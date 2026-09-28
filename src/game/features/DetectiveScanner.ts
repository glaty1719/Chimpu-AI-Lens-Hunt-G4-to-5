import { Scene, GameObjects } from 'phaser';
import { HuntObjectData } from '../data/LensHuntData';
import { WorldObjectItem } from './WorldParallaxView';
import { UILayers } from '../utils/UILayers';
import { AudioManager } from '../services/AudioManager';

export interface ScanResult {
    objectData: HuntObjectData;
    isAI: boolean;
    isFirstDiscovery: boolean;
    batteryChargedPercent: number;
    scoreAdded: number;
}

export class DetectiveScanner {
    private scene: Scene;
    private screenWidth: number;
    private screenHeight: number;

    // Reticle Target
    private reticleContainer!: GameObjects.Container;
    private reticleSprite!: GameObjects.Sprite;
    private reticlePulseTween: Phaser.Tweens.Tween | null = null;
    private currentTarget: WorldObjectItem | null = null;

    // Scan Laser Beam Graphics
    private scanBeamGraphics!: GameObjects.Graphics;
    private isScanning: boolean = false;

    // Breakdown Modal Container
    private modalContainer: GameObjects.Container | null = null;

    // Callbacks
    private onScanCompletedCallback: (result: ScanResult) => void;

    constructor(scene: Scene, onScanCompleted: (result: ScanResult) => void) {
        this.scene = scene;
        this.screenWidth = scene.scale.width;
        this.screenHeight = scene.scale.height;
        this.onScanCompletedCallback = onScanCompleted;

        this.createReticle();
        this.createScanBeamGraphics();
    }

    private createReticle() {
        this.reticleContainer = this.scene.add.container(-500, -500)
            .setDepth(UILayers.GAME_EFFECTS)
            .setVisible(false);

        this.reticleSprite = this.scene.add.sprite(0, 0, 'scanner_reticle').setScale(0.9);
        this.reticleContainer.add(this.reticleSprite);

        // Continuous sci-fi rotation and pulsing
        this.scene.tweens.add({
            targets: this.reticleSprite,
            angle: 360,
            duration: 12000,
            repeat: -1,
            ease: 'Linear'
        });

        this.reticlePulseTween = this.scene.tweens.add({
            targets: this.reticleContainer,
            scale: 1.08,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createScanBeamGraphics() {
        this.scanBeamGraphics = this.scene.add.graphics()
            .setDepth(UILayers.GAME_EFFECTS + 1);
    }

    public lockOn(target: WorldObjectItem, scrollX: number) {
        this.currentTarget = target;
        const screenX = target.worldX - scrollX;
        const screenY = target.worldY;

        if (this.reticleContainer.x === -500 && this.reticleContainer.y === -500) {
            this.reticleContainer.setPosition(screenX, screenY);
            this.reticleContainer.setScale(1.2);
        }

        this.reticleContainer.setVisible(true);

        // Smooth glide to target position
        this.scene.tweens.add({
            targets: this.reticleContainer,
            x: screenX,
            y: screenY,
            scale: 1.0,
            duration: 220,
            ease: 'Cubic.easeOut',
            onStart: () => {
                AudioManager.getInstance().playSFX('lock_on');
            }
        });
    }

    public unlock() {
        this.currentTarget = null;
        this.reticleContainer.setVisible(false);
        this.reticleContainer.setPosition(-500, -500);
    }

    public updateReticlePosition(scrollX: number) {
        if (this.currentTarget && !this.isScanning) {
            this.reticleContainer.x = this.currentTarget.worldX - scrollX;
            this.reticleContainer.y = this.currentTarget.worldY;
        }
    }

    public performScan(scrollX: number, onDone?: () => void) {
        if (!this.currentTarget || this.isScanning) return;
        this.isScanning = true;
        this.scene.events.emit('scanner-modal-changed', true);

        const target = this.currentTarget;
        const screenX = target.worldX - scrollX;
        const screenY = target.worldY;
        const tw = target.data.width;
        const th = target.data.height;

        AudioManager.getInstance().playSFX('scan_sweep');

        // 1. Digital Holographic Sweep Animation
        const sweepProgress = { t: 0 };
        this.scene.tweens.add({
            targets: sweepProgress,
            t: 1,
            duration: 550,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                this.scanBeamGraphics.clear();

                const currentY = screenY - th / 2 + th * sweepProgress.t;

                // Horizontal Laser Line
                this.scanBeamGraphics.lineStyle(6, 0x00e5ff, 1);
                this.scanBeamGraphics.lineBetween(screenX - tw / 2 - 20, currentY, screenX + tw / 2 + 20, currentY);

                // Laser Light Glow Fan
                this.scanBeamGraphics.fillStyle(0x00e676, 0.25);
                this.scanBeamGraphics.fillRect(screenX - tw / 2 - 10, screenY - th / 2, tw + 20, th * sweepProgress.t);

                // Grid particle points
                this.scanBeamGraphics.fillStyle(0xffffff, 0.8);
                for (let i = 0; i < 5; i++) {
                    const rx = screenX - tw / 2 + (tw / 4) * i;
                    this.scanBeamGraphics.fillCircle(rx, currentY, 3);
                }
            },
            onComplete: () => {
                this.scanBeamGraphics.clear();
                this.isScanning = false;
                this.unlock(); // Hide reticle after scanning any object

                // 2. Open Holographic Breakdown Modal
                this.showBreakdownModal(target, () => {
                    this.unlock();
                    if (onDone) onDone();
                });
            }
        });
    }

    private showBreakdownModal(target: WorldObjectItem, onClose: () => void) {
        const data = target.data;
        const isFirstTime = !target.isDiscovered;
        const isAI = data.isAI;

        // Play appropriate sound
        if (isAI) {
            AudioManager.getInstance().playSFX('correct_ai');
        } else {
            AudioManager.getInstance().playSFX('fixed_step');
        }

        // Notify scene that modal is open (disabling scanner button)
        this.scene.events.emit('scanner-modal-changed', true);

        // 1. Modal Container
        this.modalContainer = this.scene.add.container(this.screenWidth / 2, this.screenHeight / 2)
            .setDepth(UILayers.MODAL_PANEL)
            .setScale(0.8)
            .setAlpha(0);

        const mw = 1380;
        const mh = 720;
        const r = 32;

        // Dark Backdrop Blocker
        const blocker = this.scene.add.rectangle(0, 0, this.screenWidth * 2, this.screenHeight * 2, 0x000000, 0.75)
            .setInteractive();
        this.modalContainer.add(blocker);

        // Holographic Frame
        const frameG = this.scene.add.graphics();
        const primaryColor = isAI ? 0x00e5ff : 0xffd600;
        const plateBg = isAI ? 0x0a1128 : 0x1e1b4b;

        // Outer Glow
        frameG.fillStyle(primaryColor, 0.25);
        frameG.fillRoundedRect(-mw / 2 - 12, -mh / 2 - 12, mw + 24, mh + 24, r + 6);

        // Body Plate
        frameG.fillStyle(plateBg, 0.98);
        frameG.fillRoundedRect(-mw / 2, -mh / 2, mw, mh, r);

        // Neon Border
        frameG.lineStyle(5, primaryColor, 1);
        frameG.strokeRoundedRect(-mw / 2, -mh / 2, mw, mh, r);

        this.modalContainer.add(frameG);

        // 2. Left Object Display Box (480x520)
        const leftBox = this.scene.add.container(-395, -50);
        const leftBg = this.scene.add.graphics();
        leftBg.fillStyle(0x0f172a, 0.95);
        leftBg.fillRoundedRect(-240, -260, 480, 520, 24);
        leftBg.lineStyle(3, primaryColor, 0.85);
        leftBg.strokeRoundedRect(-240, -260, 480, 520, 24);
        leftBox.add(leftBg);

        // Object Sprite
        if (this.scene.textures.exists(data.textureKey)) {
            const spr = this.scene.add.image(0, -60, data.textureKey);
            const maxDim = Math.max(spr.width, spr.height);
            const targetScale = maxDim > 300 ? (300 / maxDim) : 1.8;
            spr.setScale(targetScale);
            leftBox.add(spr);

            // Gentle pulsing animation on object
            this.scene.tweens.add({
                targets: spr,
                scale: targetScale * 1.08,
                duration: 900,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Object Name
        const nameTitle = this.scene.add.text(0, 160, data.name.toUpperCase(), {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center',
            wordWrap: { width: 440 }
        }).setOrigin(0.5);
        leftBox.add(nameTitle);

        this.modalContainer.add(leftBox);

        // 3. Right Educational Breakdown Panel (760x520)
        const rightBox = this.scene.add.container(255, -50);
        const rightBg = this.scene.add.graphics();
        rightBg.fillStyle(0x0f172a, 0.95);
        rightBg.fillRoundedRect(-380, -260, 760, 520, 24);
        rightBg.lineStyle(3, 0x38bdf8, 0.85);
        rightBg.strokeRoundedRect(-380, -260, 760, 520, 24);
        rightBox.add(rightBg);

        // Educational Tagline
        const taglineTxt = this.scene.add.text(0, -140, `"${data.tagline}"`, {
            fontFamily: 'Arial Black',
            fontSize: '48px',
            color: isAI ? '#69f0ae' : '#fef08a',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center',
            wordWrap: { width: 700 },
            lineSpacing: 10
        }).setOrigin(0.5);
        rightBox.add(taglineTxt);

        // Detailed Educational Explanation (Kid-Friendly & Clear)
        const expTxt = this.scene.add.text(0, 50, data.detailedExplanation, {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center',
            wordWrap: { width: 700 },
            lineSpacing: 18
        }).setOrigin(0.5);
        rightBox.add(expTxt);

        this.modalContainer.add(rightBox);

        // 4. "CONTINUE" Button at Bottom
        const btnW = 520;
        const btnH = 82;
        const btnCont = this.scene.add.container(0, 285);

        const btnG = this.scene.add.graphics();
        btnG.fillStyle(0x059669, 1);
        btnG.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
        btnG.fillStyle(0x34d399, 0.5);
        btnG.fillRoundedRect(-btnW / 2 + 4, -btnH / 2 + 4, btnW - 8, btnH / 2 - 4, 18);
        btnG.lineStyle(4, 0xffffff, 1);
        btnG.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
        btnCont.add(btnG);

        const btnTxt = this.scene.add.text(0, 0, 'CONTINUE', {
            fontFamily: 'Arial Black',
            fontSize: '40px',
            color: '#ffffff',
            stroke: '#064e3b',
            strokeThickness: 8
        }).setOrigin(0.5);
        btnCont.add(btnTxt);

        const hit = this.scene.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
            AudioManager.getInstance().playSFX('button_tap');
            this.closeBreakdownModal(onClose, {
                objectData: data,
                isAI: isAI,
                isFirstDiscovery: isFirstTime,
                batteryChargedPercent: isAI && isFirstTime ? 25 : 0,
                scoreAdded: isAI && isFirstTime ? 100 : (isFirstTime ? 25 : 0)
            });
        });
        btnCont.add(hit);
        this.modalContainer.add(btnCont);

        // Pop in animation
        this.scene.tweens.add({
            targets: this.modalContainer,
            scale: 1,
            alpha: 1,
            duration: 320,
            ease: 'Back.easeOut'
        });
    }

    private closeBreakdownModal(onClose: () => void, result: ScanResult) {
        if (!this.modalContainer) return;

        this.scene.tweens.add({
            targets: this.modalContainer,
            scale: 0.8,
            alpha: 0,
            duration: 220,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.modalContainer?.destroy();
                this.modalContainer = null;
                this.scene.events.emit('scanner-modal-changed', false);
                this.onScanCompletedCallback(result);
                onClose();
            }
        });
    }

    public isModalOpen(): boolean {
        return this.modalContainer !== null;
    }

    public isScanningActive(): boolean {
        return this.isScanning;
    }

    public destroy() {
        this.reticlePulseTween?.stop();
        this.reticleContainer.destroy();
        this.scanBeamGraphics.destroy();
        this.modalContainer?.destroy();
    }
}
