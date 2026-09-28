import { Scene, GameObjects } from 'phaser';
import { IconButton } from '../ui/IconButton';
import { PausePanel } from '../ui/PausePanel';
import { SettingsPanel } from '../ui/SettingsPanel';
import { UILayers } from '../utils/UILayers';

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
    private scannerBtnBg!: GameObjects.Graphics;
    private scannerBtnTitle!: GameObjects.Text;
    private scannerBtnIcon?: GameObjects.Image;
    private scanHitZone!: GameObjects.Zone;
    private scannerBtnGlowTween: Phaser.Tweens.Tween | null = null;
    private isScannerBtnEnabled: boolean = false;

    // Side Navigation Movement Buttons (Left & Right Ends of Screen)
    private leftNavBtnCont!: GameObjects.Container;
    private rightNavBtnCont!: GameObjects.Container;

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
        this.setupBottomControlConsole();
        this.setupTutorialPointer();

        // Listen for HUD updates and events from Game Scene
        this.gameEvents.on('update-hunt-hud', this.onUpdateHuntHUD, this);
        this.gameEvents.on('show-zone-complete', this.onZoneCompleteBanner, this);
        this.gameEvents.on('scanner-modal-changed', (isOpen: boolean) => {
            if (isOpen) {
                this.setScannerButtonEnabled(false);
                this.tutorialPointer?.setVisible(false);
            }
        }, this);

        // Request initial HUD state synchronization from Game Scene
        this.gameEvents.emit('request-hud-sync');

        this.events.on('shutdown', this.cleanup, this);
    }

    private setupTopLeftHUD() {
        this.zoneBadgeCont = this.add.container(275, 65).setDepth(UILayers.UI_BACKGROUND_PANELS);

        const badgeG = this.add.graphics();
        // Glassmorphic panel
        badgeG.fillStyle(0x061526, 0.88);
        badgeG.fillRoundedRect(-240, -44, 480, 88, 18);
        badgeG.lineStyle(2.5, 0x00e5ff, 0.85);
        badgeG.strokeRoundedRect(-240, -44, 480, 88, 18);

        // Top subtle highlight line
        badgeG.lineStyle(1.5, 0xffffff, 0.4);
        badgeG.lineBetween(-220, -42, 220, -42);
        this.zoneBadgeCont.add(badgeG);

        // Zone Title
        this.zoneTitleText = this.add.text(0, -16, `ZONE ${this.currentZoneId}: AI AT HOME`, {
            fontFamily: 'Arial Black',
            fontSize: '26px',
            color: '#38bdf8',
            stroke: '#05131e',
            strokeThickness: 5
        }).setOrigin(0.5);

        // Discoveries Counter
        this.discoveriesText = this.add.text(0, 16, '🔍 AI FEATURES: 0 / 4 FOUND', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#00e676',
            stroke: '#05131e',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.zoneBadgeCont.add([this.zoneTitleText, this.discoveriesText]);
    }

    private setupTopRightHUD() {
        const { width } = this.scale;

        // 1. Scanner Battery Meter
        const batX = width - 650;
        const batY = 65;
        this.batteryContainer = this.add.container(batX, batY).setDepth(UILayers.UI_BACKGROUND_PANELS);

        const batFrameG = this.add.graphics();
        batFrameG.fillStyle(0x061526, 0.88);
        batFrameG.fillRoundedRect(-130, -44, 260, 88, 18);
        batFrameG.lineStyle(2.5, 0x00e5ff, 0.85);
        batFrameG.strokeRoundedRect(-130, -44, 260, 88, 18);
        this.batteryContainer.add(batFrameG);

        const batLabel = this.add.text(0, -18, '⚡ SCANNER BATTERY', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#fef08a'
        }).setOrigin(0.5);
        this.batteryContainer.add(batLabel);

        // Battery cell frame & graphics
        this.batteryCellsGraphics = this.add.graphics();
        this.batteryContainer.add(this.batteryCellsGraphics);

        this.batteryPercentText = this.add.text(0, 18, '0%', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#05131e',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.batteryContainer.add(this.batteryPercentText);

        // 2. Score Badge
        const scoreX = width - 390;
        const scoreY = 65;
        const scoreCont = this.add.container(scoreX, scoreY).setDepth(UILayers.UI_BACKGROUND_PANELS);
        const scG = this.add.graphics();
        scG.fillStyle(0x061526, 0.88);
        scG.fillRoundedRect(-90, -44, 180, 88, 18);
        scG.lineStyle(2.5, 0x10b981, 0.85);
        scG.strokeRoundedRect(-90, -44, 180, 88, 18);
        scoreCont.add(scG);

        const scLbl = this.add.text(0, -16, 'SCORE', {
            fontFamily: 'Arial Black', fontSize: '18px', color: '#6ee7b7'
        }).setOrigin(0.5);
        this.scoreText = this.add.text(0, 18, '0', {
            fontFamily: 'Arial Black', fontSize: '32px', color: '#ffffff', stroke: '#05131e', strokeThickness: 5
        }).setOrigin(0.5);
        scoreCont.add([scLbl, this.scoreText]);

        // 3. Settings/Sound & Pause Top Buttons
        const soundX = width - 190;
        const pauseX = width - 85;
        const btnY = 65;

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

    private setupBottomControlConsole() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height - 70;

        // --- 2. Left Movement Button (Left of Scanner) ---
        const leftX = centerX - 195;
        const btnRadius = 40;
        this.leftNavBtnCont = this.add.container(leftX, centerY).setDepth(UILayers.UI_BUTTONS);

        const leftBg = this.add.graphics();
        leftBg.fillStyle(0x061e36, 0.95);
        leftBg.fillRoundedRect(-btnRadius, -btnRadius, btnRadius * 2, btnRadius * 2, 20);
        leftBg.fillStyle(0x0284c7, 0.35);
        leftBg.fillRoundedRect(-btnRadius + 2, -btnRadius + 2, btnRadius * 2 - 4, btnRadius - 2, 16);
        leftBg.lineStyle(2.5, 0x00e5ff, 0.95);
        leftBg.strokeRoundedRect(-btnRadius, -btnRadius, btnRadius * 2, btnRadius * 2, 20);
        this.leftNavBtnCont.add(leftBg);

        const leftIcon = this.add.text(0, 0, '◀', {
            fontFamily: 'Arial Black',
            fontSize: '34px',
            color: '#38bdf8',
            stroke: '#05131e',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.leftNavBtnCont.add(leftIcon);

        const leftHitZone = this.add.zone(0, 0, btnRadius * 2, btnRadius * 2)
            .setInteractive({ useHandCursor: true });

        leftHitZone.on('pointerdown', () => {
            this.gameEvents.emit('chimpu-move', -1);
            this.leftNavBtnCont.setScale(0.92);
            leftIcon.setColor('#00e5ff');
        });
        const onLeftRelease = () => {
            this.gameEvents.emit('chimpu-move', 0);
            this.leftNavBtnCont.setScale(1.0);
            leftIcon.setColor('#38bdf8');
        };
        leftHitZone.on('pointerup', onLeftRelease);
        leftHitZone.on('pointerout', onLeftRelease);
        leftHitZone.on('pointercancel', onLeftRelease);
        this.leftNavBtnCont.add(leftHitZone);

        // --- 3. Center Scanner Button ---
        const btnW = 300;
        const btnH = 86;
        this.scannerBtnContainer = this.add.container(centerX, centerY).setDepth(UILayers.UI_BUTTONS);

        this.scannerBtnBg = this.add.graphics();
        this.scannerBtnContainer.add(this.scannerBtnBg);

        if (this.textures.exists('lens_home')) {
            this.scannerBtnIcon = this.add.image(-btnW / 2 + 50, 0, 'lens_home').setScale(0.44);
            this.scannerBtnContainer.add(this.scannerBtnIcon);
        }

        this.scannerBtnTitle = this.add.text(28, 0, 'SCAN OBJECT', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#05131e',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.scannerBtnContainer.add(this.scannerBtnTitle);

        this.scanHitZone = this.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });
        this.scanHitZone.on('pointerdown', (pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
            event?.stopPropagation();
            if (!this.isScannerBtnEnabled) return;
            this.animateButtonPress(this.scannerBtnContainer);
            this.gameEvents.emit('trigger-scan');
        });
        this.scannerBtnContainer.add(this.scanHitZone);

        // Initially disabled until an object is selected
        this.setScannerButtonEnabled(false);

        // --- 4. Right Movement Button (Right of Scanner) ---
        const rightX = centerX + 210;
        this.rightNavBtnCont = this.add.container(rightX, centerY).setDepth(UILayers.UI_BUTTONS);

        const rightBg = this.add.graphics();
        rightBg.fillStyle(0x061e36, 0.95);
        rightBg.fillRoundedRect(-btnRadius, -btnRadius, btnRadius * 2, btnRadius * 2, 20);
        rightBg.fillStyle(0x0284c7, 0.35);
        rightBg.fillRoundedRect(-btnRadius + 2, -btnRadius + 2, btnRadius * 2 - 4, btnRadius - 2, 16);
        rightBg.lineStyle(2.5, 0x00e5ff, 0.95);
        rightBg.strokeRoundedRect(-btnRadius, -btnRadius, btnRadius * 2, btnRadius * 2, 20);
        this.rightNavBtnCont.add(rightBg);

        const rightIcon = this.add.text(0, 0, '▶', {
            fontFamily: 'Arial Black',
            fontSize: '34px',
            color: '#38bdf8',
            stroke: '#05131e',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.rightNavBtnCont.add(rightIcon);

        const rightHitZone = this.add.zone(0, 0, btnRadius * 2, btnRadius * 2)
            .setInteractive({ useHandCursor: true });

        rightHitZone.on('pointerdown', () => {
            this.gameEvents.emit('chimpu-move', 1);
            this.rightNavBtnCont.setScale(0.92);
            rightIcon.setColor('#00e5ff');
        });
        const onRightRelease = () => {
            this.gameEvents.emit('chimpu-move', 0);
            this.rightNavBtnCont.setScale(1.0);
            rightIcon.setColor('#38bdf8');
        };
        rightHitZone.on('pointerup', onRightRelease);
        rightHitZone.on('pointerout', onRightRelease);
        rightHitZone.on('pointercancel', onRightRelease);
        this.rightNavBtnCont.add(rightHitZone);
    }

    private setupTutorialPointer() {
        const isTutorial = this.currentZoneId === 1;
        this.tutorialPointer = this.add.container(this.scale.width / 2, this.scale.height / 2)
            .setDepth(UILayers.OVERLAY_PANEL + 15)
            .setVisible(isTutorial);

        const ptrBody = this.add.container(0, 0);
        const ptrG = this.add.graphics();
        ptrG.fillStyle(0xfbbf24, 1);
        ptrG.fillRoundedRect(-190, -48, 380, 68, 20);
        ptrG.lineStyle(3.5, 0xffffff, 1);
        ptrG.strokeRoundedRect(-190, -48, 380, 68, 20);

        // Downward Triangle
        ptrG.fillStyle(0xfbbf24, 1);
        ptrG.beginPath();
        ptrG.moveTo(-20, 20);
        ptrG.lineTo(20, 20);
        ptrG.lineTo(0, 40);
        ptrG.closePath();
        ptrG.fillPath();

        this.tutorialPointerText = this.add.text(0, -14, '👇 TAP OBJECT TO SELECT', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
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

        // Update Scanner Button enabled/disabled state
        const canScan = state.hasTargetSelected && !state.isScanning;
        this.setScannerButtonEnabled(canScan);

        // Tutorial Guidance
        if (state.isTutorialActive) {
            if (!state.hasTargetSelected) {
                // Whenever an object is not selected during tutorial, display at center of screen
                this.tutorialPointer.setVisible(true);
                this.tutorialPointerText.setText('👇 TAP OBJECT TO SELECT');
                this.tutorialPointer.setPosition(this.scale.width / 2, this.scale.height / 2);
            } else if (state.hasTargetSelected && !state.isScanning) {
                // Point to Scanner Button when object is selected
                this.tutorialPointer.setVisible(true);
                this.tutorialPointerText.setText('👇 TAP SCAN TO ANALYZE!');
                this.tutorialPointer.setPosition(this.scannerBtnContainer.x, this.scannerBtnContainer.y - 85);
            } else {
                this.tutorialPointer.setVisible(false);
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

    private setScannerButtonEnabled(enabled: boolean) {
        this.isScannerBtnEnabled = enabled;
        const btnW = 250;
        const btnH = 74;

        this.scannerBtnBg.clear();

        if (enabled) {
            this.scannerBtnBg.fillStyle(0x061e36, 0.95);
            this.scannerBtnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 18);
            this.scannerBtnBg.fillStyle(0x0284c7, 0.4);
            this.scannerBtnBg.fillRoundedRect(-btnW / 2 + 2, -btnH / 2 + 2, btnW - 4, btnH / 2 - 2, 14);
            this.scannerBtnBg.lineStyle(2.5, 0x00e5ff, 1);
            this.scannerBtnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 18);

            this.scannerBtnTitle.setColor('#ffffff');
            this.scannerBtnTitle.setAlpha(1);
            if (this.scannerBtnIcon) this.scannerBtnIcon.setAlpha(1);
            this.scannerBtnContainer.setAlpha(1);

            this.scanHitZone.setInteractive({ useHandCursor: true });
        } else {
            this.scannerBtnBg.fillStyle(0x0a101d, 0.7);
            this.scannerBtnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 18);
            this.scannerBtnBg.lineStyle(2, 0x334155, 0.6);
            this.scannerBtnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 18);

            this.scannerBtnTitle.setColor('#94a3b8');
            this.scannerBtnTitle.setAlpha(0.6);
            if (this.scannerBtnIcon) this.scannerBtnIcon.setAlpha(0.4);
            this.scannerBtnContainer.setAlpha(0.5);

            this.scanHitZone.disableInteractive();
        }

        this.pulseScannerButton(enabled);
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
        bG.fillRoundedRect(-480, -190, 960, 380, 28);
        bG.lineStyle(4, 0x10b981, 1);
        bG.strokeRoundedRect(-480, -190, 960, 380, 28);
        banner.add(bG);

        const title = this.add.text(0, -105, `🎉 ZONE ${data.zoneId} CLEARED!`, {
            fontFamily: 'Arial Black', fontSize: '52px', color: '#fef08a', stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5);

        const lensText = this.add.text(0, -25, `Collected: ${data.lensName.toUpperCase()} ✨`, {
            fontFamily: 'Arial Black', fontSize: '38px', color: '#00e5ff', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5);

        const subText = this.add.text(0, 50, 'Scanner Battery 100% Charged! Preparing next zone...', {
            fontFamily: 'Arial Black', fontSize: '30px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
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
            this.gameEvents.off('scanner-modal-changed');
        }
    }
}
