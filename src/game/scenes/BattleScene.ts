import { Scene } from 'phaser';
import {
    BattleQuestion,
    createShuffledQuestionQueueForSubject,
    Difficulty,
    difficultyToGrade,
    type Subject
} from '../data/questions';
import { canEnterBattle, getAttackDeckForSubject, MIN_BATTLE_SKILLS } from '../data/playerProgress';
import { C } from '../ui/designTokens';

type TurnPhase = 'playerAttack' | 'enemyAttack';

/** 난이도별 AI(상대) 방어 성공 확률 — 높을수록 상대가 정답을 잘 맞춤 */
function enemyDefenseHitChance (difficulty: Difficulty): number
{
    switch (difficulty)
    {
        case '초급': return 0.4;
        case '중급': return 0.32;
        case '심화': return 0.24;
        case '챌린지': return 0.17;
        default: return 0.3;
    }
}

function pickRandomWrongIndex (q: BattleQuestion): number
{
    const wrong = [0, 1, 2, 3].filter(i => i !== q.correctIndex);
    return wrong[Math.floor(Math.random() * wrong.length)] ?? 0;
}

interface BattleResultPayload {
    result: 'WIN' | 'LOSE';
    playerHp: number;
    enemyHp: number;
    correctAnswers: number;
    totalQuestions: number;
    gainedXp: number;
    gainedGold: number;
    gainedKnowledge: number;
    mvpComment: string;
}

/** 세로 화면 기준 겹침 없이 구역을 나눈다. */
function computeBattleLayout (width: number, height: number)
{
    const topBarH = 36;
    const pad = 8;
    const statusH = 86;
    const statusY = topBarH + pad + statusH / 2;

    const arenaH = Math.min(168, Math.floor((height - statusY - statusH / 2) * 0.28));
    const arenaY = statusY + statusH / 2 + pad + arenaH / 2;

    const logH = 66;
    const logY = arenaY + arenaH / 2 + pad + logH / 2;

    const qCardH = 140;
    const qCardY = logY + logH / 2 + pad + qCardH / 2;

    const choiceH = 40;
    const choiceGap = 8;
    const choice1Y = qCardY + qCardH / 2 + pad + choiceH / 2;
    const choice2Y = choice1Y + choiceH + choiceGap;

    const subH = 42;
    const subY = choice2Y + choiceH / 2 + pad + subH / 2;

    const toolsH = 84;
    const toolsPad = 6;
    let toolsY = subY + subH / 2 + toolsPad + toolsH / 2;
    const bottomMargin = 12;
    if (toolsY + toolsH / 2 > height - bottomMargin)
    {
        const overflow = toolsY + toolsH / 2 - (height - bottomMargin);
        toolsY -= overflow;
    }

    return {
        width,
        height,
        topBarH,
        statusY,
        statusH,
        arenaY,
        arenaH,
        logY,
        logH,
        qCardY,
        qCardH,
        choice1Y,
        choice2Y,
        choiceH,
        choiceGap,
        subY,
        subH,
        toolsY,
        toolsH
    };
}

const UNIT_SCALE = 1.08;

export class BattleScene extends Scene
{
    private battleSubject: Subject = '역사';
    private enemyQuestionQueue: BattleQuestion[] = [];
    private enemyQueueIndex = 0;
    private roundsPlayed = 0;

    private turnPhase: TurnPhase = 'playerAttack';
    /** 내 공격: 스킬 카드 고르기 → 상대 AI 방어 연출 */
    private playerAttackStep: 'pickCard' | 'resolving' = 'pickCard';
    private selectedAttackQuestion: BattleQuestion | null = null;
    private deckPickerRoot!: Phaser.GameObjects.Container;
    private deckPage = 0;

    private turnBannerText!: Phaser.GameObjects.Text;

    private selectedChoiceIndex: number | null = null;
    private playerHp = 100;
    private enemyHp = 100;
    private battleEnded = false;
    private result: 'WIN' | 'LOSE' | null = null;

    private logMessage = '문제를 풀어 상대 HP를 0으로 만들면 승리합니다. 오답 시 나의 HP가 줄어듭니다.';
    private correctAnswers = 0;
    private totalXp = 0;
    private totalKnowledge = 0;

    private layout!: ReturnType<typeof computeBattleLayout>;

    private playerHpFill!: Phaser.GameObjects.Rectangle;
    private enemyHpFill!: Phaser.GameObjects.Rectangle;
    private playerHpText!: Phaser.GameObjects.Text;
    private enemyHpText!: Phaser.GameObjects.Text;
    private questionCounterText!: Phaser.GameObjects.Text;
    private questionTitleText!: Phaser.GameObjects.Text;
    private questionMetaText!: Phaser.GameObjects.Text;
    private questionText!: Phaser.GameObjects.Text;
    private submitButton!: Phaser.GameObjects.Rectangle;
    private submitLabel!: Phaser.GameObjects.Text;
    private logText!: Phaser.GameObjects.Text;
    private playerStatusText!: Phaser.GameObjects.Text;
    private enemyStatusText!: Phaser.GameObjects.Text;

    private choiceButtons: Phaser.GameObjects.Rectangle[] = [];
    private choiceLabels: Phaser.GameObjects.Text[] = [];
    private choiceGloss: Phaser.GameObjects.Rectangle[] = [];
    private defenseControlsVisible = true;

    private playerUnit!: Phaser.GameObjects.Container;
    private enemyUnit!: Phaser.GameObjects.Container;
    private playerMarker!: Phaser.GameObjects.Ellipse;
    private enemyMarker!: Phaser.GameObjects.Ellipse;
    private playerShadow!: Phaser.GameObjects.Ellipse;
    private enemyShadow!: Phaser.GameObjects.Ellipse;

    private playerBaseX = 0;
    private playerBaseY = 0;
    private enemyBaseX = 0;
    private enemyBaseY = 0;

    constructor ()
    {
        super('BattleScene');
    }

    init (data: { subject?: Subject })
    {
        const s = data?.subject ?? (this.registry.get('currentSubject') as Subject) ?? '역사';
        this.battleSubject = s;
        this.registry.set('currentSubject', s);
    }

    create ()
    {
        if (!canEnterBattle())
        {
            this.registry.set('uiMessage', `배틀은 학습으로 스킬을 ${MIN_BATTLE_SKILLS}개 이상 모은 뒤 참여할 수 있어요.`);
            this.scene.start('LobbyScene', { subject: this.battleSubject });
            return;
        }
        if (getAttackDeckForSubject(this.battleSubject).length === 0)
        {
            this.registry.set('uiMessage', `「${this.battleSubject}」에서 풀어둔 문제가 없습니다. 학습으로 먼저 스킬을 모으세요.`);
            this.scene.start('LobbyScene', { subject: this.battleSubject });
            return;
        }

        this.enemyQuestionQueue = createShuffledQuestionQueueForSubject(this.battleSubject);
        this.enemyQueueIndex = 0;
        this.roundsPlayed = 0;

        const { width, height } = this.scale;
        this.layout = computeBattleLayout(width, height);
        this.cameras.main.setBackgroundColor('#0f172a');

        this.add.rectangle(width / 2, this.layout.topBarH / 2, width, this.layout.topBarH, C.accentSoft).setStrokeStyle(0);
        this.turnBannerText = this.add.text(width / 2, this.layout.topBarH / 2, '', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#1e40af',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: width - 16 }
        }).setOrigin(0.5);

        this.createArenaBackdrop();
        this.createTopPanels(width);
        this.createDialogueBox(width);
        this.createQuestionPanel(width);
        this.createChoiceButtons(width);
        this.createSubmitButton(width);
        this.createBottomActionMenu(width, height);
        this.spawnBattleUnits(width);
        this.startIdleTweens();
        this.deckPickerRoot = this.add.container(0, 0).setDepth(40);

        this.cameras.main.fadeIn(180, 15, 23, 42);

        this.beginPlayerAttackTurn();
    }

    private refreshTurnBanner (): void
    {
        let line: string;
        if (this.turnPhase === 'playerAttack' && this.playerAttackStep === 'pickCard')
        {
            line = '내 공격 · 스킬(문제) 카드를 고르세요';
        }
        else if (this.turnPhase === 'playerAttack')
        {
            line = '내 공격 · 상대 AI가 방어합니다';
        }
        else
        {
            line = '상대 공격 · 막으려면 정답을 고르세요';
        }
        this.turnBannerText.setText(`서버 ${this.battleSubject} · 1vs1 턴제\n${line}`);
    }

    private setInteractionEnabled (enabled: boolean): void
    {
        this.choiceButtons.forEach((b, i) => {
            if (enabled)
            {
                b.setInteractive({ useHandCursor: true });
            }
            else
            {
                b.disableInteractive();
            }
            this.choiceGloss[i].setAlpha(enabled ? 0.12 : 0.06);
        });
        if (enabled)
        {
            this.submitButton.setInteractive({ useHandCursor: true });
        }
        else
        {
            this.submitButton.disableInteractive();
        }
    }

    private setDefenseControlsVisible (visible: boolean): void
    {
        this.defenseControlsVisible = visible;
        this.choiceButtons.forEach(b => b.setVisible(visible));
        this.choiceLabels.forEach(t => t.setVisible(visible));
        this.choiceGloss.forEach(g => g.setVisible(visible));
        this.submitButton.setVisible(visible);
        this.submitLabel.setVisible(visible);
    }

    private beginPlayerAttackTurn (): void
    {
        if (this.battleEnded) return;
        this.turnPhase = 'playerAttack';
        this.playerAttackStep = 'pickCard';
        this.selectedAttackQuestion = null;
        this.selectedChoiceIndex = null;
        this.refreshTurnBanner();
        this.playerStatusText.setText('공격');
        this.enemyStatusText.setText('방어');
        this.logMessage = '학습으로 획득한 스킬(문제) 중 하나를 골라 공격하세요.';
        this.setInteractionEnabled(false);
        this.setDefenseControlsVisible(false);
        this.refreshQuestionUI();
        this.refreshBattleUI();
        this.refreshChoiceHighlight();
        this.showAttackDeckPicker();
    }

    private showAttackDeckPicker (): void
    {
        const w = this.scale.width;
        const { qCardY, qCardH } = this.layout;
        const deck = getAttackDeckForSubject(this.battleSubject);
        this.deckPickerRoot.removeAll(true);
        this.deckPickerRoot.setVisible(true);

        const perPage = 4;
        const totalPages = Math.max(1, Math.ceil(deck.length / perPage));
        this.deckPage = Math.min(this.deckPage, totalPages - 1);
        const slice = deck.slice(this.deckPage * perPage, this.deckPage * perPage + perPage);

        const panel = this.add.rectangle(w / 2, qCardY, w - 18, qCardH + 24, 0xffffff, 0.97).setStrokeStyle(2, 0x2563eb);
        this.deckPickerRoot.add(panel);
        this.deckPickerRoot.add(this.add.text(w / 2, qCardY - qCardH / 2 + 6, '공격 스킬 선택 · 학습으로 푼 문제만 사용', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#2563eb',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        if (totalPages > 1)
        {
            const py = qCardY + qCardH / 2 + 8;
            const prev = this.add.rectangle(40, py, 56, 28, 0x64748b).setInteractive({ useHandCursor: true });
            const prevLab = this.add.text(40, py, '◀', { fontFamily: 'Arial', fontSize: '14px', color: '#fff' }).setOrigin(0.5);
            prev.on('pointerdown', () =>
            {
                this.deckPage = Math.max(0, this.deckPage - 1);
                this.showAttackDeckPicker();
            });
            const next = this.add.rectangle(w - 40, py, 56, 28, 0x64748b).setInteractive({ useHandCursor: true });
            const nextLab = this.add.text(w - 40, py, '▶', { fontFamily: 'Arial', fontSize: '14px', color: '#fff' }).setOrigin(0.5);
            next.on('pointerdown', () =>
            {
                this.deckPage = Math.min(totalPages - 1, this.deckPage + 1);
                this.showAttackDeckPicker();
            });
            this.deckPickerRoot.add([prev, prevLab, next, nextLab]);
        }

        const cardW = (w - 48) / 2;
        const baseY = qCardY - qCardH / 2 + 36;
        slice.forEach((q, i) =>
        {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const cx = 20 + col * (cardW + 12) + cardW / 2;
            const cy = baseY + row * 58;
            const g = difficultyToGrade(q.difficulty);
            const hit = this.add.rectangle(cx, cy, cardW, 52, 0xf8fafc).setStrokeStyle(1, 0xe2e8f0).setInteractive({ useHandCursor: true });
            const t1 = this.add.text(cx - cardW / 2 + 8, cy - 18, `${g}등급 · 피해 ${q.damage} · ${q.difficulty}`, {
                fontFamily: 'Arial',
                fontSize: '11px',
                color: '#0f172a',
                fontStyle: 'bold'
            });
            const t2 = this.add.text(cx - cardW / 2 + 8, cy + 2, q.question.length > 42 ? `${q.question.slice(0, 42)}…` : q.question, {
                fontFamily: 'Arial',
                fontSize: '10px',
                color: '#475569',
                wordWrap: { width: cardW - 16 }
            });
            hit.on('pointerover', () => hit.setFillStyle(0xeff6ff));
            hit.on('pointerout', () => hit.setFillStyle(0xf8fafc));
            hit.on('pointerdown', () => this.confirmAttackCard(q));
            this.deckPickerRoot.add([hit, t1, t2]);
        });
    }

    private confirmAttackCard (q: BattleQuestion): void
    {
        if (this.battleEnded || this.turnPhase !== 'playerAttack' || this.playerAttackStep !== 'pickCard') return;
        this.selectedAttackQuestion = q;
        this.playerAttackStep = 'resolving';
        this.deckPickerRoot.removeAll(true);
        this.deckPickerRoot.setVisible(false);
        this.setDefenseControlsVisible(true);
        this.refreshTurnBanner();
        this.refreshQuestionUI();
        this.refreshBattleUI();
        this.time.delayedCall(780, () =>
        {
            if (this.battleEnded) return;
            this.resolveEnemyDefense();
        });
    }

    private beginEnemyAttackTurn (): void
    {
        if (this.battleEnded) return;
        this.turnPhase = 'enemyAttack';
        this.playerAttackStep = 'pickCard';
        this.selectedChoiceIndex = null;
        this.refreshTurnBanner();
        this.refreshQuestionUI();
        this.playerStatusText.setText('방어');
        this.enemyStatusText.setText('공격');
        this.logMessage = '상대의 공격 퀴즈입니다. 막으려면 정답을 고르고 제출하세요.';
        this.setDefenseControlsVisible(true);
        this.setInteractionEnabled(true);
        this.refreshBattleUI();
        this.refreshChoiceHighlight();
    }

    private resolveEnemyDefense (): void
    {
        const q = this.selectedAttackQuestion;
        if (!q || this.battleEnded) return;

        const enemyRoll = Math.random() < enemyDefenseHitChance(q.difficulty);
        const aiPick = enemyRoll ? q.correctIndex : pickRandomWrongIndex(q);

        this.choiceButtons.forEach((b, idx) => {
            b.setFillStyle(idx === aiPick ? 0xea580c : 0x334155);
            b.setStrokeStyle(1, idx === aiPick ? 0xfdba74 : 0x64748b);
        });
        this.choiceLabels.forEach((lbl, idx) => {
            lbl.setColor(idx === aiPick ? '#fff7ed' : '#94a3b8');
        });

        this.logMessage = `상대가 ${aiPick + 1}번을 선택했습니다…`;

        this.time.delayedCall(720, () =>
        {
            if (this.battleEnded) return;
            this.refreshChoiceHighlight();

            const enemyDefended = aiPick === q.correctIndex;
            this.roundsPlayed += 1;

            if (!enemyDefended)
            {
                this.enemyHp = Math.max(0, this.enemyHp - q.damage);
                this.correctAnswers += 1;
                this.totalXp += q.rewardXp;
                this.totalKnowledge += q.rewardKnowledge;
                this.logMessage = `상대 방어 실패! ${q.damage} 피해를 입혔습니다.`;
                this.playAttackMotion(true);
            }
            else
            {
                this.logMessage = '상대가 정답을 맞혀 방어했습니다. 피해 없음.';
                this.playDefenseSuccessMotion('enemy');
            }

            this.selectedChoiceIndex = null;

            if (this.playerHp <= 0 || this.enemyHp <= 0)
            {
                this.battleEnded = true;
                this.setInteractionEnabled(false);
                this.time.delayedCall(520, () => this.finishBattle());
                this.refreshBattleUI();
                return;
            }

            this.time.delayedCall(1000, () =>
            {
                if (this.battleEnded) return;
                this.beginEnemyAttackTurn();
            });
        });
    }

    private playDefenseSuccessMotion (who: 'player' | 'enemy'): void
    {
        if (who === 'enemy')
        {
            this.tweens.add({ targets: this.enemyUnit, scaleX: UNIT_SCALE * 1.06, scaleY: UNIT_SCALE * 1.06, duration: 140, yoyo: true, ease: 'Sine.Out' });
            this.spawnHitSpark(this.enemyBaseX, this.enemyBaseY, 0x94a3b8);
        }
        else
        {
            this.tweens.add({ targets: this.playerUnit, scaleX: UNIT_SCALE * 1.06, scaleY: UNIT_SCALE * 1.06, duration: 140, yoyo: true, ease: 'Sine.Out' });
            this.spawnHitSpark(this.playerBaseX, this.playerBaseY, 0x38bdf8);
        }
    }

    private createTopPanels (width: number): void
    {
        const { statusY, statusH } = this.layout;
        const boxW = (width - 36) / 2;
        const lx = 18 + boxW / 2;
        const rx = width - 18 - boxW / 2;

        this.add.rectangle(lx, statusY, boxW, statusH, 0x1e3a5f).setStrokeStyle(1, 0x38bdf8);
        this.add.rectangle(rx, statusY, boxW, statusH, 0x4a2040).setStrokeStyle(1, 0xfb923c);

        const nameY = statusY - statusH / 2 + 16;
        this.add.text(26, nameY, '나 · 루미아  Lv.15', { fontFamily: 'Arial', fontSize: '14px', color: '#f1f5f9', fontStyle: 'bold' });
        this.add.text(width - 26, nameY, '상대 · 이그니스  Lv.17', { fontFamily: 'Arial', fontSize: '14px', color: '#fef3c7', fontStyle: 'bold' }).setOrigin(1, 0);

        this.playerStatusText = this.add.text(26, nameY + 20, '집중', { fontFamily: 'Arial', fontSize: '11px', color: '#94a3b8' });
        this.enemyStatusText = this.add.text(width - 26, nameY + 20, '대기', { fontFamily: 'Arial', fontSize: '11px', color: '#94a3b8' }).setOrigin(1, 0);

        const trackY = statusY + statusH / 2 - 18;
        const trackW = boxW - 28;
        const trackH = 12;
        const trackLeftX = 26 + trackW / 2;
        const trackRightX = width - 26 - trackW / 2;

        this.add.rectangle(trackLeftX, trackY, trackW, trackH, 0x0f172a).setOrigin(0.5).setStrokeStyle(1, 0x64748b);
        this.add.rectangle(trackRightX, trackY, trackW, trackH, 0x0f172a).setOrigin(0.5).setStrokeStyle(1, 0x64748b);

        this.playerHpFill = this.add.rectangle(trackLeftX - trackW / 2 + 3, trackY, trackW - 6, trackH - 4, 0x22d3ee).setOrigin(0, 0.5);
        this.enemyHpFill = this.add.rectangle(trackRightX + trackW / 2 - 3, trackY, trackW - 6, trackH - 4, 0xfb923c).setOrigin(1, 0.5);

        this.playerHpText = this.add.text(trackLeftX, trackY, '100', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#ecfeff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.enemyHpText = this.add.text(trackRightX, trackY, '100', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#fff7ed',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    private createArenaBackdrop (): void
    {
        const { width } = this.scale;
        const { arenaY, arenaH } = this.layout;
        const top = arenaY - arenaH / 2;

        const g = this.add.graphics();
        g.fillGradientStyle(0x1e293b, 0x0f172a, 0x0f172a, 0x1e3a8a, 1);
        g.fillRect(0, top, width, arenaH);
        g.lineStyle(1, 0x334155, 0.6);
        for (let x = 0; x < width; x += 24)
        {
            g.lineBetween(x, top, x + arenaH * 0.3, top + arenaH);
        }

        this.add.ellipse(width / 2, arenaY + 8, width * 0.92, arenaH * 0.45, 0x3b82f6, 0.08);
        this.add.ellipse(width / 2, arenaY - 2, width * 0.75, arenaH * 0.35, 0x22d3ee, 0.06);

        const stage = this.add.rectangle(width / 2, arenaY + 18, width - 20, arenaH - 36, 0x1e293b, 0.85).setStrokeStyle(1, 0x475569, 0.9);
        stage.setDepth(0);

        const py = arenaY + 28;
        const ey = arenaY + 22;
        this.playerMarker = this.add.ellipse(width * 0.28, py, 120, 42, 0x22d3ee, 0.35).setStrokeStyle(2, 0x67e8f9, 0.85).setDepth(1);
        this.enemyMarker = this.add.ellipse(width * 0.72, ey, 118, 40, 0xf97316, 0.35).setStrokeStyle(2, 0xfdba74, 0.9).setDepth(1);
    }

    private createDialogueBox (width: number): void
    {
        const { logY, logH } = this.layout;
        this.add.rectangle(width / 2, logY, width - 20, logH, 0x1e293b, 0.95).setStrokeStyle(1, 0x64748b).setDepth(2);
        this.logText = this.add.text(22, logY - logH / 2 + 10, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#e2e8f0',
            wordWrap: { width: width - 44 },
            lineSpacing: 2
        }).setDepth(3);
    }

    private createQuestionPanel (width: number): void
    {
        const { qCardY, qCardH } = this.layout;
        const half = qCardH / 2;

        this.add.rectangle(width / 2, qCardY, width - 20, qCardH, 0xffffff).setStrokeStyle(1, 0xc7d2fe).setDepth(2);
        this.add.rectangle(width / 2, qCardY, width - 32, qCardH - 12, 0xfbfdff).setStrokeStyle(1, 0xe2e8f0).setDepth(2);

        const badgeY = qCardY - half + 18;
        this.add.rectangle(88, badgeY, 128, 22, C.accent).setStrokeStyle(0).setDepth(3);
        this.questionTitleText = this.add.text(24, badgeY, '과목', { fontFamily: 'Arial', fontSize: '11px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(3);
        this.questionMetaText = this.add.text(164, badgeY, '난이도', { fontFamily: 'Arial', fontSize: '11px', color: '#64748b' }).setOrigin(0, 0.5).setDepth(3);
        this.questionCounterText = this.add.text(width - 24, badgeY, '', { fontFamily: 'Arial', fontSize: '11px', color: '#94a3b8' }).setOrigin(1, 0.5).setDepth(3);

        const qTextY = qCardY - half + 48;
        this.questionText = this.add.text(24, qTextY, '', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#0f172a',
            fontStyle: 'bold',
            wordWrap: { width: width - 48 },
            lineSpacing: 4
        }).setDepth(3);
    }

    private createChoiceButtons (width: number): void
    {
        const { choice1Y, choice2Y, choiceH, choiceGap } = this.layout;
        const buttonWidth = (width - 34) / 2;
        const rows = [choice1Y, choice2Y];
        for (let i = 0; i < 4; i++)
        {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = 12 + (buttonWidth / 2) + (col * (buttonWidth + choiceGap));
            const y = rows[row];
            const button = this.add.rectangle(x, y, buttonWidth, choiceH, 0x334155).setStrokeStyle(1, 0x64748b).setInteractive({ useHandCursor: true }).setDepth(3);
            const gloss = this.add.rectangle(x, y - 14, buttonWidth - 14, 10, 0xffffff, 0.12).setDepth(4);
            const label = this.add.text(x, y, '', { fontFamily: 'Arial', fontSize: '12px', color: '#f8fafc', wordWrap: { width: buttonWidth - 18 }, align: 'center' }).setOrigin(0.5).setDepth(4);
            button.on('pointerdown', () => {
                if (this.battleEnded || this.turnPhase !== 'enemyAttack') return;
                this.selectedChoiceIndex = i;
                this.logMessage = `${i + 1}번 선택. 제출하세요.`;
                this.refreshChoiceHighlight();
                this.refreshBattleUI();
            });
            button.on('pointerover', () => {
                if (!this.battleEnded && this.turnPhase === 'enemyAttack') { button.setScale(1.01); gloss.setAlpha(0.2); }
            });
            button.on('pointerout', () => {
                if (this.turnPhase !== 'enemyAttack') return;
                button.setScale(1); gloss.setAlpha(0.12); this.refreshChoiceHighlight();
            });
            this.choiceButtons.push(button);
            this.choiceLabels.push(label);
            this.choiceGloss.push(gloss);
        }
    }

    private createSubmitButton (width: number): void
    {
        const { subY, subH } = this.layout;
        this.submitButton = this.add.rectangle(width / 2, subY, width - 24, subH, C.accent).setStrokeStyle(0).setInteractive({ useHandCursor: true }).setDepth(3);
        this.submitLabel = this.add.text(width / 2, subY, '답 제출', { fontFamily: 'Arial', fontSize: '17px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(4);
        this.submitButton.on('pointerover', () => this.submitButton.setScale(1.01));
        this.submitButton.on('pointerout', () => this.submitButton.setScale(1));
        this.submitButton.on('pointerdown', () => this.submitButton.setScale(0.985));
        this.submitButton.on('pointerup', () => this.submitButton.setScale(1.01));
        this.submitButton.on('pointerdown', () => this.handleSubmitAnswer());
    }

    private createBottomActionMenu (width: number, height: number): void
    {
        const items = [
            { label: '힌트', icon: 'H', color: 0x475569, stroke: 0x64748b },
            { label: '카드', icon: 'C', color: 0x475569, stroke: 0x64748b },
            { label: '복습', icon: 'R', color: 0x475569, stroke: 0x64748b },
            { label: '나가기', icon: '←', color: 0x334155, stroke: 0x64748b }
        ];
        const { toolsY, toolsH } = this.layout;
        const btnW = (width - 28) / 2;
        const btnH = (toolsH - 16) / 2;
        const gridTop = toolsY - toolsH / 2 + 10;

        this.add.rectangle(width / 2, toolsY, width - 12, toolsH, 0x1e293b, 0.95).setStrokeStyle(1, 0x334155).setDepth(2);

        items.forEach((item, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const x = 14 + (btnW / 2) + (col * (btnW + 8));
            const y = gridTop + (btnH / 2) + (row * (btnH + 8));
            const box = this.add.rectangle(x, y, btnW, btnH, item.color).setStrokeStyle(1, item.stroke).setInteractive({ useHandCursor: true }).setDepth(3);
            this.add.text(x - (btnW / 2) + 20, y, item.icon, { fontFamily: 'Arial', fontSize: '12px', color: '#e2e8f0', fontStyle: 'bold' }).setOrigin(0.5).setDepth(4);
            this.add.text(x + 6, y, item.label, { fontFamily: 'Arial', fontSize: '12px', color: '#f8fafc' }).setOrigin(0.5).setDepth(4);
            box.on('pointerdown', () => {
                if (this.battleEnded) return;
                this.logMessage = `[${item.label}] 데모: 추후 연결 예정입니다.`;
                this.refreshBattleUI();
            });
        });

        const back = this.add.rectangle(width - 52, toolsY - 4, 72, 28, 0x334155).setStrokeStyle(1, 0x64748b).setInteractive({ useHandCursor: true }).setDepth(4);
        this.add.text(width - 52, toolsY - 4, '로비', { fontFamily: 'Arial', fontSize: '12px', color: '#f1f5f9', fontStyle: 'bold' }).setOrigin(0.5).setDepth(5);
        back.on('pointerdown', () => this.scene.start('LobbyScene', { subject: this.battleSubject }));
    }

    private spawnBattleUnits (width: number): void
    {
        const { arenaY } = this.layout;
        const pX = width * 0.28;
        const eX = width * 0.72;
        const pY = arenaY + 26;
        const eY = arenaY + 20;

        this.playerShadow = this.add.ellipse(pX, arenaY + 44, 88, 22, 0x020617, 0.45).setDepth(2);
        this.enemyShadow = this.add.ellipse(eX, arenaY + 38, 84, 20, 0x020617, 0.45).setDepth(2);

        this.playerUnit = this.createPlayerCharacter(pX, pY);
        this.enemyUnit = this.createEnemyCharacter(eX, eY);
        this.playerUnit.setDepth(5);
        this.enemyUnit.setDepth(5);

        this.playerBaseX = pX;
        this.playerBaseY = pY;
        this.enemyBaseX = eX;
        this.enemyBaseY = eY;
    }

    private startIdleTweens (): void
    {
        this.tweens.add({ targets: this.playerUnit, y: this.playerUnit.y - 3, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        this.tweens.add({ targets: this.enemyUnit, y: this.enemyUnit.y - 4, duration: 880, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        this.tweens.add({ targets: this.playerMarker, alpha: 0.38, duration: 900, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: this.enemyMarker, alpha: 0.38, duration: 820, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: this.playerShadow, scaleX: 1.06, scaleY: 1.05, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        this.tweens.add({ targets: this.enemyShadow, scaleX: 1.06, scaleY: 1.05, duration: 880, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }

    private handleSubmitAnswer (): void
    {
        if (this.battleEnded || this.turnPhase !== 'enemyAttack') return;
        if (this.selectedChoiceIndex === null)
        {
            this.logMessage = '보기를 고른 뒤 제출해 주세요.';
            this.refreshBattleUI();
            return;
        }
        const currentQuestion = this.getEnemyQuestion();
        if (!currentQuestion) return;

        const isCorrect = this.selectedChoiceIndex === currentQuestion.correctIndex;
        this.roundsPlayed += 1;

        if (isCorrect)
        {
            this.correctAnswers += 1;
            this.totalXp += Math.floor(currentQuestion.rewardXp * 0.6);
            this.totalKnowledge += Math.floor(currentQuestion.rewardKnowledge * 0.6);
            this.logMessage = `정답! 공격을 막았습니다.`;
            this.playDefenseSuccessMotion('player');
        }
        else
        {
            this.playerHp = Math.max(0, this.playerHp - currentQuestion.risk);
            this.logMessage = `오답… ${currentQuestion.risk} 피해. 해설: ${currentQuestion.explanation}`;
            this.playHitEffect('player');
            this.playAttackMotion(false);
        }

        this.advanceEnemyQuestionPointer();
        this.selectedChoiceIndex = null;

        if (this.playerHp <= 0 || this.enemyHp <= 0)
        {
            this.battleEnded = true;
            this.setInteractionEnabled(false);
            this.time.delayedCall(520, () => this.finishBattle());
            this.refreshBattleUI();
            return;
        }

        this.time.delayedCall(1000, () =>
        {
            if (this.battleEnded) return;
            this.beginPlayerAttackTurn();
        });
        this.refreshBattleUI();
    }

    private getEnemyQuestion (): BattleQuestion | undefined
    {
        if (this.enemyQuestionQueue.length === 0) return undefined;
        return this.enemyQuestionQueue[this.enemyQueueIndex % this.enemyQuestionQueue.length];
    }

    private advanceEnemyQuestionPointer (): void
    {
        this.enemyQueueIndex += 1;
        if (
            this.enemyQuestionQueue.length > 0 &&
            this.enemyQueueIndex > 0 &&
            this.enemyQueueIndex % this.enemyQuestionQueue.length === 0
        )
        {
            this.enemyQuestionQueue = createShuffledQuestionQueueForSubject(this.battleSubject);
        }
    }

    private finishBattle (): void
    {
        this.battleEnded = true;
        this.setInteractionEnabled(false);
        if (this.enemyHp <= 0 && this.playerHp > 0)
        {
            this.result = 'WIN';
        }
        else if (this.playerHp <= 0 && this.enemyHp > 0)
        {
            this.result = 'LOSE';
        }
        else if (this.enemyHp <= 0 && this.playerHp <= 0)
        {
            this.result = 'WIN';
        }
        else
        {
            this.result = this.playerHp > this.enemyHp ? 'WIN' : 'LOSE';
        }

        this.refreshBattleUI();
        const payload: BattleResultPayload = {
            result: this.result,
            playerHp: this.playerHp,
            enemyHp: this.enemyHp,
            correctAnswers: this.correctAnswers,
            totalQuestions: this.roundsPlayed,
            gainedXp: this.totalXp + (this.result === 'WIN' ? 90 : 30),
            gainedGold: 400 + (this.correctAnswers * 70),
            gainedKnowledge: this.totalKnowledge + (this.result === 'WIN' ? 20 : 8),
            mvpComment: this.result === 'WIN'
                ? '턴을 번갈아 상대 공격을 막고, 내 공격에서 HP를 앞섰습니다.'
                : '상대 공격 턴의 방어 실수가 누적되었습니다. 복습으로 막기 확률을 높여 보세요.'
        };
        this.time.delayedCall(500, () => this.scene.start('ResultScene', payload));
    }

    private refreshQuestionUI (): void
    {
        if (this.turnPhase === 'playerAttack' && this.playerAttackStep === 'pickCard')
        {
            this.questionTitleText.setText('공격 스킬');
            this.questionMetaText.setText('등급·피해는 난이도·문항에 따라 달라요');
            this.questionCounterText.setText('');
            this.questionText.setText('아래 카드에서 이번 턴 공격에 사용할 문제를 선택하세요.');
            return;
        }
        const q = this.turnPhase === 'enemyAttack' ? this.getEnemyQuestion() : this.selectedAttackQuestion;
        if (!q) return;
        const phaseLabel = this.turnPhase === 'playerAttack' ? '내 공격' : '상대 공격';
        const grade = difficultyToGrade(q.difficulty);
        this.questionTitleText.setText(`${phaseLabel} · ${q.subject}`);
        const meta = this.turnPhase === 'playerAttack'
            ? `${q.difficulty} · 등급 ${grade} · 공격 ${q.damage} · AI 방어`
            : `${q.difficulty} · 등급 ${grade} · 오답 시 ${q.risk} · XP ${q.rewardXp}`;
        this.questionMetaText.setText(meta);
        this.questionCounterText.setText(`교전 ${this.roundsPlayed + 1} · 상대 출제 풀 ${this.enemyQuestionQueue.length}`);
        this.questionText.setText(q.question);
        q.choices.forEach((choice, idx) => this.choiceLabels[idx].setText(`${idx + 1}) ${choice}`));
        this.refreshChoiceHighlight();
    }

    private refreshChoiceHighlight (): void
    {
        this.choiceButtons.forEach((button, idx) => {
            if (this.turnPhase === 'playerAttack')
            {
                button.setFillStyle(0x1e293b);
                button.setStrokeStyle(1, 0x334155);
                this.choiceGloss[idx].setAlpha(0.05);
                this.choiceLabels[idx].setColor('#64748b');
                return;
            }
            const selected = this.selectedChoiceIndex === idx;
            button.setFillStyle(selected ? C.accent : 0x334155);
            button.setStrokeStyle(1, selected ? 0x93c5fd : 0x64748b);
            this.choiceGloss[idx].setAlpha(selected ? 0.2 : 0.1);
            this.choiceLabels[idx].setColor(selected ? '#ffffff' : '#e2e8f0');
        });
    }

    private refreshBattleUI (): void
    {
        const tw = (t: Phaser.GameObjects.GameObject, sx: number) =>
        {
            this.tweens.add({ targets: t, scaleX: sx, duration: 280, ease: 'Cubic.Out' });
        };
        tw(this.playerHpFill, Math.max(0.02, this.playerHp / 100));
        tw(this.enemyHpFill, Math.max(0.02, this.enemyHp / 100));

        this.playerHpText.setText(`${this.playerHp}`);
        this.enemyHpText.setText(`${this.enemyHp}`);
        this.logText.setText(this.logMessage);
        if (!this.defenseControlsVisible)
        {
            return;
        }
        if (this.battleEnded)
        {
            this.submitButton.setFillStyle(0x94a3b8);
            this.submitLabel.setText('결과 준비 중…');
            return;
        }
        if (this.turnPhase === 'playerAttack')
        {
            if (this.playerAttackStep === 'pickCard')
            {
                this.submitButton.setFillStyle(0x94a3b8);
                this.submitLabel.setText('스킬 카드 선택');
                return;
            }
            this.submitButton.setFillStyle(0x64748b);
            this.submitLabel.setText('상대 방어 중…');
            return;
        }
        this.submitButton.setFillStyle(this.selectedChoiceIndex === null ? 0x94a3b8 : C.accent);
        this.submitLabel.setText('막기 · 제출');
    }

    private playAttackMotion (playerCorrect: boolean): void
    {
        const dist = 36;
        if (playerCorrect)
        {
            this.tweens.add({
                targets: this.playerUnit,
                x: this.playerBaseX + dist,
                scaleX: UNIT_SCALE * 1.04,
                scaleY: UNIT_SCALE * 1.04,
                duration: 120,
                ease: 'Cubic.Out',
                yoyo: true,
                hold: 40,
                onYoyo: () => {
                    this.spawnHitSpark(this.enemyBaseX, this.enemyBaseY, 0x38bdf8);
                },
                onComplete: () => {
                    this.playerUnit.setPosition(this.playerBaseX, this.playerBaseY);
                    this.playerUnit.setScale(UNIT_SCALE);
                }
            });
            this.tweens.add({
                targets: this.enemyUnit,
                x: this.enemyBaseX + 14,
                angle: -6,
                duration: 120,
                ease: 'Quad.Out',
                yoyo: true,
                hold: 40,
                onComplete: () => {
                    this.enemyUnit.setPosition(this.enemyBaseX, this.enemyBaseY);
                    this.enemyUnit.setAngle(0);
                }
            });
        }
        else
        {
            this.tweens.add({
                targets: this.enemyUnit,
                x: this.enemyBaseX - dist,
                scaleX: UNIT_SCALE * 1.04,
                scaleY: UNIT_SCALE * 1.04,
                duration: 120,
                ease: 'Cubic.Out',
                yoyo: true,
                hold: 40,
                onYoyo: () => {
                    this.spawnHitSpark(this.playerBaseX, this.playerBaseY, 0xfb923c);
                },
                onComplete: () => {
                    this.enemyUnit.setPosition(this.enemyBaseX, this.enemyBaseY);
                    this.enemyUnit.setScale(UNIT_SCALE);
                }
            });
            this.tweens.add({
                targets: this.playerUnit,
                x: this.playerBaseX - 14,
                angle: 6,
                duration: 120,
                ease: 'Quad.Out',
                yoyo: true,
                hold: 40,
                onComplete: () => {
                    this.playerUnit.setPosition(this.playerBaseX, this.playerBaseY);
                    this.playerUnit.setAngle(0);
                }
            });
        }
    }

    private spawnHitSpark (x: number, y: number, color: number): void
    {
        for (let i = 0; i < 8; i++)
        {
            const ang = (Math.PI * 2 * i) / 8;
            const c = this.add.circle(x, y, 5 + (i % 3), color, 0.85).setDepth(10);
            this.tweens.add({
                targets: c,
                x: x + Math.cos(ang) * 42,
                y: y + Math.sin(ang) * 28,
                alpha: 0,
                scale: 0.2,
                duration: 320,
                ease: 'Cubic.Out',
                onComplete: () => c.destroy()
            });
        }
    }

    private playHitEffect (target: 'player' | 'enemy'): void
    {
        const unit = target === 'enemy' ? this.enemyUnit : this.playerUnit;
        const direction = target === 'enemy' ? 1 : -1;
        this.tweens.add({ targets: unit, x: unit.x + (6 * direction), duration: 60, yoyo: true, repeat: 2, ease: 'Quad.Out' });
        this.tweens.add({ targets: unit, alpha: 0.65, duration: 50, yoyo: true, repeat: 2 });
    }

    private createPlayerCharacter (x: number, y: number): Phaser.GameObjects.Container
    {
        const container = this.add.container(x, y);
        const g = this.add.graphics();
        container.add(g);
        const p = 5;
        const map = ['.....aac.......', '....abbbc......', '...abbbbbc.....', '..abbbddbbc....', '..abbdeddbbc...', '..abbbddbbb....', '..ccbbbbbccc...', '.ccfbbbbbbfc...', '..cffbbfffc....', '...cff..ffc....'];
        const palette: Record<string, number> = { a: 0x9efff0, b: 0x63e9ce, c: 0x32bfae, d: 0x1f6b89, e: 0xffffff, f: 0x1a3e5f };
        map.forEach((row, ry) => [...row].forEach((ch, cx) => {
            if (palette[ch]) { g.fillStyle(palette[ch], 1); g.fillRect((cx * p) - 36, (ry * p) - 56, p, p); }
        }));
        const horn = this.add.triangle(-18, -62, -6, 10, 0, -10, 7, 10, 0xb8fdff).setStrokeStyle(1, 0x3f9ec4);
        container.add(horn);
        container.setScale(UNIT_SCALE);
        return container;
    }

    private createEnemyCharacter (x: number, y: number): Phaser.GameObjects.Container
    {
        const container = this.add.container(x, y);
        const g = this.add.graphics();
        container.add(g);
        const p = 5;
        const map = ['......aa.......', '.....abb.......', '....abccb......', '...abccccc.....', '..abccddccc....', '..abcdedcc.....', '..abccddcc.....', '...abbccccb....', '..ffbbccbbff...', '.fffbbccbbfff..'];
        const palette: Record<string, number> = { a: 0xffc88d, b: 0xff9f63, c: 0xf06b4a, d: 0x8c2f2e, e: 0xffffff, f: 0x5a232c };
        map.forEach((row, ry) => [...row].forEach((ch, cx) => {
            if (palette[ch]) {
                const rawX = (cx * p) - 36;
                g.fillStyle(palette[ch], 1);
                g.fillRect(-rawX - p, (ry * p) - 56, p, p);
            }
        }));
        const flame = this.add.triangle(36, -34, -8, 16, 0, -18, 8, 16, 0xffd07a).setStrokeStyle(1, 0xd25a3e);
        container.add(flame);
        container.setScale(UNIT_SCALE);
        this.tweens.add({ targets: flame, angle: 12, duration: 280, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        return container;
    }
}

