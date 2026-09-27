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

        // 1. Modal Container
        this.modalContainer = this.scene.add.container(this.screenWidth / 2, this.screenHeight / 2)
            .setDepth(UILayers.MODAL_PANEL)
            .setScale(0.8)
            .setAlpha(0);

        const mw = 1180;
        const mh = 700;
        const r = 28;

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

        // Top Header Banner
        const bannerColor = isAI ? 0x047857 : 0xb45309;
        frameG.fillStyle(bannerColor, 1);
        frameG.fillRoundedRect(-mw / 2 + 16, -mh / 2 + 16, mw - 32, 90, 18);
        frameG.lineStyle(3, 0xffffff, 0.8);
        frameG.strokeRoundedRect(-mw / 2 + 16, -mh / 2 + 16, mw - 32, 90, 18);

        this.modalContainer.add(frameG);

        // Header Title
        const headerText = isAI ? `✨ AI FEATURE DETECTED: ${data.name.toUpperCase()}` : `⚙️ FIXED AUTOMATION / DECOY: ${data.name.toUpperCase()}`;
        const headerTitle = this.scene.add.text(0, -mh / 2 + 60, headerText, {
            fontFamily: 'Arial Black',
            fontSize: '34px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        this.modalContainer.add(headerTitle);

        // 2. Left Visual Simulation Diagram Box (460x440)
        const leftBox = this.scene.add.container(-mw / 2 + 270, 40);
        const leftBg = this.scene.add.graphics();
        leftBg.fillStyle(0x0f172a, 0.95);
        leftBg.fillRoundedRect(-230, -210, 460, 420, 20);
        leftBg.lineStyle(3, primaryColor, 0.7);
        leftBg.strokeRoundedRect(-230, -210, 460, 420, 20);
        leftBox.add(leftBg);

        // Render animated visual diagram inside left box
        this.renderVisualDiagram(leftBox, data);
        this.modalContainer.add(leftBox);

        // 3. Right Educational Breakdown Panel (580x440)
        const rightBox = this.scene.add.container(mw / 2 - 310, 40);
        const rightBg = this.scene.add.graphics();
        rightBg.fillStyle(0x0f172a, 0.95);
        rightBg.fillRoundedRect(-280, -210, 560, 420, 20);
        rightBg.lineStyle(3, 0x38bdf8, 0.7);
        rightBg.strokeRoundedRect(-280, -210, 560, 420, 20);
        rightBox.add(rightBg);

        // AI Verb Badge or Decoy Mechanism Badge
        const badgeCont = this.scene.add.container(0, -145);
        const bG = this.scene.add.graphics();
        const bColor = isAI ? 0x059669 : 0xd97706;
        bG.fillStyle(bColor, 1);
        bG.fillRoundedRect(-240, -32, 480, 64, 16);
        bG.lineStyle(3, 0xffffff, 1);
        bG.strokeRoundedRect(-240, -32, 480, 64, 16);
        badgeCont.add(bG);

        const badgeIconKey = isAI
            ? (data.aiAction === 'RECOGNIZES' ? 'icon_recognizes' :
                data.aiAction === 'LISTENS' ? 'icon_listens' :
                    data.aiAction === 'PREDICTS' ? 'icon_predicts' :
                        data.aiAction === 'RECOMMENDS' ? 'icon_recommends' : 'icon_learns')
            : (data.mechanismType === 'MECHANICAL' ? 'icon_gear' :
                data.mechanismType === 'FIXED TIMER' ? 'icon_timer' :
                    data.mechanismType === 'BUTTON ACTION' ? 'icon_button_arrow' : 'icon_fixed_calc');

        if (this.scene.textures.exists(badgeIconKey)) {
            const bIcon = this.scene.add.image(-190, 0, badgeIconKey).setScale(0.42);
            badgeCont.add(bIcon);
        }

        const badgeLabel = isAI ? `AI ACTION: ${data.shortLabel}` : `MECHANISM: ${data.shortLabel}`;
        const bTxt = this.scene.add.text(-140, 0, badgeLabel, {
            fontFamily: 'Arial Black',
            fontSize: '26px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0, 0.5);
        badgeCont.add(bTxt);
        rightBox.add(badgeCont);

        // Educational Tagline
        const taglineTxt = this.scene.add.text(0, -75, `"${data.tagline}"`, {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: isAI ? '#69f0ae' : '#fef08a',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        rightBox.add(taglineTxt);

        // Detailed Educational Explanation (Kid-Friendly & Clear)
        const expTxt = this.scene.add.text(0, 20, data.detailedExplanation, {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 500 },
            lineSpacing: 10
        }).setOrigin(0.5);
        rightBox.add(expTxt);

        // Score & Battery Bonus Indicator
        const bonusCont = this.scene.add.container(0, 140);
        const bonusTxt = isAI
            ? '🔋 SCANNER BATTERY +25%  |  ⭐ SCORE +100'
            : '💡 DETECTIVE INSIGHT: Understood Fixed Mechanics!';
        const bonusColor = isAI ? '#00e5ff' : '#ffd600';
        const bInfo = this.scene.add.text(0, 0, bonusTxt, {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: bonusColor,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        bonusCont.add(bInfo);
        rightBox.add(bonusCont);

        this.modalContainer.add(rightBox);

        // 4. "CONTINUE DETECTIVE HUNT" Button at Bottom
        const btnW = 420;
        const btnH = 68;
        const btnCont = this.scene.add.container(0, mh / 2 - 50);

        const btnG = this.scene.add.graphics();
        btnG.fillStyle(0x059669, 1);
        btnG.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 20);
        btnG.fillStyle(0x34d399, 0.5);
        btnG.fillRoundedRect(-btnW / 2 + 4, -btnH / 2 + 4, btnW - 8, btnH / 2 - 4, 16);
        btnG.lineStyle(4, 0xffffff, 1);
        btnG.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 20);
        btnCont.add(btnG);

        const btnTxt = this.scene.add.text(0, 0, 'CONTINUE HUNT  ➜', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#064e3b',
            strokeThickness: 6
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

    private renderVisualDiagram(container: GameObjects.Container, data: HuntObjectData) {
        // Large Object Vector Sprite in Top of Diagram Box
        if (this.scene.textures.exists(data.textureKey)) {
            const spr = this.scene.add.image(0, -60, data.textureKey).setScale(1.2);
            container.add(spr);

            // Pulse animation on object
            this.scene.tweens.add({
                targets: spr,
                scale: 1.3,
                duration: 900,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Bottom Animated Visual Diagram Simulation based on visualDiagramType
        const simG = this.scene.add.graphics();
        const simY = 100;

        if (data.visualDiagramType === 'face_match') {
            // Face Matching Scanning Particles
            simG.lineStyle(3, 0x00e676, 1);
            simG.strokeCircle(0, simY, 40);
            simG.fillStyle(0x00e5ff, 1);
            simG.fillCircle(-12, simY - 10, 4);
            simG.fillCircle(12, simY - 10, 4);
            simG.beginPath(); simG.arc(0, simY + 10, 14, 0, Math.PI, false); simG.strokePath();

            const matchTxt = this.scene.add.text(0, simY + 60, '100% FACE MATCH VALIDATED', {
                fontFamily: 'Arial Black', fontSize: '18px', color: '#00e676'
            }).setOrigin(0.5);
            container.add(matchTxt);
        } else if (data.visualDiagramType === 'soundwave_listen') {
            // Soundwave listening waves
            simG.lineStyle(4, 0x00e5ff, 0.9);
            simG.beginPath(); simG.arc(-40, simY, 20, -Math.PI * 0.4, Math.PI * 0.4, false); simG.strokePath();
            simG.beginPath(); simG.arc(-40, simY, 35, -Math.PI * 0.4, Math.PI * 0.4, false); simG.strokePath();
            simG.beginPath(); simG.arc(-40, simY, 50, -Math.PI * 0.4, Math.PI * 0.4, false); simG.strokePath();

            const bubbleTxt = this.scene.add.text(45, simY, '💬 "Playing Music!"', {
                fontFamily: 'Arial Black', fontSize: '18px', color: '#fef08a'
            }).setOrigin(0.5);
            container.add(bubbleTxt);
        } else if (data.visualDiagramType === 'gear_spin') {
            // Turning Mechanical Gear
            simG.lineStyle(4, 0xffd600, 1);
            simG.strokeCircle(0, simY, 35);
            simG.lineStyle(2, 0xffffff, 0.8);
            simG.lineBetween(-35, simY, 35, simY);
            simG.lineBetween(0, simY - 35, 0, simY + 35);

            const mechTxt = this.scene.add.text(0, simY + 60, 'Mechanical Gear & Spring Mechanism', {
                fontFamily: 'Arial Black', fontSize: '16px', color: '#ffd600'
            }).setOrigin(0.5);
            container.add(mechTxt);
        } else {
            // Generic AI / Mechanism data indicator
            simG.lineStyle(3, 0x00e5ff, 1);
            simG.strokeRoundedRect(-140, simY - 30, 280, 60, 12);
            const statusTxt = this.scene.add.text(0, simY, data.tagline, {
                fontFamily: 'Arial Black', fontSize: '18px', color: '#ffffff'
            }).setOrigin(0.5);
            container.add(statusTxt);
        }

        container.add(simG);
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
                this.onScanCompletedCallback(result);
                onClose();
            }
        });
    }

    public isModalOpen(): boolean {
        return this.modalContainer !== null;
    }

    public destroy() {
        this.reticlePulseTween?.stop();
        this.reticleContainer.destroy();
        this.scanBeamGraphics.destroy();
        this.modalContainer?.destroy();
    }
}
