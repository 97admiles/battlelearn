import { Scene } from 'phaser';

interface ResultData {
    result?: 'WIN' | 'LOSE';
    playerHp?: number;
    enemyHp?: number;
    correctAnswers?: number;
    totalQuestions?: number;
    gainedXp?: number;
    gainedGold?: number;
    gainedKnowledge?: number;
    mvpComment?: string;
}

export class ResultScene extends Scene
{
    private dataBag: Required<ResultData> = {
        result: 'LOSE',
        playerHp: 0,
        enemyHp: 0,
        correctAnswers: 0,
        totalQuestions: 5,
        gainedXp: 0,
        gainedGold: 0,
        gainedKnowledge: 0,
        mvpComment: '다음 배틀에서 더 높은 연속 정답을 노려보세요.'
    };

    constructor ()
    {
        super('ResultScene');
    }

    init (data: ResultData)
    {
        this.dataBag = { ...this.dataBag, ...data };
    }

    create ()
    {
        const { width, height } = this.scale;
        const win = this.dataBag.result === 'WIN';
        this.cameras.main.setBackgroundColor(win ? '#132447' : '#2f2246');

        this.add.ellipse(width / 2, 180, 420, 180, win ? 0x4fcfd0 : 0xdd7d9e, 0.16);
        this.add.text(width / 2, 96, win ? 'VICTORY' : 'DEFEAT', {
            fontFamily: 'Arial Black',
            fontSize: '64px',
            color: win ? '#a8ffee' : '#ffd7e3',
            stroke: '#1c2550',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(width / 2, 154, this.dataBag.mvpComment, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#e8efff',
            align: 'center',
            wordWrap: { width: width - 40 }
        }).setOrigin(0.5);

        const rewardBox = this.add.rectangle(width / 2, 380, width - 48, 360, 0x1a2554).setStrokeStyle(2, 0x93aefe);
        this.add.text(38, 224, `남은 HP: ${this.dataBag.playerHp}`, { fontFamily: 'Arial Black', fontSize: '26px', color: '#eff6ff' });
        this.add.text(38, 262, `맞춘 문제: ${this.dataBag.correctAnswers}/${this.dataBag.totalQuestions}`, { fontFamily: 'Arial', fontSize: '22px', color: '#cddcff' });
        this.add.text(38, 300, `획득 경험치: +${this.dataBag.gainedXp}`, { fontFamily: 'Arial', fontSize: '22px', color: '#8deee0' });
        this.add.text(38, 338, `획득 골드: +${this.dataBag.gainedGold}`, { fontFamily: 'Arial', fontSize: '22px', color: '#ffd697' });
        this.add.text(38, 376, `복습 포인트: +${this.dataBag.gainedKnowledge}`, { fontFamily: 'Arial', fontSize: '22px', color: '#9fc6ff' });
        this.add.text(38, 418, `랜덤 보상: ${win ? 'Epic 카드 조각 x12' : 'Rare 카드 조각 x6'}`, { fontFamily: 'Arial Black', fontSize: '22px', color: '#f6deff' });

        const b1 = this.createButton(width / 2, 640, width - 90, 72, 0x5a9bff, '다시 배틀');
        const b2 = this.createButton(width / 2, 724, width - 90, 66, 0x3f5fa5, '로비로');
        const b3 = this.createButton(width / 2, 800, width - 90, 66, 0x368b7a, '복습하러 가기');
        b1.on('pointerdown', () =>
        {
            const sub = this.registry.get('currentSubject');
            this.scene.start('BattleScene', { subject: sub });
        });
        b2.on('pointerdown', () =>
        {
            const sub = this.registry.get('currentSubject');
            this.scene.start('LobbyScene', { subject: sub });
        });
        b3.on('pointerdown', () => this.scene.start('QuestionInventoryScene'));

        this.tweens.add({
            targets: [rewardBox, b1, b2, b3],
            alpha: { from: 0, to: 1 },
            y: '-=6',
            duration: 300,
            ease: 'Cubic.Out'
        });
    }

    private createButton (x: number, y: number, w: number, h: number, color: number, label: string): Phaser.GameObjects.Rectangle
    {
        const box = this.add.rectangle(x, y, w, h, color).setStrokeStyle(2, 0xe5edff).setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, { fontFamily: 'Arial Black', fontSize: `${Math.floor(h * 0.42)}px`, color: '#ffffff' }).setOrigin(0.5);
        box.on('pointerover', () => box.setScale(1.01));
        box.on('pointerout', () => box.setScale(1));
        box.on('pointerdown', () => box.setScale(0.98));
        box.on('pointerup', () => box.setScale(1.01));
        return box;
    }
}
