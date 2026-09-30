import { Scene, GameObjects, Math as PhaserMath } from 'phaser';
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
    tutorialTargetPos?: { x: number; y: number };
}

export class UIScene extends Scene {
    private gameScene!: Scene;
    private gameEvents!: Phaser.Events.EventEmitter;
    private currentZoneId: number = 1;

    // Top HUD Elements
    private levelTitleText!: GameObjects.Text;
    private scoreText!: GameObjects.Text;
    private teamSparkBar!: GameObjects.Graphics;
    private teamSparkPercentText!: GameObjects.Text;
    private currentLevel: number = 1;
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
    private isTutorialActiveState: boolean = false;
    private hasTargetSelectedState: boolean = false;

    constructor() {
        super({ key: 'UIScene' });
    }

    init(data: { gameScene: Scene; zoneId?: number }) {
        this.gameScene = data.gameScene;
        this.gameEvents = this.gameScene.events;
        this.currentZoneId = data.zoneId || 1;
        this.currentLevel = this.currentZoneId;
    }

    create() {
        this.input.setTopOnly(true);

        this.setupTopHUD();
        this.setupBottomControlConsole();
        this.setupTutorialPointer();

        // Listen for HUD updates and events from Game Scene
        this.gameEvents.on('update-hunt-hud', this.onUpdateHuntHUD, this);
        this.gameEvents.on('show-zone-complete', this.onZoneCompleteBanner, this);
        this.gameEvents.on('tutorial-pointer-pos', (pos: { x: number; y: number }) => {
            if (this.isTutorialActiveState && !this.hasTargetSelectedState && this.tutorialPointer?.visible) {
                this.tutorialPointer.setPosition(pos.x, pos.y);
            }
        }, this);
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

    private setupTopHUD() {
        const { width } = this.scale;

        // Top Left: Pause & Settings Buttons
        const pauseX = 105;
        const soundX = 205;
        const btnY = 70;

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

        // Top Right: Zone & Score (Right-aligned with 45px safe right margin to prevent text clipping)
        const rightMarginX = width - 45;
        this.levelTitleText = this.add.text(rightMarginX, 50, `Level: ${this.currentLevel}`, {
            fontFamily: 'Arial Black',
            fontSize: '36px',
            color: '#38bdf8',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(1, 0.5).setDepth(UILayers.UI_TEXT);

        this.scoreText = this.add.text(rightMarginX, 105, 'SCORE: 0', {
            fontFamily: 'Arial Black',
            fontSize: '36px',
            color: '#4ade80',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(1, 0.5).setDepth(UILayers.UI_TEXT);

        // Top Center: Team Spark & Combo Meter Box
        const centerBox = this.add.graphics().setDepth(UILayers.UI_BACKGROUND_PANELS);
        centerBox.fillStyle(0x0f172a, 0.92);
        centerBox.fillRoundedRect(width / 2 - 270, 24, 540, 106, 18);
        centerBox.lineStyle(3, 0xa855f7, 0.9);
        centerBox.strokeRoundedRect(width / 2 - 270, 24, 540, 106, 18);

        this.add.text(width / 2, 36, '⚡ LENS HUNT', {
            fontFamily: 'Arial Black',
            fontSize: '26px',
            color: '#c084fc'
        }).setOrigin(0.5, 0).setDepth(UILayers.UI_TEXT);

        this.teamSparkBar = this.add.graphics().setDepth(UILayers.UI_TEXT);
        this.teamSparkPercentText = this.add.text(width / 2, 93, '0%', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(UILayers.UI_TEXT + 1);
        this.drawSparkBar(0);
    }

    private drawSparkBar(percent: number) {
        this.teamSparkBar.clear();
        const { width } = this.scale;
        const clamped = PhaserMath.Clamp(percent, 0, 100);

        const barX = width / 2 - 235;
        const barY = 74;
        const barW = 470;
        const barH = 38;

        // Spark bar background slot
        this.teamSparkBar.fillStyle(0x1e1b4b, 0.85);
        this.teamSparkBar.fillRoundedRect(barX, barY, barW, barH, 10);
        this.teamSparkBar.lineStyle(2, 0x6366f1, 0.5);
        this.teamSparkBar.strokeRoundedRect(barX, barY, barW, barH, 10);

        if (clamped > 0) {
            const fillW = Math.max(12, (barW * clamped) / 100);
            // Purple spark glow fill
            this.teamSparkBar.fillStyle(0xa855f7, 1);
            this.teamSparkBar.fillRoundedRect(barX, barY, fillW, barH, 10);

            // Highlight glass reflection shine
            this.teamSparkBar.fillStyle(0xffffff, 0.35);
            this.teamSparkBar.fillRoundedRect(barX + 2, barY + 2, fillW - 4, barH / 2 - 2, 6);
        }

        if (this.teamSparkPercentText) {
            this.teamSparkPercentText.setText(`${Math.round(clamped)}%`);
        }
    }

    private setupBottomControlConsole() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height - 70;

        // --- 1. Left Movement Button (Left of Scanner) ---
        const leftX = centerX - 205;
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

        // --- 2. Center Scanner Button ---
        const btnW = 300;
        const btnH = 84;
        this.scannerBtnContainer = this.add.container(centerX, centerY).setDepth(UILayers.UI_BUTTONS);

        this.scannerBtnBg = this.add.graphics();
        this.scannerBtnContainer.add(this.scannerBtnBg);

        if (this.textures.exists('lens_home')) {
            this.scannerBtnIcon = this.add.image(-btnW / 2 + 52, 0, 'lens_home').setScale(0.48);
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
        this.scanHitZone.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
            event?.stopPropagation();
            if (!this.isScannerBtnEnabled) return;
            this.animateButtonPress(this.scannerBtnContainer);
            this.gameEvents.emit('trigger-scan');
        });
        this.scannerBtnContainer.add(this.scanHitZone);

        // Initially disabled until an object is selected
        this.setScannerButtonEnabled(false);

        // --- 3. Right Movement Button (Right of Scanner) ---
        const rightX = centerX + 205;
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

        this.tutorialPointerText = this.add.text(0, -14, '🛹 SKATE TO OBJECT', {
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
        this.currentLevel = state.zoneId;
        this.isTutorialActiveState = state.isTutorialActive;
        this.hasTargetSelectedState = state.hasTargetSelected;

        if (this.levelTitleText) {
            this.levelTitleText.setText(`Level: ${state.zoneId}`);
        }
        if (this.scoreText) {
            this.scoreText.setText(`SCORE: ${state.score}`);
        }

        this.drawSparkBar(state.batteryPercent);

        // Update Scanner Button enabled/disabled state
        const canScan = state.hasTargetSelected && !state.isScanning;
        this.setScannerButtonEnabled(canScan);

        // Tutorial Guidance
        if (state.isTutorialActive) {
            if (!state.hasTargetSelected) {
                // Whenever an object is not selected during tutorial, display directly over the AI object
                this.tutorialPointer.setVisible(true);
                this.tutorialPointerText.setText('🛹 SKATE TO OBJECT');
                if (state.tutorialTargetPos) {
                    this.tutorialPointer.setPosition(state.tutorialTargetPos.x, state.tutorialTargetPos.y);
                }
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

    private setScannerButtonEnabled(enabled: boolean) {
        this.isScannerBtnEnabled = enabled;
        const btnW = 300;
        const btnH = 84;

        this.scannerBtnBg.clear();

        if (enabled) {
            // Outer glow halo
            this.scannerBtnBg.fillStyle(0x00e5ff, 0.25);
            this.scannerBtnBg.fillRoundedRect(-btnW / 2 - 4, -btnH / 2 - 4, btnW + 8, btnH + 8, 22);

            // Rich cyber navy gradient base
            this.scannerBtnBg.fillStyle(0x061e38, 0.98);
            this.scannerBtnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 18);

            // Glowing top cyan plate
            this.scannerBtnBg.fillStyle(0x0284c7, 0.5);
            this.scannerBtnBg.fillRoundedRect(-btnW / 2 + 2, -btnH / 2 + 2, btnW - 4, btnH / 2 - 2, 14);

            // Bright cyan outline
            this.scannerBtnBg.lineStyle(3, 0x00e5ff, 1);
            this.scannerBtnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 18);

            // Subtle lens badge backing ring
            this.scannerBtnBg.lineStyle(2, 0x38bdf8, 0.8);
            this.scannerBtnBg.strokeCircle(-btnW / 2 + 52, 0, 28);

            this.scannerBtnTitle.setColor('#ffffff');
            this.scannerBtnTitle.setStroke('#021a36', 6);
            if (this.scannerBtnIcon) this.scannerBtnIcon.setAlpha(1);
            this.scannerBtnContainer.setAlpha(1);

            this.scanHitZone.setInteractive({ useHandCursor: true });
        } else {
            // Sleek translucent standby plate (crisp and high contrast, not muddy)
            this.scannerBtnBg.fillStyle(0x091424, 0.92);
            this.scannerBtnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 18);

            // Soft top bevel highlight
            this.scannerBtnBg.fillStyle(0x1e293b, 0.45);
            this.scannerBtnBg.fillRoundedRect(-btnW / 2 + 2, -btnH / 2 + 2, btnW - 4, btnH / 2 - 2, 14);

            // Subtle tech cyan border
            this.scannerBtnBg.lineStyle(2, 0x0284c7, 0.7);
            this.scannerBtnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 18);

            // Circular standby badge
            this.scannerBtnBg.lineStyle(1.5, 0x334155, 0.8);
            this.scannerBtnBg.strokeCircle(-btnW / 2 + 52, 0, 26);

            this.scannerBtnTitle.setColor('#cbd5e1');
            this.scannerBtnTitle.setStroke('#05131e', 5);
            if (this.scannerBtnIcon) this.scannerBtnIcon.setAlpha(0.75);
            this.scannerBtnContainer.setAlpha(0.9);

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
            this.gameEvents.off('tutorial-pointer-pos');
            this.gameEvents.off('scanner-modal-changed');
        }
    }
}
