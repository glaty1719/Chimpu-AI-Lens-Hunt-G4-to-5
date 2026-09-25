import { Scene } from 'phaser';
import { IconButton } from '../ui/IconButton';
import { SpriteButton } from '../ui/SpriteButton';
import { SettingsPanel } from '../ui/SettingsPanel';
import { UILayers } from '../utils/UILayers';
import { UIPositions } from '../utils/UIPositions';
import { AudioManager } from '../services/AudioManager';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const { width, height } = this.scale;

        // 1. Fullscreen Background Image
        this.add.image(width / 2, height / 2, 'bg')
            .setDisplaySize(width, height)
            .setDepth(UILayers.GAME_BACKGROUND);

        // 5. Play Button & Text
        const playBtnX = width - 260;
        const playBtnY = height - 210;

        let isStarting = false;
        const startGame = () => {
            if (isStarting) return;
            isStarting = true;
            AudioManager.getInstance().playSFX('click', 0.7);
            this.scene.start('LevelSelection');
        };

        const playBtn = new SpriteButton(
            this,
            playBtnX,
            playBtnY,
            'playButton',
            startGame
        ).setDepth(UILayers.UI_BUTTONS).setScale(0.38);

        // 'Play Now' text styled to blend with the orange & gold button theme
        const playText = this.add.text(playBtnX, playBtnY + 105, 'Play Now', {
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: '34px',
            color: '#FFB800',
            stroke: '#1A0B02',
            strokeThickness: 6,
            shadow: {
                offsetX: 0,
                offsetY: 4,
                color: '#FF8800',
                blur: 8,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setDepth(UILayers.UI_ICONS);

        playText.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.tweens.add({
                    targets: [playBtn.sprite, playText],
                    scaleX: '*=0.92',
                    scaleY: '*=0.92',
                    duration: 80,
                    yoyo: true,
                    onComplete: () => startGame()
                });
            });

        // Synchronized pulse animation for both button and text
        this.tweens.add({
            targets: playBtn.sprite,
            scale: 0.42,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: playText,
            scale: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 6. Settings Button (Top-Left)
        this.addSettingsButton();

        // 7. Start Detective BGM
        try {
            AudioManager.getInstance().playMusic('detective_theme');
        } catch (e) {}
    }

    private addSettingsButton() {
        const pos = UIPositions.getTopLeftButtonPos(0);
        const settingsBtn = new IconButton(
            this,
            pos.x,
            pos.y,
            'settings_icon',
            () => {
                AudioManager.getInstance().playSFX('button_tap');
                new SettingsPanel(this, () => { });
            }
        );
        settingsBtn.setDepth(UILayers.UI_BUTTONS);
    }
}
