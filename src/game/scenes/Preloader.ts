import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        // 세로형 모바일 기준 중앙 로딩 박스 UI.
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#0b2240');

        // 게임 HUD 느낌을 주기 위해 진한 외곽 패널을 먼저 배치한다.
        this.add.rectangle(width / 2, height / 2, width * 0.86, 220, 0x102f54)
            .setStrokeStyle(6, 0x72d6c9);
        this.add.rectangle(width / 2, height / 2, width * 0.82, 200, 0x153f6a)
            .setStrokeStyle(2, 0xe5dfc9);

        this.add.text(width / 2, height / 2 - 58, 'BATTLELEARN', {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#e9f8ff',
            stroke: '#0a1a2f',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 20, '학습 배틀 데이터 준비 중...', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#d7efe9'
        }).setOrigin(0.5);

        // 로딩 진행 바 외곽선.
        this.add.rectangle(width / 2, height / 2 + 30, width * 0.62, 32, 0x0d223d)
            .setStrokeStyle(2, 0xe5dfc9);

        // 진행률에 따라 너비가 확장되는 내부 바.
        const bar = this.add.rectangle(width / 2 - (width * 0.62) / 2 + 4, height / 2 + 30, 8, 24, 0x72d6c9);
        bar.setOrigin(0, 0.5);

        // LoaderPlugin progress 이벤트에 연결해 막대를 업데이트한다.
        this.load.on('progress', (progress: number) => {
            bar.width = 8 + ((width * 0.62 - 8) * progress);
        });
    }

    preload ()
    {
        // 현재 프로토타입은 도형/텍스트 기반이므로 강제 로딩할 외부 에셋이 없다.
        // 향후 캐릭터 스프라이트, 사운드, 배경 이미지가 추가되면 이 영역에 적재한다.
    }

    create ()
    {
        // 초기 준비가 끝나면 스플래시 씬으로 이동한다.
        this.scene.start('SplashScene');
    }
}
