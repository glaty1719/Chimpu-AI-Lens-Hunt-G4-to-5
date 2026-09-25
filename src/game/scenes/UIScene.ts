import { Scene, GameObjects } from 'phaser';
import { IconButton } from '../ui/IconButton';
import { PausePanel } from '../ui/PausePanel';
import { SettingsPanel } from '../ui/SettingsPanel';
import { UILayers } from '../utils/UILayers';
import { UIPositions } from '../utils/UIPositions';

export interface HuntHUDState {
    zoneId: number;
    zoneTitle: string;
    zoneSubtitle: string;
    themeHex: string;
    aiDiscoveredCount: number;
    totalRequiredAI: number;
    batteryPercent: number;
    score: number;
    hasTargetSelected: boolean;
    isScanning: boolean;
    isTutorialActive: boolean;
    tutorialStep: number;
}

export class UIScene extends Scene {
    private gameScene!: Scene;
    private gameEvents!: Phaser.Events.EventEmitter;
    private currentZoneId: number = 1;

    // Top-Left HUD (Zone Badge & Discoveries)
    private zoneBadgeCont!: GameObjects.Container;
    private zoneTitleText!: GameObjects.Text;
    private discoveriesText!: GameObjects.Text;

    // Top-Right HUD (Battery Meter, Score, Sound, Pause)
    private scoreText!: GameObjects.Text;
    private batteryContainer!: GameObjects.Container;
    private batteryCellsGraphics!: GameObjects.Graphics;
    private batteryPercentText!: GameObjects.Text;
    private pauseButton!: IconButton;
    private soundButton!: IconButton;

    // Bottom Action HUD (Scanner Button & Controls Hint)
    private scannerBtnContainer!: GameObjects.Container;
    private scannerBtnGlowTween: Phaser.Tweens.Tween | null = null;
    private controlsHintContainer!: GameObjects.Container;

    // Interactive Tutorial Finger Pointer
    private tutorialPointer!: GameObjects.Container;
    private tutorialPointerText!: GameObjects.Text;

    constructor() {
        super({ key: 'UIScene' });
    }

    init(data: { gameScene: Scene; zoneId?: number }) {
        this.gameScene = data.gameScene;
        this.gameEvents = this.gameScene.events;
        this.currentZoneId = data.zoneId || 1;
    }

    create() {
        this.input.setTopOnly(true);

        this.setupTopLeftHUD();
        this.setupTopRightHUD();
        this.setupBottomScannerButton();
        this.setupTutorialPointer();

        // Listen for HUD updates and events from Game Scene
        this.gameEvents.on('update-hunt-hud', this.onUpdateHuntHUD, this);
        this.gameEvents.on('show-zone-complete', this.onZoneCompleteBanner, this);

        this.events.on('shutdown', this.cleanup, this);
    }

    private setupTopLeftHUD() {
        this.zoneBadgeCont = this.add.container(230, 62).setDepth(UILayers.UI_BACKGROUND_PANELS);

        const badgeG = this.add.graphics();
        // Glassmorphic panel
        badgeG.fillStyle(0x061526, 0.88);
        badgeG.fillRoundedRect(-190, -36, 380, 72, 16);
        badgeG.lineStyle(2, 0x00e5ff, 0.85);
        badgeG.strokeRoundedRect(-190, -36, 380, 72, 16);

        // Top subtle highlight line
        badgeG.lineStyle(1.5, 0xffffff, 0.4);
        badgeG.lineBetween(-175, -34, 175, -34);
        this.zoneBadgeCont.add(badgeG);

        // Zone Title
        this.zoneTitleText = this.add.text(0, -14, `ZONE ${this.currentZoneId}: AI AT HOME`, {
            fontFamily: 'Arial Black',
            fontSize: '17px',
            color: '#38bdf8',
            stroke: '#05131e',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Discoveries Counter
        this.discoveriesText = this.add.text(0, 14, '🔍 AI FEATURES: 0 / 4 FOUND', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#00e676',
            stroke: '#05131e',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.zoneBadgeCont.add([this.zoneTitleText, this.discoveriesText]);
    }

    private setupTopRightHUD() {
        const { width } = this.scale;

        // 1. Scanner Battery Meter
        const batX = width - 580;
        const batY = 62;
        this.batteryContainer = this.add.container(batX, batY).setDepth(UILayers.UI_BACKGROUND_PANELS);

        const batFrameG = this.add.graphics();
        batFrameG.fillStyle(0x061526, 0.88);
        batFrameG.fillRoundedRect(-110, -36, 220, 72, 16);
        batFrameG.lineStyle(2, 0x00e5ff, 0.85);
        batFrameG.strokeRoundedRect(-110, -36, 220, 72, 16);
        this.batteryContainer.add(batFrameG);

        const batLabel = this.add.text(0, -16, '⚡ SCANNER BATTERY', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#fef08a'
        }).setOrigin(0.5);
        this.batteryContainer.add(batLabel);

        // Battery cell frame & graphics
        this.batteryCellsGraphics = this.add.graphics();
        this.batteryContainer.add(this.batteryCellsGraphics);

        this.batteryPercentText = this.add.text(0, 14, '0%', {
            fontFamily: 'Arial Black',
            fontSize: '15px',
            color: '#ffffff',
            stroke: '#05131e',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.batteryContainer.add(this.batteryPercentText);

        // 2. Score Badge
        const scoreX = width - 360;
        const scoreY = 62;
        const scoreCont = this.add.container(scoreX, scoreY).setDepth(UILayers.UI_BACKGROUND_PANELS);
        const scG = this.add.graphics();
        scG.fillStyle(0x061526, 0.88);
        scG.fillRoundedRect(-70, -36, 140, 72, 16);
        scG.lineStyle(2, 0x10b981, 0.85);
        scG.strokeRoundedRect(-70, -36, 140, 72, 16);
        scoreCont.add(scG);

        const scLbl = this.add.text(0, -14, 'SCORE', {
            fontFamily: 'Arial Black', fontSize: '13px', color: '#6ee7b7'
        }).setOrigin(0.5);
        this.scoreText = this.add.text(0, 14, '0', {
            fontFamily: 'Arial Black', fontSize: '22px', color: '#ffffff', stroke: '#05131e', strokeThickness: 3
        }).setOrigin(0.5);
        scoreCont.add([scLbl, this.scoreText]);

        // 3. Settings/Sound & Pause Top Buttons
        const soundX = width - 190;
        const pauseX = width - 85;
        const btnY = 62;

        this.soundButton = new IconButton(
            this,
            soundX,
            btnY,
            'settings_icon',
            () => {
                this.gameEvents.emit('pause-game');
                new SettingsPanel(this, () => {
                    this.gameEvents.emit('resume-game');
                });
            }
        );
        this.soundButton.setDepth(UILayers.UI_BUTTONS);

        this.pauseButton = new IconButton(
            this,
            pauseX,
            btnY,
            'pause_icon',
            () => {
                this.gameEvents.emit('pause-game');
                new PausePanel(
                    this,
                    () => { this.gameEvents.emit('resume-game'); },
                    () => { this.gameEvents.emit('resume-game'); this.gameEvents.emit('restart-game'); },
                    () => { this.gameEvents.emit('resume-game'); this.gameEvents.emit('quit-game'); }
                );
            }
        );
        this.pauseButton.setDepth(UILayers.UI_BUTTONS);
    }

    private setupBottomScannerButton() {
        const { width, height } = this.scale;
        const btnX = width - 170;
        const btnY = height - 75;
        const btnW = 250;
        const btnH = 80;

        this.scannerBtnContainer = this.add.container(btnX, btnY).setDepth(UILayers.UI_BUTTONS);

        const btnG = this.add.graphics();
        btnG.fillStyle(0x04192b, 0.95);
        btnG.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 20);
        btnG.fillStyle(0x0284c7, 0.35);
        btnG.fillRoundedRect(-btnW / 2 + 3, -btnH / 2 + 3, btnW - 6, btnH / 2 - 2, 16);
        btnG.lineStyle(3, 0x00e5ff, 1);
        btnG.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 20);
        this.scannerBtnContainer.add(btnG);

        // Lens Icon inside Scanner Button
        if (this.textures.exists('lens_home')) {
            const lensIcon = this.add.image(-btnW / 2 + 45, 0, 'lens_home').setScale(0.38);
            this.scannerBtnContainer.add(lensIcon);
        }

        const btnTitle = this.add.text(25, -10, 'SCAN OBJECT', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#05131e',
            strokeThickness: 4
        }).setOrigin(0.5);

        const btnSub = this.add.text(25, 16, 'TAP OR [SPACE]', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#00e5ff'
        }).setOrigin(0.5);

        this.scannerBtnContainer.add([btnTitle, btnSub]);

        // Interactive Trigger
        const hitZone = this.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });
        hitZone.on('pointerdown', () => {
            this.animateButtonPress(this.scannerBtnContainer);
            this.gameEvents.emit('trigger-scan');
        });
        this.scannerBtnContainer.add(hitZone);
    }

    private setupTutorialPointer() {
        this.tutorialPointer = this.add.container(0, 0)
            .setDepth(UILayers.OVERLAY_PANEL + 15)
            .setVisible(false);

        const ptrBody = this.add.container(0, 0);
        const ptrG = this.add.graphics();
        ptrG.fillStyle(0xfbbf24, 1);
        ptrG.fillRoundedRect(-120, -40, 240, 52, 16);
        ptrG.lineStyle(3, 0xffffff, 1);
        ptrG.strokeRoundedRect(-120, -40, 240, 52, 16);

        // Downward Triangle
        ptrG.fillStyle(0xfbbf24, 1);
        ptrG.beginPath();
        ptrG.moveTo(-16, 12);
        ptrG.lineTo(16, 12);
        ptrG.lineTo(0, 28);
        ptrG.closePath();
        ptrG.fillPath();

        this.tutorialPointerText = this.add.text(0, -14, '👇 TAP OBJECT TO SELECT', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#0f172a'
        }).setOrigin(0.5);

        ptrBody.add([ptrG, this.tutorialPointerText]);
        this.tutorialPointer.add(ptrBody);

        this.tweens.add({
            targets: ptrBody,
            y: -12,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private onUpdateHuntHUD(state: HuntHUDState) {
        this.zoneTitleText.setText(`ZONE ${state.zoneId}: ${state.zoneSubtitle.toUpperCase()}`);
        this.discoveriesText.setText(`🔍 AI FEATURES: ${state.aiDiscoveredCount} / ${state.totalRequiredAI} FOUND`);
        this.scoreText.setText(`${state.score}`);

        this.drawBattery(state.batteryPercent);

        // Pulse scanner button if a target is selected
        if (state.hasTargetSelected && !state.isScanning) {
            this.pulseScannerButton(true);
        } else {
            this.pulseScannerButton(false);
        }

        // Tutorial Guidance
        if (state.isTutorialActive) {
            this.tutorialPointer.setVisible(true);
            if (state.tutorialStep === 1) {
                // Point to object
                this.tutorialPointerText.setText('👇 TAP OBJECT TO SELECT');
                this.tutorialPointer.setPosition(620, 520);
            } else if (state.tutorialStep === 2) {
                // Point to Scanner Button
                this.tutorialPointerText.setText('👇 TAP SCAN TO ANALYZE!');
                this.tutorialPointer.setPosition(this.scannerBtnContainer.x, this.scannerBtnContainer.y - 85);
            }
        } else {
            this.tutorialPointer.setVisible(false);
        }
    }

    private drawBattery(percent: number) {
        this.batteryCellsGraphics.clear();
        const clamped = Phaser.Math.Clamp(percent, 0, 100);

        const startX = -84;
        const startY = 6;
        const totalW = 160;
        const cellH = 20;

        if (clamped > 0) {
            const fillW = (totalW * (clamped / 100));
            // Mint green / cyan battery fluid
            this.batteryCellsGraphics.fillStyle(0x00e676, 1);
            this.batteryCellsGraphics.fillRoundedRect(startX, startY, fillW, cellH, 4);

            this.batteryCellsGraphics.fillStyle(0xffffff, 0.6);
            this.batteryCellsGraphics.fillRect(startX + 2, startY + 2, fillW - 4, 3);
        }

        this.batteryPercentText.setText(`${clamped}%`);
    }

    private pulseScannerButton(enable: boolean) {
        if (enable) {
            if (!this.scannerBtnGlowTween) {
                this.scannerBtnGlowTween = this.tweens.add({
                    targets: this.scannerBtnContainer,
                    scale: 1.08,
                    duration: 380,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        } else {
            if (this.scannerBtnGlowTween) {
                this.scannerBtnGlowTween.stop();
                this.scannerBtnGlowTween = null;
                this.scannerBtnContainer.setScale(1);
            }
        }
    }

    private animateButtonPress(container: GameObjects.Container) {
        this.tweens.add({
            targets: container,
            scale: 0.92,
            duration: 80,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    private onZoneCompleteBanner(data: { zoneId: number; lensName: string; score: number }) {
        const { width, height } = this.scale;
        const banner = this.add.container(width / 2, height / 2)
            .setDepth(UILayers.MODAL_PANEL + 10)
            .setScale(0.8)
            .setAlpha(0);

        const bG = this.add.graphics();
        bG.fillStyle(0x0a1128, 0.96);
        bG.fillRoundedRect(-420, -160, 840, 320, 24);
        bG.lineStyle(4, 0x10b981, 1);
        bG.strokeRoundedRect(-420, -160, 840, 320, 24);
        banner.add(bG);

        const title = this.add.text(0, -90, `🎉 ZONE ${data.zoneId} CLEARED!`, {
            fontFamily: 'Arial Black', fontSize: '36px', color: '#fef08a', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        const lensText = this.add.text(0, -25, `Collected: ${data.lensName.toUpperCase()} ✨`, {
            fontFamily: 'Arial Black', fontSize: '26px', color: '#00e5ff'
        }).setOrigin(0.5);

        const subText = this.add.text(0, 35, 'Scanner Battery 100% Charged! Preparing next zone...', {
            fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5);

        banner.add([title, lensText, subText]);

        this.tweens.add({
            targets: banner,
            scale: 1,
            alpha: 1,
            duration: 350,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(2200, () => {
                    this.tweens.add({
                        targets: banner,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => {
                            banner.destroy();
                        }
                    });
                });
            }
        });
    }

    private cleanup() {
        if (this.gameEvents) {
            this.gameEvents.off('update-hunt-hud', this.onUpdateHuntHUD, this);
            this.gameEvents.off('show-zone-complete', this.onZoneCompleteBanner, this);
        }
    }
}
