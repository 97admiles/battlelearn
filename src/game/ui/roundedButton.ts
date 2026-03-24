import type { Scene } from 'phaser';

export interface RoundedButtonOptions
{
    fill: number;
    fillHover?: number;
    stroke: number;
    radius?: number;
    label: string;
    textStyle: Phaser.Types.GameObjects.Text.TextStyle;
    onClick: () => void;
}

/**
 * 둥근 사각형 버튼(그래픽스 + 텍스트). 호버 시 살짝 밝아진다.
 */
export function addRoundedRectButton (
    scene: Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    opts: RoundedButtonOptions
): { graphics: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text }
{
    const r = opts.radius ?? 14;
    const g = scene.add.graphics();
    const hoverFill = opts.fillHover ?? opts.fill;

    const draw = (hover: boolean): void =>
    {
        g.clear();
        const f = hover ? hoverFill : opts.fill;
        g.fillStyle(f, 1);
        g.lineStyle(1, opts.stroke, 1);
        g.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
        g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
    };

    draw(false);
    g.setInteractive(
        new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h),
        Phaser.Geom.Rectangle.Contains
    );
    g.on('pointerover', () => draw(true));
    g.on('pointerout', () => draw(false));
    g.on('pointerdown', opts.onClick);

    const text = scene.add.text(x, y, opts.label, opts.textStyle).setOrigin(0.5);
    return { graphics: g, text };
}
