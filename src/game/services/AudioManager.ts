import { Scene } from 'phaser';

export class AudioManager {
    private static instance: AudioManager;

    private constructor() {
        this.loadSettings();
    }

    private loadSettings() {
        try {
            const savedMusicVolume = localStorage.getItem('audio_music_volume');
            const savedSFXVolume = localStorage.getItem('audio_sfx_volume');
            const savedMusicMuted = localStorage.getItem('audio_music_muted');
            const savedSFXMuted = localStorage.getItem('audio_sfx_muted');

            if (savedMusicVolume !== null) {
                this.musicVolume = parseFloat(savedMusicVolume);
            }
            if (savedSFXVolume !== null) {
                this.sfxVolume = parseFloat(savedSFXVolume);
            }
            if (savedMusicMuted !== null) {
                this._isMusicMuted = savedMusicMuted === 'true';
            }
            if (savedSFXMuted !== null) {
                this._isSFXMuted = savedSFXMuted === 'true';
            }
        } catch (e) {
            // localStorage not available or error reading
        }
    }

    private saveSettings() {
        try {
            localStorage.setItem('audio_music_volume', this.musicVolume.toString());
            localStorage.setItem('audio_sfx_volume', this.sfxVolume.toString());
            localStorage.setItem('audio_music_muted', this._isMusicMuted.toString());
            localStorage.setItem('audio_sfx_muted', this._isSFXMuted.toString());
        } catch (e) {
            // localStorage not available
        }
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    private scene: Scene;
    private currentMusic: Phaser.Sound.BaseSound | null = null;
    private musicVolume: number = 0.5;
    private sfxVolume: number = 0.5;
    private _isMusicMuted: boolean = false;
    private _isSFXMuted: boolean = false;

    public init(scene: Scene) {
        this.scene = scene;
    }

    public setMusicVolume(volume: number) {
        this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
        if (this.currentMusic && !this._isMusicMuted) {
            (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(this.musicVolume);
        }
        import('./SynthesizerAudio').then(({ SynthesizerAudio }) => {
            SynthesizerAudio.getInstance().setBgmVolume(this.musicVolume);
        });
        this.saveSettings();
    }

    public setSFXVolume(volume: number) {
        this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
        import('./SynthesizerAudio').then(({ SynthesizerAudio }) => {
            SynthesizerAudio.getInstance().setSfxVolume(this.sfxVolume);
        });
        this.saveSettings();
    }

    public setMusicMuted(muted: boolean) {
        this._isMusicMuted = muted;
        if (this.currentMusic) {
            if (muted) {
                (this.currentMusic as any).setVolume(0);
            } else {
                (this.currentMusic as any).setVolume(this.musicVolume);
            }
        }
        import('./SynthesizerAudio').then(({ SynthesizerAudio }) => {
            SynthesizerAudio.getInstance().setMuted(this._isMusicMuted);
        });
        this.saveSettings();
    }

    public setSFXMuted(muted: boolean) {
        this._isSFXMuted = muted;
        this.saveSettings();
    }

    public playMusic(key: string = 'detective_theme', loop: boolean = true) {
        if (this.scene && this.scene.cache.audio.exists(key)) {
            if (this.currentMusic) {
                if ((this.currentMusic as any).key === key && (this.currentMusic as any).isPlaying) {
                    return;
                }
                this.currentMusic.stop();
            }
            this.currentMusic = this.scene.sound.add(key, {
                loop: loop,
                volume: this._isMusicMuted ? 0 : this.musicVolume
            });
            this.currentMusic.play();
        } else {
            // Procedural Synthesizer Detective BGM fallback
            import('./SynthesizerAudio').then(({ SynthesizerAudio }) => {
                const synth = SynthesizerAudio.getInstance();
                synth.setMuted(this._isMusicMuted);
                synth.setBgmVolume(this.musicVolume);
                synth.startDetectiveBGM();
            });
        }
    }

    public stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
        import('./SynthesizerAudio').then(({ SynthesizerAudio }) => {
            SynthesizerAudio.getInstance().stopDetectiveBGM();
        });
    }

    public playSFX(key: string, volScale: number = 1.0) {
        if (this._isSFXMuted) return;

        if (this.scene && this.scene.cache.audio.exists(key)) {
            this.scene.sound.play(key, {
                volume: this.sfxVolume * volScale
            });
        } else {
            // Procedural Synthesizer SFX fallback
            import('./SynthesizerAudio').then(({ SynthesizerAudio }) => {
                const synth = SynthesizerAudio.getInstance();
                synth.setSfxVolume(this.sfxVolume * volScale);
                if (key === 'click' || key === 'button_tap') synth.playButtonTap();
                else if (key === 'lock_on' || key === 'reticle') synth.playLockOn();
                else if (key === 'scan_sweep' || key === 'scan') synth.playScannerSweep();
                else if (key === 'correct_ai' || key === 'ai_discovery') synth.playCorrectAIDiscovery();
                else if (key === 'fixed_step' || key === 'decoy') synth.playFixedStepDiscovery();
                else if (key === 'battery_charge') synth.playBatteryCharge();
                else if (key === 'lens_collected') synth.playLensCollected();
                else if (key === 'zone_transition') synth.playZoneTransition();
                else if (key === 'badge_earned' || key === 'badge') synth.playBadgeEarned();
                else if (key === 'skateboard_trick' || key === 'trick') synth.playSkateboardTrick();
                else synth.playButtonTap();
            });
        }
    }

    public getMusicVolume(): number { return this.musicVolume; }
    public getSFXVolume(): number { return this.sfxVolume; }
    public isMusicMuted(): boolean { return this._isMusicMuted; }
    public isSFXMuted(): boolean { return this._isSFXMuted; }
}
