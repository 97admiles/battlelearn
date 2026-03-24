import { Scene } from 'phaser';

export class GameOver extends Scene
{
    private resultData!: {
        result: 'WIN' | 'LOSE';
        playerHp: number;
        enemyHp: number;
        correctAnswers: number;
        totalQuestions: number;
    };

    constructor ()
    {
        super('GameOver');
    }

    init (data: {
        result?: 'WIN' | 'LOSE';
        playerHp?: number;
        enemyHp?: number;
        correctAnswers?: number;
        totalQuestions?: number;
    })
    {
        // Game Scene에서 넘긴 결과값을 안전하게 기본값과 함께 저장한다.
        this.resultData = {
            result: data.result ?? 'LOSE',
            playerHp: data.playerHp ?? 0,
            enemyHp: data.enemyHp ?? 0,
            correctAnswers: data.correctAnswers ?? 0,
            totalQuestions: data.totalQuestions ?? 3
        };
    }

    create ()
    {
        const { width, height } = this.scale;
        const isWin = this.resultData.result === 'WIN';
        this.cameras.main.setBackgroundColor(isWin ? '#12395a' : '#3b2b46');

        // 결과 패널: 사각형 이중 테두리로 강한 HUD 구획을 만든다.
        this.add.rectangle(width / 2, height / 2, width - 30, height - 70, isWin ? 0x194b77 : 0x4b3960)
            .setStrokeStyle(6, 0xe5dfc9);
        this.add.rectangle(width / 2, height / 2, width - 50, height - 90, isWin ? 0x236199 : 0x5d4a73)
            .setStrokeStyle(3, 0x73d7c9);

        this.add.text(width / 2, 140, isWin ? '승리!' : '패배', {
            fontFamily: 'Arial Black',
            fontSize: '72px',
            color: isWin ? '#8cefd9' : '#ffd0d0',
            stroke: '#12243a',
            strokeThickness: 10
        }).setOrigin(0.5);

        this.add.text(width / 2, 205, isWin ? '정확한 선택으로 배틀을 제압했습니다.' : '다음 복습에서 더 강해질 수 있어요.', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#eaf7ff'
        }).setOrigin(0.5);

        // 결과 요약 패널.
        this.add.rectangle(width / 2, 360, width - 78, 250, 0x12314f).setStrokeStyle(3, 0xe5dfc9);
        this.add.text(56, 280, `남은 HP: ${this.resultData.playerHp}`, {
            fontFamily: 'Arial Black',
            fontSize: '26px',
            color: '#dff7ef'
        });
        this.add.text(56, 322, `상대 HP: ${this.resultData.enemyHp}`, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#eaf7ff'
        });
        this.add.text(56, 362, `정답 수: ${this.resultData.correctAnswers} / ${this.resultData.totalQuestions}`, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#eaf7ff'
        });
        this.add.text(56, 410, '획득 보상', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#8cefd9'
        });
        this.add.text(56, 444, `XP +${isWin ? 120 : 60}   |   복습 포인트 +${isWin ? 30 : 15}`, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#e5dfc9'
        });

        // 다시 배틀 버튼
        const replayButton = this.add.rectangle(width / 2, height - 170, width - 90, 72, 0x75d8c9)
            .setStrokeStyle(4, 0x0d223d)
            .setInteractive({ useHandCursor: true });
        this.add.text(width / 2, height - 170, '다시 배틀', {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#12304f'
        }).setOrigin(0.5);

        replayButton.on('pointerdown', () => {
            replayButton.setFillStyle(0x67cabd);
            this.time.delayedCall(100, () => this.scene.start('Game'));
        });

        // 홈으로 버튼
        const homeButton = this.add.rectangle(width / 2, height - 86, width - 90, 66, 0xe5dfc9)
            .setStrokeStyle(4, 0x12304f)
            .setInteractive({ useHandCursor: true });
        this.add.text(width / 2, height - 86, '홈으로', {
            fontFamily: 'Arial Black',
            fontSize: '30px',
            color: '#1d4a73'
        }).setOrigin(0.5);

        homeButton.on('pointerdown', () => {
            homeButton.setFillStyle(0xd8d1bc);
            this.time.delayedCall(100, () => {
                this.scene.start('MainMenu');
            });
        });
    }
}
