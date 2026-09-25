import { Scene } from 'phaser';
import { IconButton } from '../ui/IconButton';
import { SettingsPanel } from '../ui/SettingsPanel';
import { UILayers } from '../utils/UILayers';
import { UIPositions } from '../utils/UIPositions';
import { GameDataManager } from '../services/GameDataManager';
import { AudioManager } from '../services/AudioManager';
import { HUNT_ZONES } from '../data/LensHuntData';

export class LevelSelection extends Scene {
    constructor() {
        super('LevelSelection');
    }

    create() {
        const { width, height } = this.scale;
        const dataManager = GameDataManager.getInstance();

        // 1. Background Image
        this.add.image(width / 2, height / 2, 'bg')
            .setDisplaySize(width, height)
            .setDepth(UILayers.GAME_BACKGROUND);

        // 2. Dark Modal Backdrop Overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65)
            .setDepth(UILayers.GAME_BACKGROUND + 1)
            .setInteractive();

        // 3. Centered Level Selection Modal Container
        const modal = this.add.container(width / 2, height / 2)
            .setDepth(UILayers.UI_BACKGROUND_PANELS)
            .setScale(0.85)
            .setAlpha(0);

        const mw = 1180;
        const mh = 680;

        // Draw Detective Cyber Modal Frame
        this.drawModalFrame(modal, mw, mh);

        // Header Plaque: "SELECT INVESTIGATION ZONE"
        this.createHeaderPlaque(modal, 0, -mh / 2 + 10);

        // 3 Zone Cards (Home, School, Street)
        const cardSpacing = 350;
        const cardY = 50;
        const cardW = 310;
        const cardH = 440;

        for (let i = 1; i <= 3; i++) {
            const isUnlocked = dataManager.isLevelUnlocked(i);
            const cardX = (i - 2) * cardSpacing;
            this.createZoneCard(modal, cardX, cardY, cardW, cardH, i, isUnlocked);
        }

        // Pop in animation for modal
        this.tweens.add({
            targets: modal,
            scale: 1,
            alpha: 1,
            duration: 350,
            ease: 'Back.easeOut'
        });

        // 4. Navigation Buttons (Back & Settings)
        this.addTopNavigationButtons();
    }

    private drawModalFrame(container: Phaser.GameObjects.Container, w: number, h: number) {
        const g = this.add.graphics();
        const r = 32;

        // Outer Glow
        g.fillStyle(0x00e5ff, 0.25);
        g.fillRoundedRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28, r + 6);

        // Deep Slate Cyber Base
        g.fillStyle(0x0a1128, 0.98);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, r);

        // Neon Border
        g.lineStyle(4, 0x00e5ff, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

        // Inner plate
        g.fillStyle(0x0f172a, 0.95);
        g.fillRoundedRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, r - 8);

        container.add(g);
    }

    private createHeaderPlaque(container: Phaser.GameObjects.Container, x: number, y: number) {
        const headerCont = this.add.container(x, y);

        const pw = 680;
        const ph = 90;
        const pr = 24;
        const g = this.add.graphics();

        g.fillStyle(0x000000, 0.45);
        g.fillRoundedRect(-pw / 2, -ph / 2 + 6, pw, ph, pr);

        // Royal Violet Plaque
        g.fillStyle(0x6b21a8, 1);
        g.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, pr);

        // Gold Trim
        g.lineStyle(4, 0xffd166, 1);
        g.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, pr);
        headerCont.add(g);

        const title = this.add.text(0, 0, 'SELECT AI ZONE', {
            fontFamily: 'Arial Black',
            fontSize: '44px',
            color: '#fef08a',
            stroke: '#3b0764',
            strokeThickness: 8
        }).setOrigin(0.5);
        headerCont.add(title);

        container.add(headerCont);
    }

    private createZoneCard(
        container: Phaser.GameObjects.Container,
        x: number,
        y: number,
        w: number,
        h: number,
        zoneId: number,
        isUnlocked: boolean
    ) {
        const cardCont = this.add.container(x, y);
        const zoneConfig = HUNT_ZONES[zoneId - 1];
        const r = 24;

        const cardG = this.add.graphics();

        if (isUnlocked) {
            // Unlocked Card
            cardG.fillStyle(0x000000, 0.4);
            cardG.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, r);
            cardG.fillStyle(0x0c1022, 0.96);
            cardG.fillRoundedRect(-w / 2, -h / 2, w, h, r);

            // Level Accent Border
            cardG.lineStyle(4, zoneConfig.themeColor, 1);
            cardG.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
            cardCont.add(cardG);

            // 1. Collectible Lens Display on Card
            if (this.textures.exists(zoneConfig.lensKey)) {
                const lensImg = this.add.image(0, -h / 2 + 105, zoneConfig.lensKey).setScale(0.85);
                cardCont.add(lensImg);

                // Subtle float
                this.tweens.add({
                    targets: lensImg,
                    y: -h / 2 + 95,
                    duration: 1200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }

            // 2. Zone Name & Lens Label
            const nameTxt = this.add.text(0, 20, zoneConfig.subtitle, {
                fontFamily: 'Arial Black',
                fontSize: '26px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5,
                align: 'center'
            }).setOrigin(0.5);

            const lensTxt = this.add.text(0, 60, `Lens: ${zoneConfig.lensName}`, {
                fontFamily: 'Arial Black',
                fontSize: '18px',
                color: '#38bdf8'
            }).setOrigin(0.5);

            cardCont.add([nameTxt, lensTxt]);

            // 3. Play Button
            const btnW = 210;
            const btnH = 58;
            const btnCont = this.add.container(0, h / 2 - 48);

            const btnG = this.add.graphics();
            btnG.fillStyle(0x059669, 1);
            btnG.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 18);
            btnG.lineStyle(3, 0x34d399, 1);
            btnG.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 18);
            btnCont.add(btnG);

            const btnTxt = this.add.text(0, 0, 'INVESTIGATE', {
                fontFamily: 'Arial Black',
                fontSize: '22px',
                color: '#ffffff',
                stroke: '#064e3b',
                strokeThickness: 5
            }).setOrigin(0.5);
            btnCont.add(btnTxt);
            cardCont.add(btnCont);

            // Interactive Click
            const hit = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
            hit.on('pointerover', () => {
                AudioManager.getInstance().playSFX('button_tap');
                this.tweens.add({
                    targets: cardCont,
                    scale: 1.05,
                    duration: 150,
                    ease: 'Sine.easeOut'
                });
            });

            hit.on('pointerout', () => {
                this.tweens.add({
                    targets: cardCont,
                    scale: 1,
                    duration: 150,
                    ease: 'Sine.easeOut'
                });
            });

            hit.on('pointerdown', () => {
                AudioManager.getInstance().playSFX('click');
                this.scene.start('Game', { zoneId: zoneId });
            });
            cardCont.add(hit);
        } else {
            // Locked Zone Card
            cardG.fillStyle(0x090d1a, 0.9);
            cardG.fillRoundedRect(-w / 2, -h / 2, w, h, r);
            cardG.lineStyle(3, 0x334155, 1);
            cardG.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
            cardCont.add(cardG);

            const lockLabel = this.add.text(0, -30, '🔒 LOCKED', {
                fontFamily: 'Arial Black',
                fontSize: '32px',
                color: '#94a3b8'
            }).setOrigin(0.5);

            const unlockHint = this.add.text(0, 30, `Find all AI features in\nZone ${zoneId - 1} to unlock`, {
                fontFamily: 'Arial Black',
                fontSize: '18px',
                color: '#64748b',
                align: 'center'
            }).setOrigin(0.5);

            cardCont.add([lockLabel, unlockHint]);
        }

        container.add(cardCont);
    }

    private addTopNavigationButtons() {
        const backPos = UIPositions.getTopLeftButtonPos(0);
        const backBtn = new IconButton(
            this,
            backPos.x,
            backPos.y,
            'back_icon',
            () => {
                AudioManager.getInstance().playSFX('button_tap');
                this.scene.start('MainMenu');
            }
        );
        backBtn.setDepth(UILayers.UI_BUTTONS);

        const settingsPos = UIPositions.getTopLeftButtonPos(1);
        const settingsBtn = new IconButton(
            this,
            settingsPos.x,
            settingsPos.y,
            'settings_icon',
            () => {
                AudioManager.getInstance().playSFX('button_tap');
                new SettingsPanel(this, () => { });
            }
        );
        settingsBtn.setDepth(UILayers.UI_BUTTONS);
    }
}
