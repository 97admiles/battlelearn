import { Scene } from 'phaser';
import {
    bandLabelKo,
    difficultyBandForLevel,
    learnerLevelFromSolvedInSubject,
    pickNextStudyQuestion
} from '../data/questions';
import type { BattleQuestion, Subject } from '../data/questions';
import {
    getSolvedCountForSubject,
    getSolvedQuestionIds,
    isQuestionSolved,
    markQuestionSolved
} from '../data/playerProgress';
import { C, T } from '../ui/designTokens';
import { fillRoundedPanel } from '../ui/drawRoundedRect';
import { addRoundedRectButton } from '../ui/roundedButton';

/**
 * 과목별 학습 — 정답 시 해당 문제 ID가 스킬로 해금된다.
 * 난이도는 해당 과목 누적 풀이 수로 추정한 레벨에 맞춰 은행에서 골라 낸다.
 */
export class StudyScene extends Scene
{
    private subject: Subject = '역사';
    private current!: BattleQuestion;
    private selected: number | null = null;
    private panelLayer!: Phaser.GameObjects.Container;
    private modalLayer: Phaser.GameObjects.Container | null = null;
    private choiceRedrawers: Array<() => void> = [];

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
        const pageBg = this.add.graphics();
        pageBg.fillGradientStyle(C.page, C.page, 0xeff6ff, C.page, 1);
        pageBg.fillRect(0, 0, width, height);

        const header = this.add.graphics();
        fillRoundedPanel(header, 12, 12, width - 24, 56, 12, C.surface, C.border, 1);
        this.add.text(24, 28, `문제 풀기 · ${this.subject}`, { ...T.title, fontSize: '18px' });
        this.add.text(width - 24, 28, '정답 시 스킬 해금', { ...T.caption }).setOrigin(1, 0.5);

        this.panelLayer = this.add.container(0, 0);
        this.pickNextQuestion();
        this.rebuildPanel(width, height);

        addRoundedRectButton(this, 72, height - 36, 120, 42, {
            fill: C.neutralButton,
            fillHover: 0xf1f5f9,
            stroke: C.borderStrong,
            radius: 12,
            label: '로비',
            textStyle: { ...T.buttonSecondary, fontSize: '15px' },
            onClick: () => this.scene.start('LobbyScene', { subject: this.subject })
        });
    }

    private pickNextQuestion (): void
    {
        const ids = getSolvedQuestionIds();
        const subN = getSolvedCountForSubject(this.subject);
        this.current = pickNextStudyQuestion(this.subject, ids, subN);
        this.selected = null;
    }

    private rebuildPanel (width: number, height: number): void
    {
        this.panelLayer.removeAll(true);
        this.choiceRedrawers = [];

        const subN = getSolvedCountForSubject(this.subject);
        const lvl = learnerLevelFromSolvedInSubject(subN);
        const band = difficultyBandForLevel(lvl);
        const bandStr = bandLabelKo(band);

        const card = this.add.graphics();
        fillRoundedPanel(card, 14, 76, width - 28, height - 188, 16, C.surface, C.border, 1);
        this.panelLayer.add(card);

        const chip = this.add.graphics();
        const chipW = 168;
        chip.fillStyle(C.accentSoft, 1);
        chip.lineStyle(1, 0xbfdbfe, 1);
        chip.fillRoundedRect(28, 92, chipW, 26, 8);
        chip.strokeRoundedRect(28, 92, chipW, 26, 8);
        this.panelLayer.add(chip);
        this.panelLayer.add(this.add.text(36, 105, `Lv.${lvl} · 추천 ${bandStr}`, {
            ...T.caption,
            fontSize: '12px',
            color: '#1d4ed8',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5));

        const q = this.current;
        this.panelLayer.add(this.add.text(28, 132, `이번 문항 · ${q.difficulty}`, {
            ...T.caption,
            color: '#2563eb',
            fontStyle: 'bold'
        }));
        this.panelLayer.add(this.add.text(28, 154, q.question, {
            ...T.body,
            fontSize: '16px',
            color: '#1c2333',
            fontStyle: 'bold',
            wordWrap: { width: width - 56 }
        }));

        const startY = 228;
        const btnH = 46;
        const gap = 10;
        const x0 = 22;
        const wCh = width - 44;

        q.choices.forEach((c, i) =>
        {
            const cy = startY + i * (btnH + gap);
            const g = this.add.graphics();
            const redraw = (): void =>
            {
                const sel = this.selected === i;
                g.clear();
                g.fillStyle(sel ? C.accentSoft : C.neutralButton, 1);
                g.lineStyle(sel ? 2 : 1, sel ? C.accent : C.borderStrong, 1);
                g.fillRoundedRect(x0, cy - btnH / 2, wCh, btnH, 12);
                g.strokeRoundedRect(x0, cy - btnH / 2, wCh, btnH, 12);
            };
            redraw();
            g.setInteractive(
                new Phaser.Geom.Rectangle(x0, cy - btnH / 2, wCh, btnH),
                Phaser.Geom.Rectangle.Contains
            );
            g.on('pointerdown', () =>
            {
                this.selected = i;
                this.choiceRedrawers.forEach(fn => fn());
            });
            this.choiceRedrawers.push(redraw);
            this.panelLayer.add(g);

            const lab = this.add.text(x0 + 14, cy, `${i + 1}. ${c}`, {
                ...T.body,
                fontSize: '14px',
                wordWrap: { width: wCh - 28 },
                color: '#1c2333'
            }).setOrigin(0, 0.5);
            this.panelLayer.add(lab);
        });

        const sub = addRoundedRectButton(this, width / 2, height - 100, width - 48, 50, {
            fill: C.accent,
            fillHover: C.accentHover,
            stroke: C.accentHover,
            radius: 14,
            label: '채점하기',
            textStyle: { ...T.button, fontSize: '16px' },
            onClick: () => this.onSubmit(width, height)
        });
        this.panelLayer.add(sub.graphics);
        this.panelLayer.add(sub.text);
    }

    private onSubmit (width: number, height: number): void
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
            ? (wasNew ? '정답입니다. 새 스킬이 덱에 추가됐어요.' : '정답입니다. (이미 획득한 스킬 복습)')
            : `오답이에요.\n${q.explanation}`;

        if (this.modalLayer !== null)
        {
            this.modalLayer.destroy(true);
            this.modalLayer = null;
        }

        const m = this.add.container(0, 0).setDepth(2500);
        this.modalLayer = m;

        const dim = this.add.graphics();
        dim.fillStyle(0x0f172a, 0.42);
        dim.fillRect(0, 0, width, height);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        m.add(dim);

        const boxW = width - 40;
        const boxH = 168;
        const boxY = height / 2 - 20;
        const boxG = this.add.graphics();
        fillRoundedPanel(boxG, width / 2 - boxW / 2, boxY - boxH / 2, boxW, boxH, 18, C.surface, C.borderStrong, 1);
        m.add(boxG);

        m.add(this.add.text(width / 2, boxY - 38, ok ? '결과' : '해설', {
            ...T.title,
            fontSize: '17px'
        }).setOrigin(0.5));

        m.add(this.add.text(width / 2, boxY + 8, msg, {
            ...T.body,
            fontSize: '14px',
            color: ok ? '#047857' : '#b45309',
            align: 'center',
            wordWrap: { width: boxW - 36 }
        }).setOrigin(0.5));

        const next = addRoundedRectButton(this, width / 2, boxY + boxH / 2 + 36, boxW - 32, 48, {
            fill: C.accent,
            fillHover: C.accentHover,
            stroke: C.accentHover,
            radius: 14,
            label: '다음 문제',
            textStyle: { ...T.button, fontSize: '15px' },
            onClick: () =>
            {
                if (this.modalLayer !== null)
                {
                    this.modalLayer.destroy(true);
                    this.modalLayer = null;
                }
                this.pickNextQuestion();
                this.rebuildPanel(width, height);
            }
        });
        m.add(next.graphics);
        m.add(next.text);
    }
}
