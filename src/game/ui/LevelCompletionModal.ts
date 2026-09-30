import { Scene, GameObjects } from 'phaser';
import { UILayers } from '../utils/UILayers';
import { AudioManager } from '../services/AudioManager';

export class LevelCompletionModal {
    private container: GameObjects.Container;
    private overlay: GameObjects.Rectangle;

    constructor(
        scene: Scene,
        levelNumber: number,
        _score: number,
        _maxCombo: number,
        onNext: () => void,
        onPlayAgain: () => void,
        onHome: () => void
    ) {
        const { width, height } = scene.scale;

        // Dark Modal Overlay
        this.overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
            .setDepth(UILayers.MODAL_BACKGROUND)
            .setInteractive();

        this.container = scene.add.container(width / 2, height / 2)
            .setDepth(UILayers.MODAL_PANEL)
            .setScale(0.7)
            .setAlpha(0);

        // Modal Frame Box (Updated dimensions)
        const mw = 600;
        const mh = 380;
        const bg = scene.add.graphics();

        // Layered Outer Glow: Team Violet (Synergy) + Cyber Cyan
        bg.fillStyle(0x7c3aed, 0.28);
        bg.fillRoundedRect(-mw / 2 - 12, -mh / 2 - 12, mw + 24, mh + 24, 34);
        bg.fillStyle(0x00f2fe, 0.12);
        bg.fillRoundedRect(-mw / 2 - 6, -mh / 2 - 6, mw + 12, mh + 12, 28);

        // Panel Background: Deep Midnight Slate (Cyber Asphalt theme)
        bg.fillStyle(0x0c1022, 0.98);
        bg.fillRoundedRect(-mw / 2, -mh / 2, mw, mh, 26);

        // Panel Border: Neon Electric Cyan (Byte Accent)
        bg.lineStyle(4, 0x00f2fe, 1);
        bg.strokeRoundedRect(-mw / 2, -mh / 2, mw, mh, 26);

        this.container.add(bg);

        // --- Radiant Golden Glow Behind Stars ---
        const starCenterY = -mh / 2 + 48;
        const starGlow = scene.add.graphics();
        starGlow.fillStyle(0xfbbf24, 0.25);
        starGlow.fillCircle(0, starCenterY, 90);
        starGlow.fillStyle(0xf59e0b, 0.14);
        starGlow.fillCircle(0, starCenterY, 130);
        this.container.add(starGlow);

        // --- 3 Golden 3D Stars ---
        const starGraphics = scene.add.graphics();
        // Left Star
        this.drawStyledStar(starGraphics, -70, starCenterY + 8, 5, 30, 15, -0.18);
        // Right Star
        this.drawStyledStar(starGraphics, 70, starCenterY + 8, 5, 30, 15, 0.18);
        // Center Star
        this.drawStyledStar(starGraphics, 0, starCenterY - 4, 5, 42, 21, 0);
        this.container.add(starGraphics);

        // --- Sparkle Glints around stars ---
        const sparkles = scene.add.graphics();
        this.drawSparkle(sparkles, -105, starCenterY + 2, 5);
        this.drawSparkle(sparkles, -32, starCenterY - 24, 5);
        this.drawSparkle(sparkles, 32, starCenterY - 24, 5);
        this.drawSparkle(sparkles, 105, starCenterY + 2, 5);
        this.container.add(sparkles);

        // --- Championship Ribbon Banner: "LEVEL COMPLETED" ---
        const bannerY = -mh / 2 + 115;
        const bannerGraphics = scene.add.graphics();

        // 1. Left Ribbon Tail
        bannerGraphics.fillStyle(0x4c1d95, 1);
        bannerGraphics.beginPath();
        bannerGraphics.moveTo(-185, bannerY - 24);
        bannerGraphics.lineTo(-235, bannerY - 12);
        bannerGraphics.lineTo(-218, bannerY + 5);
        bannerGraphics.lineTo(-235, bannerY + 22);
        bannerGraphics.lineTo(-185, bannerY + 27);
        bannerGraphics.closePath();
        bannerGraphics.fillPath();
        bannerGraphics.lineStyle(2.5, 0xffd166, 1);
        bannerGraphics.strokePath();

        // Left fold shadow triangle
        bannerGraphics.fillStyle(0x2e1065, 1);
        bannerGraphics.fillTriangle(-185, bannerY - 24, -185, bannerY + 27, -172, bannerY + 16);

        // 2. Right Ribbon Tail
        bannerGraphics.fillStyle(0x4c1d95, 1);
        bannerGraphics.beginPath();
        bannerGraphics.moveTo(185, bannerY - 24);
        bannerGraphics.lineTo(235, bannerY - 12);
        bannerGraphics.lineTo(218, bannerY + 5);
        bannerGraphics.lineTo(235, bannerY + 22);
        bannerGraphics.lineTo(185, bannerY + 27);
        bannerGraphics.closePath();
        bannerGraphics.fillPath();
        bannerGraphics.lineStyle(2.5, 0xffd166, 1);
        bannerGraphics.strokePath();

        // Right fold shadow triangle
        bannerGraphics.fillStyle(0x2e1065, 1);
        bannerGraphics.fillTriangle(185, bannerY - 24, 185, bannerY + 27, 172, bannerY + 16);

        // 3. Main Center Ribbon Plaque
        const bw = 380;
        const bh = 60;
        const br = 14;

        // Shadow under plaque
        bannerGraphics.fillStyle(0x1e1b4b, 0.9);
        bannerGraphics.fillRoundedRect(-bw / 2, bannerY - bh / 2 + 3, bw, bh, br);

        // Royal Violet Ribbon body
        bannerGraphics.fillStyle(0x6b21a8, 1);
        bannerGraphics.fillRoundedRect(-bw / 2, bannerY - bh / 2, bw, bh, br);

        // Top glossy shine
        bannerGraphics.fillStyle(0xc084fc, 0.35);
        bannerGraphics.fillRoundedRect(-bw / 2 + 3, bannerY - bh / 2 + 3, bw - 6, bh / 2 - 3, br - 3);

        // Outer Gold Trim
        bannerGraphics.lineStyle(3, 0xffd166, 1);
        bannerGraphics.strokeRoundedRect(-bw / 2, bannerY - bh / 2, bw, bh, br);

        // Inner Golden Accent Pinstripe
        bannerGraphics.lineStyle(1, 0xfbbf24, 0.7);
        bannerGraphics.strokeRoundedRect(-bw / 2 + 4, bannerY - bh / 2 + 4, bw - 8, bh - 8, br - 4);

        this.container.add(bannerGraphics);

        // "LEVEL COMPLETED" Title
        const title = scene.add.text(0, bannerY - 1, 'LEVEL COMPLETED', {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#fef08a',
            stroke: '#3b0764',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.container.add(title);

        // --- Action Buttons Layout ---
        const btnY = 65;
        const btnW = 145;
        const btnH = 62;
        const btnFontSize = '22px';
        const gap = 155; // center-to-center spacing

        const hasNextLevel = levelNumber < 3;

        // Calculate X positions based on whether NEXT button is present
        let restartX: number;
        let homeX: number;

        if (hasNextLevel) {
            restartX = -gap;
            homeX = 0;
        } else {
            restartX = -gap / 2;
            homeX = gap / 2;
        }

        // RESTART (Cyan)
        this.createButton(
            scene,
            restartX,
            btnY,
            btnW,
            btnH,
            0x0284c7,
            0x00f2fe,
            '#0c4a6e',
            'RESTART',
            btnFontSize,
            onPlayAgain
        );

        // HOME (Slate gold)
        this.createButton(
            scene,
            homeX,
            btnY,
            btnW,
            btnH,
            0x1e293b,
            0xffd166,
            '#0f172a',
            'HOME',
            btnFontSize,
            onHome
        );

        // NEXT (hidden on final level)
        if (hasNextLevel) {
            this.createButton(
                scene,
                gap,
                btnY,
                btnW,
                btnH,
                0x059669,
                0x34d399,
                '#064e3b',
                'NEXT',
                btnFontSize,
                onNext
            );
        }

        // Pop in animation
        scene.tweens.add({
            targets: this.container,
            scale: 1,
            alpha: 1,
            duration: 380,
            ease: 'Back.easeOut'
        });
    }

    private drawStyledStar(
        graphics: GameObjects.Graphics,
        cx: number,
        cy: number,
        points: number,
        outerR: number,
        innerR: number,
        angleOffset: number
    ) {
        this.renderStarPath(graphics, cx, cy + 3, points, outerR + 2, innerR + 1, angleOffset, 0xb45309, 1, 0, 0);
        this.renderStarPath(graphics, cx, cy, points, outerR, innerR, angleOffset, 0xfbbf24, 1, 0xd97706, 3);
        this.renderStarPath(graphics, cx, cy - 2, points, outerR * 0.72, innerR * 0.72, angleOffset, 0xfef08a, 0.45, 0, 0);
    }

    private renderStarPath(
        graphics: GameObjects.Graphics,
        cx: number,
        cy: number,
        points: number,
        outerR: number,
        innerR: number,
        angleOffset: number,
        fillColor: number,
        fillAlpha: number,
        strokeColor: number,
        strokeWidth: number
    ) {
        const startAngle = -Math.PI / 2 + angleOffset;
        const step = Math.PI / points;

        graphics.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = startAngle + i * step;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        }
        graphics.closePath();
        graphics.fillStyle(fillColor, fillAlpha);
        graphics.fillPath();

        if (strokeWidth > 0) {
            graphics.lineStyle(strokeWidth, strokeColor, 1);
            graphics.strokePath();
        }
    }

    private drawSparkle(graphics: GameObjects.Graphics, x: number, y: number, size: number) {
        graphics.fillStyle(0xfef08a, 0.9);
        graphics.fillRect(x - size, y - size / 4, size * 2, size / 2);
        graphics.fillRect(x - size / 4, y - size, size / 2, size * 2);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(x, y, size / 2.5);
    }

    private createButton(
        scene: Scene,
        x: number,
        y: number,
        w: number,
        h: number,
        bgColor: number,
        borderColor: number,
        strokeColor: string,
        label: string,
        fontSize: string,
        onClick: () => void,
        disabled: boolean = false
    ) {
        const btnCont = scene.add.container(x, y);
        if (disabled) btnCont.setAlpha(0.45);

        const bg = scene.add.graphics();
        const r = 18;

        // Bottom shadow bevel
        bg.fillStyle(0x000000, 0.35);
        bg.fillRoundedRect(-w / 2, -h / 2 + 3, w, h, r);

        // Main button fill
        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);

        // Top glossy shine
        bg.fillStyle(0xffffff, 0.18);
        bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 2, w - 6, h / 2 - 2, r - 3);

        // Border outline
        bg.lineStyle(3, borderColor, 1);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
        btnCont.add(bg);

        // Button text
        const text = scene.add.text(0, 0, label, {
            fontFamily: 'Arial Black',
            fontSize: fontSize,
            color: '#ffffff',
            stroke: strokeColor,
            strokeThickness: 4
        }).setOrigin(0.5);
        btnCont.add(text);

        if (!disabled) {
            const hit = scene.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
            hit.on('pointerdown', () => {
                AudioManager.getInstance().playSFX('button_tap');
                this.destroy();
                onClick();
            });
            hit.on('pointerover', () => {
                btnCont.setScale(1.05);
            });
            hit.on('pointerout', () => {
                btnCont.setScale(1.0);
            });
            btnCont.add(hit);
        }

        this.container.add(btnCont);
    }

    public destroy() {
        this.overlay.destroy();
        this.container.destroy();
    }
}