import { Scene } from 'phaser';
import { C } from '../ui/designTokens';

/**
 * 스플래시 — 교육 앱 첫인상: 밝고 차분, 브랜드만 짧게 각인.
 * 게임 이펙트(별/강한 글로우)는 최소화한다.
 */
export class SplashScene extends Scene
{
    constructor ()
    {
        super('SplashScene');
    }

    create ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#f4f6f9');

        const g = this.add.graphics();
        g.fillGradientStyle(C.page, C.page, 0xe8ecf2, 0xe8ecf2, 1);
        g.fillRect(0, 0, width, height);
        g.fillStyle(0xdbeafe, 0.45);
        g.fillCircle(width * 0.85, height * 0.18, 90);
        g.fillStyle(0xe0e7ff, 0.35);
        g.fillCircle(width * 0.12, height * 0.72, 70);

        const wordmark = this.add.text(width / 2, height / 2 - 28, 'BattleLearn', {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#1c2333',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        const tagline = this.add.text(width / 2, height / 2 + 18, '지식이 무기가 되는 프리미엄 학습 배틀', {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#5a6472'
        }).setOrigin(0.5).setAlpha(0);

        const loadingBarBg = this.add.rectangle(width / 2, height - 96, 120, 3, 0xe2e6ee);
        const loadingBar = this.add.rectangle(width / 2 - 60, height - 96, 0, 3, C.accent).setOrigin(0, 0.5);

        this.tweens.add({
            targets: wordmark,
            alpha: 1,
            duration: 500,
            ease: 'Cubic.Out'
        });
        this.tweens.add({
            targets: tagline,
            alpha: 1,
            delay: 200,
            duration: 450
        });
        this.tweens.add({
            targets: loadingBar,
            width: 120,
            duration: 1600,
            ease: 'Quad.InOut'
        });

        this.time.delayedCall(2000, () => {
            this.cameras.main.fadeOut(200, 244, 246, 249);
            this.time.delayedCall(210, () => this.scene.start('IntroScene'));
        });
    }
}
