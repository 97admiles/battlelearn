import { Scene } from 'phaser';
import { equippedDeckIds, skillCards } from '../data/skillCards';
import { C, T } from '../ui/designTokens';
import { fillRoundedPanel } from '../ui/drawRoundedRect';
import { addRoundedRectButton } from '../ui/roundedButton';

export class DeckScene extends Scene
{
    constructor ()
    {
        super('DeckScene');
    }

    create ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#f4f6f9');
        const bg = this.add.graphics();
        bg.fillGradientStyle(C.page, C.page, 0xeff6ff, C.page, 1);
        bg.fillRect(0, 0, width, height);

        const header = this.add.graphics();
        fillRoundedPanel(header, 12, 12, width - 24, 84, 14, C.surface, C.border, 1);
        this.add.text(24, 28, '덱 관리', { ...T.title, fontSize: '18px' });
        this.add.text(24, 52, '배틀에 사용할 스킬 조합을 빠르게 확인하세요.', { ...T.caption });
        this.add.text(width - 24, 28, `장착 ${equippedDeckIds.length}/6`, { ...T.caption, color: '#1d4ed8', fontStyle: 'bold' }).setOrigin(1, 0);

        const equipCard = this.add.graphics();
        fillRoundedPanel(equipCard, 12, 106, width - 24, 130, 14, C.surface, C.border, 1);
        this.add.text(24, 120, '현재 장착 덱', { ...T.body, color: '#1c2333', fontStyle: 'bold' });
        for (let i = 0; i < 6; i++)
        {
            const slotW = (width - 48 - (5 * 8)) / 6;
            const x = 24 + (i * (slotW + 8));
            const active = i < equippedDeckIds.length;
            const cx = x + (slotW / 2);
            this.add.rectangle(cx, 176, slotW, 66, active ? 0xdbeafe : 0xf1f5f9).setStrokeStyle(1, active ? 0x93c5fd : C.borderStrong);
            this.add.text(cx, 170, active ? `슬롯 ${i + 1}` : '비어 있음', { ...T.caption, fontSize: '11px', color: active ? '#1d4ed8' : '#64748b' }).setOrigin(0.5);
            this.add.text(cx, 188, active ? '사용 중' : '+', { ...T.body, fontSize: active ? '13px' : '16px', color: active ? '#0369a1' : '#64748b', fontStyle: 'bold' }).setOrigin(0.5);
        }

        const listCard = this.add.graphics();
        fillRoundedPanel(listCard, 12, 246, width - 24, 430, 14, C.surface, C.border, 1);
        this.add.text(24, 260, '추천 카드', { ...T.body, color: '#1c2333', fontStyle: 'bold' });

        let y = 282;
        skillCards.slice(0, 4).forEach((card) => {
            this.add.rectangle(width / 2, y + 44, width - 40, 82, 0xf8fafc).setStrokeStyle(1, C.borderStrong);
            this.add.rectangle(54, y + 44, 56, 56, Number(card.colorTheme.replace('#', '0x'))).setStrokeStyle(1, 0xe7eeff);
            this.add.text(54, y + 44, card.rarity.substring(0, 1), { ...T.button, fontSize: '18px' }).setOrigin(0.5);
            this.add.text(92, y + 26, `${card.name} · ${card.type}`, { ...T.body, fontSize: '14px', color: '#1e293b', fontStyle: 'bold' });
            this.add.text(92, y + 46, `비용 ${card.resourceCost} · 추천 ${card.recommendedSubjects.join('/')}`, { ...T.caption, fontSize: '12px' });
            this.add.text(92, y + 62, card.effect, { ...T.caption, fontSize: '12px', color: '#059669' });
            y += 94;
        });

        addRoundedRectButton(this, width * 0.28, 702, 160, 44, {
            fill: C.neutralButton,
            fillHover: 0xf1f5f9,
            stroke: C.borderStrong,
            label: '카드 장착',
            textStyle: { ...T.buttonSecondary, fontSize: '14px' },
            onClick: () => this.flashToast('선택 카드 장착 완료 (데모)')
        });
        addRoundedRectButton(this, width * 0.72, 702, 160, 44, {
            fill: C.neutralButton,
            fillHover: 0xf1f5f9,
            stroke: C.borderStrong,
            label: '카드 해제',
            textStyle: { ...T.buttonSecondary, fontSize: '14px' },
            onClick: () => this.flashToast('선택 카드 해제 완료 (데모)')
        });

        this.drawBottomTabs('덱');
    }

    private flashToast (message: string): void
    {
        const { width } = this.scale;
        const toast = this.add.rectangle(width / 2, 160, width - 60, 42, 0x1e293b, 0.94).setStrokeStyle(1, 0x334155);
        const text = this.add.text(width / 2, 160, message, { ...T.body, fontSize: '13px', color: '#f8fafc' }).setOrigin(0.5);
        this.tweens.add({ targets: [toast, text], alpha: 0, y: '-=10', duration: 700, delay: 500, onComplete: () => { toast.destroy(); text.destroy(); } });
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
