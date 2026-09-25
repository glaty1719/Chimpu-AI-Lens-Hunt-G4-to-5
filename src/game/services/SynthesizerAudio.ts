/**
 * SynthesizerAudio provides procedural Web Audio BGM and SFX for Chimpu's AI Lens Hunt.
 * Guarantees zero external audio network dependencies with high quality procedural sounds.
 */
export class SynthesizerAudio {
    private static instance: SynthesizerAudio;
    private ctx: AudioContext | null = null;
    private isBgmPlaying: boolean = false;
    private bgmTimer: number | null = null;
    private currentBgmStep: number = 0;
    private masterGain: GainNode | null = null;
    private sfxGain: GainNode | null = null;
    private bgmGain: GainNode | null = null;

    private isMuted: boolean = false;
    private bgmVolume: number = 0.35;
    private sfxVolume: number = 0.6;

    private constructor() {}

    public static getInstance(): SynthesizerAudio {
        if (!SynthesizerAudio.instance) {
            SynthesizerAudio.instance = new SynthesizerAudio();
        }
        return SynthesizerAudio.instance;
    }

    public init() {
        if (this.ctx) return;
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);

                this.bgmGain = this.ctx.createGain();
                this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
                this.bgmGain.connect(this.masterGain);

                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
                this.sfxGain.connect(this.masterGain);
            }
        } catch (e) {
            console.warn('Web Audio synthesis not supported:', e);
        }
    }

    private resumeContext() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    public setMuted(muted: boolean) {
        this.isMuted = muted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
        }
    }

    public setBgmVolume(vol: number) {
        this.bgmVolume = Math.max(0, Math.min(1, vol));
        if (this.bgmGain && this.ctx) {
            this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
        }
    }

    public setSfxVolume(vol: number) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        }
    }

    // ==========================================
    // SFX GENERATORS
    // ==========================================

    public playButtonTap() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.05);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    public playLockOn() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1174.66, now + 0.06);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.14);
    }

    public playScannerSweep() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.35);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(2800, now + 0.35);
        filter.Q.setValueAtTime(3.0, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.42);
    }

    public playCorrectAIDiscovery() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        // Sparkly Major Chime (E5, G#5, B5, E6)
        const chime = [659.25, 830.61, 987.77, 1318.51];
        chime.forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + idx * 0.05 + 0.3);

            gain.gain.setValueAtTime(0.25, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.4);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.42);
        });
    }

    public playFixedStepDiscovery() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        // Mechanical ratchet / gear clicks (3 quick clicks)
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(320 - i * 40, now + i * 0.06);

            gain.gain.setValueAtTime(0.2, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.04);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.05);
        }
    }

    public playBatteryCharge() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.38);
    }

    public playLensCollected() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        // Harmonic Ethereal Chord
        const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        chord.forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);

            gain.gain.setValueAtTime(0.18, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.6);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 0.65);
        });
    }

    public playZoneTransition() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.6);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.3);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.6);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.68);
    }

    public playBadgeEarned() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        // Grand Fanfare
        const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
        const times = [0, 0.12, 0.24, 0.36, 0.48, 0.65];

        fanfare.forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + times[idx]);

            const dur = idx === fanfare.length - 1 ? 0.9 : 0.22;
            gain.gain.setValueAtTime(0.25, now + times[idx]);
            gain.gain.exponentialRampToValueAtTime(0.001, now + times[idx] + dur);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + times[idx]);
            osc.stop(now + times[idx] + dur + 0.05);
        });
    }

    public playSkateboardTrick() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        // Pop + Whoosh + Land
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.32);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.36);
    }

    // ==========================================
    // PROCEDURAL DETECTIVE ADVENTURE BGM LOOP
    // ==========================================

    public startDetectiveBGM() {
        if (this.isBgmPlaying) return;
        this.resumeContext();
        this.isBgmPlaying = true;
        this.currentBgmStep = 0;

        const bpm = 112; // Groovy walking/skating tempo
        const stepInterval = ((60 / bpm) / 4) * 1000;

        // Jazzy detective bass line
        const bassLine = [
            110.00, 0, 130.81, 0, 146.83, 0, 155.56, 0,
            164.81, 0, 146.83, 0, 130.81, 0, 123.47, 0
        ];
        // Futuristic synth melody stabs
        const leadLine = [
            440.00, 0, 523.25, 0, 587.33, 0, 659.25, 0,
            587.33, 0, 523.25, 493.88, 440.00, 0, 0, 0
        ];

        this.bgmTimer = window.setInterval(() => {
            if (!this.isBgmPlaying || !this.ctx || !this.bgmGain || this.isMuted) return;

            const now = this.ctx.currentTime;
            const step = this.currentBgmStep % 16;

            // Bass Synth
            const bassFreq = bassLine[step];
            if (bassFreq > 0) {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                const bFilter = this.ctx.createBiquadFilter();

                bOsc.type = 'sawtooth';
                bOsc.frequency.setValueAtTime(bassFreq, now);

                bFilter.type = 'lowpass';
                bFilter.frequency.setValueAtTime(380, now);

                bGain.gain.setValueAtTime(0.16, now);
                bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

                bOsc.connect(bFilter);
                bFilter.connect(bGain);
                bGain.connect(this.bgmGain);

                bOsc.start(now);
                bOsc.stop(now + 0.2);
            }

            // Lead Synth
            const leadFreq = leadLine[step];
            if (leadFreq > 0 && Math.floor(this.currentBgmStep / 16) % 2 === 1) {
                const lOsc = this.ctx.createOscillator();
                const lGain = this.ctx.createGain();

                lOsc.type = 'triangle';
                lOsc.frequency.setValueAtTime(leadFreq, now);

                lGain.gain.setValueAtTime(0.09, now);
                lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

                lOsc.connect(lGain);
                lGain.connect(this.bgmGain);

                lOsc.start(now);
                lOsc.stop(now + 0.16);
            }

            // Crisp Hi-hat tick every 2 steps
            if (step % 2 === 0) {
                const hBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.025, this.ctx.sampleRate);
                const data = hBuffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.18;

                const hSource = this.ctx.createBufferSource();
                hSource.buffer = hBuffer;

                const hFilter = this.ctx.createBiquadFilter();
                hFilter.type = 'highpass';
                hFilter.frequency.setValueAtTime(7500, now);

                const hGain = this.ctx.createGain();
                hGain.gain.setValueAtTime(0.05, now);
                hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

                hSource.connect(hFilter);
                hFilter.connect(hGain);
                hGain.connect(this.bgmGain);

                hSource.start(now);
                hSource.stop(now + 0.03);
            }

            this.currentBgmStep++;
        }, stepInterval);
    }

    public stopDetectiveBGM() {
        this.isBgmPlaying = false;
        if (this.bgmTimer !== null) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}
