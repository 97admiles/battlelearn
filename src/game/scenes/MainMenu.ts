import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#102842');

        // 상단 타이틀 영역: 교육 + 배틀 감성을 동시에 주는 이중 패널.
        this.add.rectangle(width / 2, 110, width - 40, 150, 0x153f6a).setStrokeStyle(5, 0x73d7c9);
        this.add.rectangle(width / 2, 110, width - 56, 130, 0x1d4c7c).setStrokeStyle(2, 0xe5dfc9);

        this.add.text(width / 2, 78, '배틀런', {
            fontFamily: 'Arial Black',
            fontSize: '54px',
            color: '#e9f7ff',
            stroke: '#0b1e35',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(width / 2, 120, '학습형 턴제 배틀', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#d5f2ea',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 150, '한 판 3문제로 핵심 개념을 빠르게 복습하세요.', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#e5dfc9',
            align: 'center'
        }).setOrigin(0.5, 0.5);

        // 중단 정보 패널: 보너스 + 최근 학습 기록.
        this.add.rectangle(width / 2, 315, width - 40, 290, 0x173a5c).setStrokeStyle(4, 0xe5dfc9);
        this.add.rectangle(width / 2, 315, width - 56, 272, 0x1f4f7c).setStrokeStyle(2, 0x73d7c9);

        this.add.text(40, 205, '오늘의 복습 보너스', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#d7f7ee',
            fontStyle: 'bold'
        });
        this.add.text(width - 40, 205, '+30 포인트', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#8bf0d9'
        }).setOrigin(1, 0);

        this.add.rectangle(width / 2, 248, width - 80, 2, 0xe5dfc9);

        this.add.text(40, 266, '최근 학습 기록', {
            fontFamily: 'Arial',
            fontSize: '17px',
            color: '#d7f7ee',
            fontStyle: 'bold'
        });
        this.add.text(40, 300, '• 영단어 세트 A 82% 정답', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#eaf7ff'
        });
        this.add.text(40, 326, '• 1차 방정식 복습 완료', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#eaf7ff'
        });
        this.add.text(40, 352, '• 한국사 핵심 연표 2단계 진행 중', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#eaf7ff'
        });

        // 핵심 액션 버튼 1: 실제로 Game Scene으로 진입.
        const startButton = this.add.rectangle(width / 2, 470, width - 56, 84, 0x75d8c9)
            .setStrokeStyle(5, 0x0a223d)
            .setInteractive({ useHandCursor: true });
        this.add.text(width / 2, 470, '배틀 시작', {
            fontFamily: 'Arial Black',
            fontSize: '34px',
            color: '#133251'
        }).setOrigin(0.5);

        // 핵심 액션 버튼 2: 현재는 임시 문구만 출력.
        const recommendButton = this.add.rectangle(width / 2, 568, width - 56, 74, 0xe5dfc9)
            .setStrokeStyle(4, 0x133251)
            .setInteractive({ useHandCursor: true });
        const recommendLabel = this.add.text(width / 2, 568, '추천 배틀', {
            fontFamily: 'Arial Black',
            fontSize: '30px',
            color: '#1e4a73'
        }).setOrigin(0.5);

        const hintText = this.add.text(width / 2, 624, '추천 배틀은 다음 단계에서 오픈됩니다.', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#c8e9df'
        }).setOrigin(0.5).setAlpha(0.85);

        recommendButton.on('pointerdown', () => {
            // 클릭 피드백을 주어 버튼이 실제 게임 UI처럼 느껴지도록 처리.
            recommendButton.setFillStyle(0xd8d0b8);
            recommendLabel.setColor('#204f7b');
            hintText.setText('현재는 "배틀 시작"으로 기본 전투를 플레이할 수 있어요.');
            this.time.delayedCall(120, () => {
                recommendButton.setFillStyle(0xe5dfc9);
                recommendLabel.setColor('#1e4a73');
            });
        });

        startButton.on('pointerdown', () => {
            startButton.setFillStyle(0x63c9b9);
            this.time.delayedCall(100, () => {
                this.scene.start('Game');
            });
        });

        // 하단 탭 느낌의 고정 메뉴 4개 (현재 단계에서는 시각적/로그 피드백 중심).
        const tabs = ['홈', '배틀', '덱', '결과'];
        const tabWidth = (width - 50) / 4;

        tabs.forEach((tabName, index) => {
            const x = 15 + (tabWidth / 2) + (index * tabWidth);
            const isHome = index === 0;
            const tabBox = this.add.rectangle(x, height - 42, tabWidth - 8, 62, isHome ? 0x75d8c9 : 0x1a4369)
                .setStrokeStyle(3, isHome ? 0xe5dfc9 : 0x73d7c9)
                .setInteractive({ useHandCursor: true });
            const tabLabel = this.add.text(x, height - 42, tabName, {
                fontFamily: 'Arial Black',
                fontSize: '20px',
                color: isHome ? '#133251' : '#d8f5ee'
            }).setOrigin(0.5);

            tabBox.on('pointerdown', () => {
                // 아직 실제 탭 전환은 없으므로 간단한 HUD 피드백만 제공.
                tabLabel.setScale(0.95);
                this.time.delayedCall(80, () => tabLabel.setScale(1));
                hintText.setText(`"${tabName}" 탭은 프로토타입 단계에서 준비 중입니다.`);
            });
        });
    }
}
