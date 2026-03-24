import { Scene } from 'phaser';
import { battleQuestions, BattleQuestion } from '../data/questions';

export class Game extends Scene
{
    // ---------- 필수 상태 ----------
    private currentQuestionIndex = 0;
    private selectedChoiceIndex: number | null = null;
    private playerHp = 100;
    private enemyHp = 100;
    private battleEnded = false;
    private logMessage = '상대 불꽃 냥룡의 공격 전, 문제를 맞혀 선공하세요.';
    private result: 'WIN' | 'LOSE' | null = null;

    // ---------- 보조 상태 ----------
    private correctAnswers = 0;
    private choiceButtons: Phaser.GameObjects.Rectangle[] = [];
    private choiceLabels: Phaser.GameObjects.Text[] = [];
    private choiceGloss: Phaser.GameObjects.Rectangle[] = [];

    // ---------- 자주 갱신되는 UI ----------
    private playerHpFill!: Phaser.GameObjects.Rectangle;
    private enemyHpFill!: Phaser.GameObjects.Rectangle;
    private playerHpText!: Phaser.GameObjects.Text;
    private enemyHpText!: Phaser.GameObjects.Text;
    private questionCounterText!: Phaser.GameObjects.Text;
    private questionText!: Phaser.GameObjects.Text;
    private submitButton!: Phaser.GameObjects.Rectangle;
    private submitLabel!: Phaser.GameObjects.Text;
    private logText!: Phaser.GameObjects.Text;
    private playerStatusText!: Phaser.GameObjects.Text;
    private enemyStatusText!: Phaser.GameObjects.Text;
    private questionTitleText!: Phaser.GameObjects.Text;
    private questionMetaText!: Phaser.GameObjects.Text;

    // ---------- 전투 유닛/연출 ----------
    private playerUnit!: Phaser.GameObjects.Container;
    private enemyUnit!: Phaser.GameObjects.Container;
    private playerMarker!: Phaser.GameObjects.Ellipse;
    private enemyMarker!: Phaser.GameObjects.Ellipse;
    private playerAura!: Phaser.GameObjects.Ellipse;
    private enemyAura!: Phaser.GameObjects.Ellipse;
    private uiEntranceTargets: Phaser.GameObjects.GameObject[] = [];

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#10142a');

        // 전투 씬 공간 우선순위:
        // 아레나 -> 대사창 -> 문제 카드 -> 선택지 -> CTA -> 2x2 전술 메뉴
        this.createArenaBackdrop(width);
        this.createTopPanels(width);
        this.createDialogueBox(width);
        this.createQuestionPanel(width);
        this.createChoiceButtons(width);
        this.createSubmitButton(width);
        this.createBottomActionMenu(width, height);

        this.spawnBattleUnits(width);
        this.startIdleTweens();
        this.animateUiEntrance();

        // 최초 렌더링
        this.refreshQuestionUI();
        this.refreshBattleUI();
    }

    /**
     * 상단 좌/우 정보 HUD.
     * 동일한 구조를 유지하되 플레이어/적 진영 색감을 분리해 세련된 위계를 만든다.
     */
    private createTopPanels (width: number): void
    {
        const topY = 72;
        const panelW = (width / 2) - 18;
        const panelH = 92;

        this.createPremiumHudBox(9 + (panelW / 2), topY, panelW, panelH, 'player');
        this.createPremiumHudBox(width - 9 - (panelW / 2), topY, panelW, panelH, 'enemy');

        const pName = this.add.text(20, 33, '수정 정령 루미아  Lv.15', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#e9fcff'
        });
        const pTag = this.add.text(20, 54, '빙결/숲 속성 · 선공 대기', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#baf6eb'
        });
        this.playerStatusText = this.add.text(20, 78, '속성: 빙결/숲', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#8ef2df'
        });

        const eName = this.add.text(width - 20, 33, '불꽃 냥룡 이그니스  Lv.17', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#ffe8de'
        }).setOrigin(1, 0);
        const eTag = this.add.text(width - 20, 54, '화염 속성 · 공격 준비', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffcbb5'
        }).setOrigin(1, 0);
        this.enemyStatusText = this.add.text(width - 20, 78, '속성: 화염', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#ffb293'
        }).setOrigin(1, 0);

        this.add.rectangle(23, 99, 172, 14, 0x171b2d).setOrigin(0, 0.5).setStrokeStyle(1, 0x90a6c8);
        this.add.rectangle(width - 195, 99, 172, 14, 0x1f1a25).setOrigin(0, 0.5).setStrokeStyle(1, 0xce8e80);

        this.playerHpFill = this.add.rectangle(26, 99, 166, 10, 0x47e7c8).setOrigin(0, 0.5);
        this.enemyHpFill = this.add.rectangle(width - 192, 99, 166, 10, 0xff8a64).setOrigin(0, 0.5);
        this.playerHpText = this.add.text(26, 108, 'HP 100', { fontFamily: 'Arial Black', fontSize: '12px', color: '#e6f9ff' });
        this.enemyHpText = this.add.text(width - 26, 108, 'HP 100', { fontFamily: 'Arial Black', fontSize: '12px', color: '#fff2e9' }).setOrigin(1, 0);

        this.uiEntranceTargets.push(pName, pTag, this.playerStatusText, eName, eTag, this.enemyStatusText, this.playerHpText, this.enemyHpText);
    }

    /**
     * 트렌디한 픽셀 판타지 아레나 배경.
     * 회갈색 위주를 버리고 네이비/퍼플/청록/코랄 하이라이트로 무드 구성.
     */
    private createArenaBackdrop (width: number): void
    {
        const g = this.add.graphics();
        g.fillGradientStyle(0x0d1733, 0x0d1733, 0x1a1e4a, 0x1a1e4a, 1);
        g.fillRect(0, 120, width, 310);

        // 배경 대기광 레이어
        this.add.ellipse(width / 2, 220, 520, 180, 0x2a3f8e, 0.22);
        this.add.ellipse(width / 2, 210, 420, 130, 0x32c7c2, 0.14);
        this.add.ellipse(width / 2, 210, 360, 96, 0x8a72ff, 0.12);

        // 먼 배경 기둥/창 느낌
        for (let i = 0; i < 6; i++)
        {
            const x = 26 + (i * 98);
            this.add.rectangle(x, 196, 40, 118, 0x202847, 0.55).setStrokeStyle(1, 0x5364a2, 0.4);
            this.add.rectangle(x, 148, 40, 12, 0x364275, 0.65);
        }

        // 전투 플랫폼 타일
        const platformY = 280;
        this.add.rectangle(width / 2, platformY, width - 24, 170, 0x202640).setStrokeStyle(2, 0x6073b7, 0.8);
        for (let row = 0; row < 4; row++)
        {
            for (let col = 0; col < 6; col++)
            {
                const tileX = 50 + (col * 88);
                const tileY = 228 + (row * 38);
                const tone = (row + col) % 2 === 0 ? 0x2f3a68 : 0x26315a;
                this.add.rectangle(tileX, tileY, 84, 34, tone).setStrokeStyle(1, 0x4f63aa, 0.5);
            }
        }

        // 중앙 마법진/플랫폼 광
        this.add.ellipse(width / 2, 300, 200, 76, 0x47b8ef, 0.14).setStrokeStyle(2, 0x8be1ff, 0.45);
        this.add.ellipse(width / 2, 300, 152, 54, 0x9276ff, 0.12).setStrokeStyle(1, 0xc6b7ff, 0.4);

        // 유닛 위치 마커 + 진영 글로우
        this.playerMarker = this.add.ellipse(142, 342, 132, 48, 0x1f6f82, 0.5).setStrokeStyle(2, 0x7ff3de, 0.8);
        this.enemyMarker = this.add.ellipse(width - 136, 250, 126, 44, 0x8a3b42, 0.5).setStrokeStyle(2, 0xffb089, 0.85);
        this.playerAura = this.add.ellipse(142, 336, 158, 74, 0x3ce9c6, 0.16);
        this.enemyAura = this.add.ellipse(width - 136, 245, 148, 68, 0xff935d, 0.16);
    }

    /**
     * 전투 대사/로그 창.
     */
    private createDialogueBox (width: number): void
    {
        const outer = this.add.rectangle(width / 2, 451, width - 18, 86, 0x171d36).setStrokeStyle(3, 0x6f82cf);
        const inner = this.add.rectangle(width / 2, 451, width - 28, 74, 0x202947).setStrokeStyle(1, 0x91a4ea, 0.7);
        const glow = this.add.rectangle(width / 2, 425, width - 56, 8, 0x61cde9, 0.18);
        this.logText = this.add.text(24, 426, '', {
            fontFamily: 'Arial',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ecf3ff',
            wordWrap: { width: width - 48 }
        });
        this.uiEntranceTargets.push(outer, inner, glow, this.logText);
    }

    /**
     * 문제 패널.
     */
    private createQuestionPanel (width: number): void
    {
        const card = this.add.rectangle(width / 2, 574, width - 18, 154, 0xf1e8d7).setStrokeStyle(3, 0x34418f);
        const cardInner = this.add.rectangle(width / 2, 574, width - 28, 144, 0xf9f1e3).setStrokeStyle(1, 0x6e7dbe);
        const strip = this.add.rectangle(88, 512, 132, 22, 0x2f478e).setStrokeStyle(1, 0x98a9f0);

        this.questionTitleText = this.add.text(24, 508, '역사 퀴즈', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#e8eeff'
        });

        this.questionMetaText = this.add.text(164, 507, '전투 문제', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#374068'
        });

        this.questionCounterText = this.add.text(width - 24, 506, '', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#38406a'
        }).setOrigin(1, 0);

        this.questionText = this.add.text(24, 536, '', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#1e2549',
            wordWrap: { width: width - 50 }
        });

        this.uiEntranceTargets.push(card, cardInner, strip, this.questionTitleText, this.questionMetaText, this.questionCounterText, this.questionText);
    }

    /**
     * 4지선다 버튼: 세로 4줄이 아닌 2x2로 구성해 전투 선택 메뉴 느낌을 강화한다.
     */
    private createChoiceButtons (width: number): void
    {
        const startY = 646;
        const buttonHeight = 52;
        const gap = 10;
        const buttonWidth = (width - 34) / 2;

        for (let i = 0; i < 4; i++)
        {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = 12 + (buttonWidth / 2) + (col * (buttonWidth + gap));
            const y = startY + (row * (buttonHeight + gap));

            const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x262e4f)
                .setStrokeStyle(2, 0x7f91cf)
                .setInteractive({ useHandCursor: true });
            const gloss = this.add.rectangle(x, y - 16, buttonWidth - 16, 12, 0xffffff, 0.14);
            const label = this.add.text(x, y, '', {
                fontFamily: 'Arial Black',
                fontSize: '17px',
                color: '#f3f7ff',
                align: 'center',
                wordWrap: { width: buttonWidth - 18 }
            }).setOrigin(0.5);

            button.on('pointerdown', () => {
                if (this.battleEnded)
                {
                    return;
                }

                this.selectedChoiceIndex = i;
                this.logMessage = `${i + 1}번 선택 완료. 정답 제출로 공격을 시도하세요.`;
                this.refreshChoiceHighlight();
                this.refreshBattleUI();
            });
            button.on('pointerover', () => {
                if (!this.battleEnded)
                {
                    button.setStrokeStyle(2, 0xb4c8ff);
                    button.setScale(1.012);
                    gloss.setAlpha(0.2);
                }
            });
            button.on('pointerout', () => {
                button.setScale(1);
                gloss.setAlpha(0.14);
                this.refreshChoiceHighlight();
            });

            this.choiceButtons.push(button);
            this.choiceLabels.push(label);
            this.choiceGloss.push(gloss);
            this.uiEntranceTargets.push(button, gloss, label);
        }
    }

    /**
     * 정답 제출 버튼.
     */
    private createSubmitButton (width: number): void
    {
        this.submitButton = this.add.rectangle(width / 2, 770, width - 22, 58, 0x59a2ff)
            .setStrokeStyle(3, 0xddeaff)
            .setInteractive({ useHandCursor: true });
        const ctaGlow = this.add.rectangle(width / 2, 748, width - 70, 12, 0xffffff, 0.18);
        this.submitLabel = this.add.text(width / 2, 770, '정답 제출', {
            fontFamily: 'Arial Black',
            fontSize: '29px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.submitButton.on('pointerover', () => {
            this.submitButton.setScale(1.015);
            ctaGlow.setAlpha(0.24);
        });
        this.submitButton.on('pointerout', () => {
            this.submitButton.setScale(1);
            ctaGlow.setAlpha(0.18);
        });
        this.submitButton.on('pointerdown', () => this.submitButton.setScale(0.985));
        this.submitButton.on('pointerup', () => this.submitButton.setScale(1.015));
        this.submitButton.on('pointerdown', () => this.handleSubmitAnswer());
        this.uiEntranceTargets.push(this.submitButton, ctaGlow, this.submitLabel);
    }

    /**
     * 하단 2x2 대형 액션 메뉴.
     */
    private createBottomActionMenu (width: number, height: number): void
    {
        const actionItems = [
            { label: '문제 스킬', icon: '✦', color: 0xb84757, stroke: 0xffc5cb },
            { label: '아이템 보관', icon: '⌂', color: 0xc6882f, stroke: 0xf9dca8 },
            { label: '역사 백과', icon: '◈', color: 0x3f67be, stroke: 0xbacbff },
            { label: '전술 후퇴', icon: '➤', color: 0x3f8f69, stroke: 0xbff7d9 }
        ];
        const panelTop = 806;
        const btnW = (width - 30) / 2;
        const btnH = 66;
        const gapX = 8;
        const gapY = 8;

        const tray = this.add.rectangle(width / 2, 882, width - 12, 156, 0x1a1f39).setStrokeStyle(2, 0x5c6db4);
        const trayInner = this.add.rectangle(width / 2, 882, width - 22, 146, 0x20264a).setStrokeStyle(1, 0x8ba0e8, 0.6);
        this.uiEntranceTargets.push(tray, trayInner);

        actionItems.forEach((item, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const x = 10 + (btnW / 2) + (col * (btnW + gapX));
            const y = panelTop + (btnH / 2) + (row * (btnH + gapY));
            const box = this.add.rectangle(x, y, btnW, btnH, item.color)
                .setStrokeStyle(2, item.stroke)
                .setInteractive({ useHandCursor: true });
            const shine = this.add.rectangle(x, y - 17, btnW - 14, 14, 0xffffff, 0.16);
            const icon = this.add.text(x - (btnW / 2) + 24, y + 3, item.icon, {
                fontFamily: 'Arial Black',
                fontSize: '24px',
                color: '#ffffff'
            }).setOrigin(0.5);
            const label = this.add.text(x, y + 3, item.label, {
                fontFamily: 'Arial Black',
                fontSize: '26px',
                color: '#fff8ef'
            }).setOrigin(0.5);

            box.on('pointerdown', () => {
                if (this.battleEnded)
                {
                    return;
                }

                box.setScale(0.98);
                label.setScale(0.96);
                shine.setScale(0.98);
                icon.setScale(0.95);
                this.time.delayedCall(120, () => {
                    box.setScale(1);
                    label.setScale(1);
                    shine.setScale(1);
                    icon.setScale(1);
                });
                this.logMessage = `[${item.label}] 준비 중. 현재는 퀴즈 전투에 집중하세요.`;
                this.refreshBattleUI();
            });

            box.on('pointerover', () => {
                box.setStrokeStyle(2, 0xffffff);
                box.setScale(1.01);
            });
            box.on('pointerout', () => {
                box.setStrokeStyle(2, item.stroke);
                box.setScale(1);
            });

            this.uiEntranceTargets.push(box, shine, icon, label);
        });
    }

    /**
     * 정답 제출 처리:
     * - 정답이면 적 HP 감소
     * - 오답이면 플레이어 HP 감소
     * - 로그 갱신 후 다음 문제 혹은 전투 종료
     */
    private handleSubmitAnswer (): void
    {
        if (this.battleEnded)
        {
            return;
        }

        if (this.selectedChoiceIndex === null)
        {
            this.logMessage = '먼저 보기 1개를 선택하세요.';
            this.refreshBattleUI();
            return;
        }

        const currentQuestion = battleQuestions[this.currentQuestionIndex];
        if (!currentQuestion)
        {
            return;
        }

        const isCorrect = this.selectedChoiceIndex === currentQuestion.correctIndex;
        if (isCorrect)
        {
            this.enemyHp = Math.max(0, this.enemyHp - currentQuestion.correctDamage);
            this.correctAnswers += 1;
            this.enemyStatusText.setText('속성: 화염(약화)');
            this.playerStatusText.setText('속성: 빙결/숲(증폭)');
            this.logMessage = `정답! 선공 성공, 적에게 ${currentQuestion.correctDamage} 피해. ${currentQuestion.explanation}`;
            this.playHitEffect('enemy');
        }
        else
        {
            this.playerHp = Math.max(0, this.playerHp - currentQuestion.wrongDamage);
            this.playerStatusText.setText('속성: 빙결/숲(흔들림)');
            this.enemyStatusText.setText('속성: 화염(강화)');
            this.logMessage = `오답! 상대 반격으로 ${currentQuestion.wrongDamage} 피해. ${currentQuestion.explanation}`;
            this.playHitEffect('player');
        }

        // 현재 문제 처리 완료 후 다음 문제로 이동.
        this.currentQuestionIndex += 1;
        this.selectedChoiceIndex = null;

        // 전투 종료 조건: 문제 소진 or HP 바닥.
        const questionDone = this.currentQuestionIndex >= battleQuestions.length;
        const hpEnded = this.playerHp <= 0 || this.enemyHp <= 0;
        if (questionDone || hpEnded)
        {
            this.finishBattle();
            return;
        }

        this.refreshQuestionUI();
        this.refreshBattleUI();
    }

    /**
     * 전투 종료 및 결과 Scene 이동.
     */
    private finishBattle (): void
    {
        this.battleEnded = true;
        this.result = this.playerHp >= this.enemyHp ? 'WIN' : 'LOSE';
        this.refreshBattleUI();

        // 즉시 전환하면 로그를 읽기 어려우므로 짧은 지연 후 결과 화면으로 이동.
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOver', {
                result: this.result,
                playerHp: this.playerHp,
                enemyHp: this.enemyHp,
                correctAnswers: this.correctAnswers,
                totalQuestions: battleQuestions.length
            });
        });
    }

    /**
     * 현재 문제 텍스트/선택지를 화면에 갱신.
     */
    private refreshQuestionUI (): void
    {
        const q = battleQuestions[this.currentQuestionIndex] as BattleQuestion | undefined;
        if (!q)
        {
            return;
        }

        this.questionTitleText.setText('역사 퀴즈');
        this.questionMetaText.setText('선공 조건 · 정답 시 강공격');
        this.questionCounterText.setText(`Q${this.currentQuestionIndex + 1}/${battleQuestions.length} · 남은 ${battleQuestions.length - this.currentQuestionIndex - 1}`);
        this.questionText.setText(q.question);

        q.choices.forEach((choice, idx) => {
            this.choiceLabels[idx].setText(`${idx + 1}) ${choice}`);
        });

        this.refreshChoiceHighlight();
    }

    /**
     * 선택된 보기의 하이라이트 표시 업데이트.
     */
    private refreshChoiceHighlight (): void
    {
        this.choiceButtons.forEach((button, idx) => {
            const selected = this.selectedChoiceIndex === idx;
            button.setFillStyle(selected ? 0x425da8 : 0x262e4f);
            button.setStrokeStyle(2, selected ? 0xd8e3ff : 0x7f91cf);
            this.choiceGloss[idx].setAlpha(selected ? 0.26 : 0.14);
            this.choiceLabels[idx].setColor(selected ? '#ffffff' : '#f3f7ff');
        });
    }

    /**
     * HP, 로그, 버튼 상태를 묶어서 갱신.
     */
    private refreshBattleUI (): void
    {
        // HP 바는 즉시 점프가 아니라 트윈으로 감소시켜 타격감을 준다.
        this.tweens.add({
            targets: this.playerHpFill,
            scaleX: Math.max(0.01, this.playerHp / 100),
            duration: 300,
            ease: 'Cubic.Out'
        });
        this.tweens.add({
            targets: this.enemyHpFill,
            scaleX: Math.max(0.01, this.enemyHp / 100),
            duration: 300,
            ease: 'Cubic.Out'
        });

        this.playerHpText.setText(`HP ${this.playerHp}`);
        this.enemyHpText.setText(`HP ${this.enemyHp}`);
        this.logText.setText(this.logMessage);

        if (this.battleEnded)
        {
            this.submitButton.setFillStyle(0x576183);
            this.submitLabel.setText('결과 계산 중...');
            this.playerStatusText.setText(this.result === 'WIN' ? '상태: 승리 임박' : '상태: 아쉬운 패배');
            this.enemyStatusText.setText(this.result === 'WIN' ? '상태: 전투불능' : '상태: 방어 성공');
            return;
        }

        this.submitButton.setFillStyle(this.selectedChoiceIndex === null ? 0x6d7fa9 : 0x59a2ff);
        this.submitLabel.setText('정답 제출');
    }

    /**
     * 플레이어/적 캐릭터 배치.
     * 실제 스프라이트 도입 시 createPlayerCharacter/createEnemyCharacter만 교체하면 된다.
     */
    private spawnBattleUnits (width: number): void
    {
        this.playerUnit = this.createPlayerCharacter(138, 327);
        this.enemyUnit = this.createEnemyCharacter(width - 134, 238);

        // 캐릭터 그림자
        this.add.ellipse(138, 346, 96, 24, 0x10142a, 0.45);
        this.add.ellipse(width - 134, 252, 86, 22, 0x10142a, 0.45);
    }

    /**
     * 유닛에 부유감(아이들)을 넣어 완전 정적 상태를 피한다.
     */
    private startIdleTweens (): void
    {
        this.tweens.add({
            targets: this.playerUnit,
            y: this.playerUnit.y - 4,
            duration: 1050,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut'
        });
        this.tweens.add({
            targets: this.enemyUnit,
            y: this.enemyUnit.y - 5,
            duration: 920,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut'
        });

        this.tweens.add({
            targets: this.playerMarker,
            alpha: 0.45,
            duration: 900,
            yoyo: true,
            repeat: -1
        });
        this.tweens.add({
            targets: this.enemyMarker,
            alpha: 0.45,
            duration: 820,
            yoyo: true,
            repeat: -1
        });
        this.tweens.add({
            targets: this.playerAura,
            alpha: 0.28,
            scaleX: 1.06,
            scaleY: 1.06,
            duration: 960,
            yoyo: true,
            repeat: -1
        });
        this.tweens.add({
            targets: this.enemyAura,
            alpha: 0.27,
            scaleX: 1.06,
            scaleY: 1.06,
            duration: 840,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * 정답/오답 제출 시 피격 유닛 반응 연출.
     */
    private playHitEffect (target: 'player' | 'enemy'): void
    {
        const unit = target === 'enemy' ? this.enemyUnit : this.playerUnit;
        const direction = target === 'enemy' ? 1 : -1;
        this.tweens.add({
            targets: unit,
            x: unit.x + (8 * direction),
            duration: 70,
            yoyo: true,
            repeat: 2,
            ease: 'Quad.Out'
        });
        this.tweens.add({
            targets: unit,
            angle: target === 'enemy' ? 4 : -4,
            duration: 70,
            yoyo: true,
            repeat: 2
        });
        this.tweens.add({
            targets: unit,
            alpha: 0.72,
            duration: 55,
            yoyo: true,
            repeat: 2
        });
    }

    /**
     * HUD 박스 생성 헬퍼.
     */
    private createPremiumHudBox (x: number, y: number, width: number, height: number, side: 'player' | 'enemy'): void
    {
        const isPlayer = side === 'player';
        const outer = isPlayer ? 0x1f2b4f : 0x4a2632;
        const inner = isPlayer ? 0x2d3c6d : 0x6a3440;
        const edge = isPlayer ? 0x7adfe1 : 0xffb38e;
        const trim = isPlayer ? 0xbbeeff : 0xffdfd0;
        const base = this.add.rectangle(x, y, width, height, outer).setStrokeStyle(2, edge, 0.85);
        const layer = this.add.rectangle(x, y, width - 8, height - 8, inner).setStrokeStyle(1, trim, 0.65);
        const line = this.add.rectangle(x, y - 28, width - 16, 8, 0xffffff, 0.14);
        this.uiEntranceTargets.push(base, layer, line);
    }

    /**
     * 플레이어 캐릭터: 수정/빙결 정령 느낌.
     * 픽셀맵 + 추가 장식(뿔, 꼬리, 결정)을 조합해 임시 에셋 완성도를 높인다.
     */
    private createPlayerCharacter (x: number, y: number): Phaser.GameObjects.Container
    {
        const container = this.add.container(x, y);
        const graphics = this.add.graphics();
        container.add(graphics);

        const px = 5;
        const map = [
            '...............',
            '.....aac.......',
            '....abbbc......',
            '...abbbbbc.....',
            '..abbbddbbc....',
            '..abbdeddbbc...',
            '..abbbddbbb....',
            '...abbbbbbc....',
            '..ccbbbbbccc...',
            '.ccfbbbbbbfc...',
            '..cffbbfffc....',
            '...cff..ffc....',
            '....f....f.....'
        ];
        const offsetX = -(map[0].length * px) / 2;
        const offsetY = -(map.length * px);

        const palette: Record<string, number> = {
            a: 0x9efff0,
            b: 0x63e9ce,
            c: 0x32bfae,
            d: 0x1f6b89,
            e: 0xffffff,
            f: 0x1a3e5f
        };
        const drawPixel = (pixelX: number, pixelY: number, color: number) => {
            graphics.fillStyle(color, 1);
            graphics.fillRect(pixelX, pixelY, px, px);
        };
        map.forEach((row, rowIdx) => {
            [...row].forEach((cell, colIdx) => {
                const drawX = offsetX + (colIdx * px);
                const drawY = offsetY + (rowIdx * px);
                if (palette[cell])
                {
                    drawPixel(drawX, drawY, palette[cell]);
                }
            });
        });

        // 눈/뿔/꼬리 결정으로 생물형 실루엣을 강화한다.
        const eyeWhite = this.add.rectangle(8, -42, 8, 5, 0xffffff);
        const eyePupil = this.add.rectangle(10, -42, 3, 3, 0x1a3149);
        const hornLeft = this.add.triangle(-18, -62, -6, 10, 0, -10, 7, 10, 0xb8fdff).setStrokeStyle(1, 0x3f9ec4);
        const hornRight = this.add.triangle(-2, -66, -6, 10, 0, -10, 7, 10, 0x90f5ff).setStrokeStyle(1, 0x3586ad);
        const tailCrystal = this.add.triangle(-28, -20, -7, 12, 0, -12, 7, 12, 0x9bf5ff).setStrokeStyle(1, 0x3e93b5);
        container.add([eyeWhite, eyePupil, hornLeft, hornRight, tailCrystal]);
        this.uiEntranceTargets.push(container);

        return container;
    }

    /**
     * 적 캐릭터: 불꽃 냥룡 느낌.
     */
    private createEnemyCharacter (x: number, y: number): Phaser.GameObjects.Container
    {
        const container = this.add.container(x, y);
        const graphics = this.add.graphics();
        container.add(graphics);

        const px = 5;
        const map = [
            '...............',
            '......aa.......',
            '.....abb.......',
            '....abccb......',
            '...abccccc.....',
            '..abccddccc....',
            '..abcdedcc.....',
            '..abccddcc.....',
            '...abbccccb....',
            '..ffbbccbbff...',
            '.fffbbccbbfff..',
            '..ff..bb..ff...',
            '...f......f....'
        ];
        const offsetX = -(map[0].length * px) / 2;
        const offsetY = -(map.length * px);

        const palette: Record<string, number> = {
            a: 0xffc88d,
            b: 0xff9f63,
            c: 0xf06b4a,
            d: 0x8c2f2e,
            e: 0xffffff,
            f: 0x5a232c
        };
        const drawPixel = (pixelX: number, pixelY: number, color: number) => {
            graphics.fillStyle(color, 1);
            graphics.fillRect(pixelX, pixelY, px, px);
        };
        map.forEach((row, rowIdx) => {
            [...row].forEach((cell, colIdx) => {
                const rawX = offsetX + (colIdx * px);
                // 적은 좌향 시점으로 뒤집어 배치한다.
                const drawX = -rawX - px;
                const drawY = offsetY + (rowIdx * px);
                if (palette[cell])
                {
                    drawPixel(drawX, drawY, palette[cell]);
                }
            });
        });

        const eyeWhite = this.add.rectangle(-8, -42, 8, 5, 0xffffff);
        const eyePupil = this.add.rectangle(-10, -42, 3, 3, 0x3a1c21);
        const ear = this.add.triangle(10, -58, -6, 10, 0, -10, 7, 10, 0xffb070).setStrokeStyle(1, 0xb44c37);
        const tail = this.add.triangle(30, -28, -7, 12, 0, -14, 7, 12, 0xff884a).setStrokeStyle(1, 0xb34735);
        const flame = this.add.triangle(36, -34, -8, 16, 0, -18, 8, 16, 0xffd07a).setStrokeStyle(1, 0xd25a3e);
        container.add([eyeWhite, eyePupil, ear, tail, flame]);

        // 불꽃 파츠는 별도 트윈으로 "살아있는 꼬리 불꽃" 느낌을 준다.
        this.tweens.add({
            targets: flame,
            angle: 10,
            duration: 260,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut'
        });
        this.uiEntranceTargets.push(container);
        return container;
    }

    /**
     * 화면 진입 시 UI가 부드럽게 나타나도록 공통 등장 트윈을 적용한다.
     */
    private animateUiEntrance (): void
    {
        this.uiEntranceTargets.forEach((target, index) => {
            const object = target as Phaser.GameObjects.GameObject & { alpha: number; y?: number; };
            object.alpha = 0;
            if (typeof object.y === 'number')
            {
                object.y += 8;
            }
            this.tweens.add({
                targets: object,
                alpha: 1,
                y: typeof object.y === 'number' ? object.y - 8 : undefined,
                duration: 260,
                delay: Math.min(index * 8, 220),
                ease: 'Cubic.Out'
            });
        });
    }
}
