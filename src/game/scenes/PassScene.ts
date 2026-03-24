import { Scene } from 'phaser';
import { passRewards, seasonInfo } from '../data/progression';

export class PassScene extends Scene
{
    constructor ()
    {
        super('PassScene');
    }

    create ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#12193a');
        this.add.text(20, 22, '시즌 패스', { fontFamily: 'Arial Black', fontSize: '32px', color: '#edf4ff' });
        this.add.text(20, 58, seasonInfo.seasonName, { fontFamily: 'Arial', fontSize: '17px', color: '#b8ceff' });
        this.add.text(width - 20, 30, `현재 단계 ${seasonInfo.currentLevel}/${seasonInfo.maxLevel}`, { fontFamily: 'Arial Black', fontSize: '16px', color: '#ffe39d' }).setOrigin(1, 0);

        // 무료/프리미엄 트랙
        this.add.rectangle(width / 2, 140, width - 24, 70, 0x26346d).setStrokeStyle(1, 0x8aa2ed);
        this.add.text(24, 118, '무료 보상 트랙', { fontFamily: 'Arial Black', fontSize: '16px', color: '#d3e1ff' });
        this.add.text(24, 144, passRewards.map((r) => `Lv${r.level}:${r.freeReward}`).join('  |  '), { fontFamily: 'Arial', fontSize: '13px', color: '#aec6ff' });

        this.add.rectangle(width / 2, 228, width - 24, 70, 0x5a3d8f).setStrokeStyle(1, 0xd2b7ff);
        this.add.text(24, 206, '프리미엄 보상 트랙', { fontFamily: 'Arial Black', fontSize: '16px', color: '#f0dcff' });
        this.add.text(24, 232, passRewards.map((r) => `Lv${r.level}:${r.premiumReward}`).join('  |  '), { fontFamily: 'Arial', fontSize: '13px', color: '#f0d0ff' });

        this.add.rectangle(width / 2, 338, width - 24, 92, 0x1d2a57).setStrokeStyle(1, 0x7b95dc);
        this.add.text(24, 298, '다음 보상 미리보기', { fontFamily: 'Arial Black', fontSize: '16px', color: '#dce8ff' });
        this.add.text(24, 332, seasonInfo.nextRewardPreview, { fontFamily: 'Arial Black', fontSize: '24px', color: '#8cf2df' });

        const unlockBtn = this.add.rectangle(width / 2, 426, width - 56, 62, 0x5f6bdf).setStrokeStyle(2, 0xe1e7ff).setInteractive({ useHandCursor: true });
        this.add.text(width / 2, 426, '프리미엄 패스 업그레이드 (mock)', { fontFamily: 'Arial Black', fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
        unlockBtn.on('pointerdown', () => this.scene.start('ShopScene'));

        const lobby = this.add.rectangle(width / 2, height - 52, 220, 54, 0x3a4d7f).setStrokeStyle(1, 0xdce9ff).setInteractive({ useHandCursor: true });
        this.add.text(width / 2, height - 52, '로비로 돌아가기', { fontFamily: 'Arial Black', fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);
        lobby.on('pointerdown', () => this.scene.start('LobbyScene'));
    }
}
