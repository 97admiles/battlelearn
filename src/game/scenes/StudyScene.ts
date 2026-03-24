import { Scene } from 'phaser';
import { questionBank } from '../data/questions';
import type { BattleQuestion, Subject } from '../data/questions';
import { markQuestionSolved, isQuestionSolved } from '../data/playerProgress';
import { C, T } from '../ui/designTokens';
import { fillRoundedPanel } from '../ui/drawRoundedRect';

/**
 * 과목별 학습 — 정답 시 해당 문제 ID가 스킬로 해금된다.
 */
export class StudyScene extends Scene
{
    private subject: Subject = '역사';
    private current!: BattleQuestion;
    private selected: number | null = null;

    constructor ()
    {
        super('StudyScene');
    }

    init (data: { subject?: Subject })
    {
        this.subject = data?.subject ?? (this.registry.get('currentSubject') as Subject) ?? '역사';
        this.registry.set('currentSubject', this.subject);
    }

    create ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#f4f6f9');
        const g = this.add.graphics();
        g.fillGradientStyle(C.page, C.page, 0xeff6ff, C.page, 1);
        g.fillRect(0, 0, width, height);

        const header = this.add.graphics();
        fillRoundedPanel(header, 12, 12, width - 24, 56, 12, C.surface, C.border, 1);
        this.add.text(24, 28, `학습 · ${this.subject}`, { ...T.title, fontSize: '18px' });
        this.add.text(width - 24, 28, '정답 시 스킬 해금', { ...T.caption }).setOrigin(1, 0.5);

        this.pickNextQuestion();
        this.renderPanel(width, height);

        const back = this.add.rectangle(72, height - 36, 120, 40, C.neutralButton).setStrokeStyle(1, C.borderStrong).setInteractive({ useHandCursor: true });
        this.add.text(72, height - 36, '로비', { ...T.buttonSecondary, fontSize: '15px' }).setOrigin(0.5);
        back.on('pointerdown', () => this.scene.start('LobbyScene', { subject: this.subject }));
    }

    private poolForSubject (): BattleQuestion[]
    {
        return questionBank.filter(q => q.subject === this.subject);
    }

    private pickNextQuestion (): void
    {
        const pool = this.poolForSubject();
        if (pool.length === 0)
        {
            this.current = questionBank[0];
            return;
        }
        const unsolved = pool.filter(q => !isQuestionSolved(q.id));
        const use = unsolved.length > 0 ? unsolved : pool;
        this.current = use[Math.floor(Math.random() * use.length)];
        this.selected = null;
    }

    private panelTexts: Phaser.GameObjects.Text[] = [];
    private choiceBoxes: Phaser.GameObjects.Rectangle[] = [];
    private submitBtn!: Phaser.GameObjects.Rectangle;

    private renderPanel (width: number, height: number): void
    {
        this.panelTexts.forEach(t => t.destroy());
        this.choiceBoxes.forEach(b => b.destroy());
        this.panelTexts = [];
        this.choiceBoxes = [];
        if (this.submitBtn) this.submitBtn.destroy();

        const card = this.add.graphics();
        fillRoundedPanel(card, 14, 88, width - 28, height - 200, 16, C.surface, C.border, 1);

        const q = this.current;
        const t1 = this.add.text(28, 108, `[${q.difficulty}]`, { ...T.caption, color: '#2563eb', fontStyle: 'bold' });
        const t2 = this.add.text(28, 132, q.question, { ...T.body, fontSize: '16px', color: '#1c2333', fontStyle: 'bold', wordWrap: { width: width - 56 } });
        this.panelTexts.push(t1, t2);

        const startY = 220;
        const btnH = 44;
        const gap = 8;
        q.choices.forEach((c, i) =>
        {
            const y = startY + i * (btnH + gap);
            const box = this.add.rectangle(width / 2, y, width - 40, btnH, C.neutralButton).setStrokeStyle(1, C.borderStrong).setInteractive({ useHandCursor: true });
            const lab = this.add.text(width / 2, y, `${i + 1}) ${c}`, { ...T.body, fontSize: '14px', wordWrap: { width: width - 56 }, align: 'center' }).setOrigin(0.5);
            box.on('pointerdown', () =>
            {
                this.selected = i;
                this.choiceBoxes.forEach((b, bi) => b.setFillStyle(bi === i ? C.accentSoft : C.neutralButton));
            });
            this.choiceBoxes.push(box);
            this.panelTexts.push(lab);
        });

        this.submitBtn = this.add.rectangle(width / 2, height - 100, width - 48, 48, C.accent).setInteractive({ useHandCursor: true });
        this.add.text(width / 2, height - 100, '채점', T.button).setOrigin(0.5);
        this.submitBtn.on('pointerdown', () => this.onSubmit());
    }

    private onSubmit (): void
    {
        if (this.selected === null) return;
        const q = this.current;
        const ok = this.selected === q.correctIndex;
        let wasNew = false;
        if (ok)
        {
            wasNew = !isQuestionSolved(q.id);
            if (wasNew) markQuestionSolved(q.id);
        }
        const msg = ok
            ? (wasNew ? '정답! 새 스킬이 추가되었습니다.' : '정답! (이미 획득한 스킬 복습)')
            : `오답 — ${q.explanation}`;

        const { width } = this.scale;
        const tip = this.add.rectangle(width / 2, 400, width - 48, 120, 0x1e293b).setStrokeStyle(1, C.border);
        const tx = this.add.text(width / 2, 392, msg, { fontFamily: 'Arial', fontSize: '14px', color: '#f8fafc', wordWrap: { width: width - 72 }, align: 'center' }).setOrigin(0.5);

        const next = this.add.rectangle(width / 2, 470, width - 48, 44, C.accent).setInteractive({ useHandCursor: true });
        this.add.text(width / 2, 470, '다음 문제', T.button).setOrigin(0.5);
        next.on('pointerdown', () =>
        {
            tip.destroy();
            tx.destroy();
            next.destroy();
            this.scene.start('StudyScene', { subject: this.subject });
        });
    }
}
