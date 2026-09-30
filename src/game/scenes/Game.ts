import { Scene } from 'phaser';
import { GameDataManager } from '../services/GameDataManager';
import { AudioManager } from '../services/AudioManager';
import { HUNT_ZONES, ZoneConfig } from '../data/LensHuntData';
import { WorldParallaxView, WorldObjectItem } from '../features/WorldParallaxView';
import { DetectiveScanner, ScanResult } from '../features/DetectiveScanner';
import { AlbumActivity } from '../features/AlbumActivity';
import { LensFusionFinale } from '../features/LensFusionFinale';
import { LevelCompletionModal } from '../ui/LevelCompletionModal';

export class Game extends Scene {
    private currentZoneId: number = 1;
    private zoneConfig!: ZoneConfig;

    // Feature Controllers
    private worldView: WorldParallaxView | null = null;
    private scanner: DetectiveScanner | null = null;
    private albumActivity: AlbumActivity | null = null;
    private finaleModal: LensFusionFinale | null = null;
    private levelCompletionModal: LevelCompletionModal | null = null;

    // Gameplay Progress State
    private discoveredAIObjects: Set<string> = new Set();
    private batteryPercent: number = 0;
    private totalScore: number = 0;
    private isZoneFinished: boolean = false;

    // Tutorial State (in Zone 1)
    private isTutorialActive: boolean = false;
    private tutorialStep: number = 0;

    constructor() {
        super('Game');
    }

    init(data: { level?: number; zoneId?: number }) {
        this.currentZoneId = data.zoneId || data.level || 1;
        if (this.currentZoneId < 1 || this.currentZoneId > 3) {
            this.currentZoneId = 1;
        }

        const foundConfig = HUNT_ZONES.find(z => z.id === this.currentZoneId);
        this.zoneConfig = foundConfig || HUNT_ZONES[0];

        this.discoveredAIObjects.clear();
        this.batteryPercent = 0;
        this.isZoneFinished = false;

        // Tutorial in Zone 1 for the first time
        this.isTutorialActive = this.currentZoneId === 1;
        this.tutorialStep = this.isTutorialActive ? 1 : 0;
    }

    create() {
        // 1. Play Detective BGM
        try {
            AudioManager.getInstance().playMusic('detective_theme');
        } catch (e) {
            // Fallback handled
        }

        // 2. Launch UIScene in parallel
        this.scene.launch('UIScene', { gameScene: this, zoneId: this.currentZoneId });
        this.scene.bringToTop('UIScene');

        // 3. Register UI & Control Events
        this.events.on('pause-game', this.onPauseGame, this);
        this.events.on('resume-game', this.onResumeGame, this);
        this.events.on('restart-game', this.onRestartGame, this);
        this.events.on('quit-game', this.onQuitGame, this);
        this.events.on('home-game', this.onHomeGame, this);
        this.events.on('trigger-scan', this.onTriggerScan, this);
        this.events.on('chimpu-move', (dir: number) => { this.worldView?.setTouchMoveDir(dir); }, this);
        this.events.on('request-hud-sync', this.broadcastHUDState, this);
        this.events.on('shutdown', this.cleanup, this);

        // 4. Initialize Parallax World View
        this.worldView = new WorldParallaxView(
            this,
            this.zoneConfig,
            (obj: WorldObjectItem, _index: number) => {
                this.onObjectSelected(obj);
            },
            () => {
                this.onObjectDeselected();
            }
        );

        // 5. Initialize Detective Scanner System
        this.scanner = new DetectiveScanner(this, (result: ScanResult) => {
            this.onScanCompleted(result);
        });

        this.events.on('scanner-modal-changed', (isOpen: boolean) => {
            if (isOpen) {
                this.worldView?.pause();
            } else {
                this.worldView?.resume();
            }
            this.broadcastHUDState();
        });

        // 6. Setup Keyboard Controls (Space/Enter: Scan, Arrow Keys & WASD: Skate Move)
        this.setupKeyboardControls();

        // 7. Initial HUD Broadcast
        this.broadcastHUDState();
    }

    private setupKeyboardControls() {
        if (!this.input.keyboard) return;

        // Space and Enter triggers Holographic Scan
        this.input.keyboard.on('keydown-SPACE', () => {
            this.onTriggerScan();
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            this.onTriggerScan();
        });
    }

    private onObjectDeselected() {
        if (!this.scanner) return;
        this.scanner.unlock();

        if (this.isTutorialActive) {
            this.tutorialStep = 1;
        }

        this.broadcastHUDState();
    }

    private onObjectSelected(obj: WorldObjectItem) {
        if (!this.worldView || !this.scanner) return;
        this.scanner.lockOn(obj, this.worldView.getScrollX());

        if (this.isTutorialActive && this.tutorialStep === 1) {
            this.tutorialStep = 2; // Advance to "Tap Scan Button"
        }

        this.broadcastHUDState();
    }

    private onTriggerScan() {
        if (!this.worldView || !this.scanner || this.scanner.isModalOpen()) return;
        const selected = this.worldView.getSelectedObject();
        if (!selected) return;

        //this.worldView.setChimpuScanPose(true);
        this.scanner.performScan(this.worldView.getScrollX(), () => {
            //this.worldView?.setChimpuScanPose(false);
        });

        if (this.isTutorialActive) {
            this.isTutorialActive = false;
            this.tutorialStep = 0;
        }

        this.broadcastHUDState();
    }

    private onScanCompleted(result: ScanResult) {
        if (!this.worldView) return;

        const selectedIndex = this.worldView.getSelectedObjectIndex();

        // 1. Mark object discovered in world
        if (selectedIndex >= 0) {
            this.worldView.markObjectDiscovered(selectedIndex);
        }

        // 2. Clear selection and unlock scanner so neither AI nor non-AI objects remain selected after scanning
        this.worldView.deselectObject();
        this.scanner?.unlock();

        // 3. Tally AI discoveries
        if (result.isAI) {
            this.discoveredAIObjects.add(result.objectData.id);
            this.batteryPercent = Math.min(100, this.batteryPercent + result.batteryChargedPercent);
            this.totalScore += result.scoreAdded;

            // Check if all AI targets in current room are discovered to roll into next room
            this.worldView.checkRoomProgression();
            // Chimpu celebration skateboard trick
            // this.worldView.playChimpuTrick(() => {
            //     this.worldView!.checkRoomProgression();
            // });
        } else {
            this.totalScore += result.scoreAdded;
        }

        this.broadcastHUDState();

        // 3. Check Zone Victory Condition (All 4 AI targets discovered)
        if (this.discoveredAIObjects.size >= this.zoneConfig.requiredAIDiscoveries && !this.isZoneFinished) {
            this.isZoneFinished = true;
            this.handleZoneCompletion();
        }
    }

    private handleZoneCompletion() {
        AudioManager.getInstance().playSFX('lens_collected');

        // Save unlocked progress in GameDataManager
        const dataManager = GameDataManager.getInstance();
        dataManager.completeLevel(this.currentZoneId, 3, this.totalScore);

        // Open Level Completion Modal
        this.levelCompletionModal = new LevelCompletionModal(
            this,
            this.currentZoneId,
            this.totalScore,
            0,
            () => {
                this.levelCompletionModal = null;
                if (this.currentZoneId < 3) {
                    // Transition to Next Zone (School / Street)
                    AudioManager.getInstance().playSFX('zone_transition');
                    this.cleanup();
                    this.scene.stop('UIScene');
                    this.scene.restart({ zoneId: this.currentZoneId + 1 });
                } else {
                    // Finale Flow: All 3 Zones Cleared!
                    // Open AI Detective Album Activity
                    this.openAlbumActivity();
                }
            },
            () => {
                // Play Again (Restart current Zone)
                this.levelCompletionModal = null;
                this.cleanup();
                this.scene.stop('UIScene');
                this.scene.restart({ zoneId: this.currentZoneId });
            },
            () => {
                // Home (Return to Main Menu)
                this.levelCompletionModal = null;
                this.cleanup();
                this.scene.stop('UIScene');
                this.scene.start('MainMenu');
            }
        );
    }

    private openAlbumActivity() {
        this.albumActivity = new AlbumActivity(this, () => {
            // Step 2: On completing scrapbook album, launch Grand Finale Fusion & Badge Modal!
            this.launchGrandFinale();
        });
    }

    private launchGrandFinale() {
        this.finaleModal = new LensFusionFinale(
            this,
            this.totalScore,
            () => {
                // Play Again (Restart Zone 1)
                this.cleanup();
                this.scene.stop('UIScene');
                this.scene.restart({ zoneId: 1 });
            },
            () => {
                // Level / Zone Selection
                this.cleanup();
                this.scene.stop('UIScene');
                this.scene.start('LevelSelection');
            },
            () => {
                // Return Main Menu Home
                this.cleanup();
                this.scene.stop('UIScene');
                this.scene.start('MainMenu');
            }
        );
    }

    private broadcastHUDState() {
        if (!this.worldView) return;
        const selected = this.worldView.getSelectedObject();
        const isModalOpen = this.scanner?.isModalOpen() || false;
        const isScanning = this.scanner?.isScanningActive() || false;
        const isBusy = isModalOpen || isScanning;
        const tutorialPos = this.worldView.getFirstUndiscoveredAIObjectScreenPos();

        this.events.emit('update-hunt-hud', {
            zoneId: this.currentZoneId,
            zoneTitle: this.zoneConfig.title,
            zoneSubtitle: this.zoneConfig.subtitle,
            themeHex: this.zoneConfig.themeHex,
            aiDiscoveredCount: this.discoveredAIObjects.size,
            totalRequiredAI: this.zoneConfig.requiredAIDiscoveries,
            batteryPercent: this.batteryPercent,
            score: this.totalScore,
            hasTargetSelected: selected !== null && !isBusy,
            isScanning: isBusy,
            isTutorialActive: this.isTutorialActive && !isBusy,
            tutorialStep: this.tutorialStep,
            tutorialTargetPos: tutorialPos || undefined
        });
    }

    update(time: number, delta: number) {
        if (this.worldView) {
            this.worldView.update(time, delta);
        }
        if (this.scanner && this.worldView) {
            this.scanner.updateReticlePosition(this.worldView.getScrollX());
        }
        if (this.isTutorialActive && this.worldView) {
            const pos = this.worldView.getFirstUndiscoveredAIObjectScreenPos();
            if (pos) {
                this.events.emit('tutorial-pointer-pos', pos);
            }
        }
    }

    private onPauseGame() {
        this.worldView?.pause();
    }

    private onResumeGame() {
        this.worldView?.resume();
    }

    private onRestartGame(data?: { level?: number; zoneId?: number }) {
        const targetZone = data?.zoneId || data?.level || this.currentZoneId;
        this.cleanup();
        this.scene.stop('UIScene');
        this.scene.restart({ zoneId: targetZone });
    }

    private onQuitGame() {
        this.cleanup();
        this.scene.stop('UIScene');
        this.scene.start('LevelSelection');
    }

    private onHomeGame() {
        this.cleanup();
        this.scene.stop('UIScene');
        this.scene.start('MainMenu');
    }

    private cleanup() {
        this.totalScore = 0;
        if (this.worldView) {
            this.worldView.destroy();
            this.worldView = null;
        }
        if (this.scanner) {
            this.scanner.destroy();
            this.scanner = null;
        }
        if (this.albumActivity) {
            this.albumActivity.destroy();
            this.albumActivity = null;
        }
        if (this.finaleModal) {
            this.finaleModal.destroy();
            this.finaleModal = null;
        }
        if (this.levelCompletionModal) {
            this.levelCompletionModal.destroy();
            this.levelCompletionModal = null;
        }

        if (this.input.keyboard) {
            this.input.keyboard.removeAllListeners();
        }
        this.input.off('pointerdown');

        this.events.off('pause-game', this.onPauseGame, this);
        this.events.off('resume-game', this.onResumeGame, this);
        this.events.off('restart-game', this.onRestartGame, this);
        this.events.off('quit-game', this.onQuitGame, this);
        this.events.off('home-game', this.onHomeGame, this);
        this.events.off('trigger-scan', this.onTriggerScan, this);
        this.events.off('request-hud-sync', this.broadcastHUDState, this);
    }
}
