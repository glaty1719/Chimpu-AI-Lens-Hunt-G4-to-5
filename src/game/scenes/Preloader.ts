import { Scene } from 'phaser';
import { AssetManager } from '../utils/AssetManager';
import { APIService, APIEvents } from '../services/APIService';
import { GameDataManager } from '../services/GameDataManager';
import { AudioManager } from '../services/AudioManager';
import { APIConfig } from '../utils/Constants';

export class Preloader extends Scene {
    private apiReady: boolean = false;
    private assetsLoaded: boolean = false;

    constructor() {
        super('Preloader');
    }

    init() {
        const { width, height } = this.scale;

        // Progress Bar
        this.add.rectangle(width / 2, height / 2, 468, 32).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(width / 2 - 230, height / 2, 4, 28, 0xffffff);

        // Animated Character Animations
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('chimpu_run', { start: 0, end: 5 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'chimpu_walk',
            frames: this.anims.generateFrameNumbers('chimpu_run', { start: 0, end: 5 }),
            frameRate: 5,
            repeat: -1
        });

        this.add.sprite(width / 2, height / 2 - 80, 'chimpu_run')
            .setScale(0.8)
            .play('run');

        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (460 * progress);
        });

        this.load.on('loaderror', (_file: any) => {
            // Error loading asset
        });

        const statusText = this.add.text(width / 2, height / 2 + 55, 'Loading Assets...', {
            fontFamily: 'Arial Black', fontSize: '30px', color: '#ffffff', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5);

        // API Status Handling
        const api = APIService.getInstance();

        const onApiReady = () => {
            statusText.setText('Connecting to Server... Done!');
            GameDataManager.getInstance().syncFromAPI(api.level);
            this.apiReady = true;
            this.checkReady();
        };

        const onApiError = (_err: any) => {
            statusText.setText('Connecting to Server... Failed! Reconnecting...');

            // If USE_API is true, we stay here.
            // We could optionally retry or just let the user see the failed state.
            // Following user request to stay on page until status is OK.
            if (!APIConfig.USE_API) {
                // If not using API, we treat errors as "OK" for offline play
                this.apiReady = true;
                this.checkReady();
            }
        };

        if (api.isInitialized) {
            onApiReady();
        } else if (api.isFailed) {
            onApiError("API Failed during initialization");
        } else {
            statusText.setText('Connecting to Server...');
            api.once(APIEvents.API_READY, onApiReady);
            api.once(APIEvents.API_ERROR, onApiError);

            // Only add safety timeout if USE_API is false (offline mode allowed)
            if (!APIConfig.USE_API) {
                this.time.delayedCall(3000, () => {
                    if (!this.apiReady) {
                        onApiError("Timeout");
                    }
                });
            }
        }
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('bg', 'bg.png');
        this.load.image('playButton', 'playButton.png');
        this.load.image('logo', 'CV_Logo.png');
        this.load.image('gameBG', 'GameBG.png'); // Kept for LevelSelection
        this.load.image('game_over_bg', 'GameOverBG.png');
        this.load.image('game_completed_bg', 'GameCompletedBG.png');

        this.load.image('back_icon', 'globalUI/backBtn.png');
        this.load.image('settings_icon', 'globalUI/settingsBtn.png');
        this.load.image('pause_icon', 'globalUI/pauseBtn.png');

        this.load.image('settings_bg', 'globalUI/settingsBG.png');
        this.load.image('paused_bg', 'globalUI/pausedBG.png');
        this.load.image('musicon', 'globalUI/musicon.png');
        this.load.image('musicoff', 'globalUI/musicoff.png');
        this.load.image('sfxon', 'globalUI/sfxon.png');
        this.load.image('sfxoff', 'globalUI/sfxoff.png');
        this.load.image('pause_panel_btn', 'globalUI/pausePanelButtons.png');
        this.load.image('close_icon', 'globalUI/closeBtn.png');

        this.load.image('next_icon', 'globalUI/nextBtn.png');
        this.load.image('retry_icon', 'globalUI/retryBtn.png');
        this.load.image('home_icon', 'globalUI/homeBtn.png');

        this.load.setPath('assets/loading');
        this.load.image('cv_logo_text', 'Text_CV_Logo.png');

        // Chimpu Character Spritesheets & Poses
        this.load.setPath('assets/chimpu');
        this.load.spritesheet('chimpu_detective', 'chimpu_detective_strip.png', { frameWidth: 256, frameHeight: 320 });
        this.load.spritesheet('chimpu_celebrate', 'chimpu_celebrate_strip.png', { frameWidth: 256, frameHeight: 320 });
        this.load.spritesheet('chimpu_idle', 'chimpu_idle_strip.png', { frameWidth: 256, frameHeight: 320 });
        this.load.spritesheet('chimpu_puzzled', 'chimpu_puzzled_strip.png', { frameWidth: 256, frameHeight: 320 });

        this.load.image('chimpu_skateboard', 'skateboard.png');
        this.load.image('skateboard', 'skateboard.png');

        this.load.image('chimpu_riding_skateboard', 'chimpu_riding_skateboard.png');
        this.load.image('chimpu_idle_1', 'chimpu_idle_1.png');
        this.load.image('chimpu_detective_1', 'chimpu_detective_1.png');
        this.load.image('chimpu_detective_5', 'chimpu_detective_5.png');
        this.load.image('chimpu_celebrate_4', 'chimpu_celebrate_4.png');
        this.load.image('chimpu_skater_idle', 'chimpu_riding_skateboard.png');
        this.load.image('chimpu_skater_move', 'chimpu_riding_skateboard.png');
        this.load.image('chimpu_skater_scan', 'chimpu_detective_5.png');
        this.load.image('chimpu_skater_trick', 'chimpu_celebrate_4.png');
        this.load.image('chimpu_wave', 'chimpu_idle_2.png');
        this.load.image('chimpu_question_bubble', 'chimpu_puzzled_accessory.png');

        this.load.once('complete', () => {
            this.assetsLoaded = true;
            this.checkReady();
        });
    }

    create() {
        this.cameras.main.setBackgroundColor('#231F20');
        AssetManager.generateTextures(this);
        this.sound.pauseOnBlur = false;

        // Chimpu Animation Library
        if (!this.anims.exists('chimpu_detective_scan')) {
            this.anims.create({
                key: 'chimpu_detective_scan',
                frames: this.anims.generateFrameNumbers('chimpu_detective', { start: 0, end: 7 }),
                frameRate: 6,
                repeat: -1
            });
        }
        if (!this.anims.exists('chimpu_celebrate_cheer')) {
            this.anims.create({
                key: 'chimpu_celebrate_cheer',
                frames: this.anims.generateFrameNumbers('chimpu_celebrate', { start: 0, end: 5 }),
                frameRate: 6,
                repeat: -1
            });
        }
        if (!this.anims.exists('chimpu_idle_anim')) {
            this.anims.create({
                key: 'chimpu_idle_anim',
                frames: this.anims.generateFrameNumbers('chimpu_idle', { start: 0, end: 4 }),
                frameRate: 4,
                repeat: -1
            });
        }
        if (!this.anims.exists('chimpu_puzzled_anim')) {
            this.anims.create({
                key: 'chimpu_puzzled_anim',
                frames: this.anims.generateFrameNumbers('chimpu_puzzled', { start: 0, end: 7 }),
                frameRate: 5,
                repeat: -1
            });
        }

        const audio = AudioManager.getInstance();
        audio.init(this);

        if (!this.scene.isActive('GlobalUI')) {
            this.scene.launch('GlobalUI');
        }
        this.scene.bringToTop('GlobalUI');
    }

    private checkReady() {
        if (this.apiReady && this.assetsLoaded) {
            this.showSplashScreen();
        }
    }

    private showSplashScreen() {
        const { width, height } = this.scale;

        // White background overlay
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff)
            .setAlpha(0)
            .setDepth(1000)
            .setInteractive(); // Blocks input

        // Logo in center
        const logo = this.add.image(width / 2, height / 2, 'cv_logo_text')
            .setAlpha(0)
            .setDepth(1001);

        // Animation sequence
        this.tweens.add({
            targets: [bg, logo],
            alpha: 1,
            duration: 500,
            onComplete: () => {
                // When fully opaque, launch MainMenu in background
                this.scene.launch('MainMenu');
                this.scene.bringToTop('Preloader');

                // Hide all other elements in this scene
                this.children.each((child) => {
                    if (child !== bg && child !== logo) {
                        (child as any).visible = false;
                    }
                });

                this.time.delayedCall(1000, () => {
                    this.tweens.add({
                        targets: [bg, logo],
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            this.scene.stop('Preloader');
                        }
                    });
                });
            }
        });
    }
}
