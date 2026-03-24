import { Scene } from 'phaser';
import { equippedDeckIds, skillCards } from '../data/skillCards';

export class DeckScene extends Scene
{
    constructor ()
    {
        super('DeckScene');
    }

    create ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#eef5ff');
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xf4f8ff, 0xf4f8ff, 0xe8fbf6, 0xe8fbf6, 1);
        bg.fillRect(0, 0, width, height);

        this.add.text(20, 20, '덱 편성 / 스킬카드 관리', { fontFamily: 'Arial Black', fontSize: '30px', color: '#3f5e96' });
        this.add.text(width - 20, 28, 'AI 추천 활성화', { fontFamily: 'Arial', fontSize: '14px', color: '#5e82bb' }).setOrigin(1, 0);

        // 장착 덱 슬롯
        this.add.rectangle(width / 2, 120, width - 28, 134, 0xffffff).setStrokeStyle(2, 0xb9cdf5);
        this.add.text(24, 76, '현재 장착 덱 (5/6)', { fontFamily: 'Arial Black', fontSize: '18px', color: '#4a689e' });
        for (let i = 0; i < 6; i++)
        {
            const x = 24 + (i * 84);
            const active = i < equippedDeckIds.length;
            this.add.rectangle(x + 38, 126, 72, 80, active ? 0x7fa9ff : 0xdde6fb).setStrokeStyle(2, active ? 0xf3f8ff : 0xb2c5ee);
            this.add.text(x + 38, 126, active ? `${i + 1}` : '+', { fontFamily: 'Arial Black', fontSize: '24px', color: active ? '#ffffff' : '#4f6798' }).setOrigin(0.5);
        }

        // 스탯
        this.add.rectangle(width / 2, 232, width - 28, 92, 0xffffff).setStrokeStyle(2, 0xbad0f7);
        const stats = ['공격 78', '오답 방어 61', '개념 이해 84', '기억 지속력 71', '복습 효율 88'];
        stats.forEach((s, i) => this.add.text(26 + (i * 102), 220, s, { fontFamily: 'Arial', fontSize: '14px', color: '#5f78ad' }));

        // 필터
        this.add.rectangle(width / 2, 286, width - 28, 42, 0xf8fbff).setStrokeStyle(1, 0xc5d8fb);
        this.add.text(24, 274, '필터: 공격형 · 방어형 · 복습형 · 서포트형', { fontFamily: 'Arial', fontSize: '14px', color: '#5f78ad' });

        // 카드 목록
        let y = 318;
        skillCards.slice(0, 6).forEach((card) => {
            this.add.rectangle(width / 2, y + 44, width - 28, 82, 0xffffff).setStrokeStyle(2, 0xc1d5fb);
            this.add.rectangle(64, y + 44, 78, 62, Number(card.colorTheme.replace('#', '0x'))).setStrokeStyle(1, 0xe7eeff);
            this.add.text(64, y + 44, card.rarity.substring(0, 1), { fontFamily: 'Arial Black', fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
            this.add.text(116, y + 18, `${card.name} [${card.rarity}]`, { fontFamily: 'Arial Black', fontSize: '17px', color: '#465f95' });
            this.add.text(116, y + 40, `${card.type} · 비용 ${card.resourceCost} · 추천 ${card.recommendedSubjects.join('/')}`, { fontFamily: 'Arial', fontSize: '13px', color: '#6783b7' });
            this.add.text(116, y + 58, card.effect, { fontFamily: 'Arial', fontSize: '13px', color: '#3da58c' });
            y += 90;
        });

        const equipBtn = this.createButton(width - 124, height - 120, 210, 56, 0x4f99ff, '장착');
        const removeBtn = this.createButton(width - 124, height - 56, 210, 48, 0x5b4f9f, '해제');
        equipBtn.on('pointerdown', () => this.flashToast('선택 카드 장착 완료 (mock)'));
        removeBtn.on('pointerdown', () => this.flashToast('선택 카드 해제 완료 (mock)'));

        const navLobby = this.createButton(84, height - 56, 128, 48, 0x3a4d7f, '로비');
        navLobby.on('pointerdown', () => this.scene.start('LobbyScene'));
    }

    private createButton (x: number, y: number, w: number, h: number, color: number, label: string): Phaser.GameObjects.Rectangle
    {
        const box = this.add.rectangle(x, y, w, h, color).setStrokeStyle(1, 0xdde9ff).setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, { fontFamily: 'Arial Black', fontSize: `${Math.floor(h * 0.43)}px`, color: '#ffffff' }).setOrigin(0.5);
        box.on('pointerover', () => box.setScale(1.02));
        box.on('pointerout', () => box.setScale(1));
        return box;
    }

    private flashToast (message: string): void
    {
        const { width } = this.scale;
        const toast = this.add.rectangle(width / 2, 170, width - 60, 40, 0x2f4f8f).setStrokeStyle(1, 0xc4d7ff);
        const text = this.add.text(width / 2, 170, message, { fontFamily: 'Arial', fontSize: '16px', color: '#f2f6ff' }).setOrigin(0.5);
        this.tweens.add({ targets: [toast, text], alpha: 0, y: '-=10', duration: 700, delay: 500, onComplete: () => { toast.destroy(); text.destroy(); } });
    }
}
