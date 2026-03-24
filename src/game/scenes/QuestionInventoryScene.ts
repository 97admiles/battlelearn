import { Scene } from 'phaser';
import { questionBank } from '../data/questions';

export class QuestionInventoryScene extends Scene
{
    constructor ()
    {
        super('QuestionInventoryScene');
    }

    create ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#eef5ff');
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xf4f8ff, 0xf4f8ff, 0xe7faf5, 0xe7faf5, 1);
        bg.fillRect(0, 0, width, height);

        this.add.text(20, 20, '문제 보유함 / 문제 아카이브', { fontFamily: 'Arial Black', fontSize: '30px', color: '#45639a' });
        this.add.rectangle(width / 2, 84, width - 20, 44, 0xffffff).setStrokeStyle(1, 0xc3d6fa);
        this.add.text(20, 72, '과목: 전체 역사 수학 영어 과학 자격증  |  난이도: 초급 중급 심화 챌린지  |  정렬: 최신/난이도/즐겨찾기', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#6783b8'
        });

        let y = 112;
        questionBank.slice(0, 8).forEach((q, idx) => {
            const card = this.add.rectangle(width / 2, y + 44, width - 24, 80, 0xffffff).setStrokeStyle(2, 0xc1d5fb);
            const badgeColor = q.difficulty === '챌린지' ? 0xd85f7f : q.difficulty === '심화' ? 0x7d6be4 : q.difficulty === '중급' ? 0x3d8fd4 : 0x40b88a;
            this.add.rectangle(66, y + 28, 86, 24, badgeColor).setStrokeStyle(1, 0xe6efff);
            this.add.text(66, y + 28, `${q.subject}`, { fontFamily: 'Arial Black', fontSize: '13px', color: '#ffffff' }).setOrigin(0.5);
            this.add.text(118, y + 18, `[${q.difficulty}] ${q.question.slice(0, 35)}...`, { fontFamily: 'Arial Black', fontSize: '15px', color: '#475f95' });
            this.add.text(118, y + 40, `보상 XP ${q.rewardXp} · 지식 ${q.rewardKnowledge} · 추천 배틀: ${q.subject} 모드`, { fontFamily: 'Arial', fontSize: '13px', color: '#6884b9' });
            this.add.text(width - 30, y + 26, idx % 2 === 0 ? '★' : '☆', { fontFamily: 'Arial Black', fontSize: '24px', color: '#ffdf8e' }).setOrigin(1, 0.5);
            this.add.text(width - 30, y + 50, '보유', { fontFamily: 'Arial', fontSize: '12px', color: '#9ff0d6' }).setOrigin(1, 0.5);
            card.on('pointerdown', () => this.flashInfo(`문제 상세(mock): ${q.id}`));
            card.setInteractive({ useHandCursor: true });
            y += 88;
        });

        const lobby = this.createButton(80, height - 40, 130, 48, 0x3a4d7f, '로비');
        const battle = this.createButton(width - 90, height - 40, 150, 48, 0x4f99ff, '배틀 진입');
        lobby.on('pointerdown', () => this.scene.start('LobbyScene'));
        battle.on('pointerdown', () =>
        {
            const sub = this.registry.get('currentSubject');
            this.scene.start('BattleScene', { subject: sub });
        });
    }

    private createButton (x: number, y: number, w: number, h: number, color: number, label: string): Phaser.GameObjects.Rectangle
    {
        const box = this.add.rectangle(x, y, w, h, color).setStrokeStyle(1, 0xdeebff).setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, { fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
        return box;
    }

    private flashInfo (message: string): void
    {
        const { width } = this.scale;
        const bg = this.add.rectangle(width / 2, 96, width - 40, 38, 0x37508a).setStrokeStyle(1, 0xc8d8ff);
        const text = this.add.text(width / 2, 96, message, { fontFamily: 'Arial', fontSize: '15px', color: '#eef3ff' }).setOrigin(0.5);
        this.tweens.add({ targets: [bg, text], alpha: 0, duration: 700, delay: 500, onComplete: () => { bg.destroy(); text.destroy(); } });
    }
}
