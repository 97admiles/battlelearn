import type { GameObjects } from 'phaser';

/**
 * 둥근 모서리 패널 (교육 앱 카드 느낌).
 * Phaser 3 Graphics.fillRoundedRect 사용.
 */
export function fillRoundedPanel (
    g: GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillColor: number,
    strokeColor?: number,
    strokeWidth = 1
): void
{
    g.fillStyle(fillColor, 1);
    g.fillRoundedRect(x, y, width, height, radius);
    if (strokeColor !== undefined)
    {
        g.lineStyle(strokeWidth, strokeColor, 1);
        g.strokeRoundedRect(x, y, width, height, radius);
    }
}
