import { Scene } from 'phaser';

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
        // 1. Smartphone Face Unlock (obj_phone_face: 140x190)
        const gPhone = scene.make.graphics({ x: 0, y: 0 });
        // Soft outer drop shadow & glow
        gPhone.fillStyle(0x00e5ff, 0.15);
        gPhone.fillRoundedRect(16, 6, 108, 178, 22);

        // Sleek Titanium Outer Frame
        gPhone.fillStyle(0x1e293b, 1);
        gPhone.fillRoundedRect(20, 10, 100, 170, 20);
        gPhone.lineStyle(2.5, 0x64748b, 1);
        gPhone.strokeRoundedRect(20, 10, 100, 170, 20);

        // Side volume & power buttons
        gPhone.fillStyle(0x475569, 1);
        gPhone.fillRect(17, 45, 3, 22); // Volume Up/Down
        gPhone.fillRect(17, 72, 3, 16);
        gPhone.fillRect(120, 52, 3, 24); // Power button

        // Ultra-thin Bezel OLED Screen (Deep Glass Midnight)
        gPhone.fillStyle(0x050814, 1);
        gPhone.fillRoundedRect(24, 14, 92, 162, 16);

        // Top Dynamic Island / Camera Pill Notch
        gPhone.fillStyle(0x020617, 1);
        gPhone.fillRoundedRect(53, 18, 34, 10, 5);
        gPhone.fillStyle(0x00e5ff, 0.9);
        gPhone.fillCircle(59, 23, 2.5); // IR sensor
        gPhone.fillStyle(0x1e293b, 1);
        gPhone.fillCircle(77, 23, 3); // Selfie lens

        // Screen Wallpaper Gradient / Digital Mesh Background
        gPhone.fillStyle(0x0f172a, 0.9);
        gPhone.fillRoundedRect(26, 32, 88, 126, 10);
        gPhone.fillStyle(0x0284c7, 0.25);
        gPhone.fillCircle(70, 85, 38);

        // Biometric Face ID Scan Visual
        // Holographic facial mesh outline
        gPhone.lineStyle(2, 0x00e5ff, 0.95);
        gPhone.strokeCircle(70, 78, 24); // Head oval
        gPhone.fillStyle(0x38bdf8, 0.9);
        gPhone.fillCircle(62, 74, 3); // Eye L
        gPhone.fillCircle(78, 74, 3); // Eye R
        gPhone.lineStyle(2, 0x38bdf8, 0.9);
        gPhone.beginPath(); gPhone.arc(70, 84, 8, 0, Math.PI, false); gPhone.strokePath(); // Smile
        // Nose bridge
        gPhone.lineStyle(1.5, 0x00e5ff, 0.7);
        gPhone.lineBetween(70, 72, 70, 80);

        // 3D Laser Scan Grid Dots
        gPhone.fillStyle(0x00e676, 1);
        const scanDots = [
            { x: 54, y: 64 }, { x: 86, y: 64 },
            { x: 50, y: 78 }, { x: 90, y: 78 },
            { x: 56, y: 92 }, { x: 84, y: 92 },
            { x: 70, y: 60 }, { x: 70, y: 96 }
        ];
        scanDots.forEach(d => {
            gPhone.fillCircle(d.x, d.y, 2);
        });

        // Glowing Laser Scanning Horizon Line
        gPhone.lineStyle(2, 0x00e676, 1);
        gPhone.lineBetween(40, 80, 100, 80);
        gPhone.fillStyle(0x00e676, 0.25);
        gPhone.fillRect(40, 74, 60, 12);

        // Biometric Brackets [ ]
        gPhone.lineStyle(2.5, 0x00e5ff, 1);
        gPhone.beginPath(); gPhone.moveTo(42, 58); gPhone.lineTo(42, 50); gPhone.lineTo(50, 50); gPhone.strokePath();
        gPhone.beginPath(); gPhone.moveTo(98, 58); gPhone.lineTo(98, 50); gPhone.lineTo(90, 50); gPhone.strokePath();
        gPhone.beginPath(); gPhone.moveTo(42, 100); gPhone.lineTo(42, 108); gPhone.lineTo(50, 108); gPhone.strokePath();
        gPhone.beginPath(); gPhone.moveTo(98, 100); gPhone.lineTo(98, 108); gPhone.lineTo(90, 108); gPhone.strokePath();

        // Lock Status Icon (Unlocked Green)
        gPhone.fillStyle(0x00e676, 1);
        gPhone.fillRoundedRect(63, 122, 14, 11, 3);
        gPhone.lineStyle(2, 0x00e676, 1);
        gPhone.beginPath(); gPhone.arc(70, 120, 5, Math.PI, 0, false); gPhone.strokePath();

        // Diagonal Glass Specular Highlight
        gPhone.fillStyle(0xffffff, 0.12);
        gPhone.beginPath();
        gPhone.moveTo(30, 16);
        gPhone.lineTo(75, 16);
        gPhone.lineTo(26, 110);
        gPhone.lineTo(26, 60);
        gPhone.closePath();
        gPhone.fillPath();

        // Home Navigation Bar Pill
        gPhone.fillStyle(0xffffff, 0.85);
        gPhone.fillRoundedRect(52, 165, 36, 4, 2);
        gPhone.generateTexture('obj_phone_face', 140, 190);
        gPhone.destroy();

        // 2. Smart Speaker (obj_smart_speaker: 140x180)
        const gSpk = scene.make.graphics({ x: 0, y: 0 });
        // Ambient Soundwave Halo
        gSpk.fillStyle(0x00e5ff, 0.12);
        gSpk.fillCircle(70, 38, 48);

        // Soundwave Emitting Arcs
        gSpk.lineStyle(3, 0x00e5ff, 0.85);
        gSpk.beginPath(); gSpk.arc(70, 24, 22, -Math.PI * 0.85, -Math.PI * 0.15, false); gSpk.strokePath();
        gSpk.lineStyle(2.5, 0x69f0ae, 0.75);
        gSpk.beginPath(); gSpk.arc(70, 12, 38, -Math.PI * 0.85, -Math.PI * 0.15, false); gSpk.strokePath();
        gSpk.lineStyle(2, 0x38bdf8, 0.6);
        gSpk.beginPath(); gSpk.arc(70, 2, 54, -Math.PI * 0.85, -Math.PI * 0.15, false); gSpk.strokePath();

        // Speaker Drop Shadow
        gSpk.fillStyle(0x000000, 0.4);
        gSpk.fillEllipse(70, 162, 74, 18);

        // Cylindrical Speaker Body (Woven Acoustic Fabric)
        gSpk.fillStyle(0x1e293b, 1);
        gSpk.fillRoundedRect(32, 42, 76, 115, 20);
        gSpk.lineStyle(2, 0x334155, 1);
        gSpk.strokeRoundedRect(32, 42, 76, 115, 20);

        // Textured Fabric Grille Mesh Micro-lines
        gSpk.lineStyle(1, 0x334155, 0.6);
        for (let y = 52; y < 148; y += 7) {
            gSpk.lineBetween(36, y, 104, y);
        }
        for (let x = 40; x < 100; x += 8) {
            gSpk.lineBetween(x, 50, x, 150);
        }

        // Side Highlight Sheen
        gSpk.fillStyle(0xffffff, 0.08);
        gSpk.fillRect(36, 50, 12, 98);

        // Top Illuminated Capacitive Touch Disc
        gSpk.fillStyle(0x0f172a, 1);
        gSpk.fillEllipse(70, 42, 36, 14);

        // Vibrant Multi-Color LED Glow Ring (Cyan / Mint / Violet gradient illusion)
        gSpk.fillStyle(0x00e5ff, 1);
        gSpk.fillEllipse(70, 42, 34, 12);
        gSpk.fillStyle(0x69f0ae, 0.8);
        gSpk.fillEllipse(64, 42, 20, 9);
        gSpk.fillStyle(0xa855f7, 0.8);
        gSpk.fillEllipse(78, 42, 18, 9);

        // Glass Touch Center Disc
        gSpk.fillStyle(0x090d16, 0.9);
        gSpk.fillEllipse(70, 42, 22, 7);

        // Volume + and - Touch Glyphs
        gSpk.fillStyle(0xffffff, 0.9);
        gSpk.fillRect(60, 41, 6, 2); // minus
        gSpk.fillRect(74, 41, 6, 2); // plus h
        gSpk.fillRect(76, 39, 2, 6); // plus v

        // Non-slip Base Ring
        gSpk.fillStyle(0x0f172a, 1);
        gSpk.fillRoundedRect(42, 154, 56, 8, 4);
        gSpk.generateTexture('obj_smart_speaker', 140, 180);
        gSpk.destroy();

        // 3. Streaming Television (obj_streaming_tv: 250x200)
        const gTV = scene.make.graphics({ x: 0, y: 0 });
        // Ambient Ambilight Wall Glow
        gTV.fillStyle(0x38bdf8, 0.2);
        gTV.fillRoundedRect(4, 4, 242, 156, 18);
        gTV.fillStyle(0xa855f7, 0.15);
        gTV.fillCircle(200, 70, 60);

        // TV Outer Bezel Frame (Ultra-slim Metallic)
        gTV.fillStyle(0x0a0f1d, 1);
        gTV.fillRoundedRect(12, 10, 226, 144, 10);
        gTV.lineStyle(2, 0x334155, 1);
        gTV.strokeRoundedRect(12, 10, 226, 144, 10);

        // OLED Screen (Deep Pitch Black)
        gTV.fillStyle(0x020617, 1);
        gTV.fillRoundedRect(18, 16, 214, 132, 6);

        // Smart TV UI Header Bar
        gTV.fillStyle(0x0f172a, 0.85);
        gTV.fillRoundedRect(22, 20, 206, 18, 4);
        // Brand logo & Menu items
        gTV.fillStyle(0xef4444, 1);
        gTV.fillRect(28, 24, 12, 10); // Red streaming logo
        gTV.fillStyle(0x94a3b8, 1);
        gTV.fillRect(46, 27, 20, 4);
        gTV.fillRect(72, 27, 24, 4);
        gTV.fillStyle(0x00e5ff, 1);
        gTV.fillRect(102, 27, 28, 4); // "AI For You" active tab

        // "AI RECOMMENDED" Section Banner Header
        gTV.fillStyle(0x38bdf8, 1);
        gTV.fillRect(26, 44, 52, 5);

        // Movie Card 1 (Left - SciFi Neon City)
        gTV.fillStyle(0x1e1b4b, 1);
        gTV.fillRoundedRect(26, 54, 56, 76, 6);
        gTV.fillStyle(0x4338ca, 0.9);
        gTV.fillCircle(54, 78, 16);
        gTV.fillStyle(0x00e5ff, 0.7);
        gTV.fillRect(32, 104, 44, 6);
        gTV.fillRect(32, 114, 30, 4);

        // Movie Card 2 (Center - HIGHLIGHTED AI RECOMMENDATION)
        // Outer glowing recommendation border
        gTV.fillStyle(0x00e676, 0.35);
        gTV.fillRoundedRect(88, 48, 74, 88, 8);
        gTV.fillStyle(0x064e3b, 1);
        gTV.fillRoundedRect(91, 51, 68, 82, 6);
        gTV.lineStyle(2.5, 0x00e676, 1);
        gTV.strokeRoundedRect(91, 51, 68, 82, 6);

        // Hero Art Thumbnail inside center card
        gTV.fillStyle(0x047857, 1);
        gTV.fillRoundedRect(94, 54, 62, 44, 4);
        // Star & Play Icon
        this.drawStar(gTV, 125, 74, 5, 12, 5, 0xffd600, 0xffa000);
        // AI Match Badge
        gTV.fillStyle(0x00e676, 1);
        gTV.fillRoundedRect(96, 102, 42, 10, 3);
        // Play button
        gTV.fillStyle(0xffffff, 1);
        gTV.fillTriangle(144, 104, 150, 107, 144, 110);
        gTV.fillStyle(0xffffff, 0.8);
        gTV.fillRect(96, 116, 54, 5);

        // Movie Card 3 (Right - Sunset Adventure)
        gTV.fillStyle(0x451a03, 1);
        gTV.fillRoundedRect(168, 54, 56, 76, 6);
        gTV.fillStyle(0xd97706, 0.9);
        gTV.fillCircle(196, 80, 15);
        gTV.fillStyle(0xfbbf24, 0.7);
        gTV.fillRect(174, 104, 44, 6);
        gTV.fillRect(174, 114, 28, 4);

        // Screen Diagonal Glass Sheen
        gTV.fillStyle(0xffffff, 0.08);
        gTV.beginPath();
        gTV.moveTo(35, 16);
        gTV.lineTo(95, 16);
        gTV.lineTo(20, 140);
        gTV.lineTo(20, 80);
        gTV.closePath();
        gTV.fillPath();

        // Sleek TV Stand & Integrated Soundbar
        // Soundbar
        gTV.fillStyle(0x1e293b, 1);
        gTV.fillRoundedRect(50, 154, 150, 12, 4);
        gTV.lineStyle(1.5, 0x475569, 1);
        gTV.strokeRoundedRect(50, 154, 150, 12, 4);
        gTV.fillStyle(0x00e5ff, 1);
        gTV.fillCircle(125, 160, 2); // Soundbar LED

        // Pedestal Stem & Base
        gTV.fillStyle(0x475569, 1);
        gTV.fillRect(116, 166, 18, 16);
        gTV.fillStyle(0x334155, 1);
        gTV.fillRoundedRect(80, 182, 90, 10, 4);
        gTV.lineStyle(2, 0x64748b, 1);
        gTV.strokeRoundedRect(80, 182, 90, 10, 4);
        gTV.generateTexture('obj_streaming_tv', 250, 200);
        gTV.destroy();

        // 4. Robot Vacuum (obj_robot_vacuum: 170x120)
        const gVac = scene.make.graphics({ x: 0, y: 0 });
        // Laser Scan Fan on Floor
        gVac.fillStyle(0x00e5ff, 0.15);
        gVac.beginPath();
        gVac.moveTo(85, 55);
        gVac.lineTo(165, 25);
        gVac.lineTo(168, 85);
        gVac.closePath();
        gVac.fillPath();

        // Floor Shadow
        gVac.fillStyle(0x000000, 0.35);
        gVac.fillEllipse(85, 78, 80, 32);

        // Main Circular Disc Chassis (Brushed Slate Graphite)
        gVac.fillStyle(0x1e293b, 1);
        gVac.fillEllipse(85, 65, 74, 38);
        gVac.lineStyle(3, 0x475569, 1);
        gVac.strokeEllipse(85, 65, 74, 38);

        // Inner Matte Metallic Lid Ring
        gVac.fillStyle(0x0f172a, 1);
        gVac.fillEllipse(85, 63, 60, 28);
        gVac.lineStyle(2, 0x00e5ff, 0.7);
        gVac.strokeEllipse(85, 63, 60, 28);

        // Raised LiDAR Laser Turret (Top Sensor Dome)
        gVac.fillStyle(0x1e293b, 1);
        gVac.fillCircle(85, 48, 18);
        gVac.lineStyle(2.5, 0x00e676, 1);
        gVac.strokeCircle(85, 48, 18);

        // LiDAR Optical Lens & Spinning Beacon
        gVac.fillStyle(0x00e5ff, 1);
        gVac.fillCircle(85, 48, 8);
        gVac.fillStyle(0xffffff, 1);
        gVac.fillCircle(83, 46, 2.5);

        // Front Rubber Bumper with IR Proximity Sensors
        gVac.lineStyle(4, 0x0a0f1d, 1);
        gVac.beginPath();
        gVac.arc(85, 65, 37, -Math.PI * 0.25, Math.PI * 0.25, false);
        gVac.strokePath();

        // Edge Cleaning Side Brush Whisker Bristles
        gVac.lineStyle(2, 0xffffff, 0.9);
        gVac.lineBetween(142, 75, 162, 70);
        gVac.lineBetween(142, 75, 164, 82);
        gVac.lineBetween(142, 75, 156, 90);

        // Power / Docking Touch Button
        gVac.fillStyle(0x00e676, 1);
        gVac.fillCircle(85, 74, 6);
        gVac.lineStyle(1.5, 0xffffff, 1);
        gVac.strokeCircle(85, 74, 6);

        // Laser Scan Ray Lines
        gVac.lineStyle(2, 0x00e676, 0.85);
        gVac.lineBetween(85, 48, 150, 35);
        gVac.lineBetween(85, 48, 158, 55);
        gVac.lineBetween(85, 48, 150, 75);
        gVac.generateTexture('obj_robot_vacuum', 170, 120);
        gVac.destroy();

        // 5. Manual Toaster (obj_toaster: 150x140)
        const gTst = scene.make.graphics({ x: 0, y: 0 });
        // Drop Shadow
        gTst.fillStyle(0x000000, 0.3);
        gTst.fillEllipse(75, 126, 68, 12);

        // Toaster Body (Brushed Stainless Steel Chrome)
        gTst.fillStyle(0x94a3b8, 1);
        gTst.fillRoundedRect(22, 38, 106, 78, 16);
        gTst.lineStyle(3, 0x475569, 1);
        gTst.strokeRoundedRect(22, 38, 106, 78, 16);

        // Chrome Metallic Specular Reflection Band
        gTst.fillStyle(0xe2e8f0, 0.85);
        gTst.fillRoundedRect(28, 44, 94, 28, 8);
        gTst.fillStyle(0x64748b, 0.4);
        gTst.fillRect(28, 76, 94, 26);

        // Dual Top Bread Slots
        gTst.fillStyle(0x1e293b, 1);
        gTst.fillRoundedRect(36, 32, 28, 14, 4);
        gTst.fillRoundedRect(76, 32, 28, 14, 4);

        // Glowing Orange Nichrome Heating Coils Inside Slots
        gTst.lineStyle(2, 0xf97316, 0.9);
        gTst.lineBetween(40, 39, 60, 39);
        gTst.lineBetween(80, 39, 100, 39);

        // 2 Slices of Golden-Brown Artisanal Toast Popping Out
        // Left Toast
        gTst.fillStyle(0xd97706, 1);
        gTst.fillRoundedRect(38, 14, 24, 30, 6);
        gTst.fillStyle(0xfde68a, 1);
        gTst.fillRoundedRect(42, 18, 16, 20, 4);
        // Right Toast
        gTst.fillStyle(0xd97706, 1);
        gTst.fillRoundedRect(78, 10, 24, 34, 6);
        gTst.fillStyle(0xfde68a, 1);
        gTst.fillRoundedRect(82, 14, 16, 24, 4);

        // Mechanical Push Slider Track & Chrome Lever
        gTst.fillStyle(0x1e293b, 1);
        gTst.fillRect(124, 52, 6, 42); // Vertical slot track
        // Lever Arm & Knob
        gTst.fillStyle(0x475569, 1);
        gTst.fillRect(120, 68, 14, 8);
        gTst.fillStyle(0x0f172a, 1);
        gTst.fillCircle(136, 72, 8);
        gTst.fillStyle(0xe2e8f0, 1);
        gTst.fillCircle(135, 70, 3); // Chrome highlight

        // Rotary Browning Dial 1-6
        gTst.fillStyle(0x334155, 1);
        gTst.fillCircle(75, 92, 14);
        gTst.lineStyle(2, 0x1e293b, 1);
        gTst.strokeCircle(75, 92, 14);
        gTst.fillStyle(0xf59e0b, 1);
        gTst.fillCircle(75, 84, 2.5); // Dial pointer dot
        // Numbers indicator ticks
        gTst.fillStyle(0xffffff, 0.7);
        gTst.fillRect(66, 91, 3, 2);
        gTst.fillRect(81, 91, 3, 2);

        // Defrost / Cancel Push Buttons
        gTst.fillStyle(0xef4444, 1);
        gTst.fillCircle(45, 92, 5);
        gTst.fillStyle(0x38bdf8, 1);
        gTst.fillCircle(105, 92, 5);

        // Non-slip Rubber Feet
        gTst.fillStyle(0x0f172a, 1);
        gTst.fillRoundedRect(30, 114, 16, 6, 2);
        gTst.fillRoundedRect(94, 114, 16, 6, 2);
        gTst.generateTexture('obj_toaster', 150, 140);
        gTst.destroy();

        // 6. Ordinary Lamp Switch (obj_lamp_switch: 120x180)
        const gLmp = scene.make.graphics({ x: 0, y: 0 });
        // Ambient Warm Golden Lamp Glow
        gLmp.fillStyle(0xfef08a, 0.22);
        gLmp.fillTriangle(60, 40, 10, 175, 110, 175);
        gLmp.fillCircle(60, 45, 36);

        // Textured Linen Fabric Drum Lampshade
        gLmp.fillStyle(0xfef3c7, 1);
        gLmp.beginPath();
        gLmp.moveTo(38, 22);
        gLmp.lineTo(82, 22);
        gLmp.lineTo(96, 78);
        gLmp.lineTo(24, 78);
        gLmp.closePath();
        gLmp.fillPath();
        gLmp.lineStyle(2.5, 0xd97706, 1);
        gLmp.strokePath();

        // Lampshade Texture Weave Lines
        gLmp.lineStyle(1, 0xfbbf24, 0.5);
        gLmp.lineBetween(40, 40, 80, 40);
        gLmp.lineBetween(32, 60, 88, 60);

        // Internal Glowing Lightbulb Silhouette
        gLmp.fillStyle(0xf59e0b, 0.85);
        gLmp.fillCircle(60, 52, 14);

        // Top Finial & Brushed Brass Stem
        gLmp.fillStyle(0xd97706, 1);
        gLmp.fillCircle(60, 18, 5); // Brass top finial
        gLmp.fillRect(57, 78, 6, 68); // Brass metallic rod
        gLmp.fillStyle(0xfde68a, 1);
        gLmp.fillRect(59, 78, 2, 68); // Rod highlight

        // Mechanical Bead Pull Chain & Toggle Switch
        gLmp.fillStyle(0xd97706, 1);
        for (let y = 78; y <= 112; y += 6) {
            gLmp.fillCircle(73, y, 2); // Brass bead chain
        }
        gLmp.fillStyle(0xb45309, 1);
        gLmp.fillCircle(73, 116, 4.5); // Brass pull acorn bead

        // In-line Rocker Toggle Switch Box (Physical Circuit)
        gLmp.fillStyle(0x1e293b, 1);
        gLmp.fillRoundedRect(72, 134, 20, 14, 3);
        gLmp.fillStyle(0xef4444, 1); // Rocker ON switch
        gLmp.fillRect(75, 137, 8, 8);
        gLmp.fillStyle(0x64748b, 1);
        gLmp.fillRect(83, 137, 6, 8);

        // Heavy Carrara Marble Base
        gLmp.fillStyle(0xf8fafc, 1);
        gLmp.fillEllipse(60, 150, 36, 14);
        gLmp.lineStyle(2, 0xcb9a67, 1); // Brass rim on base
        gLmp.strokeEllipse(60, 150, 36, 14);
        // Marble Veins
        gLmp.lineStyle(1, 0x94a3b8, 0.6);
        gLmp.lineBetween(48, 148, 65, 152);

        // Table Shadow
        gLmp.fillStyle(0x000000, 0.25);
        gLmp.fillEllipse(60, 164, 44, 10);
        gLmp.generateTexture('obj_lamp_switch', 120, 180);
        gLmp.destroy();

        // 7. Mechanical Analog Clock (obj_analog_clock: 140x140)
        const gClk = scene.make.graphics({ x: 0, y: 0 });
        const cx = 70;
        const cy = 70;

        // Drop Shadow
        gClk.fillStyle(0x000000, 0.35);
        gClk.fillCircle(cx + 3, cy + 4, 56);

        // Polished Mahogany Wood Frame
        gClk.fillStyle(0x451a03, 1);
        gClk.fillCircle(cx, cy, 58);
        gClk.fillStyle(0x78350f, 1);
        gClk.fillCircle(cx, cy, 54);

        // Polished Brass Bezel Inner Rim
        gClk.lineStyle(3, 0xd97706, 1);
        gClk.strokeCircle(cx, cy, 50);

        // Parchment Dial Face
        gClk.fillStyle(0xfffbeb, 1);
        gClk.fillCircle(cx, cy, 47);

        // Hour Tick Marks (12, 1..11)
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6;
            const isMajor = i % 3 === 0;
            const r1 = 44;
            const r2 = isMajor ? 34 : 38;
            gClk.lineStyle(isMajor ? 3 : 1.5, 0x1e293b, 1);
            gClk.beginPath();
            gClk.moveTo(cx + Math.sin(angle) * r1, cy - Math.cos(angle) * r1);
            gClk.lineTo(cx + Math.sin(angle) * r2, cy - Math.cos(angle) * r2);
            gClk.strokePath();
        }

        // Roman Numerals 12, 3, 6, 9
        gClk.fillStyle(0x0f172a, 1);
        gClk.fillRect(cx - 3, cy - 35, 6, 3); // XII block
        gClk.fillRect(cx + 30, cy - 2, 3, 6); // III
        gClk.fillRect(cx - 2, cy + 30, 4, 3); // VI
        gClk.fillRect(cx - 33, cy - 2, 3, 6); // IX

        // Subtle Escapement Gears Visible through transparent dial center
        gClk.fillStyle(0xd97706, 0.25);
        gClk.fillCircle(cx, cy, 14);
        gClk.lineStyle(1.5, 0xb45309, 0.4);
        gClk.strokeCircle(cx, cy, 14);

        // Ornate Black Hour Hand (Pointing towards 10 o'clock)
        gClk.lineStyle(4, 0x0f172a, 1);
        gClk.beginPath();
        gClk.moveTo(cx, cy);
        gClk.lineTo(cx - 18, cy - 14);
        gClk.strokePath();

        // Ornate Black Minute Hand (Pointing towards 2 o'clock)
        gClk.lineStyle(3, 0x0f172a, 1);
        gClk.beginPath();
        gClk.moveTo(cx, cy);
        gClk.lineTo(cx + 24, cy - 24);
        gClk.strokePath();

        // Red Sweeping Second Hand
        gClk.lineStyle(1.5, 0xef4444, 1);
        gClk.beginPath();
        gClk.moveTo(cx - 6, cy + 10);
        gClk.lineTo(cx + 10, cy - 36);
        gClk.strokePath();
        gClk.fillStyle(0xef4444, 1);
        gClk.fillCircle(cx, cy, 3);

        // Center Brass Pinion Nut
        gClk.fillStyle(0xd97706, 1);
        gClk.fillCircle(cx, cy, 2);

        // Glass Dome Specular Reflection Arc
        gClk.fillStyle(0xffffff, 0.2);
        gClk.beginPath();
        gClk.arc(cx, cy, 44, -Math.PI * 0.75, -Math.PI * 0.25, false);
        gClk.lineTo(cx + 15, cy - 25);
        gClk.arc(cx, cy, 28, -Math.PI * 0.25, -Math.PI * 0.75, true);
        gClk.closePath();
        gClk.fillPath();
        gClk.generateTexture('obj_analog_clock', 140, 140);
        gClk.destroy();

        // 8. Kitchen Blender (obj_blender: 130x170)
        const gBln = scene.make.graphics({ x: 0, y: 0 });
        // Drop Shadow
        gBln.fillStyle(0x000000, 0.3);
        gBln.fillEllipse(65, 156, 56, 12);

        // Clear Faceted Glass/Tritan Pitcher Jar
        gBln.fillStyle(0x38bdf8, 0.25);
        gBln.beginPath();
        gBln.moveTo(38, 26);
        gBln.lineTo(92, 26);
        gBln.lineTo(84, 96);
        gBln.lineTo(46, 96);
        gBln.closePath();
        gBln.fillPath();
        gBln.lineStyle(2.5, 0x0284c7, 1);
        gBln.strokePath();

        // Swirling Berry Smoothie Liquid
        gBln.fillStyle(0xe11d48, 0.85);
        gBln.beginPath();
        gBln.moveTo(42, 48);
        gBln.lineTo(88, 48);
        gBln.lineTo(82, 94);
        gBln.lineTo(48, 94);
        gBln.closePath();
        gBln.fillPath();

        // Smoothie Vortex Wave Highlights
        gBln.fillStyle(0xf43f5e, 0.9);
        gBln.fillEllipse(65, 52, 20, 6);
        gBln.fillStyle(0xfde047, 0.9); // Fruit droplet
        gBln.fillCircle(58, 62, 2.5);
        gBln.fillCircle(72, 70, 2);

        // Measurement Markings (oz / ml)
        gBln.fillStyle(0xffffff, 0.75);
        gBln.fillRect(44, 38, 10, 2);
        gBln.fillRect(45, 54, 8, 2);
        gBln.fillRect(46, 70, 8, 2);
        gBln.fillRect(48, 86, 6, 2);

        // Pitcher Handle
        gBln.lineStyle(5, 0x1e293b, 1);
        gBln.beginPath();
        gBln.moveTo(90, 34);
        gBln.lineTo(108, 42);
        gBln.lineTo(104, 84);
        gBln.lineTo(84, 88);
        gBln.strokePath();

        // Pitcher Lid with Removable Clear Cap
        gBln.fillStyle(0x0f172a, 1);
        gBln.fillRoundedRect(34, 18, 62, 10, 3);
        gBln.fillStyle(0x38bdf8, 0.8);
        gBln.fillRoundedRect(56, 12, 18, 8, 2);

        // Stainless Steel 4-Blade Assembly at Bottom
        gBln.fillStyle(0x94a3b8, 1);
        gBln.fillRect(52, 94, 26, 6);
        gBln.fillStyle(0x475569, 1);
        gBln.fillTriangle(65, 94, 55, 90, 65, 92);
        gBln.fillTriangle(65, 94, 75, 90, 65, 92);

        // Cast-Metal Heavy Duty Motor Base (Brushed Charcoal & Chrome)
        gBln.fillStyle(0x1e293b, 1);
        gBln.fillRoundedRect(30, 100, 70, 52, 10);
        gBln.lineStyle(2, 0x475569, 1);
        gBln.strokeRoundedRect(30, 100, 70, 52, 10);

        // Chrome Front Bezel Plate
        gBln.fillStyle(0x334155, 1);
        gBln.fillRoundedRect(36, 106, 58, 40, 6);

        // Heavy Rotary Speed Knob (0-1-2-3-Pulse)
        gBln.fillStyle(0x0f172a, 1);
        gBln.fillCircle(65, 125, 12);
        gBln.lineStyle(2, 0xd97706, 1);
        gBln.strokeCircle(65, 125, 12);
        gBln.fillStyle(0xffd600, 1);
        gBln.fillCircle(65, 116, 2.5); // Knob indicator

        // Manual Metal Toggle Switches (Power / Pulse)
        gBln.fillStyle(0x94a3b8, 1);
        gBln.fillRect(42, 122, 4, 10);
        gBln.fillRect(84, 122, 4, 10);

        // Non-slip Base Rubber Feet
        gBln.fillStyle(0x0a0f1d, 1);
        gBln.fillRoundedRect(34, 150, 12, 5, 2);
        gBln.fillRoundedRect(84, 150, 12, 5, 2);
        gBln.generateTexture('obj_blender', 130, 170);
        gBln.destroy();
    }

    // ==========================================
    // 5. ZONE 2: SCHOOL OBJECT TEXTURES
    // ==========================================

    private static generateSchoolObjects(scene: Scene) {
        // 1. Speech-to-Text Tablet (obj_speech_tablet: 150x160)
        const gSpTab = scene.make.graphics({ x: 0, y: 0 });
        gSpTab.fillStyle(0x1e293b, 1);
        gSpTab.fillRoundedRect(15, 15, 120, 130, 14);
        gSpTab.lineStyle(3, 0x0284c7, 1);
        gSpTab.strokeRoundedRect(15, 15, 120, 130, 14);

        // Screen
        gSpTab.fillStyle(0x0f172a, 1);
        gSpTab.fillRoundedRect(22, 22, 106, 116, 10);

        // Soundwaves turning into transcribed text lines
        gSpTab.lineStyle(2, 0x00e5ff, 0.9);
        gSpTab.beginPath();
        gSpTab.moveTo(30, 48);
        gSpTab.lineTo(38, 38);
        gSpTab.lineTo(46, 58);
        gSpTab.lineTo(54, 42);
        gSpTab.lineTo(62, 50);
        gSpTab.strokePath();

        // Arrow
        gSpTab.lineStyle(2, 0x00e676, 1);
        gSpTab.lineBetween(68, 48, 80, 48);

        // Text lines
        gSpTab.fillStyle(0x00e676, 1);
        gSpTab.fillRoundedRect(30, 72, 75, 8, 4);
        gSpTab.fillRoundedRect(30, 88, 60, 8, 4);
        gSpTab.fillRoundedRect(30, 104, 80, 8, 4);
        gSpTab.generateTexture('obj_speech_tablet', 150, 160);

        // 2. Translation Application (obj_translation_app: 150x170)
        const gTrans = scene.make.graphics({ x: 0, y: 0 });
        gTrans.fillStyle(0x1e293b, 1);
        gTrans.fillRoundedRect(15, 15, 120, 140, 14);
        gTrans.lineStyle(3, 0x38bdf8, 1);
        gTrans.strokeRoundedRect(15, 15, 120, 140, 14);

        // Screen
        gTrans.fillStyle(0x0f172a, 1);
        gTrans.fillRoundedRect(22, 22, 106, 126, 10);

        // Speech Bubble 1: "HELLO" (English)
        gTrans.fillStyle(0x38bdf8, 1);
        gTrans.fillRoundedRect(30, 36, 68, 30, 8);

        // Neural AI Translation Arrow
        gTrans.fillStyle(0xffd600, 1);
        gTrans.beginPath();
        gTrans.moveTo(75, 74);
        gTrans.lineTo(75, 88);
        gTrans.lineTo(82, 81);
        gTrans.strokePath();

        // Speech Bubble 2: "HOLA" (Spanish)
        gTrans.fillStyle(0x00e676, 1);
        gTrans.fillRoundedRect(50, 94, 68, 30, 8);
        gTrans.generateTexture('obj_translation_app', 150, 170);

        // 3. Adaptive Learning App (obj_adaptive_learning: 150x170)
        const gAdapt = scene.make.graphics({ x: 0, y: 0 });
        gAdapt.fillStyle(0x1e293b, 1);
        gAdapt.fillRoundedRect(15, 15, 120, 140, 14);
        gAdapt.lineStyle(3, 0xa855f7, 1);
        gAdapt.strokeRoundedRect(15, 15, 120, 140, 14);

        gAdapt.fillStyle(0x0f172a, 1);
        gAdapt.fillRoundedRect(22, 22, 106, 126, 10);

        // 3 Stacked Adaptive Difficulty Cards (Easy, Medium, Master)
        gAdapt.fillStyle(0x00e676, 0.75); // Easy
        gAdapt.fillRoundedRect(30, 34, 90, 24, 6);
        gAdapt.fillStyle(0xfbbf24, 0.85); // Medium
        gAdapt.fillRoundedRect(30, 66, 90, 24, 6);
        gAdapt.fillStyle(0xa855f7, 1); // Master Challenge
        gAdapt.fillRoundedRect(30, 98, 90, 28, 6);
        gAdapt.lineStyle(2, 0xffffff, 1);
        gAdapt.strokeRoundedRect(30, 98, 90, 28, 6);

        gAdapt.generateTexture('obj_adaptive_learning', 150, 170);

        // 4. Camera Plant Recognition Scanner (obj_camera_plant: 150x180)
        const gPlant = scene.make.graphics({ x: 0, y: 0 });
        // Plant Pot
        gPlant.fillStyle(0xb45309, 1);
        gPlant.beginPath();
        gPlant.moveTo(40, 110);
        gPlant.lineTo(110, 110);
        gPlant.lineTo(98, 160);
        gPlant.lineTo(52, 160);
        gPlant.closePath();
        gPlant.fillPath();

        // Plant Foliage
        gPlant.fillStyle(0x10b981, 1);
        gPlant.fillCircle(75, 80, 32);
        gPlant.fillCircle(55, 90, 22);
        gPlant.fillCircle(95, 90, 22);

        // Computer Vision AI Detection Box & Tag
        gPlant.lineStyle(3, 0x00e5ff, 1);
        gPlant.strokeRoundedRect(24, 40, 102, 115, 8);
        gPlant.fillStyle(0x00e5ff, 0.9);
        gPlant.fillRoundedRect(30, 25, 75, 20, 6);
        gPlant.generateTexture('obj_camera_plant', 150, 180);

        // 5. Basic Calculator (obj_calculator: 120x140)
        const gCalc = scene.make.graphics({ x: 0, y: 0 });
        gCalc.fillStyle(0x334155, 1);
        gCalc.fillRoundedRect(20, 10, 80, 120, 12);
        gCalc.lineStyle(2, 0x64748b, 1);
        gCalc.strokeRoundedRect(20, 10, 80, 120, 12);

        // LCD Display (Fixed math 2+2=4)
        gCalc.fillStyle(0x84cc16, 0.7);
        gCalc.fillRect(28, 20, 64, 24);
        gCalc.lineStyle(1.5, 0x1e293b, 1);
        gCalc.strokeRect(28, 20, 64, 24);

        // Keypad Grid
        gCalc.fillStyle(0x1e293b, 1);
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 3; c++) {
                gCalc.fillRoundedRect(30 + c * 20, 52 + r * 16, 16, 12, 3);
            }
        }
        gCalc.generateTexture('obj_calculator', 120, 140);

        // 6. Ceiling Slide Projector (obj_projector: 160x120)
        const gProj = scene.make.graphics({ x: 0, y: 0 });
        // Ceiling Mount Arm
        gProj.fillStyle(0x475569, 1);
        gProj.fillRect(72, 0, 16, 30);

        // Projector Box
        gProj.fillStyle(0x94a3b8, 1);
        gProj.fillRoundedRect(25, 30, 110, 50, 10);

        // Optical Glass Lens & Light Cone
        gProj.fillStyle(0x38bdf8, 1);
        gProj.fillCircle(130, 55, 16);

        // Static Light Beam
        gProj.fillStyle(0xfef08a, 0.35);
        gProj.beginPath();
        gProj.moveTo(130, 55);
        gProj.lineTo(160, 20);
        gProj.lineTo(160, 95);
        gProj.closePath();
        gProj.fillPath();
        gProj.generateTexture('obj_projector', 160, 120);

        // 7. Classroom Paper Printer (obj_printer: 160x150)
        const gPrn = scene.make.graphics({ x: 0, y: 0 });
        // Printer Chassis
        gPrn.fillStyle(0x475569, 1);
        gPrn.fillRoundedRect(20, 40, 120, 80, 12);

        // Input Paper Tray
        gPrn.fillStyle(0xffffff, 1);
        gPrn.fillRoundedRect(40, 15, 80, 40, 4);

        // Output Slot & Paper Sheet
        gPrn.fillStyle(0x0f172a, 1);
        gPrn.fillRect(35, 85, 90, 8);
        gPrn.fillStyle(0xffffff, 1);
        gPrn.fillRect(45, 90, 70, 45);
        gPrn.generateTexture('obj_printer', 160, 150);

        // 8. Electric Desk Fan (obj_fan: 130x170)
        const gFan = scene.make.graphics({ x: 0, y: 0 });
        // Fan Cage
        gFan.lineStyle(3, 0x0284c7, 1);
        gFan.strokeCircle(65, 55, 45);

        // Blades
        gFan.fillStyle(0x38bdf8, 0.8);
        for (let i = 0; i < 3; i++) {
            const ang = (i * Math.PI * 2) / 3;
            gFan.fillEllipse(65 + Math.cos(ang) * 22, 55 + Math.sin(ang) * 22, 24, 12);
        }

        // Motor Hub & Stand
        gFan.fillStyle(0x0f172a, 1);
        gFan.fillCircle(65, 55, 12);
        gFan.fillRect(61, 100, 8, 40);
        gFan.fillEllipse(65, 145, 36, 14);
        gFan.generateTexture('obj_fan', 130, 170);
    }

    // ==========================================
    // 6. ZONE 3: STREET OBJECT TEXTURES
    // ==========================================

    private static generateStreetObjects(scene: Scene) {
        // 1. Smart Map & Route App (obj_map_app: 150x170)
        const gMap = scene.make.graphics({ x: 0, y: 0 });
        gMap.fillStyle(0x1e293b, 1);
        gMap.fillRoundedRect(15, 15, 120, 140, 16);
        gMap.lineStyle(3, 0x00e5ff, 1);
        gMap.strokeRoundedRect(15, 15, 120, 140, 16);

        // Map Screen
        gMap.fillStyle(0x0c4a6e, 1);
        gMap.fillRoundedRect(22, 22, 106, 126, 12);

        // Road Grid
        gMap.lineStyle(8, 0x334155, 1);
        gMap.lineBetween(30, 40, 115, 120);
        gMap.lineBetween(30, 120, 115, 40);

        // Fast AI Route (Highlighted Mint Green)
        gMap.lineStyle(4, 0x00e676, 1);
        gMap.beginPath();
        gMap.moveTo(35, 115);
        gMap.lineTo(72, 80);
        gMap.lineTo(110, 50);
        gMap.strokePath();

        // Destination Star Pin
        this.drawStar(gMap, 110, 50, 5, 8, 4, 0xffd600, 0xffa000);
        gMap.generateTexture('obj_map_app', 150, 170);

        // 2. Autonomous Delivery Bot (obj_delivery_robot: 170x150)
        const gBot = scene.make.graphics({ x: 0, y: 0 });
        // Body (Cooler Compartment)
        gBot.fillStyle(0xf1f5f9, 1);
        gBot.fillRoundedRect(25, 35, 120, 75, 18);
        gBot.lineStyle(3, 0x0284c7, 1);
        gBot.strokeRoundedRect(25, 35, 120, 75, 18);

        // Orange Safety Flag Pole & Flag
        gBot.lineStyle(2, 0x64748b, 1);
        gBot.lineBetween(130, 35, 130, 5);
        gBot.fillStyle(0xf97316, 1);
        gBot.fillTriangle(130, 5, 155, 15, 130, 25);

        // Front Radar / Vision Visor
        gBot.fillStyle(0x0f172a, 1);
        gBot.fillRoundedRect(32, 50, 30, 22, 6);
        gBot.fillStyle(0x00e5ff, 1);
        gBot.fillCircle(42, 61, 4); // glowing eye camera

        // 6 Robust Wheels
        gBot.fillStyle(0x1e293b, 1);
        gBot.fillCircle(45, 115, 14);
        gBot.fillCircle(85, 115, 14);
        gBot.fillCircle(125, 115, 14);
        gBot.generateTexture('obj_delivery_robot', 170, 150);

        // 3. Adaptive Traffic Camera (obj_traffic_cam: 160x190)
        const gTfCam = scene.make.graphics({ x: 0, y: 0 });
        // Pole
        gTfCam.fillStyle(0x475569, 1);
        gTfCam.fillRect(72, 40, 16, 150);

        // Cross Arm
        gTfCam.fillRect(30, 35, 100, 12);

        // CCTV Camera Housing
        gTfCam.fillStyle(0x0f172a, 1);
        gTfCam.fillRoundedRect(30, 20, 50, 28, 8);
        gTfCam.lineStyle(2, 0x00e5ff, 1);
        gTfCam.strokeRoundedRect(30, 20, 50, 28, 8);

        // Vision Lens & Scan Beam
        gTfCam.fillStyle(0x00e5ff, 1);
        gTfCam.fillCircle(38, 34, 6);

        // AI Vehicle Detection Box
        gTfCam.lineStyle(2, 0x00e676, 0.9);
        gTfCam.strokeRect(20, 85, 65, 45);
        gTfCam.fillStyle(0x00e676, 0.85);
        gTfCam.fillRoundedRect(22, 70, 50, 14, 4);
        gTfCam.generateTexture('obj_traffic_cam', 160, 190);

        // 4. Visual Search Landmark Camera (obj_visual_search: 150x170)
        const gVS = scene.make.graphics({ x: 0, y: 0 });
        gVS.fillStyle(0x1e293b, 1);
        gVS.fillRoundedRect(15, 20, 120, 130, 16);
        gVS.lineStyle(3, 0xa855f7, 1);
        gVS.strokeRoundedRect(15, 20, 120, 130, 16);

        // Screen
        gVS.fillStyle(0x0f172a, 1);
        gVS.fillRoundedRect(22, 28, 106, 114, 10);

        // Historic Building Landmark Silhouette
        gVS.fillStyle(0xa855f7, 1);
        gVS.fillRect(55, 65, 40, 50); // Tower
        gVS.fillTriangle(45, 65, 75, 40, 105, 65); // Roof

        // Matching Info Card Floating In
        gVS.fillStyle(0x00e676, 1);
        gVS.fillRoundedRect(32, 90, 86, 22, 4);
        gVS.generateTexture('obj_visual_search', 150, 170);

        // 5. Regular Bicycle (obj_bicycle: 180x140)
        const gBike = scene.make.graphics({ x: 0, y: 0 });
        // Two Spoked Wheels
        gBike.lineStyle(4, 0x1e293b, 1);
        gBike.strokeCircle(40, 95, 30);
        gBike.strokeCircle(140, 95, 30);

        // Frame Tubes (Diamond Frame)
        gBike.lineStyle(4, 0xef4444, 1);
        gBike.lineBetween(40, 95, 80, 95); // Chain stay
        gBike.lineBetween(80, 95, 70, 55); // Seat tube
        gBike.lineBetween(70, 55, 115, 55); // Top tube
        gBike.lineBetween(115, 55, 140, 95); // Fork
        gBike.lineBetween(70, 55, 40, 95); // Seat stay
        gBike.lineBetween(80, 95, 115, 55); // Down tube

        // Handlebars & Saddle
        gBike.fillStyle(0x1e293b, 1);
        gBike.fillRect(60, 48, 20, 6); // Seat
        gBike.fillRect(110, 42, 14, 6); // Handlebar
        gBike.generateTexture('obj_bicycle', 180, 140);

        // 6. Countdown Crossing Light (obj_crossing_timer: 120x180)
        const gCross = scene.make.graphics({ x: 0, y: 0 });
        // Housing
        gCross.fillStyle(0x1e293b, 1);
        gCross.fillRoundedRect(25, 20, 70, 120, 12);
        gCross.lineStyle(3, 0x475569, 1);
        gCross.strokeRoundedRect(25, 20, 70, 120, 12);

        // Top Pedestrian Red Man
        gCross.fillStyle(0xef4444, 1);
        gCross.fillCircle(60, 50, 10); // Head
        gCross.fillRect(55, 60, 10, 20); // Body

        // Bottom 7-Segment Countdown "15"
        gCross.fillStyle(0xfbbf24, 1);
        gCross.fillRect(45, 95, 14, 30);
        gCross.fillRect(65, 95, 14, 30);
        gCross.generateTexture('obj_crossing_timer', 120, 180);

        // 7. Traditional Vending Machine (obj_vending_machine: 160x220)
        const gVend = scene.make.graphics({ x: 0, y: 0 });
        // Cabinet
        gVend.fillStyle(0x0284c7, 1);
        gVend.fillRoundedRect(20, 15, 120, 190, 14);
        gVend.lineStyle(4, 0x082f49, 1);
        gVend.strokeRoundedRect(20, 15, 120, 190, 14);

        // Glass Front Showcase
        gVend.fillStyle(0x1e293b, 1);
        gVend.fillRoundedRect(30, 28, 75, 115, 8);

        // Mechanical Spirals & Cans
        gVend.fillStyle(0xef4444, 1);
        gVend.fillRoundedRect(38, 42, 16, 22, 4);
        gVend.fillStyle(0x10b981, 1);
        gVend.fillRoundedRect(68, 42, 16, 22, 4);
        gVend.fillStyle(0xf59e0b, 1);
        gVend.fillRoundedRect(38, 80, 16, 22, 4);
        gVend.fillStyle(0xa855f7, 1);
        gVend.fillRoundedRect(68, 80, 16, 22, 4);

        // Coin Slot & Push Drop Door
        gVend.fillStyle(0x082f49, 1);
        gVend.fillRect(115, 45, 12, 4); // Coin slot
        gVend.fillRoundedRect(30, 155, 100, 35, 6); // Drop chute
        gVend.generateTexture('obj_vending_machine', 160, 220);

        // 8. Fixed-Timer Streetlight (obj_streetlight: 140x240)
        const gLight = scene.make.graphics({ x: 0, y: 0 });
        // Lamp Post
        gLight.fillStyle(0x334155, 1);
        gLight.fillRect(64, 40, 12, 190);
        gLight.fillEllipse(70, 230, 36, 12);

        // Curved Top Neck & Lantern
        gLight.beginPath();
        gLight.arc(90, 40, 26, Math.PI, Math.PI * 1.5, false);
        gLight.strokePath();

        gLight.fillStyle(0xfbbf24, 1); // Yellow Light Glow
        gLight.fillRoundedRect(80, 35, 35, 20, 6);

        // Mechanical Timer Dial Box on pole
        gLight.fillStyle(0x64748b, 1);
        gLight.fillRoundedRect(56, 130, 28, 30, 4);
        gLight.fillStyle(0xffd600, 1);
        gLight.fillCircle(70, 145, 6);
        gLight.generateTexture('obj_streetlight', 140, 240);
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
