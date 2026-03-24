import { Scene } from 'phaser';
import { shopItems } from '../data/shop';

export class ShopScene extends Scene
{
    constructor ()
    {
        super('ShopScene');
    }

    create ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#eef5ff');
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xf5f8ff, 0xf5f8ff, 0xe9f7ff, 0xe9f7ff, 1);
        bg.fillRect(0, 0, width, height);

        this.add.text(20, 20, '상점 / 스페셜 오퍼', { fontFamily: 'Arial Black', fontSize: '30px', color: '#43629b' });
        this.add.text(width - 20, 22, '골드 12,840 · 젬 1,420 · 티켓 6', { fontFamily: 'Arial', fontSize: '14px', color: '#6a84b7' }).setOrigin(1, 0);

        this.createBanner(width / 2, 84, width - 24, 38, 0x4e6bd3, '첫 구매 보너스');
        this.createBanner(width / 2, 126, width - 24, 34, 0x5d4eb3, '한정 스타터 패키지');
        this.createBanner(width / 2, 164, width - 24, 34, 0x3d7cad, '이번 주 추천 번들');

        let y = 196;
        shopItems.forEach((item) => {
            const card = this.add.rectangle(width / 2, y + 52, width - 24, 96, 0xffffff).setStrokeStyle(2, 0xc2d6fb).setInteractive({ useHandCursor: true });
            this.add.rectangle(70, y + 52, 92, 70, 0x8aa4e8).setStrokeStyle(1, 0xe5efff);
            this.add.text(70, y + 52, item.recommendedTag, { fontFamily: 'Arial Black', fontSize: '12px', color: '#ffffff', align: 'center', wordWrap: { width: 84 } }).setOrigin(0.5);
            this.add.text(124, y + 20, item.name, { fontFamily: 'Arial Black', fontSize: '18px', color: '#475f95' });
            this.add.text(124, y + 44, item.description, { fontFamily: 'Arial', fontSize: '13px', color: '#6884b9' });
            this.add.text(124, y + 66, `${item.banner}${item.limited ? ' · LIMITED' : ''}`, { fontFamily: 'Arial', fontSize: '12px', color: '#c36f66' });
            this.add.text(width - 24, y + 20, item.priceLabel, { fontFamily: 'Arial Black', fontSize: '18px', color: '#8c69d9' }).setOrigin(1, 0);
            const buy = this.add.rectangle(width - 72, y + 64, 90, 34, 0x4f99ff).setStrokeStyle(1, 0xe8f1ff).setInteractive({ useHandCursor: true });
            this.add.text(width - 72, y + 64, '구매', { fontFamily: 'Arial Black', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
            buy.on('pointerdown', () => this.toast(`${item.name} 구매는 데모에서 비활성화되어 있습니다.`));
            card.on('pointerover', () => card.setScale(1.005));
            card.on('pointerout', () => card.setScale(1));
            y += 104;
        });

        this.add.text(width / 2, height - 82, '실제 결제는 연결되지 않은 데모 화면입니다.', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#6e84b6'
        }).setOrigin(0.5);

        const passBtn = this.createButton(width / 2 - 110, height - 40, 200, 50, 0x6051b8, '시즌 패스');
        const lobbyBtn = this.createButton(width / 2 + 110, height - 40, 200, 50, 0x3a4d7f, '로비');
        passBtn.on('pointerdown', () => this.scene.start('PassScene'));
        lobbyBtn.on('pointerdown', () => this.scene.start('LobbyScene'));
    }

    private createBanner (x: number, y: number, w: number, h: number, color: number, text: string): void
    {
        this.add.rectangle(x, y, w, h, color).setStrokeStyle(1, 0xcad8ff);
        this.add.text(20, y - 8, text, { fontFamily: 'Arial Black', fontSize: '15px', color: '#f5f8ff' });
    }

    private createButton (x: number, y: number, w: number, h: number, color: number, label: string): Phaser.GameObjects.Rectangle
    {
        const box = this.add.rectangle(x, y, w, h, color).setStrokeStyle(1, 0xe7eeff).setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, { fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
        return box;
    }

    private toast (message: string): void
    {
        const { width } = this.scale;
        const bg = this.add.rectangle(width / 2, 186, width - 56, 40, 0x334f8d).setStrokeStyle(1, 0xcce0ff);
        const text = this.add.text(width / 2, 186, message, { fontFamily: 'Arial', fontSize: '14px', color: '#edf4ff' }).setOrigin(0.5);
        this.tweens.add({ targets: [bg, text], alpha: 0, duration: 700, delay: 600, onComplete: () => { bg.destroy(); text.destroy(); } });
    }
}
