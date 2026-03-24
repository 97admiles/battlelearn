import { Scene } from 'phaser';
import { shopItems } from '../data/shop';
import { C, T } from '../ui/designTokens';
import { fillRoundedPanel } from '../ui/drawRoundedRect';
import { addRoundedRectButton } from '../ui/roundedButton';

export class ShopScene extends Scene
{
    constructor ()
    {
        super('ShopScene');
    }

    create ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#f4f6f9');
        const bg = this.add.graphics();
        bg.fillGradientStyle(C.page, C.page, 0xeff6ff, C.page, 1);
        bg.fillRect(0, 0, width, height);

        const header = this.add.graphics();
        fillRoundedPanel(header, 12, 12, width - 24, 92, 14, C.surface, C.border, 1);
        this.add.text(24, 30, '상점', { ...T.title, fontSize: '18px' });
        this.add.text(24, 54, '학습 효율을 높이는 데모 상품', { ...T.caption });
        this.add.text(width - 24, 30, '골드 12,840', { ...T.caption, color: '#5a6472' }).setOrigin(1, 0);
        this.add.text(width - 24, 50, '젬 1,420 · 티켓 6', { ...T.caption, color: '#5a6472' }).setOrigin(1, 0);

        const promos = this.add.graphics();
        fillRoundedPanel(promos, 12, 112, width - 24, 64, 12, C.accentSoft, C.border, 1);
        this.add.text(24, 126, '첫 구매 보너스 + 이번 주 추천 번들', { ...T.body, fontSize: '13px', color: '#1d4ed8', fontStyle: 'bold' });
        this.add.text(24, 148, '실제 결제는 연결되지 않은 데모 화면입니다.', { ...T.caption, fontSize: '12px' });

        const list = this.add.graphics();
        fillRoundedPanel(list, 12, 184, width - 24, 492, 14, C.surface, C.border, 1);
        let y = 200;
        shopItems.slice(0, 4).forEach((item) => {
            const card = this.add.rectangle(width / 2, y + 52, width - 36, 96, 0xf8fafc).setStrokeStyle(1, C.borderStrong).setInteractive({ useHandCursor: true });
            this.add.rectangle(54, y + 52, 58, 58, item.limited ? 0x8b5cf6 : 0x3b82f6).setStrokeStyle(1, 0xe5efff);
            this.add.text(54, y + 50, item.recommendedTag, { ...T.caption, fontSize: '10px', color: '#ffffff', align: 'center', wordWrap: { width: 52 } }).setOrigin(0.5);
            this.add.text(92, y + 22, item.name, { ...T.body, fontSize: '14px', color: '#1c2333', fontStyle: 'bold' });
            this.add.text(92, y + 42, item.description, { ...T.caption, fontSize: '11px', wordWrap: { width: width - 230 } });
            this.add.text(92, y + 62, `${item.banner}${item.limited ? ' · LIMITED' : ''}`, { ...T.caption, fontSize: '11px', color: '#b45309' });
            this.add.text(width - 100, y + 22, item.priceLabel, { ...T.body, fontSize: '14px', color: '#7c3aed', fontStyle: 'bold' }).setOrigin(1, 0);
            const buy = addRoundedRectButton(this, width - 70, y + 62, 92, 34, {
                fill: C.accent,
                fillHover: C.accentHover,
                stroke: C.accentHover,
                radius: 10,
                label: '구매',
                textStyle: { ...T.button, fontSize: '13px' },
                onClick: () => this.toast(`${item.name} 구매는 데모에서 비활성화되어 있습니다.`)
            });
            card.on('pointerover', () => card.setFillStyle(0xf1f5f9));
            card.on('pointerout', () => card.setFillStyle(0xf8fafc));
            buy.graphics.setDepth(2);
            buy.text.setDepth(3);
            y += 106;
        });

        addRoundedRectButton(this, width * 0.28, 702, 160, 44, {
            fill: C.neutralButton,
            fillHover: 0xf1f5f9,
            stroke: C.borderStrong,
            label: '시즌 패스',
            textStyle: { ...T.buttonSecondary, fontSize: '14px' },
            onClick: () => this.scene.start('PassScene')
        });
        addRoundedRectButton(this, width * 0.72, 702, 160, 44, {
            fill: C.neutralButton,
            fillHover: 0xf1f5f9,
            stroke: C.borderStrong,
            label: '로비',
            textStyle: { ...T.buttonSecondary, fontSize: '14px' },
            onClick: () => this.scene.start('LobbyScene')
        });
        this.drawBottomTabs('상점');
    }

    private toast (message: string): void
    {
        const { width } = this.scale;
        const bg = this.add.rectangle(width / 2, 186, width - 56, 40, 0x1e293b).setStrokeStyle(1, 0x334155);
        const text = this.add.text(width / 2, 186, message, { ...T.caption, fontSize: '12px', color: '#edf4ff' }).setOrigin(0.5);
        this.tweens.add({ targets: [bg, text], alpha: 0, duration: 700, delay: 600, onComplete: () => { bg.destroy(); text.destroy(); } });
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
