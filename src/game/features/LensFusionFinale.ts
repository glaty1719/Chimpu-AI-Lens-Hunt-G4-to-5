import { Scene, GameObjects } from 'phaser';
import { UILayers } from '../utils/UILayers';
import { AudioManager } from '../services/AudioManager';

export class LensFusionFinale {
    private scene: Scene;
    private modalContainer: GameObjects.Container | null = null;
    private totalScore: number;
    private onPlayAgainCallback: () => void;
    private onLevelSelectCallback: () => void;
    private onHomeCallback: () => void;

    constructor(
        scene: Scene,
        score: number,
        onPlayAgain: () => void,
        onLevelSelect: () => void,
        onHome: () => void
    ) {
        this.scene = scene;
        this.totalScore = score;
        this.onPlayAgainCallback = onPlayAgain;
        this.onLevelSelectCallback = onLevelSelect;
        this.onHomeCallback = onHome;

        this.startFusionSequence();
    }

    private startFusionSequence() {
        const { width, height } = this.scene.scale;
        this.modalContainer = this.scene.add.container(width / 2, height / 2)
            .setDepth(UILayers.MODAL_PANEL + 30);

        // Dark Backdrop
        const blocker = this.scene.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.88)
            .setInteractive();
        this.modalContainer.add(blocker);

        // 3 Floating Lenses (Home 🟢, School 🔵, Street 🟣)
        const lensHome = this.scene.add.image(-260, -120, 'lens_home').setScale(0.9);
        const lensSchool = this.scene.add.image(0, -220, 'lens_school').setScale(0.9);
        const lensStreet = this.scene.add.image(260, -120, 'lens_street').setScale(0.9);
        this.modalContainer.add([lensHome, lensSchool, lensStreet]);

        AudioManager.getInstance().playSFX('lens_collected');

        // Floating hover tweens
        this.scene.tweens.add({
            targets: [lensHome, lensStreet],
            y: '-=15',
            duration: 600,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut'
        });

        // Sequence: Converge lenses into center (0, -140)
        this.scene.time.delayedCall(1200, () => {
            AudioManager.getInstance().playSFX('zone_transition');

            this.scene.tweens.add({
                targets: [lensHome, lensSchool, lensStreet],
                x: 0,
                y: -140,
                scale: 0.2,
                alpha: 0,
                duration: 700,
                ease: 'Cubic.easeIn',
                onComplete: () => {
                    // Explode into Golden Master Lens & Badge!
                    this.revealGoldenScanner();
                }
            });
        });
    }

    private revealGoldenScanner() {
        if (!this.modalContainer) return;
        const mw = 1320;
        const mh = 750;
        const r = 32;

        AudioManager.getInstance().playSFX('badge_earned');

        // Grand Trophy Plaque Frame
        const frameG = this.scene.add.graphics();
        frameG.fillStyle(0xfbbf24, 0.3);
        frameG.fillRoundedRect(-mw / 2 - 14, -mh / 2 - 14, mw + 28, mh + 28, r + 6);
        frameG.fillStyle(0x0c1022, 0.98);
        frameG.fillRoundedRect(-mw / 2, -mh / 2, mw, mh, r);
        frameG.lineStyle(5, 0xfbbf24, 1);
        frameG.strokeRoundedRect(-mw / 2, -mh / 2, mw, mh, r);

        // Header Plaque
        frameG.fillStyle(0x78350f, 1);
        frameG.fillRoundedRect(-mw / 2 + 20, -mh / 2 + 16, mw - 40, 95, 20);
        frameG.lineStyle(3, 0xfef08a, 1);
        frameG.strokeRoundedRect(-mw / 2 + 20, -mh / 2 + 16, mw - 40, 95, 20);
        this.modalContainer.add(frameG);

        // Header Title
        const title = this.scene.add.text(0, -mh / 2 + 62, '🏆 MASTER AI DETECTIVE BADGE EARNED! 🏆', {
            fontFamily: 'Arial Black',
            fontSize: '44px',
            color: '#fef08a',
            stroke: '#451a03',
            strokeThickness: 8
        }).setOrigin(0.5);
        this.modalContainer.add(title);

        // Radiant Golden Detective Badge
        const badge = this.scene.add.image(0, -115, 'badge_detective').setScale(0.1);
        this.modalContainer.add(badge);

        this.scene.tweens.add({
            targets: badge,
            scale: 1.25,
            duration: 600,
            ease: 'Back.easeOut'
        });

        // Golden Scanner Subtitle
        const sub = this.scene.add.text(0, 34, 'All 3 AI Lenses Successfully Unified into the Golden Scanner!', {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#38bdf8',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);
        this.modalContainer.add(sub);

        // Score Card Box
        const scoreBox = this.scene.add.graphics();
        scoreBox.fillStyle(0x1e293b, 0.95);
        scoreBox.fillRoundedRect(-380, 80, 760, 130, 22);
        scoreBox.lineStyle(2.5, 0x00e676, 0.9);
        scoreBox.strokeRoundedRect(-380, 80, 760, 130, 22);
        this.modalContainer.add(scoreBox);

        const scoreTxt = this.scene.add.text(0, 120, `TOTAL SCORE: ${this.totalScore} POINTS`, {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            color: '#4ade80',
            stroke: '#000000',
            strokeThickness: 7
        }).setOrigin(0.5);

        const rankTxt = this.scene.add.text(0, 172, '⭐ ⭐ ⭐ MASTER DETECTIVE RATING ⭐ ⭐ ⭐', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#fef08a',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.modalContainer.add([scoreTxt, rankTxt]);

        // 3 Action Buttons at Bottom (Play Again, Level Select, Home)
        this.createBottomButtons(mh);
    }

    private createBottomButtons(mh: number) {
        if (!this.modalContainer) return;
        const btnY = mh / 2 - 55;

        // 1. Play Again Button
        this.createSingleButton(-290, btnY, '🔄 PLAY AGAIN', 0x0284c7, () => {
            this.destroy();
            this.onPlayAgainCallback();
        });

        // 2. Level Select Button
        this.createSingleButton(0, btnY, '🗺️ ZONES', 0x7c3aed, () => {
            this.destroy();
            this.onLevelSelectCallback();
        });

        // 3. Main Menu Home Button
        this.createSingleButton(290, btnY, '🏠 HOME', 0x059669, () => {
            this.destroy();
            this.onHomeCallback();
        });
    }

    private createSingleButton(x: number, y: number, text: string, color: number, onClick: () => void) {
        if (!this.modalContainer) return;
        const btnW = 260;
        const btnH = 76;
        const cont = this.scene.add.container(x, y);

        const g = this.scene.add.graphics();
        g.fillStyle(color, 1);
        g.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 20);
        g.lineStyle(2.5, 0xffffff, 0.95);
        g.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 20);
        cont.add(g);

        const txt = this.scene.add.text(0, 0, text, {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        cont.add(txt);

        const hit = this.scene.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
            AudioManager.getInstance().playSFX('button_tap');
            onClick();
        });
        cont.add(hit);

        this.modalContainer.add(cont);
    }

    public destroy() {
        this.modalContainer?.destroy();
        this.modalContainer = null;
    }
}
