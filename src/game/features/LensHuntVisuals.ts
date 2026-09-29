import Phaser, { Scene } from 'phaser';

/**
 * LensHuntVisuals generates high-definition vector textures for:
 * - 24 Interactive Objects (12 AI features + 12 non-AI decoys)
 * - 5 AI Action Verb Badges (Recognizes, Listens, Predicts, Recommends, Learns)
 * - Non-AI Mechanism Badges (Gear, Timer, Button Arrow, Fixed Steps)
 * - Collectible Lenses (Home, School, Street, Golden Master)
 * - Scanner UI Reticle & Battery Assets
 * - Chimpu Detective & Environment Scenery Elements
 */
export class LensHuntVisuals {
    public static generateAll(scene: Scene) {
        this.generateAIIcons(scene);
        this.generateDecoyIcons(scene);
        this.generateCollectibleLenses(scene);
        this.generateScannerAssets(scene);
        this.generateHomeObjects(scene);
        this.generateSchoolObjects(scene);
        this.generateStreetObjects(scene);
        this.generateSceneryProps(scene);
        this.generateChimpuCharacterSprites(scene);
    }

    // ==========================================
    // 1. AI ACTION VERB ICONS (Section 11)
    // ==========================================

    private static generateAIIcons(scene: Scene) {
        const size = 120;

        // 1. RECOGNIZES: Eye inside targeting brackets
        const gRec = scene.make.graphics({ x: 0, y: 0 });
        gRec.fillStyle(0x0a1128, 0.95);
        gRec.fillCircle(size / 2, size / 2, 54);
        gRec.lineStyle(3, 0x00e5ff, 1);
        gRec.strokeCircle(size / 2, size / 2, 54);

        // Brackets
        gRec.lineStyle(5, 0x00e676, 1);
        const bOffset = 22;
        const bLen = 14;
        // Top-Left
        gRec.beginPath(); gRec.moveTo(bOffset, bOffset + bLen); gRec.lineTo(bOffset, bOffset); gRec.lineTo(bOffset + bLen, bOffset); gRec.strokePath();
        // Top-Right
        gRec.beginPath(); gRec.moveTo(size - bOffset, bOffset + bLen); gRec.lineTo(size - bOffset, bOffset); gRec.lineTo(size - bOffset - bLen, bOffset); gRec.strokePath();
        // Bottom-Left
        gRec.beginPath(); gRec.moveTo(bOffset, size - bOffset - bLen); gRec.lineTo(bOffset, size - bOffset); gRec.lineTo(bOffset + bLen, size - bOffset); gRec.strokePath();
        // Bottom-Right
        gRec.beginPath(); gRec.moveTo(size - bOffset, size - bOffset - bLen); gRec.lineTo(size - bOffset, size - bOffset); gRec.lineTo(size - bOffset - bLen, size - bOffset); gRec.strokePath();

        // Eye shape
        gRec.fillStyle(0xffffff, 1);
        gRec.fillEllipse(size / 2, size / 2, 56, 32);
        // Iris & Pupil
        gRec.fillStyle(0x00b0ff, 1);
        gRec.fillCircle(size / 2, size / 2, 12);
        gRec.fillStyle(0x0a1128, 1);
        gRec.fillCircle(size / 2, size / 2, 6);
        gRec.fillStyle(0xffffff, 1);
        gRec.fillCircle(size / 2 - 3, size / 2 - 3, 2.5); // highlight
        gRec.generateTexture('icon_recognizes', size, size);

        // 2. LISTENS: Ear with concentric soundwaves
        const gLis = scene.make.graphics({ x: 0, y: 0 });
        gLis.fillStyle(0x0a1128, 0.95);
        gLis.fillCircle(size / 2, size / 2, 54);
        gLis.lineStyle(3, 0x00e5ff, 1);
        gLis.strokeCircle(size / 2, size / 2, 54);

        // Ear silhouette
        gLis.lineStyle(6, 0x00e676, 1);
        gLis.beginPath();
        gLis.arc(size / 2 - 12, size / 2, 20, -Math.PI * 0.6, Math.PI * 0.55, false);
        gLis.strokePath();
        gLis.lineStyle(4, 0x69f0ae, 1);
        gLis.beginPath();
        gLis.arc(size / 2 - 12, size / 2 + 3, 10, -Math.PI * 0.5, Math.PI * 0.5, false);
        gLis.strokePath();

        // Concentric Soundwaves
        gLis.lineStyle(4, 0x00e5ff, 1);
        gLis.beginPath(); gLis.arc(size / 2 + 6, size / 2, 16, -Math.PI * 0.35, Math.PI * 0.35, false); gLis.strokePath();
        gLis.beginPath(); gLis.arc(size / 2 + 10, size / 2, 28, -Math.PI * 0.35, Math.PI * 0.35, false); gLis.strokePath();
        gLis.beginPath(); gLis.arc(size / 2 + 14, size / 2, 40, -Math.PI * 0.35, Math.PI * 0.35, false); gLis.strokePath();
        gLis.generateTexture('icon_listens', size, size);

        // 3. PREDICTS: Dotted trajectory path ending at a star
        const gPred = scene.make.graphics({ x: 0, y: 0 });
        gPred.fillStyle(0x0a1128, 0.95);
        gPred.fillCircle(size / 2, size / 2, 54);
        gPred.lineStyle(3, 0x00e5ff, 1);
        gPred.strokeCircle(size / 2, size / 2, 54);

        // Dotted trajectory curve
        const dots = [
            { x: 30, y: 86 },
            { x: 44, y: 78 },
            { x: 58, y: 64 },
            { x: 70, y: 48 },
            { x: 82, y: 34 }
        ];
        dots.forEach((p, idx) => {
            gPred.fillStyle(0x00e5ff, 0.5 + idx * 0.12);
            gPred.fillCircle(p.x, p.y, 4 + idx * 0.6);
        });

        // Glowing Target Star at (86, 32)
        this.drawStar(gPred, 88, 30, 5, 18, 8, 0xffd600, 0xffab00);
        gPred.generateTexture('icon_predicts', size, size);

        // 4. RECOMMENDS: Three cards with one highlighted
        const gRecm = scene.make.graphics({ x: 0, y: 0 });
        gRecm.fillStyle(0x0a1128, 0.95);
        gRecm.fillCircle(size / 2, size / 2, 54);
        gRecm.lineStyle(3, 0x00e5ff, 1);
        gRecm.strokeCircle(size / 2, size / 2, 54);

        // Left Card (dimmed)
        gRecm.fillStyle(0x1e293b, 0.9);
        gRecm.fillRoundedRect(22, 42, 28, 44, 6);
        gRecm.lineStyle(2, 0x475569, 1);
        gRecm.strokeRoundedRect(22, 42, 28, 44, 6);

        // Right Card (dimmed)
        gRecm.fillStyle(0x1e293b, 0.9);
        gRecm.fillRoundedRect(70, 42, 28, 44, 6);
        gRecm.lineStyle(2, 0x475569, 1);
        gRecm.strokeRoundedRect(70, 42, 28, 44, 6);

        // Center Highlighted Card
        gRecm.fillStyle(0x00e676, 1);
        gRecm.fillRoundedRect(42, 26, 36, 60, 8);
        gRecm.lineStyle(3, 0xffffff, 1);
        gRecm.strokeRoundedRect(42, 26, 36, 60, 8);

        // Star inside center card
        this.drawStar(gRecm, 60, 54, 5, 10, 4.5, 0xffffff, 0x00b0ff);
        gRecm.generateTexture('icon_recommends', size, size);

        // 5. LEARNS: Example cards entering a glowing neural chip
        const gLrn = scene.make.graphics({ x: 0, y: 0 });
        gLrn.fillStyle(0x0a1128, 0.95);
        gLrn.fillCircle(size / 2, size / 2, 54);
        gLrn.lineStyle(3, 0x00e5ff, 1);
        gLrn.strokeCircle(size / 2, size / 2, 54);

        // Neural Chip in center-bottom
        gLrn.fillStyle(0x00b0ff, 1);
        gLrn.fillRoundedRect(44, 52, 34, 34, 6);
        gLrn.lineStyle(2, 0x00e5ff, 1);
        gLrn.strokeRoundedRect(44, 52, 34, 34, 6);

        // Microchip pins
        gLrn.lineStyle(2, 0x00e5ff, 1);
        gLrn.lineBetween(40, 60, 44, 60);
        gLrn.lineBetween(40, 72, 44, 72);
        gLrn.lineBetween(78, 60, 82, 60);
        gLrn.lineBetween(78, 72, 82, 72);
        gLrn.lineBetween(52, 86, 52, 90);
        gLrn.lineBetween(68, 86, 68, 90);

        // Example data cards flying in from top
        gLrn.fillStyle(0xffd600, 0.9);
        gLrn.fillRoundedRect(34, 24, 20, 24, 4);
        gLrn.lineStyle(1.5, 0xffffff, 1);
        gLrn.strokeRoundedRect(34, 24, 20, 24, 4);

        gLrn.fillStyle(0x00e676, 0.9);
        gLrn.fillRoundedRect(64, 20, 20, 24, 4);
        gLrn.lineStyle(1.5, 0xffffff, 1);
        gLrn.strokeRoundedRect(64, 20, 20, 24, 4);

        // Connecting data stream arrows
        gLrn.lineStyle(2, 0x69f0ae, 0.9);
        gLrn.beginPath(); gLrn.moveTo(44, 48); gLrn.lineTo(54, 54); gLrn.strokePath();
        gLrn.beginPath(); gLrn.moveTo(72, 44); gLrn.lineTo(66, 54); gLrn.strokePath();

        gLrn.generateTexture('icon_learns', size, size);
    }

    // ==========================================
    // 2. NON-AI DECOY FEEDBACK ICONS (Section 16)
    // ==========================================

    private static generateDecoyIcons(scene: Scene) {
        const size = 120;

        // 1. GEAR ICON (Mechanical)
        const gGear = scene.make.graphics({ x: 0, y: 0 });
        gGear.fillStyle(0x1e293b, 0.95);
        gGear.fillCircle(size / 2, size / 2, 54);
        gGear.lineStyle(3, 0xffd600, 1);
        gGear.strokeCircle(size / 2, size / 2, 54);

        // Gear teeth
        const cx = size / 2;
        const cy = size / 2;
        const outerR = 36;
        const innerR = 26;
        const teeth = 8;
        gGear.fillStyle(0xffa000, 1);
        gGear.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI) / teeth;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) gGear.moveTo(x, y);
            else gGear.lineTo(x, y);
        }
        gGear.closePath();
        gGear.fillPath();

        // Inner circle hole
        gGear.fillStyle(0x1e293b, 1);
        gGear.fillCircle(cx, cy, 12);
        gGear.lineStyle(2, 0xffd600, 1);
        gGear.strokeCircle(cx, cy, 12);
        gGear.generateTexture('icon_gear', size, size);

        // 2. TIMER ICON (Fixed Timer)
        const gTime = scene.make.graphics({ x: 0, y: 0 });
        gTime.fillStyle(0x1e293b, 0.95);
        gTime.fillCircle(size / 2, size / 2, 54);
        gTime.lineStyle(3, 0xffd600, 1);
        gTime.strokeCircle(size / 2, size / 2, 54);

        // Clock circle
        gTime.fillStyle(0x334155, 1);
        gTime.fillCircle(cx, cy + 4, 30);
        gTime.lineStyle(3, 0xffd600, 1);
        gTime.strokeCircle(cx, cy + 4, 30);

        // Clock top stopper
        gTime.fillStyle(0xffd600, 1);
        gTime.fillRect(cx - 6, cy - 32, 12, 8);

        // Clock hands
        gTime.lineStyle(3, 0xffffff, 1);
        gTime.beginPath();
        gTime.moveTo(cx, cy + 4);
        gTime.lineTo(cx, cy - 14); // 12 o'clock
        gTime.moveTo(cx, cy + 4);
        gTime.lineTo(cx + 14, cy + 4); // 3 o'clock
        gTime.strokePath();
        gTime.generateTexture('icon_timer', size, size);

        // 3. BUTTON-TO-ACTION ARROW ICON
        const gBtn = scene.make.graphics({ x: 0, y: 0 });
        gBtn.fillStyle(0x1e293b, 0.95);
        gBtn.fillCircle(size / 2, size / 2, 54);
        gBtn.lineStyle(3, 0xffd600, 1);
        gBtn.strokeCircle(size / 2, size / 2, 54);

        // Push button
        gBtn.fillStyle(0xef4444, 1);
        gBtn.fillRoundedRect(28, 48, 26, 26, 6);
        gBtn.lineStyle(2, 0xffffff, 1);
        gBtn.strokeRoundedRect(28, 48, 26, 26, 6);

        // Arrow from button to light/gear
        gBtn.lineStyle(4, 0xffd600, 1);
        gBtn.beginPath();
        gBtn.moveTo(58, 61);
        gBtn.lineTo(82, 61);
        gBtn.strokePath();

        // Arrowhead
        gBtn.fillStyle(0xffd600, 1);
        gBtn.beginPath();
        gBtn.moveTo(82, 53);
        gBtn.lineTo(94, 61);
        gBtn.lineTo(82, 69);
        gBtn.closePath();
        gBtn.fillPath();
        gBtn.generateTexture('icon_button_arrow', size, size);

        // 4. FIXED STEPS ICON (Calculator / Flowchart)
        const gSteps = scene.make.graphics({ x: 0, y: 0 });
        gSteps.fillStyle(0x1e293b, 0.95);
        gSteps.fillCircle(size / 2, size / 2, 54);
        gSteps.lineStyle(3, 0xffd600, 1);
        gSteps.strokeCircle(size / 2, size / 2, 54);

        // 3 sequential step blocks
        gSteps.fillStyle(0x38bdf8, 1);
        gSteps.fillRoundedRect(30, 26, 24, 16, 4);
        gSteps.fillStyle(0xfbbf24, 1);
        gSteps.fillRoundedRect(50, 50, 24, 16, 4);
        gSteps.fillStyle(0x4ade80, 1);
        gSteps.fillRoundedRect(70, 74, 24, 16, 4);

        // Connectors
        gSteps.lineStyle(2, 0xffffff, 0.8);
        gSteps.lineBetween(42, 42, 50, 58);
        gSteps.lineBetween(62, 66, 70, 82);
        gSteps.generateTexture('icon_fixed_calc', size, size);
    }

    // ==========================================
    // 3. COLLECTIBLE LENSES & SCANNER ASSETS
    // ==========================================

    private static generateCollectibleLenses(scene: Scene) {
        const size = 160;

        // Lens configs
        const lenses = [
            { key: 'lens_home', name: 'Home Lens', rim: 0x059669, core: 0x10b981, aura: 0x6ee7b7 },
            { key: 'lens_school', name: 'School Lens', rim: 0x0284c7, core: 0x38bdf8, aura: 0xbae6fd },
            { key: 'lens_street', name: 'Street Lens', rim: 0x7c3aed, core: 0xa855f7, aura: 0xe9d5ff },
            { key: 'lens_golden_master', name: 'Golden Master Lens', rim: 0xb45309, core: 0xfbbf24, aura: 0xfef08a }
        ];

        lenses.forEach(l => {
            const g = scene.make.graphics({ x: 0, y: 0 });
            const cx = size / 2;
            const cy = size / 2;

            // Outer Glow Aura
            g.fillStyle(l.aura, 0.25);
            g.fillCircle(cx, cy, 70);
            g.fillStyle(l.rim, 0.6);
            g.fillCircle(cx, cy, 62);

            // Sci-Fi Metallic Lens Bezel
            g.fillStyle(0x0f172a, 1);
            g.fillCircle(cx, cy, 54);
            g.lineStyle(5, l.core, 1);
            g.strokeCircle(cx, cy, 54);

            // Glowing Optical Crystal Core
            g.fillStyle(l.core, 0.85);
            g.fillCircle(cx, cy, 42);

            // Inner Aperture Rings
            g.lineStyle(2, 0xffffff, 0.8);
            g.strokeCircle(cx, cy, 30);
            g.lineStyle(1.5, l.aura, 0.6);
            g.strokeCircle(cx, cy, 18);

            // Glass reflection highlight arcs
            g.fillStyle(0xffffff, 0.55);
            g.fillEllipse(cx - 14, cy - 14, 28, 14);

            g.generateTexture(l.key, size, size);
        });

        // AI Detective Golden Shield Badge
        const bSize = 200;
        const bgBadge = scene.make.graphics({ x: 0, y: 0 });
        const bcx = bSize / 2;
        const bcy = bSize / 2;

        // Shield Path
        bgBadge.fillStyle(0xb45309, 1);
        bgBadge.beginPath();
        bgBadge.moveTo(bcx, 15);
        bgBadge.lineTo(bSize - 20, 45);
        bgBadge.lineTo(bSize - 35, 140);
        bgBadge.lineTo(bcx, bSize - 15);
        bgBadge.lineTo(35, 140);
        bgBadge.lineTo(20, 45);
        bgBadge.closePath();
        bgBadge.fillPath();

        // Inner Golden Shield
        bgBadge.fillStyle(0xfbbf24, 1);
        bgBadge.beginPath();
        bgBadge.moveTo(bcx, 24);
        bgBadge.lineTo(bSize - 28, 52);
        bgBadge.lineTo(bSize - 42, 134);
        bgBadge.lineTo(bcx, bSize - 26);
        bgBadge.lineTo(42, 134);
        bgBadge.lineTo(28, 52);
        bgBadge.closePath();
        bgBadge.fillPath();

        // Shield Rim Stroke
        bgBadge.lineStyle(4, 0xffffff, 0.9);
        bgBadge.strokePath();

        // Magnifying Glass & Star Center
        bgBadge.fillStyle(0x0f172a, 1);
        bgBadge.fillCircle(bcx, bcy - 6, 40);
        bgBadge.lineStyle(3, 0x00e5ff, 1);
        bgBadge.strokeCircle(bcx, bcy - 6, 40);

        this.drawStar(bgBadge, bcx, bcy - 6, 5, 22, 10, 0xfef08a, 0xf59e0b);

        bgBadge.generateTexture('badge_detective', bSize, bSize);
    }

    private static generateScannerAssets(scene: Scene) {
        // 1. Scanner Reticle (Lock-on target overlay)
        const retSize = 220;
        const gRet = scene.make.graphics({ x: 0, y: 0 });
        const rcx = retSize / 2;
        const rcy = retSize / 2;

        // Cyan Sci-Fi Brackets
        gRet.lineStyle(6, 0x00e5ff, 1);
        const pad = 24;
        const arm = 36;
        // Top-Left
        gRet.beginPath(); gRet.moveTo(pad, pad + arm); gRet.lineTo(pad, pad); gRet.lineTo(pad + arm, pad); gRet.strokePath();
        // Top-Right
        gRet.beginPath(); gRet.moveTo(retSize - pad, pad + arm); gRet.lineTo(retSize - pad, pad); gRet.lineTo(retSize - pad - arm, pad); gRet.strokePath();
        // Bottom-Left
        gRet.beginPath(); gRet.moveTo(pad, retSize - pad - arm); gRet.lineTo(pad, retSize - pad); gRet.lineTo(pad + arm, retSize - pad); gRet.strokePath();
        // Bottom-Right
        gRet.beginPath(); gRet.moveTo(retSize - pad, retSize - pad - arm); gRet.lineTo(retSize - pad, retSize - pad); gRet.lineTo(retSize - pad - arm, retSize - pad); gRet.strokePath();

        // Center Pulsing Crosshair
        gRet.lineStyle(2, 0x00e676, 0.85);
        gRet.strokeCircle(rcx, rcy, 48);
        gRet.strokeCircle(rcx, rcy, 68);
        gRet.lineBetween(rcx - 20, rcy, rcx + 20, rcy);
        gRet.lineBetween(rcx, rcy - 20, rcx, rcy + 20);

        gRet.generateTexture('scanner_reticle', retSize, retSize);

        // 2. Tactile Scanner Button (Bottom-Right HUD)
        const btnW = 280;
        const btnH = 96;
        const gBtn = scene.make.graphics({ x: 0, y: 0 });

        // Outer Glow
        gBtn.fillStyle(0x00e5ff, 0.35);
        gBtn.fillRoundedRect(0, 0, btnW, btnH, 28);

        // Base Button Body
        gBtn.fillStyle(0x0a1128, 0.98);
        gBtn.fillRoundedRect(6, 6, btnW - 12, btnH - 12, 24);

        // Neon Cyan Border
        gBtn.lineStyle(4, 0x00e5ff, 1);
        gBtn.strokeRoundedRect(6, 6, btnW - 12, btnH - 12, 24);

        // Inner Holographic Glass Gradient Strip
        gBtn.fillStyle(0x00b0ff, 0.35);
        gBtn.fillRoundedRect(12, 12, btnW - 24, (btnH - 24) / 2, 18);

        gBtn.generateTexture('scanner_button_bg', btnW, btnH);

        // 3. Scanner Battery Frame & Cells
        const batW = 220;
        const batH = 48;
        const gBat = scene.make.graphics({ x: 0, y: 0 });

        // Battery body
        gBat.fillStyle(0x0a1128, 0.95);
        gBat.fillRoundedRect(0, 4, batW - 16, batH - 8, 12);
        gBat.lineStyle(3, 0x00e5ff, 1);
        gBat.strokeRoundedRect(0, 4, batW - 16, batH - 8, 12);

        // Battery Terminal Nub
        gBat.fillStyle(0x00e5ff, 1);
        gBat.fillRoundedRect(batW - 14, 14, 12, 20, 4);

        gBat.generateTexture('scanner_battery_frame', batW, batH);
    }

    // ==========================================
    // 4. ZONE 1: HOME OBJECT TEXTURES
    // ==========================================

    private static generateHomeObjects(scene: Scene) {
        // Zone 1 objects are loaded as high-fidelity AI-generated assets in Preloader.ts:
        // - obj_phone_face (Smartphone Face Unlock: 100x206)
        // - obj_smart_speaker (Smart Speaker: 120x220)
        // - obj_streaming_tv (OLED Streaming TV: 250x168)
        // - obj_robot_vacuum / obj_vacuum_robot (Robot Vacuum: 170x114)
        // - obj_toaster (Manual Toaster: 150x132)
        // - obj_lamp_switch (Lampshade with Switch: 130x161)
        // - obj_analog_clock (Mechanical Analog Clock: 140x140)
        // - obj_blender (Fixed-Speed Blender: 115x220)
        const homeTextures: Array<{ key: string; w: number; h: number; color: number }> = [
            { key: 'obj_phone_face', w: 100, h: 206, color: 0x00e5ff },
            { key: 'obj_smart_speaker', w: 120, h: 220, color: 0x8b5cf6 },
            { key: 'obj_streaming_tv', w: 250, h: 168, color: 0x0284c7 },
            { key: 'obj_robot_vacuum', w: 170, h: 114, color: 0x10b981 },
            { key: 'obj_toaster', w: 150, h: 132, color: 0xd97706 },
            { key: 'obj_lamp_switch', w: 130, h: 161, color: 0xf59e0b },
            { key: 'obj_analog_clock', w: 140, h: 140, color: 0x78350f },
            { key: 'obj_blender', w: 115, h: 220, color: 0x64748b }
        ];

        homeTextures.forEach(item => {
            if (!scene.textures.exists(item.key)) {
                const g = scene.make.graphics({ x: 0, y: 0 });
                g.fillStyle(item.color, 1);
                g.fillRoundedRect(0, 0, item.w, item.h, 8);
                g.generateTexture(item.key, item.w, item.h);
                g.destroy();
            }
        });
    }

    // ==========================================
    // 5. ZONE 2: SCHOOL OBJECT TEXTURES
    // ==========================================

    private static generateSchoolObjects(scene: Scene) {
        // =========================================================================
        // 1. SPEECH-TO-TEXT APPLICATION (obj_speech_app / obj_speech_tablet: 240x240)
        // Check if preloaded from AI generated snapshot image file first
        // =========================================================================
        if (!scene.textures.exists('obj_speech_app')) {
            const gSpTab = scene.make.graphics({ x: 0, y: 0 });

            // --- Window Ambient Drop Shadow ---
            gSpTab.fillStyle(0x000000, 0.25);
            gSpTab.fillRoundedRect(6, 12, 228, 224, 16);
            gSpTab.fillStyle(0x000000, 0.45);
            gSpTab.fillRoundedRect(10, 16, 220, 216, 14);

            // --- Main Window Chassis (Deep Obsidian Dark Mode) ---
            gSpTab.fillStyle(0x10131a, 1);
            gSpTab.fillRoundedRect(12, 10, 216, 220, 14);
            gSpTab.lineStyle(2, 0x242b3d, 1);
            gSpTab.strokeRoundedRect(12, 10, 216, 220, 14);

            // Subtle Bevel Highlight
            gSpTab.lineStyle(1, 0x3b4760, 0.6);
            gSpTab.strokeRoundedRect(13, 11, 214, 218, 13);

            // =========================================================================
            // 1. TOP TITLE BAR ("AI Scribe", "Live Transcription - Active", "[REC LIVE] 01:28")
            // =========================================================================
            gSpTab.fillStyle(0x131722, 1);
            gSpTab.fillRoundedRect(14, 12, 212, 26, 12);
            gSpTab.fillRect(14, 24, 212, 14); // Flat bottom of titlebar
            gSpTab.lineStyle(1, 0x1e2536, 1);
            gSpTab.lineBetween(14, 38, 226, 38);

            // App Icon (Microphone / Wave badge)
            gSpTab.fillStyle(0x0284c7, 1);
            gSpTab.fillRoundedRect(20, 17, 14, 14, 3.5);
            gSpTab.fillStyle(0xffffff, 1);
            gSpTab.fillRoundedRect(25, 20, 4, 6, 1.5);
            gSpTab.fillRect(26, 26, 2, 2);

            // App Title "AI Scribe"
            gSpTab.fillStyle(0xffffff, 0.95);
            gSpTab.fillRect(38, 20, 26, 5); // "AI Scribe"
            gSpTab.fillStyle(0x00e5ff, 1);
            gSpTab.fillRect(38, 26, 20, 2); // Cyan accent underline

            // Subtitle: "Live Transcription - Active"
            gSpTab.fillStyle(0x94a3b8, 0.85);
            gSpTab.fillRect(70, 21, 52, 4);

            // Recording Status Pill: [ 🔴 REC LIVE  01:28 ]
            gSpTab.fillStyle(0x3f1216, 0.8);
            gSpTab.fillRoundedRect(126, 17, 58, 14, 3);
            gSpTab.lineStyle(1, 0xef4444, 0.7);
            gSpTab.strokeRoundedRect(126, 17, 58, 14, 3);
            gSpTab.fillStyle(0xef4444, 1);
            gSpTab.fillCircle(132, 24, 2.5); // Glowing Red Dot
            gSpTab.fillStyle(0xf87171, 1);
            gSpTab.fillRect(137, 21, 22, 4.5); // "[REC LIVE]"
            gSpTab.fillStyle(0xe2e8f0, 0.9);
            gSpTab.fillRect(162, 21, 18, 4.5); // "01:28"

            // Window Controls: Minimize (-), Maximize (▢), Close (✕)
            gSpTab.fillStyle(0x64748b, 1);
            gSpTab.fillRect(190, 24, 6, 1.5); // Minimize
            gSpTab.strokeRect(200, 21, 5, 5); // Maximize
            // Close ✕
            gSpTab.lineStyle(1.2, 0x94a3b8, 1);
            gSpTab.lineBetween(212, 21, 216, 25);
            gSpTab.lineBetween(216, 21, 212, 25);

            // =========================================================================
            // 2. TOP-LEFT PANEL: "AUDIO INPUT" OSCILLATING SOUND WAVE
            // =========================================================================
            gSpTab.fillStyle(0x0c0f17, 1);
            gSpTab.fillRoundedRect(18, 42, 114, 52, 6);
            gSpTab.lineStyle(1, 0x1e2738, 1);
            gSpTab.strokeRoundedRect(18, 42, 114, 52, 6);

            // Sound Waveform Bars (Cyan to Emerald Spectrum)
            const waveBars = [
                { x: 23, h: 6, c: 0x00e5ff },
                { x: 27, h: 10, c: 0x00e5ff },
                { x: 31, h: 22, c: 0x00e5ff },
                { x: 35, h: 32, c: 0x38bdf8 },
                { x: 39, h: 18, c: 0x38bdf8 },
                { x: 43, h: 28, c: 0x10b981 },
                { x: 47, h: 36, c: 0x10b981 },
                { x: 51, h: 14, c: 0x34d399 },
                { x: 55, h: 26, c: 0x00e5ff },
                { x: 59, h: 38, c: 0x00e5ff },
                { x: 63, h: 30, c: 0x38bdf8 },
                { x: 67, h: 20, c: 0x10b981 },
                { x: 71, h: 34, c: 0x10b981 },
                { x: 75, h: 26, c: 0x34d399 },
                { x: 79, h: 16, c: 0x00e5ff },
                { x: 83, h: 32, c: 0x00e5ff },
                { x: 87, h: 24, c: 0x38bdf8 },
                { x: 91, h: 18, c: 0x10b981 },
                { x: 95, h: 28, c: 0x10b981 },
                { x: 99, h: 12, c: 0x00e5ff },
                { x: 103, h: 8, c: 0x00e5ff },
                { x: 107, h: 4, c: 0x64748b }
            ];

            waveBars.forEach(b => {
                // Glow aura
                gSpTab.fillStyle(b.c, 0.25);
                gSpTab.fillRoundedRect(b.x - 0.5, 66 - b.h / 2 - 0.5, 3, b.h + 1, 1.5);
                // Solid bar
                gSpTab.fillStyle(b.c, 0.95);
                gSpTab.fillRoundedRect(b.x, 66 - b.h / 2, 2, b.h, 1);
            });

            // "AUDIO INPUT" & "01:28" labels
            gSpTab.fillStyle(0x64748b, 0.9);
            gSpTab.fillRect(23, 86, 38, 4); // "AUDIO INPUT"
            gSpTab.fillStyle(0x94a3b8, 0.9);
            gSpTab.fillRect(104, 86, 22, 4); // "01:28"

            // =========================================================================
            // 3. TOP-RIGHT PANEL: "Neural AI Transcription" PIPELINE
            // =========================================================================
            gSpTab.fillStyle(0x0c0f17, 1);
            gSpTab.fillRoundedRect(136, 42, 90, 52, 6);
            gSpTab.lineStyle(1, 0x1e2738, 1);
            gSpTab.strokeRoundedRect(136, 42, 90, 52, 6);

            // Header: "Neural AI Transcription"
            gSpTab.fillStyle(0xe2e8f0, 0.9);
            gSpTab.fillRect(140, 46, 68, 4);

            // 3 Pipeline Stages:
            // Stage 1: Wave icon
            gSpTab.fillStyle(0x00e5ff, 1);
            gSpTab.fillRect(142, 56, 1.5, 8);
            gSpTab.fillRect(145, 54, 1.5, 12);
            gSpTab.fillRect(148, 57, 1.5, 6);
            // Arrow 1 ➔
            gSpTab.fillStyle(0x38bdf8, 1);
            gSpTab.fillTriangle(158, 60, 154, 58, 154, 62);
            gSpTab.fillRect(151, 59.5, 4, 1);

            // Stage 2: Neural Net Nodes
            gSpTab.fillStyle(0x10b981, 1);
            gSpTab.fillCircle(166, 56, 2);
            gSpTab.fillCircle(172, 60, 2);
            gSpTab.fillCircle(166, 64, 2);
            gSpTab.fillCircle(160, 60, 2);
            gSpTab.lineStyle(1, 0x34d399, 0.6);
            gSpTab.lineBetween(166, 56, 172, 60);
            gSpTab.lineBetween(172, 60, 166, 64);
            gSpTab.lineBetween(166, 64, 160, 60);
            gSpTab.lineBetween(160, 60, 166, 56);
            // Arrow 2 ➔
            gSpTab.fillStyle(0x10b981, 1);
            gSpTab.fillTriangle(182, 60, 178, 58, 178, 62);
            gSpTab.fillRect(175, 59.5, 4, 1);

            // Stage 3: Document + Search Lens Icon
            gSpTab.lineStyle(1.2, 0x00e5ff, 1);
            gSpTab.strokeRoundedRect(188, 54, 12, 12, 2);
            gSpTab.fillStyle(0x00e5ff, 1);
            gSpTab.fillRect(191, 57, 6, 1.5);
            gSpTab.fillRect(191, 60, 4, 1.5);

            // Subtext labels: INPUT AUDIO -> SIGNAL ANALYSIS NET -> TEXT GENERATION
            gSpTab.fillStyle(0x64748b, 0.85);
            gSpTab.fillRect(140, 72, 24, 3);
            gSpTab.fillRect(166, 72, 30, 3);
            gSpTab.fillRect(198, 72, 24, 3);

            // Mint Progress Line
            gSpTab.fillStyle(0x10b981, 1);
            gSpTab.fillRoundedRect(140, 84, 52, 2, 1);
            gSpTab.fillStyle(0x1e2738, 1);
            gSpTab.fillRoundedRect(192, 84, 30, 2, 1);

            // =========================================================================
            // 4. LEFT SIDEBAR ("Files", "Recordings", "Settings", "Export")
            // =========================================================================
            gSpTab.fillStyle(0x0d101a, 1);
            gSpTab.fillRoundedRect(18, 98, 40, 124, 6);
            gSpTab.lineStyle(1, 0x1e2738, 1);
            gSpTab.strokeRoundedRect(18, 98, 40, 124, 6);

            // Active Tab: Files (Cyan border indicator)
            gSpTab.fillStyle(0x00e5ff, 1);
            gSpTab.fillRect(18, 104, 2.5, 14); // Cyan active line
            gSpTab.fillStyle(0xffffff, 0.95);
            gSpTab.fillRect(24, 109, 24, 5); // "Files"

            // Menu items
            gSpTab.fillStyle(0x64748b, 0.9);
            gSpTab.fillRect(24, 128, 30, 4.5); // "Recordings"
            gSpTab.fillRect(24, 144, 26, 4.5); // "Settings"
            gSpTab.fillRect(24, 160, 22, 4.5); // "Export"

            // Bottom storage usage bar
            gSpTab.fillStyle(0x1e2738, 1);
            gSpTab.fillRoundedRect(22, 204, 32, 4, 2);
            gSpTab.fillStyle(0x0284c7, 1);
            gSpTab.fillRoundedRect(22, 204, 18, 4, 2);

            // =========================================================================
            // 5. MAIN TRANSCRIPTION TEXT EDITOR WINDOW
            // =========================================================================
            gSpTab.fillStyle(0x0a0c14, 1);
            gSpTab.fillRoundedRect(62, 98, 164, 124, 6);
            gSpTab.lineStyle(1, 0x1e2738, 1);
            gSpTab.strokeRoundedRect(62, 98, 164, 124, 6);

            // --- PARAGRAPH 1 ---
            // Timestamp "[01:28]"
            gSpTab.fillStyle(0x64748b, 0.9);
            gSpTab.fillRect(68, 106, 22, 5);

            // Speaker 1 Tag: "Speaker 1:" (Bright Cyan)
            gSpTab.fillStyle(0x00e5ff, 1);
            gSpTab.fillRect(94, 106, 36, 5);

            // Text Line 1: "Good morning, everyone. Welcome to the"
            gSpTab.fillStyle(0xf1f5f9, 0.95);
            gSpTab.fillRect(134, 106, 86, 5);

            // Text Line 2: "Q3 Project Update meeting. I'd like to start by reviewing"
            gSpTab.fillStyle(0xe2e8f0, 0.95);
            gSpTab.fillRect(68, 116, 152, 5);

            // Text Line 3: "our current progress and key milestones for this quarter."
            gSpTab.fillStyle(0xe2e8f0, 0.95);
            gSpTab.fillRect(68, 126, 148, 5);

            // Text Line 4: "Our team has been focused on developing the new"
            gSpTab.fillStyle(0xe2e8f0, 0.95);
            gSpTab.fillRect(68, 136, 142, 5);

            // Text Line 5: "data [ analytics ] platform and optimizing the back-end"
            gSpTab.fillStyle(0xe2e8f0, 0.95);
            gSpTab.fillRect(68, 146, 22, 5); // "data "
            // Keyword chip 1: [ analytics ]
            gSpTab.fillStyle(0x00e5ff, 0.2);
            gSpTab.fillRoundedRect(92, 144, 38, 9, 2.5);
            gSpTab.lineStyle(1, 0x00e5ff, 0.8);
            gSpTab.strokeRoundedRect(92, 144, 38, 9, 2.5);
            gSpTab.fillStyle(0x00e5ff, 1);
            gSpTab.fillRect(95, 146, 32, 5); // "analytics"
            // Remainder of line 5
            gSpTab.fillStyle(0xe2e8f0, 0.95);
            gSpTab.fillRect(134, 146, 86, 5); // "platform and optimizing..."

            // Text Line 6: "[ scalability ]."
            // Keyword chip 2: [ scalability ]
            gSpTab.fillStyle(0x00e5ff, 0.2);
            gSpTab.fillRoundedRect(68, 156, 44, 9, 2.5);
            gSpTab.lineStyle(1, 0x00e5ff, 0.8);
            gSpTab.strokeRoundedRect(68, 156, 44, 9, 2.5);
            gSpTab.fillStyle(0x00e5ff, 1);
            gSpTab.fillRect(71, 158, 38, 5); // "scalability"
            gSpTab.fillStyle(0xe2e8f0, 0.95);
            gSpTab.fillRect(114, 158, 4, 5); // "."

            // --- PARAGRAPH 2 (Active Dictation) ---
            // Timestamp "[01:34]"
            gSpTab.fillStyle(0x64748b, 0.9);
            gSpTab.fillRect(68, 172, 22, 5);

            // Text: "We've successfully integrated the natural language"
            gSpTab.fillStyle(0xf1f5f9, 0.95);
            gSpTab.fillRect(94, 172, 126, 5);

            // Text: "processing model into the [ core workflow ]...|"
            gSpTab.fillStyle(0xe2e8f0, 0.95);
            gSpTab.fillRect(68, 184, 80, 5); // "processing model into the "
            // Keyword chip 3: [ core workflow ]
            gSpTab.fillStyle(0x00e5ff, 0.2);
            gSpTab.fillRoundedRect(152, 182, 50, 9, 2.5);
            gSpTab.lineStyle(1, 0x00e5ff, 0.8);
            gSpTab.strokeRoundedRect(152, 182, 50, 9, 2.5);
            gSpTab.fillStyle(0x00e5ff, 1);
            gSpTab.fillRect(155, 184, 44, 5); // "core workflow"
            gSpTab.fillStyle(0xe2e8f0, 0.95);
            gSpTab.fillRect(204, 184, 8, 5); // "..."

            // Active Glowing Typewriter Cursor "|"
            gSpTab.fillStyle(0x00e5ff, 1);
            gSpTab.fillRect(214, 182, 2.5, 10);
            // Cursor pulse aura
            gSpTab.fillStyle(0x00e5ff, 0.4);
            gSpTab.fillCircle(215, 187, 3.5);

            // --- Specular Diagonal Screen Glare ---
            gSpTab.fillStyle(0xffffff, 0.04);
            gSpTab.fillTriangle(14, 12, 220, 12, 14, 140);

            // Generate Textures (both primary key and alias)
            gSpTab.generateTexture('obj_speech_app', 240, 240);
            gSpTab.generateTexture('obj_speech_tablet', 240, 240);
            gSpTab.destroy();
        }

        // =========================================================================
        // 2. LANGUAGE TRANSLATION MOBILE APP (obj_translation_app: 180x370)
        // =========================================================================
        {
            const gTrans = scene.make.graphics({ x: 0, y: 0 });
            const pw = 160;
            const ph = 340;
            const px = 10;
            const py = 10;
            const pr = 26;

            // Table Shadow
            gTrans.fillStyle(0x000000, 0.4);
            gTrans.fillEllipse(px + pw / 2, py + ph + 8, pw * 0.75, 14);

            // 1. Phone Outer Chassis (Sleek Dark Titanium / Space Black)
            gTrans.fillStyle(0x18181b, 1);
            gTrans.fillRoundedRect(px, py, pw, ph, pr);
            // Chassis Edge Bevel / Metallic Rim
            gTrans.lineStyle(2.5, 0x3f3f46, 1);
            gTrans.strokeRoundedRect(px, py, pw, ph, pr);

            // Side Buttons (Volume & Power)
            gTrans.fillStyle(0x52525b, 1);
            gTrans.fillRoundedRect(px - 2, py + 60, 2, 28, 1); // Volume Up
            gTrans.fillRoundedRect(px - 2, py + 95, 2, 28, 1); // Volume Down
            gTrans.fillRoundedRect(px + pw, py + 75, 2, 40, 1); // Power / Siri

            // 2. OLED Screen Area (Bezel-less)
            const sx = px + 6;
            const sy = py + 6;
            const sw = pw - 12;
            const sh = ph - 12;
            const sr = pr - 4;

            gTrans.fillStyle(0x09090b, 1);
            gTrans.fillRoundedRect(sx, sy, sw, sh, sr);
            gTrans.lineStyle(1, 0x27272a, 0.8);
            gTrans.strokeRoundedRect(sx, sy, sw, sh, sr);

            // 3. Dynamic Island / Camera Notch
            gTrans.fillStyle(0x000000, 1);
            gTrans.fillRoundedRect(px + pw / 2 - 24, sy + 6, 48, 14, 7);
            // Lens reflection
            gTrans.fillStyle(0x1e1b4b, 1);
            gTrans.fillCircle(px + pw / 2 + 12, sy + 13, 3);

            // 4. Status Bar (Time & Battery)
            gTrans.fillStyle(0xe4e4e7, 0.9);
            gTrans.fillRect(sx + 14, sy + 9, 20, 5); // 09:41
            // Battery
            gTrans.lineStyle(1, 0xa1a1aa, 0.9);
            gTrans.strokeRoundedRect(sx + sw - 28, sy + 8, 15, 7, 2);
            gTrans.fillStyle(0x22c55e, 1);
            gTrans.fillRect(sx + sw - 26, sy + 10, 9, 3); // Battery level

            // 5. Header: "AI Live Translator"
            gTrans.fillStyle(0xffffff, 0.95);
            gTrans.fillRect(px + pw / 2 - 42, sy + 28, 84, 7); // Title
            gTrans.fillStyle(0x00e5ff, 1);
            gTrans.fillRect(px + pw / 2 - 24, sy + 37, 48, 2); // Cyan accent bar

            // Language Switcher Pill [ EN ⇄ ES ]
            gTrans.fillStyle(0x18181b, 0.95);
            gTrans.fillRoundedRect(sx + 12, sy + 44, sw - 24, 22, 6);
            gTrans.lineStyle(1, 0x3b82f6, 0.6);
            gTrans.strokeRoundedRect(sx + 12, sy + 44, sw - 24, 22, 6);

            // EN Badge
            gTrans.fillStyle(0x1d4ed8, 1);
            gTrans.fillRoundedRect(sx + 16, sy + 47, 36, 16, 4);
            gTrans.fillStyle(0xffffff, 1);
            gTrans.fillRect(sx + 24, sy + 52, 20, 5);

            // Bidirectional Exchange Arrows ⇄
            gTrans.fillStyle(0x38bdf8, 1);
            gTrans.fillTriangle(px + pw / 2 + 4, sy + 53, px + pw / 2 - 2, sy + 50, px + pw / 2 - 2, sy + 56);
            gTrans.fillTriangle(px + pw / 2 - 4, sy + 58, px + pw / 2 + 2, sy + 55, px + pw / 2 + 2, sy + 61);

            // ES Badge
            gTrans.fillStyle(0x059669, 1);
            gTrans.fillRoundedRect(sx + sw - 52, sy + 47, 36, 16, 4);
            gTrans.fillStyle(0xffffff, 1);
            gTrans.fillRect(sx + sw - 44, sy + 52, 20, 5);

            // 6. Source Card (English Audio & Speech)
            const c1y = sy + 74;
            const ch = 78;
            gTrans.fillStyle(0x0f172a, 0.95);
            gTrans.fillRoundedRect(sx + 10, c1y, sw - 20, ch, 10);
            gTrans.lineStyle(1.5, 0x0284c7, 0.85);
            gTrans.strokeRoundedRect(sx + 10, c1y, sw - 20, ch, 10);

            // Mic badge
            gTrans.fillStyle(0x0284c7, 1);
            gTrans.fillCircle(sx + 24, c1y + 16, 8);
            gTrans.fillStyle(0xffffff, 1);
            gTrans.fillRect(sx + 22, c1y + 12, 4, 6);

            // Source Label: "English (US)"
            gTrans.fillStyle(0x94a3b8, 0.9);
            gTrans.fillRect(sx + 36, c1y + 13, 48, 5);

            // English Speech text: "Hello, how can I help you today?"
            gTrans.fillStyle(0xf8fafc, 0.95);
            gTrans.fillRect(sx + 18, c1y + 30, sw - 36, 6);
            gTrans.fillRect(sx + 18, c1y + 40, sw - 52, 6);

            // Audio Waveform Spectrum
            const transWave = [
                { x: sx + 20, h: 6 }, { x: sx + 26, h: 14 }, { x: sx + 32, h: 22 },
                { x: sx + 38, h: 10 }, { x: sx + 44, h: 18 }, { x: sx + 50, h: 26 },
                { x: sx + 56, h: 16 }, { x: sx + 62, h: 24 }, { x: sx + 68, h: 12 },
                { x: sx + 74, h: 20 }, { x: sx + 80, h: 8 }, { x: sx + 86, h: 15 },
                { x: sx + 92, h: 22 }, { x: sx + 98, h: 10 }
            ];
            transWave.forEach(bar => {
                gTrans.fillStyle(0x38bdf8, 0.95);
                gTrans.fillRoundedRect(bar.x, c1y + 64 - bar.h / 2, 3, bar.h, 1.5);
            });

            // 7. Middle Neural AI Translation Core
            const midY = c1y + ch + 18;
            // Connecting Synapse Lines
            gTrans.lineStyle(1.5, 0x00e5ff, 0.7);
            gTrans.lineBetween(px + pw / 2, c1y + ch, px + pw / 2, midY - 14);
            gTrans.lineBetween(px + pw / 2, midY + 14, px + pw / 2, midY + 28);

            // Glowing AI Brain / Translation Chip
            gTrans.fillStyle(0x00e5ff, 0.25);
            gTrans.fillCircle(px + pw / 2, midY, 18);
            gTrans.fillStyle(0x0e7490, 1);
            gTrans.fillCircle(px + pw / 2, midY, 13);
            gTrans.lineStyle(2, 0x22d3ee, 1);
            gTrans.strokeCircle(px + pw / 2, midY, 13);

            // Neural Node Dots
            gTrans.fillStyle(0xffffff, 1);
            gTrans.fillCircle(px + pw / 2, midY, 3.5);
            gTrans.fillCircle(px + pw / 2 - 6, midY - 4, 2);
            gTrans.fillCircle(px + pw / 2 + 6, midY - 4, 2);
            gTrans.fillCircle(px + pw / 2 - 5, midY + 5, 2);
            gTrans.fillCircle(px + pw / 2 + 5, midY + 5, 2);

            // 8. Target Translation Card (Spanish Output)
            const c2y = midY + 26;
            gTrans.fillStyle(0x062e24, 0.95);
            gTrans.fillRoundedRect(sx + 10, c2y, sw - 20, ch + 8, 10);
            gTrans.lineStyle(1.5, 0x059669, 0.9);
            gTrans.strokeRoundedRect(sx + 10, c2y, sw - 20, ch + 8, 10);

            // Speaker badge
            gTrans.fillStyle(0x059669, 1);
            gTrans.fillCircle(sx + 24, c2y + 16, 8);
            gTrans.fillStyle(0xffffff, 1);
            gTrans.fillTriangle(sx + 20, c2y + 16, sx + 27, c2y + 11, sx + 27, c2y + 21);

            // Target Label: "Spanish (ES)"
            gTrans.fillStyle(0x6ee7b7, 0.9);
            gTrans.fillRect(sx + 36, c2y + 13, 52, 5);

            // Spanish Translated text: "¡Hola! ¿Cómo puedo ayudarte hoy?"
            gTrans.fillStyle(0x34d399, 1); // Emerald highlighted text
            gTrans.fillRect(sx + 18, c2y + 30, sw - 36, 6);
            gTrans.fillRect(sx + 18, c2y + 40, sw - 44, 6);
            gTrans.fillRect(sx + 18, c2y + 50, 42, 6);

            // Active typing cursor on translation
            gTrans.fillStyle(0x10b981, 1);
            gTrans.fillRect(sx + 64, c2y + 49, 2.5, 9);

            // 9. Bottom Home Indicator Bar
            gTrans.fillStyle(0xffffff, 0.7);
            gTrans.fillRoundedRect(px + pw / 2 - 22, sy + sh - 8, 44, 3.5, 2);

            // 10. Specular Screen Glare
            gTrans.fillStyle(0xffffff, 0.05);
            gTrans.fillTriangle(sx, sy, sx + sw * 0.75, sy, sx, sy + sh * 0.65);

            gTrans.generateTexture('obj_translation_app', pw + 20, ph + 30);
            gTrans.destroy();
        }

        // =========================================================================
        // 3. AI ADAPTIVE LEARNING APPLICATION (obj_adaptive_learning: 260x260)
        // =========================================================================
        const gAdapt = scene.make.graphics({ x: 0, y: 0 });
        const monW = 236;
        const monH = 176;
        const monX = 12;
        const monY = 14;

        // Ambient Wall / Desk Backlight Glow (Purple / Cyan Ambient RGB)
        gAdapt.fillStyle(0x7c3aed, 0.18);
        gAdapt.fillRoundedRect(monX - 6, monY - 6, monW + 12, monH + 12, 16);
        gAdapt.fillStyle(0x06b6d4, 0.12);
        gAdapt.fillRoundedRect(monX - 2, monY - 2, monW + 4, monH + 4, 14);

        // Desk Contact Drop Shadow
        gAdapt.fillStyle(0x000000, 0.45);
        gAdapt.fillEllipse(130, 246, 170, 18);
        gAdapt.fillStyle(0x000000, 0.25);
        gAdapt.fillEllipse(130, 246, 200, 24);

        // Heavy Brushed Aluminum Ergonomic Monitor Stand
        // Vertical Pedestal Column
        gAdapt.fillStyle(0x334155, 1);
        gAdapt.fillRoundedRect(120, monY + monH - 8, 20, 52, 4);
        gAdapt.fillStyle(0x475569, 1);
        gAdapt.fillRect(124, monY + monH - 8, 12, 52);
        // Base Plate (Brushed Metal)
        gAdapt.fillStyle(0x1e293b, 1);
        gAdapt.fillRoundedRect(88, 230, 84, 14, 5);
        gAdapt.lineStyle(1.5, 0x64748b, 0.8);
        gAdapt.strokeRoundedRect(88, 230, 84, 14, 5);

        // Monitor Chassis (Bezel-less Obsidian Frame)
        gAdapt.fillStyle(0x0f172a, 1);
        gAdapt.fillRoundedRect(monX, monY, monW, monH, 10);
        gAdapt.lineStyle(2.5, 0x8b5cf6, 0.9); // Glowing Purple Edge Accent
        gAdapt.strokeRoundedRect(monX, monY, monW, monH, 10);

        // IPS Ultra-Wide Display Screen
        const scrX = monX + 6;
        const scrY = monY + 6;
        const scrW = monW - 12;
        const scrH = monH - 12;
        gAdapt.fillStyle(0x030712, 1); // Deep OLED Black
        gAdapt.fillRoundedRect(scrX, scrY, scrW, scrH, 7);

        // =========================================================================
        // TOP APP HEADER: [ 🎓 AI Adaptive Tutor ] | [ ⭐ Level 6 Mastery ] | [ ⚡ AI Mode: ON ]
        // =========================================================================
        gAdapt.fillStyle(0x111827, 0.95);
        gAdapt.fillRoundedRect(scrX + 6, scrY + 6, scrW - 12, 22, 5);
        gAdapt.lineStyle(1, 0x374151, 0.8);
        gAdapt.strokeRoundedRect(scrX + 6, scrY + 6, scrW - 12, 22, 5);

        // App Icon (Graduation Cap / AI Brain Badge)
        gAdapt.fillStyle(0x8b5cf6, 1);
        gAdapt.fillRoundedRect(scrX + 10, scrY + 9, 16, 16, 3.5);
        gAdapt.fillStyle(0xffffff, 1);
        gAdapt.fillTriangle(scrX + 18, scrY + 12, scrX + 12, scrY + 17, scrX + 24, scrY + 17);
        gAdapt.fillRect(scrX + 15, scrY + 18, 6, 4);

        // Title: "AI ADAPTIVE LEARNING ENGINE"
        gAdapt.fillStyle(0xf9fafb, 0.95);
        gAdapt.fillRect(scrX + 30, scrY + 13, 62, 5);
        gAdapt.fillStyle(0x06b6d4, 1);
        gAdapt.fillRect(scrX + 30, scrY + 19, 36, 2); // Cyan Underline

        // Level & Mastery XP Bar [ Level 6  ████████▒ 85% ]
        gAdapt.fillStyle(0x1f2937, 1);
        gAdapt.fillRoundedRect(scrX + 98, scrY + 10, 68, 14, 3);
        gAdapt.fillStyle(0xf59e0b, 1);
        gAdapt.fillRoundedRect(scrX + 100, scrY + 12, 46, 10, 2); // Gold XP fill
        gAdapt.fillStyle(0xffffff, 0.9);
        gAdapt.fillRect(scrX + 150, scrY + 14, 12, 6); // "85%"

        // Live Dynamic AI Status Badge [ ⚡ ADAPTIVE ]
        gAdapt.fillStyle(0x064e3b, 1);
        gAdapt.fillRoundedRect(scrX + scrW - 48, scrY + 10, 42, 14, 3);
        gAdapt.lineStyle(1, 0x10b981, 0.8);
        gAdapt.strokeRoundedRect(scrX + scrW - 48, scrY + 10, 42, 14, 3);
        gAdapt.fillStyle(0x34d399, 1);
        gAdapt.fillRect(scrX + scrW - 42, scrY + 14, 30, 6);

        // =========================================================================
        // LEFT COLUMN: DYNAMIC DIFFICULTY & LIVE QUESTION CARD
        // =========================================================================
        const qX = scrX + 6;
        const qY = scrY + 32;
        const qW = 126;
        const qH = 120;

        gAdapt.fillStyle(0x0b0f19, 0.95);
        gAdapt.fillRoundedRect(qX, qY, qW, qH, 6);
        gAdapt.lineStyle(1, 0x1e293b, 1);
        gAdapt.strokeRoundedRect(qX, qY, qW, qH, 6);

        // Live Question Header: "CURRENT CHALLENGE (ADAPTED)"
        gAdapt.fillStyle(0x6366f1, 1);
        gAdapt.fillRoundedRect(qX + 6, qY + 6, 52, 10, 2.5);
        gAdapt.fillStyle(0xffffff, 1);
        gAdapt.fillRect(qX + 10, qY + 9, 44, 4);

        // Question Difficulty Badge: [ HARD ⭐⭐⭐ ]
        gAdapt.fillStyle(0x831843, 1);
        gAdapt.fillRoundedRect(qX + 62, qY + 6, 56, 10, 2.5);
        gAdapt.fillStyle(0xf472b6, 1);
        gAdapt.fillRect(qX + 66, qY + 9, 48, 4);

        // Question Text Simulation Lines (Math & Logic Formula)
        gAdapt.fillStyle(0xe2e8f0, 0.95);
        gAdapt.fillRect(qX + 8, qY + 22, qW - 16, 5);
        gAdapt.fillRect(qX + 8, qY + 30, qW - 24, 5);

        // Interactive Multiple-Choice Option Cards (A, B, C)
        // Option A (Regular option)
        gAdapt.fillStyle(0x1e293b, 0.9);
        gAdapt.fillRoundedRect(qX + 8, qY + 40, qW - 16, 14, 3);
        gAdapt.fillStyle(0x94a3b8, 1);
        gAdapt.fillRect(qX + 12, qY + 44, 10, 6);
        gAdapt.fillRect(qX + 26, qY + 45, 60, 4);

        // Option B (Selected / Correct Answer - Glowing Emerald Green)
        gAdapt.fillStyle(0x064e3b, 1);
        gAdapt.fillRoundedRect(qX + 8, qY + 58, qW - 16, 15, 3);
        gAdapt.lineStyle(1.5, 0x10b981, 1);
        gAdapt.strokeRoundedRect(qX + 8, qY + 58, qW - 16, 15, 3);
        // Emerald Check Icon
        gAdapt.fillStyle(0x10b981, 1);
        gAdapt.fillCircle(qX + 16, qY + 65, 5);
        gAdapt.fillStyle(0xffffff, 1);
        gAdapt.fillRect(qX + 26, qY + 63, 64, 5);

        // Option C (Regular option)
        gAdapt.fillStyle(0x1e293b, 0.9);
        gAdapt.fillRoundedRect(qX + 8, qY + 77, qW - 16, 14, 3);
        gAdapt.fillStyle(0x94a3b8, 1);
        gAdapt.fillRect(qX + 12, qY + 81, 10, 6);
        gAdapt.fillRect(qX + 26, qY + 82, 54, 4);

        // AI Feedback Pill: "✓ Correct! Speed: 1.2s -> Next Card: Master Level"
        gAdapt.fillStyle(0x042f2e, 1);
        gAdapt.fillRoundedRect(qX + 6, qY + 96, qW - 12, 18, 3);
        gAdapt.lineStyle(1, 0x14b8a6, 0.8);
        gAdapt.strokeRoundedRect(qX + 6, qY + 96, qW - 12, 18, 3);
        gAdapt.fillStyle(0x2dd4bf, 1);
        gAdapt.fillRect(qX + 10, qY + 100, 16, 4);
        gAdapt.fillStyle(0x99f6e4, 1);
        gAdapt.fillRect(qX + 30, qY + 102, 78, 4);
        gAdapt.fillStyle(0x00e5ff, 1);
        gAdapt.fillRect(qX + 10, qY + 107, 98, 3.5);

        // =========================================================================
        // RIGHT COLUMN: 3 ADAPTIVE TIER QUEUE CARDS & AI NEURAL SKILL GRAPH
        // =========================================================================
        const rX = qX + qW + 6;
        const rY = scrY + 32;
        const rW = scrW - qW - 18;
        const rH = 120;

        gAdapt.fillStyle(0x0b0f19, 0.95);
        gAdapt.fillRoundedRect(rX, rY, rW, rH, 6);
        gAdapt.lineStyle(1, 0x1e293b, 1);
        gAdapt.strokeRoundedRect(rX, rY, rW, rH, 6);

        // Header: "ADAPTIVE PATHWAY"
        gAdapt.fillStyle(0xa855f7, 1);
        gAdapt.fillRect(rX + 8, rY + 6, 64, 5);

        // Tier 1 Card: "1. Basic Algebra" (Completed ✓)
        const t1Y = rY + 16;
        gAdapt.fillStyle(0x064e3b, 0.9);
        gAdapt.fillRoundedRect(rX + 6, t1Y, rW - 12, 28, 4);
        gAdapt.lineStyle(1, 0x059669, 0.8);
        gAdapt.strokeRoundedRect(rX + 6, t1Y, rW - 12, 28, 4);
        // Level icon
        gAdapt.fillStyle(0x10b981, 1);
        gAdapt.fillCircle(rX + 14, t1Y + 14, 5.5);
        gAdapt.fillStyle(0xffffff, 1);
        gAdapt.fillRect(rX + 24, t1Y + 8, 40, 5);
        gAdapt.fillStyle(0x6ee7b7, 1);
        gAdapt.fillRect(rX + 24, t1Y + 16, 32, 4);
        // Check badge
        gAdapt.fillStyle(0x22c55e, 1);
        gAdapt.fillCircle(rX + rW - 18, t1Y + 14, 5);

        // Connector Flow Arrow 1 ➔ 2
        gAdapt.fillStyle(0x38bdf8, 1);
        gAdapt.fillTriangle(rX + rW / 2, t1Y + 31, rX + rW / 2 - 4, t1Y + 28, rX + rW / 2 + 4, t1Y + 28);

        // Tier 2 Card: "2. Logic & Geometry" (Current Adapted Step ⚡)
        const t2Y = t1Y + 32;
        gAdapt.fillStyle(0x1e1b4b, 0.95);
        gAdapt.fillRoundedRect(rX + 6, t2Y, rW - 12, 30, 4);
        gAdapt.lineStyle(1.5, 0x6366f1, 1);
        gAdapt.strokeRoundedRect(rX + 6, t2Y, rW - 12, 30, 4);
        // Active Pulse Icon
        gAdapt.fillStyle(0x6366f1, 1);
        gAdapt.fillCircle(rX + 14, t2Y + 15, 6);
        gAdapt.fillStyle(0x00e5ff, 1);
        gAdapt.fillCircle(rX + 14, t2Y + 15, 3);
        gAdapt.fillStyle(0xffffff, 1);
        gAdapt.fillRect(rX + 24, t2Y + 8, 44, 5);
        gAdapt.fillStyle(0x818cf8, 1);
        gAdapt.fillRect(rX + 24, t2Y + 16, 36, 4);
        // Dynamic "ADAPTING..." Pulse Badge
        gAdapt.fillStyle(0xf59e0b, 1);
        gAdapt.fillCircle(rX + rW - 18, t2Y + 15, 5);

        // Connector Flow Arrow 2 ➔ 3
        gAdapt.fillStyle(0xc084fc, 1);
        gAdapt.fillTriangle(rX + rW / 2, t2Y + 33, rX + rW / 2 - 4, t2Y + 30, rX + rW / 2 + 4, t2Y + 30);

        // Tier 3 Card: "3. Master AI Reasoning" (Unlocked Challenge 🔓 ⭐)
        const t3Y = t2Y + 34;
        gAdapt.fillStyle(0x3b0764, 0.95);
        gAdapt.fillRoundedRect(rX + 6, t3Y, rW - 12, 28, 4);
        gAdapt.lineStyle(1.5, 0xc084fc, 0.9);
        gAdapt.strokeRoundedRect(rX + 6, t3Y, rW - 12, 28, 4);
        // Star Trophy Icon
        gAdapt.fillStyle(0xfacc15, 1);
        gAdapt.fillCircle(rX + 14, t3Y + 14, 6);
        gAdapt.fillStyle(0xffffff, 1);
        gAdapt.fillRect(rX + 24, t3Y + 8, 38, 5);
        gAdapt.fillStyle(0xe879f9, 1);
        gAdapt.fillRect(rX + 24, t3Y + 16, 28, 4);
        // Golden Star Badge
        gAdapt.fillStyle(0xfacc15, 1);
        gAdapt.fillCircle(rX + rW - 18, t3Y + 14, 5.5);

        // Diagonal Screen Glass Glare
        gAdapt.fillStyle(0xffffff, 0.05);
        gAdapt.fillTriangle(scrX, scrY, scrX + scrW * 0.7, scrY, scrX, scrY + scrH * 0.6);

        // Desktop Accessories: Modern Slim Keyboard & Ergonomic Mouse
        // RGB Mechanical Keyboard
        gAdapt.fillStyle(0x1e293b, 1);
        gAdapt.fillRoundedRect(68, 238, 86, 12, 3);
        gAdapt.lineStyle(1, 0x475569, 0.8);
        gAdapt.strokeRoundedRect(68, 238, 86, 12, 3);
        // Keyboard Underglow RGB
        gAdapt.fillStyle(0x00e5ff, 0.5);
        gAdapt.fillRect(72, 248, 78, 1.5);
        // Key rows
        gAdapt.fillStyle(0x334155, 1);
        gAdapt.fillRect(72, 240, 78, 3);
        gAdapt.fillRect(72, 244, 78, 3);

        // Wireless Ergonomic Mouse
        gAdapt.fillStyle(0x1e293b, 1);
        gAdapt.fillRoundedRect(164, 237, 18, 14, 5);
        gAdapt.lineStyle(1, 0x475569, 0.8);
        gAdapt.strokeRoundedRect(164, 237, 18, 14, 5);
        // Mouse Scroll Wheel (Cyan RGB LED)
        gAdapt.fillStyle(0x00e5ff, 1);
        gAdapt.fillRoundedRect(171, 239, 4, 5, 1);

        gAdapt.generateTexture('obj_adaptive_learning', 260, 260);
        gAdapt.destroy();

        // =========================================================================
        // 4. AI CAMERA RECOGNITION MOBILE APP (obj_camera_plant: 180x370)
        // =========================================================================
        {
            const gPlant = scene.make.graphics({ x: 0, y: 0 });
            const pw = 160;
            const ph = 340;
            const px = 10;
            const py = 10;
            const pr = 26;

            // 1. Desk Contact Drop Shadow
            gPlant.fillStyle(0x000000, 0.45);
            gPlant.fillEllipse(px + pw / 2, py + ph + 8, pw * 0.78, 16);

            // 2. Phone Outer Chassis (Sleek Dark Titanium / Space Black)
            gPlant.fillStyle(0x121316, 1);
            gPlant.fillRoundedRect(px, py, pw, ph, pr);
            // Metallic Rim & Bevel Highlight
            gPlant.lineStyle(2.5, 0x3f3f46, 1);
            gPlant.strokeRoundedRect(px, py, pw, ph, pr);

            // Side Physical Buttons (Volume & Power)
            gPlant.fillStyle(0x52525b, 1);
            gPlant.fillRoundedRect(px - 2, py + 60, 2, 28, 1); // Volume Up
            gPlant.fillRoundedRect(px - 2, py + 95, 2, 28, 1); // Volume Down
            gPlant.fillRoundedRect(px + pw, py + 75, 2, 40, 1); // Action Button

            // 3. OLED Edge-to-Edge Display
            const sx = px + 6;
            const sy = py + 6;
            const sw = pw - 12;
            const sh = ph - 12;
            const sr = pr - 4;

            gPlant.fillStyle(0x050811, 1);
            gPlant.fillRoundedRect(sx, sy, sw, sh, sr);
            gPlant.lineStyle(1, 0x1e293b, 0.8);
            gPlant.strokeRoundedRect(sx, sy, sw, sh, sr);

            // 4. Top Status Bar & Dynamic Island
            // Dynamic Island Capsule
            gPlant.fillStyle(0x000000, 1);
            gPlant.fillRoundedRect(px + pw / 2 - 22, sy + 6, 44, 13, 6.5);
            // Camera sensor optical reflection
            gPlant.fillStyle(0x0284c7, 0.8);
            gPlant.fillCircle(px + pw / 2 + 10, sy + 12.5, 2.5);

            // Status Bar: Time & Signals
            gPlant.fillStyle(0xf1f5f9, 0.9);
            gPlant.fillRect(sx + 12, sy + 9, 18, 5); // "09:41"
            // 5G Signal Bars
            for (let b = 0; b < 4; b++) {
                gPlant.fillRect(sx + sw - 42 + b * 4, sy + 13 - b * 2, 2.5, 3 + b * 2);
            }
            // Battery Indicator
            gPlant.lineStyle(1, 0x94a3b8, 0.9);
            gPlant.strokeRoundedRect(sx + sw - 22, sy + 8, 14, 7, 2);
            gPlant.fillStyle(0x10b981, 1);
            gPlant.fillRect(sx + sw - 20, sy + 10, 9, 3.5); // Green 90% charge

            // =========================================================================
            // 5. LIVE CAMERA VIEWFINDER SCENE (Botanical Plant Subject)
            // =========================================================================
            // Camera Viewfinder Background
            gPlant.fillStyle(0x091428, 1);
            gPlant.fillRect(sx, sy + 24, sw, sh - 90);

            // Rule-of-Thirds Composition Grid
            gPlant.lineStyle(1, 0xffffff, 0.08);
            gPlant.lineBetween(sx + sw / 3, sy + 24, sx + sw / 3, sy + sh - 66);
            gPlant.lineBetween(sx + (sw * 2) / 3, sy + 24, sx + (sw * 2) / 3, sy + sh - 66);
            gPlant.lineBetween(sx, sy + 24 + (sh - 90) / 3, sx + sw, sy + 24 + (sh - 90) / 3);
            gPlant.lineBetween(sx, sy + 24 + ((sh - 90) * 2) / 3, sx + sw, sy + 24 + ((sh - 90) * 2) / 3);

            // Live Specimen Subject (Monstera Plant in Viewfinder)
            const plantCenterX = sx + sw / 2;
            const plantCenterY = sy + 115;

            // Pot in Viewfinder
            gPlant.fillStyle(0xe2e8f0, 1);
            gPlant.beginPath();
            gPlant.moveTo(plantCenterX - 22, plantCenterY + 45);
            gPlant.lineTo(plantCenterX + 22, plantCenterY + 45);
            gPlant.lineTo(plantCenterX + 16, plantCenterY + 75);
            gPlant.lineTo(plantCenterX - 16, plantCenterY + 75);
            gPlant.closePath();
            gPlant.fillPath();
            gPlant.fillStyle(0x94a3b8, 0.5);
            gPlant.fillRoundedRect(plantCenterX - 24, plantCenterY + 43, 48, 5, 2); // Rim

            // Stems
            gPlant.lineStyle(2.5, 0x14532d, 1);
            gPlant.beginPath();
            gPlant.moveTo(plantCenterX, plantCenterY + 45);
            gPlant.lineTo(plantCenterX, plantCenterY);
            gPlant.lineTo(plantCenterX - 26, plantCenterY - 24);
            gPlant.moveTo(plantCenterX, plantCenterY + 20);
            gPlant.lineTo(plantCenterX + 28, plantCenterY - 18);
            gPlant.strokePath();

            // Layered Leaves
            // Dark Leaves
            gPlant.fillStyle(0x064e3b, 0.95);
            gPlant.fillEllipse(plantCenterX - 26, plantCenterY - 24, 22, 16);
            gPlant.fillEllipse(plantCenterX + 28, plantCenterY - 18, 20, 15);
            gPlant.fillEllipse(plantCenterX, plantCenterY - 32, 24, 18);
            // Lush Midground Leaves
            gPlant.fillStyle(0x059669, 1);
            gPlant.fillEllipse(plantCenterX - 16, plantCenterY - 10, 24, 16);
            gPlant.fillEllipse(plantCenterX + 18, plantCenterY - 6, 26, 17);
            gPlant.fillEllipse(plantCenterX, plantCenterY - 18, 28, 19);
            // Bright Foreground Highlights
            gPlant.fillStyle(0x10b981, 1);
            gPlant.fillEllipse(plantCenterX - 8, plantCenterY - 12, 18, 12);
            gPlant.fillEllipse(plantCenterX + 10, plantCenterY - 8, 19, 13);
            // Leaf Fenestrations (Slots)
            gPlant.fillStyle(0x022c22, 0.7);
            gPlant.fillEllipse(plantCenterX - 14, plantCenterY - 12, 3, 7);
            gPlant.fillEllipse(plantCenterX + 16, plantCenterY - 8, 3, 8);
            gPlant.lineStyle(1, 0x6ee7b7, 0.85);
            gPlant.lineBetween(plantCenterX, plantCenterY - 2, plantCenterX, plantCenterY - 28);

            // =========================================================================
            // 6. AR COMPUTER VISION BOUNDING BOX & AI SCANNER RETICLE
            // =========================================================================
            const retX = plantCenterX - 45;
            const retY = plantCenterY - 44;
            const retW = 90;
            const retH = 100;
            const rLen = 14;

            // Animated High-Contrast Cyan Targeting Brackets
            gPlant.lineStyle(2.5, 0x00e5ff, 1);
            // Top-Left
            gPlant.beginPath();
            gPlant.moveTo(retX, retY + rLen);
            gPlant.lineTo(retX, retY);
            gPlant.lineTo(retX + rLen, retY);
            gPlant.strokePath();
            // Top-Right
            gPlant.beginPath();
            gPlant.moveTo(retX + retW, retY + rLen);
            gPlant.lineTo(retX + retW, retY);
            gPlant.lineTo(retX + retW - rLen, retY);
            gPlant.strokePath();
            // Bottom-Left
            gPlant.beginPath();
            gPlant.moveTo(retX, retY + retH - rLen);
            gPlant.lineTo(retX, retY + retH);
            gPlant.lineTo(retX + rLen, retY + retH);
            gPlant.strokePath();
            // Bottom-Right
            gPlant.beginPath();
            gPlant.moveTo(retX + retW, retY + retH - rLen);
            gPlant.lineTo(retX + retW, retY + retH);
            gPlant.lineTo(retX + retW - rLen, retY + retH);
            gPlant.strokePath();

            // Horizontal Scanning Laser Line across Subject
            gPlant.lineStyle(2, 0x00e5ff, 0.95);
            gPlant.lineBetween(retX - 6, plantCenterY - 5, retX + retW + 6, plantCenterY - 5);
            gPlant.fillStyle(0x00e5ff, 0.25);
            gPlant.fillRect(retX - 6, plantCenterY - 7, retW + 12, 4);

            // Neural Landmark Vertex Tracking Dots
            const landmarks = [
                { x: plantCenterX - 24, y: plantCenterY - 24 },
                { x: plantCenterX, y: plantCenterY - 32 },
                { x: plantCenterX + 26, y: plantCenterY - 18 },
                { x: plantCenterX - 14, y: plantCenterY - 10 },
                { x: plantCenterX + 16, y: plantCenterY - 6 },
                { x: plantCenterX, y: plantCenterY + 25 }
            ];

            // Synapse Connection Lines
            gPlant.lineStyle(1, 0x00e5ff, 0.4);
            gPlant.lineBetween(landmarks[0].x, landmarks[0].y, landmarks[1].x, landmarks[1].y);
            gPlant.lineBetween(landmarks[1].x, landmarks[1].y, landmarks[2].x, landmarks[2].y);
            gPlant.lineBetween(landmarks[3].x, landmarks[3].y, landmarks[4].x, landmarks[4].y);
            gPlant.lineBetween(landmarks[1].x, landmarks[1].y, landmarks[5].x, landmarks[5].y);

            landmarks.forEach(lm => {
                gPlant.fillStyle(0x00e5ff, 0.4);
                gPlant.fillCircle(lm.x, lm.y, 4);
                gPlant.fillStyle(0x22c55e, 1);
                gPlant.fillCircle(lm.x, lm.y, 2);
            });

            // Top Viewfinder Quick Controls (Flash & Info)
            gPlant.fillStyle(0x0f172a, 0.7);
            gPlant.fillCircle(sx + 18, sy + 38, 10);
            gPlant.fillStyle(0xffffff, 0.9);
            gPlant.fillTriangle(sx + 18, sy + 33, sx + 14, sy + 40, sx + 22, sy + 40); // Flash icon
            gPlant.fillStyle(0x0f172a, 0.7);
            gPlant.fillCircle(sx + sw - 18, sy + 38, 10);
            gPlant.fillStyle(0x00e5ff, 1);
            gPlant.fillCircle(sx + sw - 18, sy + 38, 3.5); // AI Vision mode dot

            // =========================================================================
            // 7. REALISTIC AI RECOGNITION BOTTOM SHEET / VISUAL LOOKUP CARD
            // =========================================================================
            const cardY = sy + sh - 130;
            const cardH = 80;

            // Frosted Glass Card Body
            gPlant.fillStyle(0x00e5ff, 0.12);
            gPlant.fillRoundedRect(sx + 4, cardY - 2, sw - 8, cardH + 4, 12);
            gPlant.fillStyle(0x091224, 0.96);
            gPlant.fillRoundedRect(sx + 6, cardY, sw - 12, cardH, 10);
            gPlant.lineStyle(1.5, 0x00e5ff, 0.85);
            gPlant.strokeRoundedRect(sx + 6, cardY, sw - 12, cardH, 10);

            // Top Drag Handle Indicator
            gPlant.fillStyle(0x64748b, 0.8);
            gPlant.fillRoundedRect(px + pw / 2 - 14, cardY + 4, 28, 3, 1.5);

            // Left Thumbnail Specimen Badge
            gPlant.fillStyle(0x064e3b, 1);
            gPlant.fillRoundedRect(sx + 12, cardY + 12, 34, 34, 6);
            gPlant.lineStyle(1, 0x10b981, 1);
            gPlant.strokeRoundedRect(sx + 12, cardY + 12, 34, 34, 6);
            // Mini Leaf Icon in Thumbnail
            gPlant.fillStyle(0x10b981, 1);
            gPlant.fillEllipse(sx + 29, cardY + 29, 10, 7);
            gPlant.fillStyle(0x34d399, 1);
            gPlant.fillCircle(sx + 40, cardY + 18, 4); // Green checkmark dot

            // Identification Title & Category
            gPlant.fillStyle(0xffffff, 0.98);
            gPlant.fillRect(sx + 52, cardY + 14, 58, 6); // "Monstera Deliciosa" text bar
            gPlant.fillStyle(0x94a3b8, 0.85);
            gPlant.fillRect(sx + 52, cardY + 23, 42, 4); // "Araceae • Plant"

            // Confidence Pill: [ 99.4% AI Match ]
            gPlant.fillStyle(0x064e3b, 1);
            gPlant.fillRoundedRect(sx + 52, cardY + 31, 64, 12, 3);
            gPlant.lineStyle(1, 0x10b981, 0.8);
            gPlant.strokeRoundedRect(sx + 52, cardY + 31, 64, 12, 3);
            gPlant.fillStyle(0x10b981, 1);
            gPlant.fillRect(sx + 55, cardY + 34, 38, 6); // Green bar
            gPlant.fillStyle(0xffffff, 0.9);
            gPlant.fillRect(sx + 96, cardY + 35, 16, 4); // "99%"

            // Action Quick Chips (Bottom of card)
            gPlant.fillStyle(0x1e293b, 1);
            gPlant.fillRoundedRect(sx + 12, cardY + 52, 56, 18, 4);
            gPlant.fillStyle(0x38bdf8, 0.95);
            gPlant.fillRect(sx + 18, cardY + 59, 44, 4); // "Search Info"

            gPlant.fillStyle(0x0284c7, 1);
            gPlant.fillRoundedRect(sx + 74, cardY + 52, 54, 18, 4);
            gPlant.fillStyle(0xffffff, 0.95);
            gPlant.fillRect(sx + 80, cardY + 59, 42, 4); // "Save Plant"

            // =========================================================================
            // 8. BOTTOM CAMERA SHUTTER & MODE DOCK BAR
            // =========================================================================
            // Camera Mode Selector Tabs: [ Text | Plant AI | Translate ]
            gPlant.fillStyle(0x0284c7, 0.9);
            gPlant.fillRoundedRect(px + pw / 2 - 28, sy + sh - 46, 56, 12, 4);
            gPlant.fillStyle(0xffffff, 1);
            gPlant.fillRect(px + pw / 2 - 22, sy + sh - 42, 44, 4); // "PLANT AI" active tab

            // Shutter Button Outer AI Gradient Glow
            gPlant.fillStyle(0x00e5ff, 0.35);
            gPlant.fillCircle(px + pw / 2, sy + sh - 18, 16);
            // Shutter Outer Ring
            gPlant.fillStyle(0x1e293b, 1);
            gPlant.fillCircle(px + pw / 2, sy + sh - 18, 14);
            gPlant.lineStyle(2, 0x00e5ff, 1);
            gPlant.strokeCircle(px + pw / 2, sy + sh - 18, 14);
            // Shutter Core Button
            gPlant.fillStyle(0xffffff, 1);
            gPlant.fillCircle(px + pw / 2, sy + sh - 18, 10);

            // Specular Screen Reflection
            gPlant.fillStyle(0xffffff, 0.04);
            gPlant.fillTriangle(sx, sy, sx + sw * 0.75, sy, sx, sy + sh * 0.65);

            gPlant.generateTexture('obj_camera_plant', pw + 20, ph + 30);
            gPlant.destroy();
        }

        // =========================================================================
        // 5. BASIC POCKET CALCULATOR (obj_calculator: 130x150)
        // =========================================================================
        const gCalc = scene.make.graphics({ x: 0, y: 0 });
        // Table Shadow
        gCalc.fillStyle(0x000000, 0.35);
        gCalc.fillRoundedRect(22, 16, 90, 126, 12);

        // Durable Matte Plastic Calculator Casing
        gCalc.fillStyle(0x1e293b, 1);
        gCalc.fillRoundedRect(18, 12, 94, 128, 10);
        gCalc.lineStyle(2, 0x475569, 1);
        gCalc.strokeRoundedRect(18, 12, 94, 128, 10);

        // Photovoltaic Solar Cell Panel Strip
        gCalc.fillStyle(0x020617, 1);
        gCalc.fillRoundedRect(68, 20, 36, 14, 2);
        gCalc.fillStyle(0x78350f, 0.85);
        gCalc.fillRect(70, 22, 32, 10);
        gCalc.lineStyle(1, 0x451a03, 1);
        gCalc.lineBetween(78, 22, 78, 32);
        gCalc.lineBetween(86, 22, 86, 32);
        gCalc.lineBetween(94, 22, 94, 32);

        // 7-Segment LCD Display Window (Fixed Arithmetic 2+2=4)
        gCalc.fillStyle(0x84cc16, 0.65); // Classic greenish-grey LCD
        gCalc.fillRoundedRect(24, 38, 82, 24, 3);
        gCalc.lineStyle(1.5, 0x14532d, 0.8);
        gCalc.strokeRoundedRect(24, 38, 82, 24, 3);

        // Fixed Math Expression Segment Bars "2 + 2 = 4"
        gCalc.fillStyle(0x0f172a, 0.95);
        // "2"
        gCalc.fillRect(32, 44, 8, 2);
        gCalc.fillRect(38, 46, 2, 4);
        gCalc.fillRect(32, 50, 8, 2);
        gCalc.fillRect(32, 52, 2, 4);
        gCalc.fillRect(32, 56, 8, 2);
        // "+"
        gCalc.fillRect(46, 49, 6, 2);
        gCalc.fillRect(48, 47, 2, 6);
        // "2"
        gCalc.fillRect(58, 44, 8, 2);
        gCalc.fillRect(64, 46, 2, 4);
        gCalc.fillRect(58, 50, 8, 2);
        gCalc.fillRect(58, 52, 2, 4);
        gCalc.fillRect(58, 56, 8, 2);
        // "="
        gCalc.fillRect(72, 48, 6, 2);
        gCalc.fillRect(72, 52, 6, 2);
        // "4"
        gCalc.fillRect(84, 44, 2, 7);
        gCalc.fillRect(84, 50, 8, 2);
        gCalc.fillRect(90, 44, 2, 14);

        // Rubber Keypad Grid (Numbers 0-9, Operators, Clear)
        const keyColors = [
            [0xef4444, 0x475569, 0x0284c7], // Row 1: C/AC, +/-, /
            [0x334155, 0x334155, 0x0284c7], // Row 2: 7, 8, *
            [0x334155, 0x334155, 0x0284c7], // Row 3: 4, 5, -
            [0x334155, 0x334155, 0x22c55e], // Row 4: 1, 2, +
            [0x334155, 0x334155, 0x22c55e]  // Row 5: 0, ., =
        ];
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 3; c++) {
                const kx = 26 + c * 27;
                const ky = 68 + r * 13;
                gCalc.fillStyle(keyColors[r][c], 1);
                gCalc.fillRoundedRect(kx, ky, 22, 10, 2);
                gCalc.fillStyle(0xffffff, 0.85);
                gCalc.fillRect(kx + 4, ky + 2, 14, 2); // Key top highlight
            }
        }

        gCalc.generateTexture('obj_calculator', 130, 150);
        gCalc.destroy();

        // =========================================================================
        // 6. CEILING SLIDE PROJECTOR (obj_projector: 170x130)
        // =========================================================================
        const gProj = scene.make.graphics({ x: 0, y: 0 });
        // Ceiling Mount Flange & Extension Column
        gProj.fillStyle(0x334155, 1);
        gProj.fillRect(76, 0, 18, 38);
        gProj.fillStyle(0x64748b, 1);
        gProj.fillRect(66, 0, 38, 8); // Ceiling plate
        gProj.fillCircle(85, 38, 8); // Swivel tension knuckle

        // Heavy Industrial Projector Body
        gProj.fillStyle(0x0f172a, 1);
        gProj.fillRoundedRect(25, 42, 120, 56, 8);
        gProj.lineStyle(3, 0x475569, 1);
        gProj.strokeRoundedRect(25, 42, 120, 56, 8);

        // Ventilation Fan Grill Slits
        gProj.fillStyle(0x1e293b, 1);
        for (let lx = 34; lx < 80; lx += 8) {
            gProj.fillRect(lx, 50, 4, 38);
        }

        // Power Status LEDs & Control Panel
        gProj.fillStyle(0x22c55e, 1);
        gProj.fillCircle(95, 54, 3.5); // Lamp Power ON
        gProj.fillStyle(0xf59e0b, 1);
        gProj.fillCircle(105, 54, 3.5); // Temp OK

        // Top Slide Carousel Slot
        gProj.fillStyle(0x334155, 1);
        gProj.fillRect(55, 38, 50, 6);

        // Optical Lens Barrel with Anti-Reflective Blue Coating
        gProj.fillStyle(0x1e293b, 1);
        gProj.fillRoundedRect(138, 54, 24, 32, 4);
        gProj.fillStyle(0x00e5ff, 0.9);
        gProj.fillCircle(150, 70, 14);
        gProj.fillStyle(0xffffff, 0.95);
        gProj.fillCircle(146, 66, 4.5); // Specular lens glare

        // Projected Optical Light Cone Beam
        gProj.fillStyle(0xfef08a, 0.25);
        gProj.beginPath();
        gProj.moveTo(150, 70);
        gProj.lineTo(170, 30);
        gProj.lineTo(170, 110);
        gProj.closePath();
        gProj.fillPath();

        gProj.generateTexture('obj_projector', 170, 130);
        gProj.destroy();

        // =========================================================================
        // 7. CLASSROOM PAPER PRINTER (obj_printer: 170x150)
        // =========================================================================
        const gPrn = scene.make.graphics({ x: 0, y: 0 });
        // Table Drop Shadow
        gPrn.fillStyle(0x000000, 0.4);
        gPrn.fillRect(18, 138, 134, 10);

        // Printer Chassis (Multi-Tier Body)
        gPrn.fillStyle(0x1e293b, 1);
        gPrn.fillRoundedRect(18, 45, 134, 90, 10);
        gPrn.lineStyle(3, 0x475569, 1);
        gPrn.strokeRoundedRect(18, 45, 134, 90, 10);

        // Rear Paper Input Tray & Fresh Paper Stack
        gPrn.fillStyle(0x334155, 1);
        gPrn.fillRoundedRect(35, 12, 100, 38, 4);
        gPrn.fillStyle(0xffffff, 0.98); // White Paper Stack
        gPrn.fillRect(45, 16, 80, 34);
        gPrn.fillStyle(0xe2e8f0, 1);
        gPrn.fillRect(47, 18, 76, 32);

        // Front LCD Display Panel & Buttons
        gPrn.fillStyle(0x0f172a, 1);
        gPrn.fillRoundedRect(28, 54, 48, 22, 4);
        gPrn.fillStyle(0x38bdf8, 0.8);
        gPrn.fillRect(32, 58, 40, 14); // Mini LCD Screen
        gPrn.fillStyle(0x22c55e, 1);
        gPrn.fillCircle(86, 65, 4); // Green Print Button
        gPrn.fillStyle(0xef4444, 1);
        gPrn.fillCircle(98, 65, 4); // Red Cancel Button

        // 4 CMYK Ink Level Gauges
        const cmyk = [0x00e5ff, 0xec4899, 0xfde047, 0x0f172a];
        cmyk.forEach((cc, i) => {
            gPrn.fillStyle(cc, 1);
            gPrn.fillRect(112 + i * 8, 58, 5, 14);
        });

        // Output Slot & Paper Feed Roller Wheels
        gPrn.fillStyle(0x020617, 1);
        gPrn.fillRect(30, 92, 110, 12);
        gPrn.fillStyle(0x64748b, 1);
        gPrn.fillCircle(45, 98, 4);
        gPrn.fillCircle(85, 98, 4);
        gPrn.fillCircle(125, 98, 4);

        // Printed Output Document Sliding Out
        gPrn.fillStyle(0xffffff, 1);
        gPrn.fillRect(40, 98, 90, 42);
        gPrn.lineStyle(1, 0xcb9a67, 0.6);
        gPrn.strokeRect(40, 98, 90, 42);
        // Printed Graphics and Text Lines on Output Paper
        gPrn.fillStyle(0xef4444, 1);
        gPrn.fillRect(46, 105, 30, 4);
        gPrn.fillStyle(0x0284c7, 1);
        gPrn.fillRect(46, 113, 76, 4);
        gPrn.fillStyle(0x10b981, 1);
        gPrn.fillRect(46, 121, 62, 4);
        gPrn.fillStyle(0x0f172a, 1);
        gPrn.fillRect(46, 129, 48, 4);

        gPrn.generateTexture('obj_printer', 170, 150);
        gPrn.destroy();

        // =========================================================================
        // 8. ELECTRIC DESK FAN (obj_fan: 140x175)
        // =========================================================================
        const gFan = scene.make.graphics({ x: 0, y: 0 });
        const fx = 70;
        const fy = 62;

        // Table Shadow
        gFan.fillStyle(0x000000, 0.35);
        gFan.fillEllipse(fx, 162, 54, 12);

        // Heavy Pedestal Base
        gFan.fillStyle(0x1e293b, 1);
        gFan.fillEllipse(fx, 150, 44, 16);
        gFan.lineStyle(2, 0x475569, 1);
        gFan.strokeEllipse(fx, 150, 44, 16);

        // Mechanical Push Button Speed Switches (0, 1, 2, 3)
        const btnColors = [0xef4444, 0x64748b, 0x64748b, 0x38bdf8];
        btnColors.forEach((bc, i) => {
            gFan.fillStyle(bc, 1);
            gFan.fillRoundedRect(fx - 20 + i * 11, 145, 8, 8, 2);
        });

        // Tubular Chrome Support Neck & Tilt Adjustment Knob
        gFan.fillStyle(0x94a3b8, 1);
        gFan.fillRect(fx - 5, 108, 10, 40);
        gFan.fillStyle(0x334155, 1);
        gFan.fillCircle(fx + 9, 114, 5); // Tension knob

        // Rear Motor Housing Cylinder & Oscillation Pin
        gFan.fillStyle(0x0f172a, 1);
        gFan.fillRoundedRect(fx - 18, fy - 18, 36, 36, 6);
        gFan.fillStyle(0x64748b, 1);
        gFan.fillRect(fx - 3, fy - 26, 6, 10); // Oscillation pull knob

        // 3 Aerodynamic Translucent Fan Blades
        gFan.fillStyle(0x0284c7, 0.82);
        for (let i = 0; i < 3; i++) {
            const ang = (i * Math.PI * 2) / 3 - Math.PI / 6;
            const bx = fx + Math.cos(ang) * 26;
            const by = fy + Math.sin(ang) * 26;
            gFan.fillEllipse(bx, by, 32, 16);
        }

        // Central Motor Hub Spinner
        gFan.fillStyle(0x1e293b, 1);
        gFan.fillCircle(fx, fy, 14);
        gFan.fillStyle(0xd97706, 1);
        gFan.fillCircle(fx, fy, 6);

        // Outer Wire Safety Mesh Cage (Concentric Rings & Radial Spokes)
        gFan.lineStyle(3, 0x0284c7, 1);
        gFan.strokeCircle(fx, fy, 48); // Outer protective rim
        gFan.lineStyle(1.5, 0x38bdf8, 0.7);
        gFan.strokeCircle(fx, fy, 36); // Middle wire ring
        gFan.strokeCircle(fx, fy, 24); // Inner wire ring

        // Radial Spokes
        for (let a = 0; a < 8; a++) {
            const rad = (a * Math.PI) / 4;
            gFan.lineBetween(
                fx + Math.cos(rad) * 14,
                fy + Math.sin(rad) * 14,
                fx + Math.cos(rad) * 48,
                fy + Math.sin(rad) * 48
            );
        }

        gFan.generateTexture('obj_fan', 140, 175);
        gFan.destroy();
    }

    private static generateStreetObjects(scene: Scene) {
        // Zone 3 objects are loaded as high-fidelity AI-generated assets in Preloader.ts:
        // - obj_map_app (Smart Map & Route App)
        // - obj_delivery_robot (Autonomous Delivery Bot)
        // - obj_traffic_cam (Adaptive Traffic Camera)
        // - obj_visual_search (Visual Landmark Search Phone)
        // - obj_bicycle (Regular Commuter Bicycle)
        // - obj_crossing_timer (Countdown Crossing Light)
        // - obj_vending_machine (Traditional Vending Machine)
        // - obj_streetlight (Fixed-Timer Streetlight)
        const streetTextures: Array<{ key: string; w: number; h: number; color: number }> = [
            { key: 'obj_map_app', w: 135, h: 275, color: 0x0284c7 },
            { key: 'obj_delivery_robot', w: 220, h: 178, color: 0x00e5ff },
            { key: 'obj_traffic_cam', w: 130, h: 138, color: 0x10b981 },
            { key: 'obj_visual_search', w: 135, h: 297, color: 0x8b5cf6 },
            { key: 'obj_bicycle', w: 240, h: 179, color: 0x0d9488 },
            { key: 'obj_crossing_timer', w: 80, h: 397, color: 0xf59e0b },
            { key: 'obj_vending_machine', w: 160, h: 251, color: 0xef4444 },
            { key: 'obj_streetlight', w: 55, h: 405, color: 0x64748b }
        ];

        streetTextures.forEach(item => {
            if (!scene.textures.exists(item.key)) {
                const g = scene.make.graphics({ x: 0, y: 0 });
                g.fillStyle(item.color, 1);
                g.fillRoundedRect(0, 0, item.w, item.h, 8);
                g.generateTexture(item.key, item.w, item.h);
                g.destroy();
            }
        });
    }

    // ==========================================
    // 7. SCENERY PROPS & PARALLAX ASSETS
    // ==========================================

    private static generateSceneryProps(scene: Scene) {
        // 1. Cozy Living Room Sofa (prop_sofa: 360x160)
        const gSofa = scene.make.graphics({ x: 0, y: 0 });
        gSofa.fillStyle(0x0d9488, 1); // Teal fabric
        gSofa.fillRoundedRect(20, 40, 320, 90, 24); // Backrest
        gSofa.fillStyle(0x14b8a6, 1);
        gSofa.fillRoundedRect(10, 80, 50, 60, 16); // Left armrest
        gSofa.fillRoundedRect(300, 80, 50, 60, 16); // Right armrest
        gSofa.fillRoundedRect(50, 85, 260, 55, 14); // Cushions
        // Wooden legs
        gSofa.fillStyle(0x78350f, 1);
        gSofa.fillRect(40, 140, 14, 18);
        gSofa.fillRect(306, 140, 14, 18);
        gSofa.generateTexture('prop_sofa', 360, 160);

        // 1b. Fallback Smart Refrigerator (prop_fridge: 280x600)
        if (!scene.textures.exists('prop_fridge')) {
            const gFridge = scene.make.graphics({ x: 0, y: 0 });
            gFridge.fillStyle(0x0284c7, 1);
            gFridge.fillRoundedRect(10, 10, 260, 580, 16);
            gFridge.generateTexture('prop_fridge', 280, 600);
            gFridge.destroy();
        }

        // 2. School Chalkboard (prop_chalkboard: 320x180)
        const gBoard = scene.make.graphics({ x: 0, y: 0 });
        gBoard.fillStyle(0x78350f, 1); // Wooden frame
        gBoard.fillRoundedRect(10, 10, 300, 160, 12);
        gBoard.fillStyle(0x064e3b, 1); // Dark green blackboard
        gBoard.fillRoundedRect(20, 20, 280, 140, 6);
        gBoard.generateTexture('prop_chalkboard', 320, 180);

        // 3. City Silhouette (prop_city_skyline: 512x256)
        const gCity = scene.make.graphics({ x: 0, y: 0 });
        gCity.fillStyle(0x1e1b4b, 0.6);
        gCity.fillRect(20, 80, 70, 176);
        gCity.fillRect(100, 40, 85, 216);
        gCity.fillRect(195, 110, 60, 146);
        gCity.fillRect(265, 30, 90, 226);
        gCity.fillRect(365, 95, 75, 161);
        gCity.fillRect(450, 60, 60, 196);
        gCity.generateTexture('prop_city_skyline', 512, 256);

        // 4. Street Sidewalk Pavement Tile (prop_pavement: 256x128)
        const gPav = scene.make.graphics({ x: 0, y: 0 });
        gPav.fillStyle(0x334155, 1);
        gPav.fillRect(0, 0, 256, 128);
        gPav.lineStyle(2, 0x475569, 0.7);
        gPav.strokeRect(2, 2, 124, 60);
        gPav.strokeRect(128, 2, 124, 60);
        gPav.strokeRect(2, 64, 124, 60);
        gPav.strokeRect(128, 64, 124, 60);
        gPav.generateTexture('prop_pavement', 256, 128);
    }

    // ==========================================
    // 8. CHIMPU CHARACTER SPRITES (Section 21)
    // ==========================================

    private static generateChimpuCharacterSprites(scene: Scene) {
        // 1. High-Tech bg.png Skateboard Texture (Fallback if asset not loaded)
        if (!scene.textures.exists('chimpu_skateboard') || scene.textures.get('chimpu_skateboard').key === '__MISSING') {
            const sbW = 280;
            const sbH = 100;
            const gSb = scene.make.graphics({ x: 0, y: 0 });
            this.renderBGHoverSkateboard(gSb, sbW / 2 + 15, sbH / 2 + 6, 180, 42, true);
            gSb.generateTexture('chimpu_skateboard', sbW, sbH);
            gSb.generateTexture('skateboard', sbW, sbH);
            gSb.destroy();
        }

        // 2. Skater Character Fallback Sprites
        const w = 240;
        const h = 260;

        const gIdle = scene.make.graphics({ x: 0, y: 0 });
        this.renderChimpuBody(gIdle, w / 2, h / 2, 'idle');
        gIdle.generateTexture('chimpu_skater_idle', w, h);
        gIdle.destroy();

        const gMove = scene.make.graphics({ x: 0, y: 0 });
        this.renderChimpuBody(gMove, w / 2, h / 2, 'move');
        gMove.generateTexture('chimpu_skater_move', w, h);
        gMove.destroy();

        const gScan = scene.make.graphics({ x: 0, y: 0 });
        this.renderChimpuBody(gScan, w / 2, h / 2, 'scan');
        gScan.generateTexture('chimpu_skater_scan', w, h);
        gScan.destroy();

        const gTrick = scene.make.graphics({ x: 0, y: 0 });
        this.renderChimpuBody(gTrick, w / 2, h / 2 - 20, 'trick');
        gTrick.generateTexture('chimpu_skater_trick', w, h);
        gTrick.destroy();
    }

    /**
     * Renders the futuristic Cyan & Teal Hover Skateboard exactly as featured in bg.png:
     * - Tilted dynamic 3D angle (~-8 deg)
     * - Glowing cyan kicktail deck with bold dark outline
     * - Dark slate grip tape with inner glowing cyan contour pill
     * - Underside chassis with glowing cyan edge
     * - Angled wheel/hover pods with cyan glow
     * - Sweeping cyan/white hover trail swoosh from the rear kicktail
     */
    public static renderBGHoverSkateboard(
        g: Phaser.GameObjects.Graphics,
        cx: number,
        cy: number,
        deckWidth: number = 190,
        deckHeight: number = 38,
        drawHoverTrail: boolean = true
    ) {
        // --- 1. REAR HOVER / SPEED WAKE TRAIL (Trailing back from the rear kicktail) ---
        if (drawHoverTrail) {
            const tailX = cx - deckWidth * 0.44;
            const tailY = cy + 2;

            // Wide soft cyan ambient glow
            g.fillStyle(0x00f2fe, 0.22);
            g.beginPath();
            g.moveTo(tailX, tailY);
            g.lineTo(tailX - 80, tailY - 26);
            g.lineTo(tailX - 90, tailY - 6);
            g.lineTo(tailX - 45, tailY + 14);
            g.closePath();
            g.fillPath();

            // Upper curved swoosh
            g.lineStyle(4, 0x00f2fe, 0.85);
            g.beginPath();
            g.moveTo(tailX - 4, tailY - 2);
            g.lineTo(tailX - 45, tailY - 16);
            g.lineTo(tailX - 85, tailY - 22);
            g.strokePath();

            // Inner bright white/cyan core swoosh
            g.lineStyle(2.5, 0xffffff, 0.95);
            g.beginPath();
            g.moveTo(tailX - 6, tailY - 1);
            g.lineTo(tailX - 42, tailY - 11);
            g.lineTo(tailX - 75, tailY - 15);
            g.strokePath();

            // Lower hover swoosh
            g.lineStyle(3, 0x38bdf8, 0.7);
            g.beginPath();
            g.moveTo(tailX - 6, tailY + 8);
            g.lineTo(tailX - 35, tailY + 4);
            g.lineTo(tailX - 70, tailY - 4);
            g.strokePath();
        }

        // --- 2. UNDERSIDE CHASSIS & HOVER PODS ---
        const chY = cy + 10;

        // Underside Chassis Block
        g.fillStyle(0x061824, 1);
        g.fillRoundedRect(cx - deckWidth * 0.38, chY - 4, deckWidth * 0.76, 16, 6);
        g.lineStyle(2, 0x00d2e0, 0.9);
        g.strokeRoundedRect(cx - deckWidth * 0.38, chY - 4, deckWidth * 0.76, 16, 6);

        // Rear Hover Pod / Wheel Mount
        const rwX = cx - deckWidth * 0.26;
        g.fillStyle(0x06151f, 1);
        g.fillEllipse(rwX, chY + 7, 30, 14);
        g.lineStyle(2.5, 0x00f2fe, 1);
        g.strokeEllipse(rwX, chY + 7, 30, 14);
        g.fillStyle(0x00e5ff, 0.9);
        g.fillCircle(rwX, chY + 7, 4.5);

        // Front Hover Pod / Wheel Mount
        const fwX = cx + deckWidth * 0.26;
        g.fillStyle(0x06151f, 1);
        g.fillEllipse(fwX, chY + 5, 30, 14);
        g.lineStyle(2.5, 0x00f2fe, 1);
        g.strokeEllipse(fwX, chY + 5, 30, 14);
        g.fillStyle(0x00e5ff, 0.9);
        g.fillCircle(fwX, chY + 5, 4.5);

        // --- 3. 3D DECK THICKNESS / UNDER-BEVEL ---
        const bevY = cy + 3;
        g.fillStyle(0x007888, 1); // Dark cyan depth
        g.fillRoundedRect(cx - deckWidth / 2, bevY, deckWidth, deckHeight * 0.7, 14);
        g.lineStyle(3, 0x05131e, 1);
        g.strokeRoundedRect(cx - deckWidth / 2, bevY, deckWidth, deckHeight * 0.7, 14);

        // --- 4. TOP DECK BODY (Vibrant Curved Cyan Deck Face) ---
        // Outer cyan glow
        g.fillStyle(0x00f2fe, 0.35);
        g.fillRoundedRect(cx - deckWidth / 2 - 3, cy - deckHeight / 2 - 2, deckWidth + 6, deckHeight + 4, 16);

        // Main Cyan Deck Rim
        g.fillStyle(0x00d2e0, 1);
        g.fillRoundedRect(cx - deckWidth / 2, cy - deckHeight / 2, deckWidth, deckHeight, 15);
        g.lineStyle(3.5, 0x05131e, 1);
        g.strokeRoundedRect(cx - deckWidth / 2, cy - deckHeight / 2, deckWidth, deckHeight, 15);

        // --- 5. GRIP TAPE SURFACE (Dark Slate-Teal) ---
        const gripMargin = 6;
        g.fillStyle(0x0c2130, 1);
        g.fillRoundedRect(
            cx - deckWidth / 2 + gripMargin,
            cy - deckHeight / 2 + gripMargin * 0.65,
            deckWidth - gripMargin * 2,
            deckHeight - gripMargin * 1.3,
            11
        );

        // --- 6. INNER GLOWING CYAN CONTOUR / DECAL (Signature bg.png feature) ---
        const decalMargin = 12;
        // Cyan contour glow
        g.lineStyle(4, 0x00f2fe, 0.45);
        g.strokeRoundedRect(
            cx - deckWidth / 2 + decalMargin,
            cy - deckHeight / 2 + decalMargin * 0.55,
            deckWidth - decalMargin * 2,
            deckHeight - decalMargin * 1.1,
            8
        );
        // Sharp inner cyan line
        g.lineStyle(2.5, 0x00f2fe, 1);
        g.strokeRoundedRect(
            cx - deckWidth / 2 + decalMargin,
            cy - deckHeight / 2 + decalMargin * 0.55,
            deckWidth - decalMargin * 2,
            deckHeight - decalMargin * 1.1,
            8
        );

        // Kicktail tips highlight dots
        g.fillStyle(0xffffff, 0.95);
        g.fillCircle(cx - deckWidth / 2 + 16, cy - 1, 3.5);
        g.fillCircle(cx + deckWidth / 2 - 16, cy - 3, 3.5);
    }

    private static renderChimpuBody(
        g: Phaser.GameObjects.Graphics,
        cx: number,
        cy: number,
        mode: 'idle' | 'move' | 'scan' | 'trick'
    ) {
        // Skateboard at feet matching bg.png
        const sbY = cy + 68;
        this.renderBGHoverSkateboard(g, cx - 10, sbY, 170, 36, true);

        // Render upper chimpu body matching bg.png
        this.renderChimpuBodyOnly(g, cx, cy, mode);
    }

    private static renderChimpuBodyOnly(
        g: Phaser.GameObjects.Graphics,
        cx: number,
        cy: number,
        mode: 'idle' | 'move' | 'scan' | 'trick'
    ) {
        const sbY = cy + 68;

        // Long curled monkey tail (styled as in bg.png)
        const tailCurve = new Phaser.Curves.CubicBezier(
            new Phaser.Math.Vector2(cx - 18, cy + 30),
            new Phaser.Math.Vector2(cx - 55, cy + 30),
            new Phaser.Math.Vector2(cx - 65, cy - 10),
            new Phaser.Math.Vector2(cx - 45, cy - 25)
        );
        g.lineStyle(10, 0x4a1942, 1); // Dark violet fur
        tailCurve.draw(g, 24);
        g.lineStyle(3, 0x1f0b24, 1); // Tail dark stroke
        tailCurve.draw(g, 24);

        // Legs (Light blue-gray trousers matching bg.png)
        g.fillStyle(0xdbeafe, 1);
        // Left (rear) leg flexed back on deck
        g.fillRoundedRect(cx - 32, cy + 18, 16, 42, 7);
        // Right (front) leg flexed forward on deck
        g.fillRoundedRect(cx + 8, cy + 18, 16, 42, 7);

        // Shoes (Dark slate boots on skateboard deck)
        g.fillStyle(0x334155, 1);
        g.fillRoundedRect(cx - 42, cy + 54, 28, 14, 6); // Rear shoe
        g.fillRoundedRect(cx + 4, cy + 54, 28, 14, 6);  // Front shoe
        g.fillStyle(0x60a5fa, 1); // Shoe laces/trim
        g.fillRect(cx - 36, cy + 56, 12, 3);
        g.fillRect(cx + 10, cy + 56, 12, 3);

        // Torso / Hoodie (Soft Blue Detective Hoodie matching bg.png)
        g.fillStyle(0x60a5fa, 1);
        g.fillRoundedRect(cx - 28, cy - 18, 56, 46, 14);
        g.fillStyle(0x3b82f6, 1); // Hoodie kangaroo pocket
        g.fillRoundedRect(cx - 18, cy + 2, 36, 20, 8);
        g.fillStyle(0x93c5fd, 1); // Hoodie collar/drawstring
        g.fillRect(cx - 10, cy - 16, 20, 6);

        // Head with Hoodie Hood (Blue hood with dark purple monkey fur and peach face)
        const headY = cy - 48;
        // Outer Blue Hood
        g.fillStyle(0x60a5fa, 1);
        g.fillCircle(cx, headY, 35);
        g.lineStyle(3, 0x1d4ed8, 1);
        g.strokeCircle(cx, headY, 35);

        // Monkey Fur Head (Dark purple/violet)
        g.fillStyle(0x4a1942, 1);
        g.fillCircle(cx + 2, headY + 2, 28);

        // Peach Face Muzzle
        g.fillStyle(0xfde68a, 1);
        g.fillEllipse(cx + 6, headY + 8, 38, 28);

        // Eyes (Warm friendly cartoon eyes)
        g.fillStyle(0x0f172a, 1);
        g.fillCircle(cx, headY - 4, 5.5);
        g.fillCircle(cx + 16, headY - 4, 5.5);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(cx - 2, headY - 6, 2);
        g.fillCircle(cx + 14, headY - 6, 2);

        // Nose & Cheerful Smile
        g.fillStyle(0x78350f, 1);
        g.fillCircle(cx + 8, headY + 4, 3.5);
        g.beginPath();
        g.arc(cx + 8, headY + 12, 7, 0, Math.PI, false);
        g.strokePath();

        // Right Hand holding Holographic AI Lens Magnifying Glass
        const handX = cx + 38;
        const handY = headY + 2;

        // Lens Handle
        g.fillStyle(0x1e293b, 1);
        g.fillRect(handX - 3, handY + 10, 6, 18);

        // Holographic Lens Outer Ring
        g.fillStyle(0x00f2fe, 0.4);
        g.fillCircle(handX, handY, 22);
        g.fillStyle(0x00e5ff, 1);
        g.lineStyle(3, 0xffffff, 1);
        g.strokeCircle(handX, handY, 18);

        // Inner Holographic "AI" Microchip Glyph
        g.fillStyle(0x00e5ff, 0.9);
        g.fillRect(handX - 8, handY - 8, 16, 16);
        g.fillStyle(0xffffff, 1);
        g.fillRect(handX - 5, handY - 5, 10, 10);

        if (mode === 'trick') {
            // Sparkles around skateboard trick
            this.drawStar(g, cx - 65, sbY - 24, 4, 14, 6, 0xffd600, 0xffffff);
            this.drawStar(g, cx + 65, sbY - 24, 4, 14, 6, 0x00f2fe, 0xffffff);
        }
    }

    private static drawStar(
        g: Phaser.GameObjects.Graphics,
        cx: number,
        cy: number,
        points: number,
        outerR: number,
        innerR: number,
        fillColor: number,
        strokeColor: number
    ) {
        const startAngle = -Math.PI / 2;
        const step = Math.PI / points;

        g.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = startAngle + i * step;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) g.moveTo(x, y);
            else g.lineTo(x, y);
        }
        g.closePath();
        g.fillStyle(fillColor, 1);
        g.fillPath();
        if (strokeColor) {
            g.lineStyle(2, strokeColor, 1);
            g.strokePath();
        }
    }
}
