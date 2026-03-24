import { Scene } from 'phaser';
import { attendanceRewards, seasonInfo } from '../data/progression';
import {
    bandLabelKo,
    difficultyBandForLevel,
    learnerLevelFromSolvedInSubject,
    questionBank
} from '../data/questions';
import type { Subject } from '../data/questions';
import { C, T } from '../ui/designTokens';
import { fillRoundedPanel } from '../ui/drawRoundedRect';
import { addRoundedRectButton } from '../ui/roundedButton';
import {
    canEnterBattle,
    grantTestSkillsForSubject,
    getAttackDeckForSubject,
    getSolvedCount,
    getSolvedCountForSubject,
    MIN_BATTLE_SKILLS
} from '../data/playerProgress';

/**
 * 로비 — 교육 앱 홈: 학습 이어하기가 1순위, 배틀·덱·상점은 보조 내비게이션.
 * 시각적으로는 카드·여백·단일 액센트 컬러로 최신 프로덕트 UI에 가깝게 정리한다.
 */
export class LobbyScene extends Scene
{
    private lobbySubject: Subject = '역사';

    constructor ()
    {
        super('LobbyScene');
    }

    init (data: { subject?: Subject })
    {
        const s = data?.subject ?? (this.registry.get('currentSubject') as Subject) ?? '역사';
        this.lobbySubject = s;
        this.registry.set('currentSubject', s);
    }

    create ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#f4f6f9');

        // 테스트 편의: 역사 서버 진입 시 최소 배틀 스킬 30개를 자동 지급한다.
        if (this.lobbySubject === '역사')
        {
            grantTestSkillsForSubject('역사', MIN_BATTLE_SKILLS);
        }

        const flash = this.registry.get('uiMessage') as string | undefined;
        if (flash)
        {
            this.registry.remove('uiMessage');
            const tip = this.add.rectangle(width / 2, 56, width - 24, 44, 0xfff7ed).setStrokeStyle(1, 0xf59e0b);
            const tipTx = this.add.text(width / 2, 56, flash, { ...T.caption, fontSize: '13px', color: '#92400e', wordWrap: { width: width - 40 }, align: 'center' }).setOrigin(0.5);
            this.time.delayedCall(3200, () => { tip.destroy(); tipTx.destroy(); });
        }

        const pageBg = this.add.graphics();
        pageBg.fillGradientStyle(C.page, C.page, 0xeff6ff, C.page, 1);
        pageBg.fillRect(0, 0, width, height);

        const header = this.add.graphics();
        fillRoundedPanel(header, 12, 12, width - 24, 116, 14, C.surface, C.border, 1);

        const solved = getSolvedCount();
        const subCount = getSolvedCountForSubject(this.lobbySubject);
        const poolSize = questionBank.filter(q => q.subject === this.lobbySubject).length;
        const pct = poolSize > 0 ? Math.min(100, Math.round((subCount / poolSize) * 100)) : 0;
        const learnLv = learnerLevelFromSolvedInSubject(subCount);
        const bandStr = bandLabelKo(difficultyBandForLevel(learnLv));

        this.add.text(24, 32, `서버 · ${this.lobbySubject}`, { ...T.title, fontSize: '18px' });
        this.add.text(24, 56, `전체 스킬 ${solved}/${MIN_BATTLE_SKILLS} · 이 서버 ${subCount}문항`, { ...T.body, fontSize: '14px' });
        this.add.text(24, 80, canEnterBattle() ? '배틀 참가 가능' : `배틀 잠금 · 스킬 ${MIN_BATTLE_SKILLS}개 필요`, { ...T.caption, color: canEnterBattle() ? '#059669' : '#b45309' });

        this.add.text(width - 24, 26, '골드 12,840', { ...T.caption, color: '#5a6472' }).setOrigin(1, 0);
        this.add.text(width - 24, 44, '젬 1,420', { ...T.caption, color: '#5a6472' }).setOrigin(1, 0);
        this.add.text(width - 24, 62, '에너지 82/100', { ...T.caption, color: '#059669' }).setOrigin(1, 0);
        const switchServerBtn = this.add.rectangle(width - 86, 92, 116, 30, C.neutralButton)
            .setStrokeStyle(1, C.borderStrong)
            .setInteractive({ useHandCursor: true });
        this.add.text(width - 86, 90, '서버 변경', { ...T.buttonSecondary, fontSize: '12px' }).setOrigin(0.5);
        switchServerBtn.on('pointerdown', () => this.startSceneWithFade('IntroScene'));

        const hero = this.add.graphics();
        fillRoundedPanel(hero, 12, 138, width - 24, 164, 16, C.surface, C.border, 1);
        this.add.text(24, 152, '오늘의 학습', { ...T.title, fontSize: '17px' });
        this.add.text(24, 176, `${this.lobbySubject} · 맞춤 문제 연습`, { ...T.body, fontSize: '15px' });
        this.add.text(24, 200, `학습 Lv.${learnLv} · 추천 난이도 ${bandStr} · 이 서버 진행 ${pct}%`, { ...T.caption });

        const progressBg = this.add.rectangle(24, 228, width - 48, 6, 0xe2e6ee).setOrigin(0, 0.5);
        const progressFill = this.add.rectangle(24, 228, (width - 48) * (pct / 100), 6, C.accent).setOrigin(0, 0.5);

        const cont = addRoundedRectButton(this, width / 2, 272, width - 48, 50, {
            fill: C.accent,
            fillHover: C.accentHover,
            stroke: C.accentHover,
            radius: 14,
            label: '문제 풀러 가기',
            textStyle: { ...T.button, fontSize: '16px' },
            onClick: () => this.startSceneWithFadeData('StudyScene', { subject: this.lobbySubject })
        });

        const partner = this.add.graphics();
        fillRoundedPanel(partner, 12, 316, width - 24, 132, 16, C.surface, C.border, 1);
        this.add.text(24, 330, '학습 파트너', { ...T.title, fontSize: '15px' });
        const partnerMidY = 316 + 132 / 2;
        const mascot = this.createLobbyMascot(72, partnerMidY + 4, 0.88);
        this.tweens.add({ targets: mascot, y: mascot.y - 3, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        this.add.text(132, partnerMidY - 18, '지금 난이도에 맞는 문항으로 연습할까요?', { ...T.body, fontSize: '14px', wordWrap: { width: width - 156 } });
        this.add.text(132, partnerMidY + 18, '문제를 풀면 스킬이 쌓여 배틀에 쓸 수 있어요.', { ...T.caption, color: '#059669' });

        const row1 = this.add.graphics();
        fillRoundedPanel(row1, 12, 452, width - 24, 66, 12, C.successSoft, 0xbbf7d0, 1);
        this.add.text(24, 464, '다음 승급까지 120PT', { ...T.body, fontSize: '14px', color: '#047857' });
        this.add.text(24, 486, '주변 순위 127위 · 128위(나) · 129위', { ...T.caption });

        const row2 = this.add.graphics();
        fillRoundedPanel(row2, 12, 534, width - 24, 54, 12, C.accentSoft, C.border, 1);
        this.add.text(24, 546, `미션 · 출석 · ${seasonInfo.seasonName}`, { ...T.body, fontSize: '13px' });
        this.add.text(24, 562, `${attendanceRewards[0]} 수령 가능`, { ...T.caption });

        const secondaryRowY = 614;
        const gap = 12;
        const btnW = (width - 24 - gap) / 2;
        const ql = addRoundedRectButton(this, 12 + btnW / 2, secondaryRowY, btnW, 46, {
            fill: C.neutralButton,
            fillHover: 0xf1f5f9,
            stroke: C.borderStrong,
            radius: 14,
            label: '빠른 연습',
            textStyle: { ...T.buttonSecondary, fontSize: '14px' },
            onClick: () => this.startSceneWithFadeData('StudyScene', { subject: this.lobbySubject })
        });
        const qr = addRoundedRectButton(this, 12 + btnW + gap + btnW / 2, secondaryRowY, btnW, 46, {
            fill: C.neutralButton,
            fillHover: 0xf1f5f9,
            stroke: C.borderStrong,
            radius: 14,
            label: '문제 보유함',
            textStyle: { ...T.buttonSecondary, fontSize: '14px' },
            onClick: () => this.startSceneWithFade('QuestionInventoryScene')
        });

        const battleRowY = 672;
        const battleOk = canEnterBattle() && getAttackDeckForSubject(this.lobbySubject).length > 0;
        const battleFill = battleOk ? 0x1e293b : 0xcbd5e1;
        const battleHover = battleOk ? 0x334155 : 0x94a3b8;
        const bbtn = addRoundedRectButton(this, 12 + btnW / 2, battleRowY, btnW, 48, {
            fill: battleFill,
            fillHover: battleHover,
            stroke: battleOk ? 0x0f172a : 0x94a3b8,
            radius: 14,
            label: '복습 배틀',
            textStyle: {
                fontFamily: T.button.fontFamily,
                fontSize: '14px',
                color: battleOk ? '#f8fafc' : '#64748b',
                fontStyle: 'bold'
            },
            onClick: () =>
            {
                if (!canEnterBattle())
                {
                    this.registry.set('uiMessage', `배틀은 스킬을 ${MIN_BATTLE_SKILLS}개 이상 모은 뒤 참여할 수 있어요. 학습 탭에서 문제를 풀어 주세요.`);
                    this.scene.restart({ subject: this.lobbySubject });
                    return;
                }
                if (getAttackDeckForSubject(this.lobbySubject).length === 0)
                {
                    this.registry.set('uiMessage', `「${this.lobbySubject}」 서버에서 풀어둔 문제가 없습니다. 먼저 이 과목을 학습하세요.`);
                    this.scene.restart({ subject: this.lobbySubject });
                    return;
                }
                this.startSceneWithFadeData('BattleScene', { subject: this.lobbySubject });
            }
        });
        const deckBtnRounded = addRoundedRectButton(this, 12 + btnW + gap + btnW / 2, battleRowY, btnW, 48, {
            fill: C.neutralButton,
            fillHover: 0xf1f5f9,
            stroke: C.borderStrong,
            radius: 14,
            label: '덱 보기',
            textStyle: { ...T.buttonSecondary, fontSize: '14px' },
            onClick: () => this.startSceneWithFade('DeckScene')
        });

        const tabs = [
            { label: '홈', scene: 'LobbyScene' },
            { label: '배틀', scene: 'BattleScene' },
            { label: '덱', scene: 'DeckScene' },
            { label: '문제', scene: 'QuestionInventoryScene' },
            { label: '상점', scene: 'ShopScene' }
        ];
        const tabW = (width - 20) / tabs.length;
        tabs.forEach((tab, i) => {
            const x = 10 + (tabW / 2) + (tabW * i);
            const active = tab.scene === 'LobbyScene';
            const box = this.add.rectangle(x, height - 28, tabW - 6, 44, active ? C.accentSoft : 0xffffff).setStrokeStyle(1, active ? C.accent : C.border).setInteractive({ useHandCursor: true });
            this.add.text(x, height - 28, tab.label, {
                fontFamily: T.body.fontFamily,
                fontSize: '13px',
                color: active ? '#2563eb' : '#5a6472',
                fontStyle: active ? 'bold' : 'normal'
            }).setOrigin(0.5);
            box.on('pointerdown', () =>
            {
                if (tab.scene === 'BattleScene')
                {
                    if (!canEnterBattle() || getAttackDeckForSubject(this.lobbySubject).length === 0)
                    {
                        this.registry.set('uiMessage', '배틀 조건을 확인해 주세요. (스킬 30개 + 해당 서버 과목)');
                        this.scene.restart({ subject: this.lobbySubject });
                        return;
                    }
                    this.startSceneWithFadeData('BattleScene', { subject: this.lobbySubject });
                    return;
                }
                this.startSceneWithFade(tab.scene);
            });
        });

        this.cameras.main.fadeIn(200, 244, 246, 249);
    }

    private createLobbyMascot (x: number, y: number, scale: number): Phaser.GameObjects.Container
    {
        const c = this.add.container(x, y);
        c.setScale(scale);
        const shadow = this.add.ellipse(0, 14, 96, 24, 0x94a3b8, 0.28);
        c.addAt(shadow, 0);
        const g = this.add.graphics();
        c.add(g);
        const p = 5;
        const map = ['....aa....', '...abca...', '..abbccaa.', '.abccddcca', '.abccddcca', '..abccccaa', '...abccaa.', '..eefccff.', '...ef..f..'];
        const color: Record<string, number> = { a: 0xb8e8e0, b: 0x7dd3c8, c: 0x4fb8a8, d: 0x2d8a7a, e: 0xffffff, f: 0x64748b };
        map.forEach((row, ri) => [...row].forEach((ch, ci) => {
            if (color[ch]) { g.fillStyle(color[ch], 1); g.fillRect((ci * p) - 30, (ri * p) - 48, p, p); }
        }));
        return c;
    }

    private startSceneWithFade (scene: string): void
    {
        if (this.scene.key === scene)
        {
            return;
        }
        this.cameras.main.fadeOut(160, 244, 246, 249);
        this.time.delayedCall(170, () => this.scene.start(scene));
    }

    private startSceneWithFadeData (scene: string, data: object): void
    {
        this.cameras.main.fadeOut(160, 244, 246, 249);
        this.time.delayedCall(170, () => this.scene.start(scene, data));
    }
}
