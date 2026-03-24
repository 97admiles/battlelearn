import { Scene } from 'phaser';
import { questionBank } from '../data/questions';
import { getSolvedQuestionIds } from '../data/playerProgress';
import { C, T } from '../ui/designTokens';
import { fillRoundedPanel } from '../ui/drawRoundedRect';
import { addRoundedRectButton } from '../ui/roundedButton';

export class QuestionInventoryScene extends Scene
{
    constructor ()
    {
        super('QuestionInventoryScene');
    }

    create ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#f4f6f9');
        const bg = this.add.graphics();
        bg.fillGradientStyle(C.page, C.page, 0xeff6ff, C.page, 1);
        bg.fillRect(0, 0, width, height);

        const solved = getSolvedQuestionIds();
        const header = this.add.graphics();
        fillRoundedPanel(header, 12, 12, width - 24, 92, 14, C.surface, C.border, 1);
        this.add.text(24, 30, '문제 보유함', { ...T.title, fontSize: '18px' });
        this.add.text(24, 54, `획득 문항 ${solved.size}개 · 전체 ${questionBank.length}개`, { ...T.caption });
        this.add.text(width - 24, 30, '필터: 과목/난이도', { ...T.caption }).setOrigin(1, 0);
        this.add.text(width - 24, 52, '정렬: 최신순', { ...T.caption, color: '#2563eb' }).setOrigin(1, 0);

        const chips = this.add.graphics();
        fillRoundedPanel(chips, 12, 112, width - 24, 48, 12, C.surface, C.border, 1);
        this.add.text(24, 130, '전체 · 역사 · 수학 · 영어 · 과학 · 자격증/상식', { ...T.caption, fontSize: '12px' });

        const listCard = this.add.graphics();
        fillRoundedPanel(listCard, 12, 170, width - 24, 506, 14, C.surface, C.border, 1);
        let y = 186;
        questionBank.slice(0, 6).forEach((q, idx) => {
            const card = this.add.rectangle(width / 2, y + 34, width - 38, 66, 0xf8fafc).setStrokeStyle(1, C.borderStrong);
            const badgeColor = q.difficulty === '챌린지' ? 0xd85f7f : q.difficulty === '심화' ? 0x7d6be4 : q.difficulty === '중급' ? 0x3d8fd4 : 0x40b88a;
            this.add.rectangle(54, y + 23, 64, 22, badgeColor).setStrokeStyle(1, 0xe6efff);
            this.add.text(54, y + 23, q.subject, { ...T.caption, fontSize: '11px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
            this.add.text(92, y + 16, `[${q.difficulty}] ${q.question.slice(0, 24)}...`, { ...T.body, fontSize: '13px', color: '#1c2333', fontStyle: 'bold' });
            this.add.text(92, y + 35, `XP ${q.rewardXp} · 지식 ${q.rewardKnowledge} · 공격 ${q.damage} / 리스크 ${q.risk}`, { ...T.caption, fontSize: '11px' });
            const own = solved.has(q.id);
            this.add.text(width - 30, y + 24, own ? '획득' : '미획득', { ...T.caption, fontSize: '11px', color: own ? '#059669' : '#94a3b8', fontStyle: 'bold' }).setOrigin(1, 0.5);
            this.add.text(width - 30, y + 42, idx % 2 === 0 ? '★' : '☆', { ...T.caption, fontSize: '18px', color: '#f59e0b' }).setOrigin(1, 0.5);
            card.on('pointerdown', () => this.flashInfo(`문제 상세(mock): ${q.id}`));
            card.setInteractive({ useHandCursor: true });
            y += 78;
        });

        addRoundedRectButton(this, width * 0.28, 702, 160, 44, {
            fill: C.neutralButton,
            fillHover: 0xf1f5f9,
            stroke: C.borderStrong,
            label: '로비',
            textStyle: { ...T.buttonSecondary, fontSize: '14px' },
            onClick: () => this.scene.start('LobbyScene')
        });
        addRoundedRectButton(this, width * 0.72, 702, 160, 44, {
            fill: C.accent,
            fillHover: C.accentHover,
            stroke: C.accentHover,
            label: '배틀 진입',
            textStyle: { ...T.button, fontSize: '14px' },
            onClick: () =>
            {
                const sub = this.registry.get('currentSubject');
                this.scene.start('BattleScene', { subject: sub });
            }
        });
        this.drawBottomTabs('문제');
    }

    private flashInfo (message: string): void
    {
        const { width } = this.scale;
        const bg = this.add.rectangle(width / 2, 96, width - 40, 40, 0x1e293b).setStrokeStyle(1, 0x334155);
        const text = this.add.text(width / 2, 96, message, { ...T.caption, fontSize: '12px', color: '#eef3ff' }).setOrigin(0.5);
        this.tweens.add({ targets: [bg, text], alpha: 0, duration: 700, delay: 500, onComplete: () => { bg.destroy(); text.destroy(); } });
    }

    private drawBottomTabs (activeLabel: '홈' | '배틀' | '덱' | '문제' | '상점'): void
    {
        const { width, height } = this.scale;
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
            const active = tab.label === activeLabel;
            const box = this.add.rectangle(x, height - 28, tabW - 8, 44, active ? C.accentSoft : C.surface).setStrokeStyle(1, active ? C.accent : C.border).setInteractive({ useHandCursor: true });
            this.add.text(x, height - 28, tab.label, { ...T.caption, fontSize: '13px', color: active ? '#2563eb' : '#5a6472', fontStyle: active ? 'bold' : 'normal' }).setOrigin(0.5);
            box.on('pointerdown', () => this.scene.start(tab.scene));
        });
    }
}
