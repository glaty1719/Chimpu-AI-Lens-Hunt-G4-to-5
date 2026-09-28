import { Scene, GameObjects } from 'phaser';
import { HuntObjectData, ZoneConfig } from '../data/LensHuntData';
import { UILayers } from '../utils/UILayers';

export interface WorldObjectItem {
    data: HuntObjectData;
    container: GameObjects.Container;
    sprite: GameObjects.Sprite | GameObjects.Image;
    glowGraphics: GameObjects.Graphics;
    statusIconCont: GameObjects.Container;
    hitZone: GameObjects.Zone;
    isDiscovered: boolean;
    worldX: number;
    worldY: number;
}

export class WorldParallaxView {
    private scene: Scene;
    private zoneConfig: ZoneConfig;
    private worldWidth: number;
    private screenWidth: number;
    private screenHeight: number;
    private roomWidth: number = 1920;
    private totalRooms: number = 1;
    private currentRoomIndex: number = 0;
    private maxUnlockedRoomIndex: number = 0;
    private patrolDir: number = 1;
    private isTransitioningRoom: boolean = false;

    // Camera & Scroll State
    private scrollX: number = 0;
    private targetScrollX: number = 0;
    private isUserInteracting: boolean = false;
    private isPaused: boolean = false;

    // Containers for Parallax Layers
    private farLayerCont!: GameObjects.Container;
    private midLayerCont!: GameObjects.Container;
    private nearLayerCont!: GameObjects.Container;
    private objectLayerCont!: GameObjects.Container;

    // Object instances in world
    private worldObjects: WorldObjectItem[] = [];
    private selectedObjectIndex: number = -1;

    // Chimpu Character Object & Movement Physics
    private chimpuContainer!: GameObjects.Container;
    private chimpuSprite!: GameObjects.Sprite;
    private chimpuShadow!: GameObjects.Graphics;
    private chimpuThrusterGlow!: GameObjects.Graphics;
    private chimpuWorldX: number = 380;
    private chimpuBaseY: number = 890;
    private chimpuCurrentY: number = 890;
    private chimpuVx: number = 0;
    private isJumping: boolean = false;
    private touchMoveDir: number = 0;

    // Turbo Speed & Acceleration Boost (Hold down & Rapid Tap mechanics)
    private holdDuration: number = 0;
    private tapBoost: number = 0;
    private lastTapTime: number = 0;
    private lastTapDir: number = 0;

    // Keyboard Input
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private wasdKeys: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key } | null = null;

    // Callbacks
    private onObjectSelectCallback: (obj: WorldObjectItem, index: number) => void;
    private onObjectDoubleTapCallback: (obj: WorldObjectItem, index: number) => void;

    constructor(
        scene: Scene,
        zoneConfig: ZoneConfig,
        onSelect: (obj: WorldObjectItem, index: number) => void,
        onDoubleTap: (obj: WorldObjectItem, index: number) => void
    ) {
        this.scene = scene;
        this.zoneConfig = zoneConfig;
        this.worldWidth = zoneConfig.worldWidth;
        this.screenWidth = scene.scale.width;
        this.screenHeight = scene.scale.height;
        this.roomWidth = 1920;
        this.totalRooms = Math.max(1, Math.ceil(this.worldWidth / this.roomWidth));
        this.currentRoomIndex = 0;
        this.maxUnlockedRoomIndex = 0;
        this.patrolDir = 1;
        this.isTransitioningRoom = false;
        this.onObjectSelectCallback = onSelect;
        this.onObjectDoubleTapCallback = onDoubleTap;

        if (this.scene.input.keyboard) {
            this.cursors = this.scene.input.keyboard.createCursorKeys();
            this.wasdKeys = {
                W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
            };
        }

        this.createEnvironmentLayers();
        this.createWorldObjects();
        this.createChimpuCharacter();
    }

    private createEnvironmentLayers() {
        // Far Background Layer (Sky/Wall gradient, distant skyline)
        this.farLayerCont = this.scene.add.container(0, 0).setDepth(UILayers.GAME_BACKGROUND);
        // Midground Layer (Floors, furniture, wallpaper, banners)
        this.midLayerCont = this.scene.add.container(0, 0).setDepth(UILayers.GAME_BACKGROUND + 1);
        // Object Layer
        this.objectLayerCont = this.scene.add.container(0, 0).setDepth(UILayers.GAME_OBSTACLES);
        // Near Layer (Foreground floor rails, sidewalk curb, subtle vignettes)
        this.nearLayerCont = this.scene.add.container(0, 0).setDepth(UILayers.GAME_RINGS);

        if (this.zoneConfig.id === 1) {
            this.buildHomeEnvironment();
        } else if (this.zoneConfig.id === 2) {
            this.buildSchoolEnvironment();
        } else {
            this.buildStreetEnvironment();
        }
    }

    // --- ZONE 1: HOME INTERIOR ---
    private buildHomeEnvironment() {
        const ww = this.worldWidth; // 7680 (4 rooms * 1920px)
        const sh = this.screenHeight; // 1080
        const roomW = 1920;

        // =========================================================================
        // 1. FAR LAYER (0.35x Parallax): Distant Outdoor Scenery Through Windows
        // =========================================================================
        const farG = this.scene.add.graphics();

        // --- Outdoor Night Sky & Moonlit Garden behind Living Room Window (X: 4800 to 5650) ---
        farG.fillStyle(0x020617, 1);
        farG.fillRect(4800, 80, 850, 520);
        // Distant illuminated skyline
        farG.fillStyle(0x0f172a, 0.9);
        farG.fillRect(4840, 340, 100, 220);
        farG.fillRect(4980, 290, 130, 270);
        farG.fillRect(5160, 320, 110, 240);
        farG.fillRect(5320, 270, 140, 290);
        farG.fillRect(5500, 330, 100, 230);
        // Distant glowing city windows
        farG.fillStyle(0xfde047, 0.7);
        for (let bx = 5000; bx < 5100; bx += 16) {
            for (let by = 310; by < 460; by += 22) {
                farG.fillRect(bx, by, 7, 9);
            }
        }
        for (let bx = 5340; bx < 5440; bx += 16) {
            for (let by = 290; by < 450; by += 20) {
                farG.fillRect(bx, by, 6, 8);
            }
        }
        // Night garden trees & foliage silhouettes
        farG.fillStyle(0x064e3b, 0.95);
        farG.fillCircle(4900, 500, 95);
        farG.fillCircle(5100, 520, 120);
        farG.fillCircle(5320, 490, 105);
        farG.fillCircle(5520, 510, 115);
        // Glowing Crescent Moon & Stars
        farG.fillStyle(0xfef08a, 0.95);
        farG.fillCircle(5380, 160, 28);
        farG.fillStyle(0x020617, 1);
        farG.fillCircle(5390, 154, 24);
        farG.fillStyle(0xffffff, 0.85);
        [[4880, 130], [4980, 180], [5120, 120], [5240, 190], [5480, 140], [5580, 170]].forEach(([sx, sy]) => {
            farG.fillCircle(sx, sy, 2.5);
        });

        // --- Outdoor Terrace Sunset Sky behind Patio French Doors (X: 5850 to 7150) ---
        farG.fillStyle(0x1c1917, 1);
        farG.fillRect(5850, 60, 1300, 680);
        // Golden hour gradient & sunset glow
        farG.fillStyle(0xf59e0b, 0.5);
        farG.fillRect(5850, 60, 1300, 360);
        farG.fillStyle(0xfb7185, 0.35);
        farG.fillRect(5850, 240, 1300, 180);
        // Distant terrace palms & cypress garden silhouettes
        farG.fillStyle(0x064e3b, 0.95);
        farG.fillCircle(6050, 580, 120);
        farG.fillCircle(6350, 610, 150);
        farG.fillCircle(6650, 570, 130);
        farG.fillCircle(6950, 600, 140);

        this.farLayerCont.add(farG);

        // =========================================================================
        // 2. MID LAYER (1.0x Ratio): 4 Full-Screen 1920px Rooms & 3D Architecture
        // =========================================================================
        const roomG = this.scene.add.graphics();

        // =========================================================================
        // ROOM 1: GRAND ENTRY FOYER & EXECUTIVE STUDY (X: 0 to 1920)
        // =========================================================================
        // Room Wall: Warm Sage with Upper Wall Molding Accent
        roomG.fillStyle(0x132a22, 1); // Rich deep sage
        roomG.fillRect(0, 0, roomW, 720);
        roomG.fillStyle(0x1a382e, 0.7);
        roomG.fillRect(0, 0, roomW, 380);

        // Solid Grand Entry Door on the Left Wall (X: 0 to 260, Y: 60 to 720) - Extra Wide Grand Entrance
        roomG.fillStyle(0x240e04, 1); // Dark rich mahogany door casing
        roomG.fillRect(0, 60, 260, 660);
        roomG.lineStyle(5, 0x451a03, 1);
        roomG.strokeRect(0, 60, 260, 660);
        roomG.lineStyle(2, 0xd97706, 0.9); // Gold decorative architrave accent
        roomG.strokeRect(4, 64, 252, 652);

        // Transom Frosted Glass Window Header
        roomG.fillStyle(0x0f172a, 0.9);
        roomG.fillRoundedRect(16, 74, 228, 22, 4);
        roomG.fillStyle(0xfde68a, 0.65);
        roomG.fillRect(20, 78, 220, 14);
        roomG.lineStyle(1.5, 0xd97706, 0.8);
        roomG.strokeRoundedRect(16, 74, 228, 22, 4);

        // 6 Large Beveled Recessed Door Panels (2 Columns x 3 Rows)
        const doorPanels = [
            { x: 22, y: 110, w: 98, h: 175 },
            { x: 22, y: 305, w: 98, h: 185 },
            { x: 22, y: 510, w: 98, h: 190 },
            { x: 136, y: 110, w: 98, h: 175 },
            { x: 136, y: 305, w: 98, h: 185 },
            { x: 136, y: 510, w: 98, h: 190 }
        ];

        doorPanels.forEach(p => {
            roomG.fillStyle(0x150702, 1);
            roomG.fillRoundedRect(p.x, p.y, p.w, p.h, 6);
            roomG.fillStyle(0x3b1807, 1);
            roomG.fillRoundedRect(p.x + 4, p.y + 4, p.w - 8, p.h - 8, 4);
            roomG.lineStyle(1.5, 0xd97706, 0.6);
            roomG.strokeRoundedRect(p.x + 7, p.y + 7, p.w - 14, p.h - 14, 3);
        });

        // Designer Brushed Brass Handle & Digital Smart Lock Unit
        roomG.fillStyle(0x1a1a24, 0.95);
        roomG.fillRoundedRect(220, 370, 28, 90, 6);
        roomG.lineStyle(2, 0xd97706, 1);
        roomG.strokeRoundedRect(220, 370, 28, 90, 6);
        roomG.fillStyle(0x0284c7, 0.9);
        roomG.fillRoundedRect(226, 380, 16, 22, 3);
        roomG.fillStyle(0x00e5ff, 1);
        roomG.fillCircle(234, 391, 4); // Glowing cyan status light
        roomG.fillStyle(0xd97706, 1);
        roomG.fillCircle(234, 424, 7);
        roomG.fillStyle(0xfde68a, 1);
        roomG.fillRoundedRect(205, 421, 32, 6, 3); // Ergonomic brass lever

        // Entry Welcome Runner on Floor
        roomG.fillStyle(0x1e293b, 0.92);
        roomG.fillRoundedRect(20, 735, 240, 55, 10);
        roomG.lineStyle(3, 0xd97706, 0.85);
        roomG.strokeRoundedRect(20, 735, 240, 55, 10);
        roomG.lineStyle(1.5, 0xfde68a, 0.5);
        roomG.strokeRoundedRect(28, 742, 224, 41, 6);

        // Fluted Acoustic Walnut Timber Feature Wall (X: 380 to 940) - Positioned with generous padding from door
        roomG.fillStyle(0x0a1410, 1); // Dark acoustic backing
        roomG.fillRect(380, 70, 560, 650);
        for (let x = 388; x < 932; x += 22) {
            roomG.fillStyle(0x78350f, 1); // Solid wood slat face
            roomG.fillRoundedRect(x, 70, 15, 650, 3);
            roomG.fillStyle(0x92400e, 0.6); // Highlight
            roomG.fillRect(x + 2, 70, 4, 650);
        }

        // =========================================================================
        // IMPROVISED EXECUTIVE DESIGNER BOOKSHELF UNIT (X: 400 to 920, Y: 110 to 660)
        // =========================================================================
        const bsX = 400;
        const bsY = 110;
        const bsW = 520;
        const bsH = 550;

        // Drop shadow behind bookshelf
        roomG.fillStyle(0x000000, 0.45);
        roomG.fillRoundedRect(bsX + 6, bsY + 8, bsW, bsH, 12);

        // Bookshelf Outer Solid Walnut Casing
        roomG.fillStyle(0x240e04, 0.98);
        roomG.fillRoundedRect(bsX, bsY, bsW, bsH, 10);
        roomG.lineStyle(4, 0x78350f, 1);
        roomG.strokeRoundedRect(bsX, bsY, bsW, bsH, 10);
        roomG.lineStyle(2, 0xd97706, 0.85); // Brass inlay trim
        roomG.strokeRoundedRect(bsX + 4, bsY + 4, bsW - 8, bsH - 8, 8);

        // Horizontal Shelf Levels (Y: 230, Y: 350, Y: 470, Y: 575)
        const shelfLevels = [230, 350, 470, 575];
        shelfLevels.forEach(sy => {
            roomG.fillStyle(0x5c2c16, 1);
            roomG.fillRect(bsX + 8, sy, bsW - 16, 16);
            roomG.fillStyle(0x78350f, 1);
            roomG.fillRect(bsX + 8, sy, bsW - 16, 4); // Top edge highlight

            // Warm LED Under-Shelf Ambient Glow Strip
            roomG.fillStyle(0xfef08a, 0.28);
            roomG.fillRect(bsX + 12, sy + 16, bsW - 24, 6);
            roomG.fillStyle(0xf59e0b, 0.12);
            roomG.fillRect(bsX + 10, sy + 22, bsW - 20, 18);
        });

        // Vertical Structural Dividers (Asymmetrical Architectural Grid)
        roomG.fillStyle(0x451a03, 1);
        roomG.fillRect(bsX + 260, 110, 12, 120);
        roomG.fillRect(bsX + 160, 246, 12, 104);
        roomG.fillRect(bsX + 350, 246, 12, 104);
        roomG.fillRect(bsX + 230, 366, 12, 104);

        // --- SHELF CONTENT 1: TOP TIER (Y: 110 to 230) ---
        // Left Bay: Leather-Bound Detective Encyclopedias with Gold Foil Spines
        const topBooks = [
            { c: 0x991b1b, w: 22, h: 90 },
            { c: 0x1e3a8a, w: 24, h: 95 },
            { c: 0x065f46, w: 20, h: 86 },
            { c: 0x78350f, w: 26, h: 98 },
            { c: 0x581c87, w: 22, h: 88 },
            { c: 0x0f766e, w: 20, h: 92 },
            { c: 0xb45309, w: 24, h: 96 },
            { c: 0x1e293b, w: 22, h: 84 },
            { c: 0x831843, w: 20, h: 90 }
        ];
        let curBookX = bsX + 20;
        topBooks.forEach(b => {
            roomG.fillStyle(b.c, 1);
            roomG.fillRoundedRect(curBookX, 230 - b.h, b.w, b.h, 3);
            roomG.fillStyle(0xfde68a, 0.9);
            roomG.fillRect(curBookX + 2, 230 - b.h + 12, b.w - 4, 2);
            roomG.fillRect(curBookX + 2, 230 - b.h + 20, b.w - 4, 2);
            roomG.fillRect(curBookX + 2, 230 - 18, b.w - 4, 2);
            curBookX += b.w + 3;
        });
        // Right Bay: White Marble Bookends & Modern Tech Manuals
        roomG.fillStyle(0xf8fafc, 0.95);
        roomG.beginPath();
        roomG.moveTo(bsX + 280, 230);
        roomG.lineTo(bsX + 315, 230);
        roomG.lineTo(bsX + 315, 160);
        roomG.closePath();
        roomG.fillPath();
        const techBooks = [
            { c: 0x0284c7, w: 24, h: 80 },
            { c: 0x6366f1, w: 22, h: 84 },
            { c: 0x10b981, w: 26, h: 76 },
            { c: 0xec4899, w: 20, h: 82 },
            { c: 0xf59e0b, w: 22, h: 78 }
        ];
        let techX = bsX + 322;
        techBooks.forEach(tb => {
            roomG.fillStyle(tb.c, 1);
            roomG.fillRoundedRect(techX, 230 - tb.h, tb.w, tb.h, 3);
            roomG.fillStyle(0xffffff, 0.8);
            roomG.fillRect(techX + 3, 230 - tb.h + 10, tb.w - 6, 3);
            techX += tb.w + 4;
        });
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRoundedRect(techX + 2, 175, 14, 55, 3);

        // --- SHELF CONTENT 2: MID TIER 1 (Y: 246 to 350) ---
        // Bay 1: Armillary Celestial Globe with Brass Rings
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(bsX + 65, 336, 30, 14);
        roomG.fillRect(bsX + 77, 305, 6, 32);
        roomG.fillCircle(bsX + 80, 290, 22);
        roomG.lineStyle(3, 0xfde68a, 1);
        roomG.strokeCircle(bsX + 80, 290, 32);
        roomG.lineStyle(2, 0xd97706, 0.85);
        roomG.strokeEllipse(bsX + 80, 290, 34, 14);
        // Bay 2: Modern Ceramic Vases & Hourglass
        roomG.fillStyle(0x0284c7, 1);
        roomG.fillRoundedRect(bsX + 185, 275, 26, 75, 6);
        roomG.fillStyle(0xf8fafc, 1);
        roomG.fillCircle(bsX + 230, 310, 20);
        roomG.fillRect(bsX + 223, 280, 14, 25);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(bsX + 275, 275, 34, 6);
        roomG.fillRect(bsX + 275, 344, 34, 6);
        roomG.fillStyle(0xfef08a, 0.7);
        roomG.beginPath();
        roomG.moveTo(bsX + 280, 281);
        roomG.lineTo(bsX + 304, 281);
        roomG.lineTo(bsX + 292, 312);
        roomG.closePath();
        roomG.fillPath();
        roomG.beginPath();
        roomG.moveTo(bsX + 292, 312);
        roomG.lineTo(bsX + 304, 344);
        roomG.lineTo(bsX + 280, 344);
        roomG.closePath();
        roomG.fillPath();
        // Bay 3: Framed Detective Certificate
        roomG.fillStyle(0x451a03, 1);
        roomG.fillRoundedRect(bsX + 380, 265, 80, 85, 4);
        roomG.lineStyle(2, 0xd97706, 1);
        roomG.strokeRoundedRect(bsX + 380, 265, 80, 85, 4);
        roomG.fillStyle(0xfef3c7, 0.95);
        roomG.fillRect(bsX + 386, 271, 68, 73);
        roomG.fillStyle(0x991b1b, 1);
        roomG.fillCircle(bsX + 420, 325, 7);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillCircle(bsX + 420, 325, 4);

        // --- SHELF CONTENT 3: MID TIER 2 (Y: 366 to 470) ---
        // Left Bay: Stacked Detective Case Dossiers + Gold Magnifying Glass
        const dossierColors = [0x78350f, 0x1e3a8a, 0x991b1b, 0x065f46];
        dossierColors.forEach((dc, i) => {
            roomG.fillStyle(dc, 1);
            roomG.fillRoundedRect(bsX + 30, 448 - i * 18, 120, 16, 3);
            roomG.fillStyle(0xfde68a, 0.8);
            roomG.fillRect(bsX + 32, 452 - i * 18, 116, 2);
        });
        roomG.lineStyle(3, 0xd97706, 1);
        roomG.strokeCircle(bsX + 110, 385, 18);
        roomG.fillStyle(0x00e5ff, 0.35);
        roomG.fillCircle(bsX + 110, 385, 17);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRoundedRect(bsX + 122, 395, 26, 6, 2);
        // Right Bay: Terracotta Planter with Cascading Emerald Pothos Leaves
        roomG.fillStyle(0xb45309, 1);
        roomG.beginPath();
        roomG.moveTo(bsX + 400, 420);
        roomG.lineTo(bsX + 445, 420);
        roomG.lineTo(bsX + 438, 470);
        roomG.lineTo(bsX + 407, 470);
        roomG.closePath();
        roomG.fillPath();
        roomG.fillStyle(0x065f46, 1);
        roomG.fillCircle(bsX + 422, 412, 18);
        roomG.fillCircle(bsX + 408, 422, 14);
        roomG.fillCircle(bsX + 438, 422, 15);
        roomG.fillStyle(0x10b981, 1);
        roomG.fillCircle(bsX + 402, 442, 12);
        roomG.fillCircle(bsX + 446, 440, 13);
        roomG.fillCircle(bsX + 410, 465, 11);
        roomG.fillCircle(bsX + 430, 480, 12);
        roomG.fillCircle(bsX + 418, 500, 10);
        roomG.fillStyle(0x34d399, 0.85);
        roomG.fillCircle(bsX + 422, 515, 8);

        // --- SHELF CONTENT 4: LOWER TIER (Y: 486 to 575) ---
        // Archive binders with spine labels
        const binders = [0x1e293b, 0x334155, 0x1e3a8a, 0x065f46, 0x78350f, 0x991b1b, 0x475569];
        let binX = bsX + 22;
        binders.forEach(bc => {
            roomG.fillStyle(bc, 1);
            roomG.fillRoundedRect(binX, 492, 26, 83, 3);
            roomG.fillStyle(0xf8fafc, 0.95);
            roomG.fillRect(binX + 4, 506, 18, 22);
            roomG.fillStyle(0xd97706, 1);
            roomG.fillCircle(binX + 13, 552, 4);
            binX += 30;
        });

        // --- SHELF CONTENT 5: BOTTOM CABINETS (Y: 591 to 650) ---
        roomG.fillStyle(0x3b1807, 1);
        roomG.fillRoundedRect(bsX + 14, 591, (bsW - 36) / 2, 59, 4);
        roomG.fillRoundedRect(bsX + 22 + (bsW - 36) / 2, 591, (bsW - 36) / 2, 59, 4);
        roomG.lineStyle(2, 0x5c2c16, 1);
        roomG.strokeRoundedRect(bsX + 14, 591, (bsW - 36) / 2, 59, 4);
        roomG.strokeRoundedRect(bsX + 22 + (bsW - 36) / 2, 591, (bsW - 36) / 2, 59, 4);
        for (let fx = bsX + 24; fx < bsX + 14 + (bsW - 36) / 2 - 10; fx += 14) {
            roomG.fillStyle(0x240e04, 0.6);
            roomG.fillRect(fx, 597, 6, 47);
        }
        for (let fx = bsX + 32 + (bsW - 36) / 2; fx < bsX + bsW - 30; fx += 14) {
            roomG.fillStyle(0x240e04, 0.6);
            roomG.fillRect(fx, 597, 6, 47);
        }
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRoundedRect(bsX + 14 + (bsW - 36) / 2 - 18, 614, 6, 20, 2);
        roomG.fillRoundedRect(bsX + 22 + (bsW - 36) / 2 + 12, 614, 6, 20, 2);



        // Floor 1: Luxury Oak Herringbone Parquet (0 to 1920)
        roomG.fillStyle(0x5c2c16, 1);
        roomG.fillRect(0, 720, roomW, sh - 720);
        roomG.lineStyle(2, 0x3d1b0d, 0.7);
        for (let x = 0; x < roomW; x += 60) {
            for (let y = 720; y < sh; y += 40) {
                roomG.lineBetween(x, y, x + 30, y + 40);
                roomG.lineBetween(x + 30, y + 40, x + 60, y);
            }
        }

        // =========================================================================
        // ARCHWAY 1: FOYER TO KITCHEN CASED PORTAL (X: 1880 to 1960)
        // =========================================================================
        roomG.fillStyle(0x0f172a, 0.95);
        roomG.fillRect(1900, 0, 40, 720);
        roomG.fillStyle(0x78350f, 1);
        roomG.fillRect(1890, 0, 16, 720);
        roomG.fillRect(1934, 0, 16, 720);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(1886, 0, 68, 28);
        roomG.fillStyle(0x000000, 0.35);
        roomG.fillRect(1950, 0, 60, 720);

        // =========================================================================
        // ROOM 2: CHEF'S GOURMET SMART KITCHEN (X: 1920 to 3840)
        // =========================================================================
        roomG.fillStyle(0x0b1329, 1); // Midnight navy wall
        roomG.fillRect(roomW, 0, roomW, 720);
        roomG.fillStyle(0x111f3d, 0.7);
        roomG.fillRect(roomW, 0, roomW, 360);

        // White Subway Tile Backsplash Wall (X: 1960 to 3800, Y: 280 to 720)
        roomG.fillStyle(0xf8fafc, 0.98);
        roomG.fillRect(1960, 280, 1840, 440);
        roomG.lineStyle(1.5, 0x94a3b8, 0.7);
        let rowIdx = 0;
        for (let y = 280; y < 720; y += 22) {
            const xOffset = (rowIdx % 2 === 0) ? 0 : 25;
            for (let x = 1960 - 50; x < 3800; x += 50) {
                roomG.strokeRect(Math.max(1960, x + xOffset), y, Math.min(50, 3800 - (x + xOffset)), 22);
            }
            rowIdx++;
        }

        // Full-Height Built-in Smart Refrigerator (X: 1990 to 2250, Y: 90 to 720)
        roomG.fillStyle(0x1e293b, 1);
        roomG.fillRoundedRect(1990, 90, 260, 630, 10);
        roomG.lineStyle(4, 0x64748b, 1);
        roomG.strokeRoundedRect(1990, 90, 260, 630, 10);
        roomG.lineBetween(2120, 90, 2120, 520);
        roomG.lineBetween(1990, 520, 2250, 520);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRoundedRect(2110, 280, 8, 140, 3);
        roomG.fillRoundedRect(2122, 280, 8, 140, 3);
        roomG.fillRoundedRect(2070, 540, 100, 8, 3);
        // Interactive Glowing Smart Touchscreen
        roomG.fillStyle(0x0284c7, 0.95);
        roomG.fillRoundedRect(2020, 230, 65, 105, 6);
        roomG.fillStyle(0x38bdf8, 1);
        roomG.fillRect(2028, 244, 49, 5);
        roomG.fillStyle(0xffffff, 0.9);
        roomG.fillCircle(2052, 275, 11);
        roomG.fillRect(2028, 300, 49, 20);
        roomG.lineStyle(2, 0x00e5ff, 1);
        roomG.strokeRoundedRect(2020, 230, 65, 105, 6);

        // Modern Kitchen Upper Wall Cabinets (X: 2290 to 3780, Y: 70 to 280)
        roomG.fillStyle(0x0f172a, 1);
        roomG.fillRoundedRect(2290, 70, 1490, 210, 10);
        roomG.lineStyle(3, 0x334155, 1);
        roomG.strokeRoundedRect(2290, 70, 1490, 210, 10);
        for (let x = 2290; x < 3760; x += 186) {
            roomG.lineStyle(2, 0x1e293b, 1);
            roomG.lineBetween(x, 70, x, 280);
            roomG.fillStyle(0xd97706, 1);
            roomG.fillRoundedRect(x + 168, 230, 7, 34, 3);
        }


        // Stainless Steel Range Hood (X: 2950 to 3170, Y: 140 to 280)
        roomG.fillStyle(0x334155, 1);
        roomG.beginPath();
        roomG.moveTo(3020, 140);
        roomG.lineTo(3100, 140);
        roomG.lineTo(3170, 280);
        roomG.lineTo(2950, 280);
        roomG.closePath();
        roomG.fillPath();
        roomG.fillStyle(0x00e5ff, 0.8);
        roomG.fillCircle(3060, 270, 5);

        // Floor 2: Charcoal Slate Stone Tiles (1920 to 3840)
        roomG.fillStyle(0x1e293b, 1);
        roomG.fillRect(roomW, 720, roomW, sh - 720);
        roomG.lineStyle(2, 0x475569, 0.8);
        for (let x = roomW; x < roomW * 2; x += 120) {
            for (let y = 720; y < sh; y += 85) {
                roomG.strokeRect(x, y, 120, 85);
            }
        }

        // =========================================================================
        // ARCHWAY 2: KITCHEN TO LIVING ROOM OPEN PORTAL (X: 3800 to 3880)
        // =========================================================================
        roomG.fillStyle(0x021f1d, 0.95);
        roomG.fillRect(3820, 0, 40, 720);
        roomG.fillStyle(0x78350f, 1);
        roomG.fillRect(3810, 0, 14, 720);
        roomG.fillRect(3856, 0, 14, 720);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(3806, 0, 68, 28);
        roomG.fillStyle(0x000000, 0.35);
        roomG.fillRect(3870, 0, 60, 720);

        // =========================================================================
        // ROOM 3: LUXURY LIVING & HOME THEATER (X: 3840 to 5760)
        // =========================================================================
        roomG.fillStyle(0x042f2e, 1); // Deep royal emerald
        roomG.fillRect(roomW * 2, 0, roomW, 720);
        roomG.fillStyle(0x064e3b, 0.8);
        roomG.fillRect(roomW * 2, 0, roomW, 380);

        // Acoustic Dark Walnut Slat Media Wall behind TV (X: 3950 to 4750)
        roomG.fillStyle(0x021f1d, 1);
        roomG.fillRect(3950, 50, 800, 670);
        for (let x = 3958; x < 4742; x += 18) {
            roomG.fillStyle(0x451a03, 1);
            roomG.fillRoundedRect(x, 50, 12, 670, 3);
        }



        // Large Panoramic Garden Window Frame & Drapes (X: 4900 to 5550, Y: 110 to 540)
        roomG.lineStyle(8, 0xffffff, 0.95);
        roomG.strokeRoundedRect(4900, 110, 650, 430, 20);
        roomG.lineStyle(4, 0xffffff, 0.9);
        roomG.lineBetween(4900 + 325, 110, 4900 + 325, 540);
        roomG.lineBetween(4900, 290, 5550, 290);
        roomG.lineBetween(4900, 420, 5550, 420);

        // Royal Emerald Velvet Drapes with Gold Tiebacks
        roomG.fillStyle(0x065f46, 1);
        roomG.fillRoundedRect(4860, 90, 70, 470, 12);
        roomG.fillRoundedRect(5520, 90, 70, 470, 12);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(4850, 80, 750, 16);
        roomG.fillCircle(4850, 88, 12);
        roomG.fillCircle(5600, 88, 12);



        // Floor 3: Dark Walnut Hardwood Planks (3840 to 5760)
        roomG.fillStyle(0x3b1807, 1);
        roomG.fillRect(roomW * 2, 720, roomW, sh - 720);
        roomG.lineStyle(2, 0x240e04, 0.85);
        for (let y = 720; y < sh; y += 45) {
            roomG.lineBetween(roomW * 2, y, roomW * 3, y);
        }
        for (let x = roomW * 2; x < roomW * 3; x += 180) {
            roomG.lineBetween(x, 720, x, sh);
        }

        // =========================================================================
        // ARCHWAY 3: LIVING ROOM TO SUNROOM TIMBER PORTAL (X: 5720 to 5800)
        // =========================================================================
        roomG.fillStyle(0x1c1917, 0.95);
        roomG.fillRect(5740, 0, 40, 720);
        roomG.fillStyle(0x78350f, 1);
        roomG.fillRect(5730, 0, 14, 720);
        roomG.fillRect(5776, 0, 14, 720);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(5726, 0, 68, 28);
        roomG.fillStyle(0x000000, 0.35);
        roomG.fillRect(5790, 0, 60, 720);

        // =========================================================================
        // ROOM 4: JAPANDI PATIO SUNROOM LOUNGE (X: 5760 to 7680)
        // =========================================================================
        roomG.fillStyle(0x431407, 1); // Warm terracotta wall
        roomG.fillRect(roomW * 3, 0, roomW, 720);
        roomG.fillStyle(0x7c2d12, 0.7);
        roomG.fillRect(roomW * 3, 0, roomW, 380);

        // Floor-to-Ceiling Panoramic Patio French Doors Grid (X: 5880 to 7050, Y: 80 to 720)
        roomG.lineStyle(6, 0x1e293b, 1);
        roomG.strokeRoundedRect(5880, 80, 1170, 640, 14);
        for (let gx = 5880 + 195; gx < 7050; gx += 195) {
            roomG.lineBetween(gx, 80, gx, 720);
        }
        for (let gy = 240; gy < 720; gy += 160) {
            roomG.lineBetween(5880, gy, 7050, gy);
        }

        // Japanese Shoji Timber Screen Accent on Far Right Wall (X: 7420 to 7660)
        roomG.fillStyle(0x78350f, 1);
        roomG.fillRoundedRect(7420, 100, 240, 620, 8);
        roomG.fillStyle(0xfef3c7, 0.88);
        for (let sy = 120; sy < 700; sy += 70) {
            roomG.fillRect(7435, sy, 100, 55);
            roomG.fillRect(7545, sy, 100, 55);
        }

        // Floor 4: Light Natural Honey Oak Planks (5760 to 7680)
        roomG.fillStyle(0x854d0e, 1);
        roomG.fillRect(roomW * 3, 720, roomW, sh - 720);
        roomG.lineStyle(1.5, 0x713f12, 0.6);
        for (let y = 720; y < sh; y += 40) {
            roomG.lineBetween(roomW * 3, y, ww, y);
        }
        for (let x = roomW * 3; x < ww; x += 150) {
            roomG.lineBetween(x, 720, x, sh);
        }

        // =========================================================================
        // ARCHITECTURAL CONTINUOUS CEILING CROWN MOLDING & BASEBOARD SKIRTING
        // =========================================================================
        // Recessed Soffit Ceiling (Y: 0 to 44)
        roomG.fillStyle(0x0a0f1d, 1);
        roomG.fillRect(0, 0, ww, 28);
        roomG.fillStyle(0x1e293b, 1);
        roomG.fillRect(0, 28, ww, 12);
        roomG.fillStyle(0xd97706, 0.9);
        roomG.fillRect(0, 40, ww, 4);



        // Baseboard Skirting Trim (Y: 706 to 724)
        roomG.fillStyle(0x0f172a, 1);
        roomG.fillRect(0, 706, ww, 18);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(0, 706, ww, 3);

        this.midLayerCont.add(roomG);

        // =========================================================================
        // 3. FURNITURE, FIXTURES & CONTACT SHADOWS (Full Room Scale)
        // =========================================================================
        const furnG = this.scene.add.graphics();

        // --- ROOM 1: Executive Marble Console Table (X: 1050 to 1550) ---
        furnG.fillStyle(0x000000, 0.4);
        furnG.fillEllipse(1300, 775, 260, 24);
        furnG.fillStyle(0xf8fafc, 1);
        furnG.fillRoundedRect(1050, 680, 500, 26, 8);
        furnG.lineStyle(3, 0xd97706, 1);
        furnG.strokeRoundedRect(1050, 680, 500, 26, 8);
        furnG.fillStyle(0xd97706, 1);
        furnG.fillRect(1090, 706, 16, 70);
        furnG.fillRect(1490, 706, 16, 70);
        furnG.fillRect(1090, 760, 416, 10);
        furnG.fillStyle(0x3b82f6, 1);
        furnG.fillRoundedRect(1100, 660, 55, 20, 3);
        furnG.fillStyle(0xef4444, 1);
        furnG.fillRoundedRect(1105, 642, 45, 18, 3);

        // --- ROOM 2: Chef's Quartz Kitchen Island Counter (X: 2320 to 3760) ---
        furnG.fillStyle(0x000000, 0.45);
        furnG.fillRect(2320, 770, 1440, 22);
        furnG.fillStyle(0x0f172a, 1);
        furnG.fillRect(2320, 704, 1440, 76);
        for (let kx = 2320; kx < 3700; kx += 180) {
            furnG.lineStyle(2, 0x1e293b, 1);
            furnG.strokeRect(kx, 704, 180, 76);
            furnG.fillStyle(0xd97706, 1);
            furnG.fillRoundedRect(kx + 75, 714, 35, 7, 2);
        }
        // Solid Quartz Island Countertop Slab
        furnG.fillStyle(0xe2e8f0, 1);
        furnG.fillRoundedRect(2300, 678, 1480, 28, 8);
        furnG.lineStyle(2, 0x94a3b8, 1);
        furnG.strokeRoundedRect(2300, 678, 1480, 28, 8);
        // Integrated Induction Cooktop (X: 2950 to 3170)
        furnG.fillStyle(0x020617, 1);
        furnG.fillRoundedRect(2950, 674, 220, 8, 2);
        furnG.lineStyle(2, 0x00e5ff, 0.8);
        furnG.strokeCircle(3005, 678, 14);
        furnG.strokeCircle(3115, 678, 14);
        // Brass Gooseneck Faucet & Sink (X: 2680)
        furnG.fillStyle(0x334155, 1);
        furnG.fillRect(2630, 674, 110, 6);
        furnG.lineStyle(4, 0xd97706, 1);
        furnG.beginPath();
        furnG.moveTo(2685, 674);
        furnG.lineTo(2685, 610);
        furnG.lineTo(2660, 610);
        furnG.lineTo(2660, 628);
        furnG.strokePath();



        // --- ROOM 3: Living Room Entertainment Credenza & Luxury Rug ---
        furnG.fillStyle(0x000000, 0.35);
        furnG.fillRoundedRect(4000, 755, 1450, 180, 28);
        furnG.fillStyle(0x064e3b, 0.95);
        furnG.fillRoundedRect(4010, 750, 1430, 170, 24);
        furnG.lineStyle(4, 0x10b981, 0.85);
        furnG.strokeRoundedRect(4010, 750, 1430, 170, 24);
        furnG.lineStyle(2, 0x34d399, 0.4);
        furnG.strokeRoundedRect(4030, 765, 1390, 140, 16);

        // Low-Profile TV Entertainment Credenza (X: 4050 to 4700, Y: 675)
        furnG.fillStyle(0x000000, 0.4);
        furnG.fillRect(4050, 755, 650, 16);
        furnG.fillStyle(0x1e293b, 1);
        furnG.fillRoundedRect(4050, 675, 650, 50, 8);
        furnG.lineStyle(3, 0x451a03, 1);
        furnG.strokeRoundedRect(4050, 675, 650, 50, 8);
        furnG.fillStyle(0xd97706, 1);
        furnG.fillRect(4080, 725, 12, 35);
        furnG.fillRect(4660, 725, 12, 35);
        // Soundbar
        furnG.fillStyle(0x020617, 1);
        furnG.fillRoundedRect(4240, 660, 280, 16, 4);
        furnG.fillStyle(0x00e5ff, 1);
        furnG.fillCircle(4380, 668, 3);



        // --- ROOM 4: Sunroom Breakfast Bar & Planters (X: 5760 to 7680) ---
        furnG.fillStyle(0x000000, 0.4);
        furnG.fillRect(6650, 765, 650, 16);
        furnG.fillStyle(0x78350f, 1);
        furnG.fillRoundedRect(6650, 678, 650, 28, 8);
        furnG.lineStyle(3, 0xd97706, 1);
        furnG.strokeRoundedRect(6650, 678, 650, 28, 8);
        furnG.fillStyle(0x1e293b, 1);
        furnG.fillRect(6690, 706, 580, 65);

        // High Bar Stools (at X: 6780, 7150)
        [6780, 7150].forEach(bx => {
            furnG.fillStyle(0x0f172a, 1);
            furnG.fillRoundedRect(bx - 26, 725, 52, 14, 4);
            furnG.lineStyle(3, 0x475569, 1);
            furnG.lineBetween(bx - 18, 739, bx - 26, 820);
            furnG.lineBetween(bx + 18, 739, bx + 26, 820);
            furnG.lineBetween(bx - 22, 780, bx + 22, 780);
        });

        // Smart Robot Vacuum Wall Charging Base Station (X: 6050, Y: 710)
        furnG.fillStyle(0x000000, 0.35);
        furnG.fillEllipse(6060, 755, 70, 18);
        furnG.fillStyle(0x0f172a, 1);
        furnG.fillRoundedRect(6035, 700, 60, 44, 6);
        furnG.lineStyle(2, 0x00e676, 1);
        furnG.strokeRoundedRect(6035, 700, 60, 44, 6);
        furnG.fillStyle(0x00e676, 1);
        furnG.fillCircle(6065, 712, 4);

        // Large Potted Indoor Urban Plants (X: 5850, 7350)
        [5850, 7350].forEach((px, i) => {
            furnG.fillStyle(0x000000, 0.4);
            furnG.fillEllipse(px, 742, 60, 16);
            furnG.fillStyle(i === 0 ? 0xf8fafc : 0xb45309, 1);
            furnG.beginPath();
            furnG.moveTo(px - 35, 655);
            furnG.lineTo(px + 35, 655);
            furnG.lineTo(px + 26, 734);
            furnG.lineTo(px - 26, 734);
            furnG.closePath();
            furnG.fillPath();
            furnG.fillStyle(0x064e3b, 0.95);
            furnG.fillCircle(px, 595, 45);
            furnG.fillCircle(px - 30, 610, 34);
            furnG.fillCircle(px + 30, 610, 34);
            furnG.fillStyle(0x10b981, 0.85);
            furnG.fillCircle(px - 15, 575, 28);
            furnG.fillCircle(px + 16, 575, 26);
        });

        this.midLayerCont.add(furnG);

        // Living Room Designer Velvet Sofa in Mid Layer
        if (this.scene.textures.exists('prop_sofa')) {
            const sofa = this.scene.add.image(5100, 670, 'prop_sofa').setScale(1.25);
            this.midLayerCont.add(sofa);
        }

        // =========================================================================
        // FRAMED WALL ART PAINTINGS ('bg.png')
        // =========================================================================
        // Room 1 (Entry & Study): Centered grand gallery wall art directly above the executive marble console table
        this.createFramedPainting(1300, 250, 340, 210, this.midLayerCont);

        // Room 4 (Patio Sunroom): Japandi botanical gallery art centered on open wall between French doors and Shoji screen
        this.createFramedPainting(7235, 270, 250, 160, this.midLayerCont);

        // =========================================================================
        // 4. NEAR LAYER (1.0x Ratio): Foreground Vignette & Runner
        // =========================================================================
        const nearG = this.scene.add.graphics();
        nearG.fillStyle(0x0f172a, 0.9);
        nearG.fillRect(0, sh - 14, ww, 14);
        nearG.fillStyle(0x000000, 0.18);
        nearG.fillRect(0, 0, ww, 40);
        nearG.fillRect(0, sh - 60, ww, 60);

        this.nearLayerCont.add(nearG);
    }

    // --- ZONE 2: SCHOOL & CAMPUS ENVIRONMENT ---
    private buildSchoolEnvironment() {
        const ww = this.worldWidth; // 7680 (4 rooms * 1920px)
        const sh = this.screenHeight; // 1080
        const roomW = 1920;

        // =========================================================================
        // 1. FAR LAYER (0.35x Parallax): Distant Campus, Athletic Fields & Sky
        // =========================================================================
        const farG = this.scene.add.graphics();

        // Continuous Vibrant Campus Daytime Sky Gradient across far background
        farG.fillStyle(0x0284c7, 1); // Vivid Sky Blue
        farG.fillRect(0, 0, ww, 480);
        farG.fillStyle(0x38bdf8, 0.85);
        farG.fillRect(0, 160, ww, 220);
        farG.fillStyle(0xbae6fd, 0.9);
        farG.fillRect(0, 360, ww, 240);

        // Distant Sun with Golden Rays (visible above courtyard & fields)
        farG.fillStyle(0xfef08a, 0.95);
        farG.fillCircle(1500, 150, 48);
        farG.fillStyle(0xfde047, 0.3);
        farG.fillCircle(1500, 150, 85);
        farG.fillCircle(1500, 150, 130);

        // Fluffy Stylized Cumulus Clouds
        const clouds = [
            { x: 450, y: 120, r: 40 }, { x: 500, y: 105, r: 55 }, { x: 560, y: 120, r: 45 },
            { x: 1100, y: 180, r: 35 }, { x: 1145, y: 165, r: 48 }, { x: 1200, y: 180, r: 38 },
            { x: 2100, y: 140, r: 50 }, { x: 2165, y: 120, r: 68 }, { x: 2240, y: 140, r: 52 },
            { x: 3300, y: 160, r: 42 }, { x: 3360, y: 140, r: 58 }, { x: 3430, y: 160, r: 44 },
            { x: 4400, y: 110, r: 48 }, { x: 4470, y: 90, r: 65 }, { x: 4550, y: 110, r: 50 },
            { x: 5400, y: 170, r: 38 }, { x: 5460, y: 150, r: 54 }, { x: 5530, y: 170, r: 40 },
            { x: 6500, y: 130, r: 46 }, { x: 6570, y: 110, r: 64 }, { x: 6650, y: 130, r: 48 }
        ];
        farG.fillStyle(0xffffff, 0.92);
        clouds.forEach(c => {
            farG.fillCircle(c.x, c.y, c.r);
        });

        // Distant Main Academic School Building Wings & Clock Tower Silhouette
        farG.fillStyle(0x334155, 0.95);
        // Left Wing & Clock Tower (X: 800 to 1700)
        farG.fillRect(820, 240, 260, 280);
        farG.fillRect(1080, 160, 140, 360); // Clock tower body
        // Tower Cupola & Steeple
        farG.beginPath();
        farG.moveTo(1070, 160);
        farG.lineTo(1150, 80);
        farG.lineTo(1230, 160);
        farG.closePath();
        farG.fillPath();
        farG.fillStyle(0x0284c7, 1);
        farG.fillRect(1148, 45, 4, 35); // Flagpole
        farG.fillStyle(0xf59e0b, 1);
        farG.fillTriangle(1152, 45, 1180, 56, 1152, 68); // Gold school pennant flag
        // Clock Face on Tower
        farG.fillStyle(0xffffff, 0.95);
        farG.fillCircle(1150, 210, 26);
        farG.fillStyle(0x0f172a, 1);
        farG.strokeCircle(1150, 210, 26);
        farG.fillRect(1148, 192, 4, 18);
        farG.fillRect(1150, 208, 14, 4);

        // Distant Classroom Wing Windows
        farG.fillStyle(0xfde047, 0.75);
        for (let bx = 840; bx < 1060; bx += 28) {
            for (let by = 260; by < 480; by += 36) {
                farG.fillRect(bx, by, 16, 22);
            }
        }

        // Campus Athletic Track, Bleachers & Football/Soccer Goalposts (X: 2700 to 3800)
        farG.fillStyle(0x15803d, 1); // Distant Green Turf Field
        farG.fillRect(2700, 420, 1100, 180);
        // Running Track Oval Curves (Terracotta/Brick Red)
        farG.fillStyle(0xb91c1c, 0.9);
        farG.fillRect(2720, 480, 1060, 45);
        farG.lineStyle(2, 0xffffff, 0.8);
        farG.lineBetween(2720, 495, 3780, 495);
        farG.lineBetween(2720, 510, 3780, 510);
        // Stadium Floodlight Towers
        [2850, 3600].forEach(tx => {
            farG.fillStyle(0x64748b, 1);
            farG.fillRect(tx, 260, 12, 180);
            farG.fillStyle(0xf8fafc, 1);
            farG.fillRect(tx - 18, 245, 48, 15);
            farG.fillStyle(0xfef08a, 0.8);
            farG.fillCircle(tx - 10, 252, 5);
            farG.fillCircle(tx + 6, 252, 5);
            farG.fillCircle(tx + 22, 252, 5);
        });
        // Soccer / Football Goalposts
        farG.lineStyle(3, 0xffffff, 0.95);
        farG.lineBetween(3180, 430, 3180, 480);
        farG.lineBetween(3260, 430, 3260, 480);
        farG.lineBetween(3180, 445, 3260, 445);

        // Outdoor Campus Trees & Landscaped Forest Silhouettes
        const treeClusters = [
            { x: 300, y: 480, r: 80, c: 0x166534 },
            { x: 600, y: 490, r: 95, c: 0x15803d },
            { x: 1350, y: 470, r: 85, c: 0x14532d },
            { x: 1600, y: 500, r: 105, c: 0x166534 },
            { x: 2500, y: 480, r: 90, c: 0x15803d },
            { x: 3900, y: 490, r: 100, c: 0x14532d },
            { x: 4200, y: 470, r: 85, c: 0x166534 },
            { x: 4950, y: 490, r: 110, c: 0x15803d },
            { x: 5250, y: 475, r: 95, c: 0x166534 },
            { x: 5500, y: 500, r: 100, c: 0x14532d },
            { x: 6050, y: 480, r: 105, c: 0x15803d },
            { x: 6350, y: 465, r: 90, c: 0x166534 },
            { x: 6700, y: 495, r: 115, c: 0x14532d },
            { x: 7000, y: 480, r: 95, c: 0x15803d },
            { x: 7350, y: 490, r: 100, c: 0x166534 }
        ];
        treeClusters.forEach(t => {
            farG.fillStyle(t.c, 0.95);
            farG.fillCircle(t.x, t.y, t.r);
            farG.fillStyle(0x22c55e, 0.35); // Tree canopy highlight
            farG.fillCircle(t.x - 12, t.y - 18, t.r * 0.65);
        });

        // Courtyard Modern Abstract Sculpture behind Room 4 Glass Wall (X: 6200 to 6500)
        farG.fillStyle(0x0284c7, 0.9);
        farG.fillRoundedRect(6320, 390, 80, 110, 16);
        farG.lineStyle(4, 0x38bdf8, 1);
        farG.strokeCircle(6360, 350, 45);
        farG.fillStyle(0xd97706, 0.9);
        farG.fillCircle(6360, 350, 18);

        this.farLayerCont.add(farG);

        // =========================================================================
        // 2. MID LAYER (1.0x Ratio): 4 Full-Screen 1920px Rooms & Architecture
        // =========================================================================
        const roomG = this.scene.add.graphics();

        // =========================================================================
        // ROOM 1: GRAND ENTRANCE FOYER & ADMINISTRATION OFFICE (X: 0 to 1920)
        // =========================================================================
        // Wall: Prestigious Navy Blue with Fluted Architectural Wainscoting
        roomG.fillStyle(0x0f172a, 1); // Deep slate navy
        roomG.fillRect(0, 0, roomW, 720);
        roomG.fillStyle(0x1e293b, 0.75);
        roomG.fillRect(0, 0, roomW, 380);

        // Lower Wall Wood Wainscoting Paneling (Y: 460 to 720)
        roomG.fillStyle(0x1e293b, 1);
        roomG.fillRect(0, 460, roomW, 260);
        roomG.fillStyle(0x0284c7, 0.9); // School Accent Mold Ribbon
        roomG.fillRect(0, 456, roomW, 6);
        for (let px = 280; px < roomW - 60; px += 180) {
            roomG.fillStyle(0x0f172a, 1);
            roomG.fillRoundedRect(px, 475, 155, 230, 4);
            roomG.lineStyle(2, 0x334155, 1);
            roomG.strokeRoundedRect(px, 475, 155, 230, 4);
            roomG.lineStyle(1.5, 0x0284c7, 0.5);
            roomG.strokeRoundedRect(px + 8, 483, 139, 214, 3);
        }

        // Heavy Grand Entrance Double Doors with Frosted Glass (X: 0 to 260, Y: 60 to 720)
        roomG.fillStyle(0x0284c7, 1); // Primary School Blue Door Frame
        roomG.fillRect(0, 60, 260, 660);
        roomG.lineStyle(5, 0x0369a1, 1);
        roomG.strokeRect(0, 60, 260, 660);
        roomG.lineStyle(2, 0x38bdf8, 0.9); // Cyan border inlay
        roomG.strokeRect(4, 64, 252, 652);

        // Transom Header Window with Frosted School District Glass
        roomG.fillStyle(0x0f172a, 0.95);
        roomG.fillRoundedRect(16, 74, 228, 26, 4);
        roomG.fillStyle(0x38bdf8, 0.7);
        roomG.fillRect(20, 78, 220, 18);
        roomG.lineStyle(1.5, 0xffffff, 0.8);
        roomG.strokeRoundedRect(16, 74, 228, 26, 4);

        // Double Door Glass Panels with Frosted Privacy Geometric Ribbons
        const schoolDoorPanels = [
            { x: 20, y: 115, w: 100, h: 260 },
            { x: 20, y: 395, w: 100, h: 305 },
            { x: 140, y: 115, w: 100, h: 260 },
            { x: 140, y: 395, w: 100, h: 305 }
        ];
        schoolDoorPanels.forEach(p => {
            roomG.fillStyle(0x0f172a, 1);
            roomG.fillRoundedRect(p.x, p.y, p.w, p.h, 6);
            roomG.fillStyle(0x38bdf8, 0.35); // Frosted Glass
            roomG.fillRoundedRect(p.x + 4, p.y + 4, p.w - 8, p.h - 8, 4);
            roomG.lineStyle(2, 0x0284c7, 0.8);
            roomG.strokeRoundedRect(p.x + 4, p.y + 4, p.w - 8, p.h - 8, 4);
            // Frosted School Diagonal Stripes
            roomG.lineStyle(1.5, 0xffffff, 0.4);
            roomG.lineBetween(p.x + 10, p.y + 20, p.x + p.w - 10, p.y + 80);
            roomG.lineBetween(p.x + 10, p.y + 80, p.x + p.w - 10, p.y + 140);
        });

        // Heavy Brushed Aluminum Push Bars & Digital Access Control Keypad
        roomG.fillStyle(0xe2e8f0, 1);
        roomG.fillRoundedRect(15, 410, 105, 14, 4); // Left door push bar
        roomG.fillRoundedRect(140, 410, 105, 14, 4); // Right door push bar
        roomG.fillStyle(0x0f172a, 0.95);
        roomG.fillRoundedRect(220, 360, 30, 95, 6);
        roomG.lineStyle(2, 0x0284c7, 1);
        roomG.strokeRoundedRect(220, 360, 30, 95, 6);
        roomG.fillStyle(0x00e5ff, 1);
        roomG.fillCircle(235, 375, 5); // RFID Access Active Light
        roomG.fillStyle(0x22c55e, 1);
        roomG.fillCircle(235, 395, 4); // Authorized Badge Reader

        // School Entrance Welcome Floor Runner
        roomG.fillStyle(0x0f172a, 0.95);
        roomG.fillRoundedRect(20, 735, 240, 55, 10);
        roomG.lineStyle(3, 0x0284c7, 0.9);
        roomG.strokeRoundedRect(20, 735, 240, 55, 10);
        roomG.lineStyle(1.5, 0xfde047, 0.6);
        roomG.strokeRoundedRect(28, 742, 224, 41, 6);

        // Fluted Acoustic Wood Feature Wall (X: 380 to 940)
        roomG.fillStyle(0x090d16, 1);
        roomG.fillRect(380, 70, 560, 650);
        for (let x = 388; x < 932; x += 22) {
            roomG.fillStyle(0x78350f, 1); // Oak wood slat
            roomG.fillRoundedRect(x, 70, 15, 650, 3);
            roomG.fillStyle(0x92400e, 0.6);
            roomG.fillRect(x + 2, 70, 4, 650);
        }

        // =========================================================================
        // =========================================================================
        // SCHOOL CHAMPIONSHIP TROPHY & AWARD SHOWCASE (X: 385 to 935, Y: 95 to 670)
        // =========================================================================
        const tcX = 385;
        const tcY = 95;
        const tcW = 550;
        const tcH = 575;

        // 1. Deep Wall Ambient Shadow
        roomG.fillStyle(0x000000, 0.48);
        roomG.fillRoundedRect(tcX + 10, tcY + 12, tcW, tcH, 16);
        roomG.fillStyle(0x000000, 0.25);
        roomG.fillRoundedRect(tcX + 16, tcY + 18, tcW - 12, tcH - 12, 16);

        // 2. Architectural Top Cornice Molding (Mahogany Crown)
        roomG.fillStyle(0x291408, 1);
        roomG.fillRoundedRect(tcX - 10, tcY - 14, tcW + 20, 24, 6);
        roomG.fillStyle(0x451a03, 1);
        roomG.fillRect(tcX - 6, tcY - 8, tcW + 12, 14);
        roomG.fillStyle(0x78350f, 1);
        roomG.fillRect(tcX - 2, tcY - 2, tcW + 4, 6);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(tcX + 10, tcY + 2, tcW - 20, 2.5); // Brass Accent Inlay

        // 3. Main Cabinet Chassis (Solid Dark Walnut & Brass Trim)
        roomG.fillStyle(0x1c110a, 1);
        roomG.fillRoundedRect(tcX, tcY, tcW, tcH, 8);
        roomG.lineStyle(3, 0x451a03, 1);
        roomG.strokeRoundedRect(tcX, tcY, tcW, tcH, 8);

        // Vertical Fluted Side Pilasters (Left & Right Framing Columns)
        // Left Pilaster
        roomG.fillStyle(0x2e160a, 1);
        roomG.fillRoundedRect(tcX + 4, tcY + 6, 20, tcH - 12, 4);
        roomG.fillStyle(0xd97706, 0.9);
        roomG.fillRect(tcX + 8, tcY + 10, 3, tcH - 20);
        roomG.fillRect(tcX + 16, tcY + 10, 3, tcH - 20);
        // Right Pilaster
        roomG.fillStyle(0x2e160a, 1);
        roomG.fillRoundedRect(tcX + tcW - 24, tcY + 6, 20, tcH - 12, 4);
        roomG.fillStyle(0xd97706, 0.9);
        roomG.fillRect(tcX + tcW - 20, tcY + 10, 3, tcH - 20);
        roomG.fillRect(tcX + tcW - 12, tcY + 10, 3, tcH - 20);

        // 4. Interior Display Bay (Midnight Velvet Acoustic Backing)
        const bayX = tcX + 26;
        const bayY = tcY + 36;
        const bayW = tcW - 52;
        const bayH = 464;
        roomG.fillStyle(0x090d16, 0.98);
        roomG.fillRect(bayX, bayY, bayW, bayH);

        // Subtle Vertical Oak Slats Texture on Backing
        roomG.fillStyle(0x0f172a, 0.6);
        for (let vx = bayX + 16; vx < bayX + bayW; vx += 24) {
            roomG.fillRect(vx, bayY, 2, bayH);
        }

        // Cabinet Header Plaque: "CHIMPU ACADEMY • HALL OF EXCELLENCE"
        roomG.fillStyle(0x18181b, 1);
        roomG.fillRoundedRect(bayX + 16, tcY + 10, bayW - 32, 22, 4);
        roomG.lineStyle(1.5, 0xd97706, 1);
        roomG.strokeRoundedRect(bayX + 16, tcY + 10, bayW - 32, 22, 4);
        // Golden Laurel & Text Simulation
        roomG.fillStyle(0xf59e0b, 1);
        roomG.fillCircle(bayX + 32, tcY + 21, 6);
        roomG.fillCircle(bayX + bayW - 32, tcY + 21, 6);
        roomG.fillStyle(0xfef08a, 0.95);
        roomG.fillRect(bayX + 46, tcY + 17, bayW - 92, 7);
        roomG.fillStyle(0xf59e0b, 1);
        roomG.fillRect(bayX + 70, tcY + 25, bayW - 140, 2);

        // 5. Overhead Halogen Downlights & Ambient Spotlight Cones
        const spotX = [bayX + 80, bayX + bayW / 2, bayX + bayW - 80];
        spotX.forEach(sx => {
            // Light Fixture
            roomG.fillStyle(0x475569, 1);
            roomG.fillCircle(sx, bayY + 3, 7);
            roomG.fillStyle(0xfef08a, 1);
            roomG.fillCircle(sx, bayY + 3, 4);

            // Light Cone
            roomG.fillStyle(0xfef08a, 0.06);
            roomG.beginPath();
            roomG.moveTo(sx, bayY + 4);
            roomG.lineTo(sx - 75, bayY + 155);
            roomG.lineTo(sx + 75, bayY + 155);
            roomG.closePath();
            roomG.fillPath();
        });

        // 6. Illuminated 10mm Tempered Glass Shelves
        const trophyShelves = [bayY + 115, bayY + 230, bayY + 345, bayY + 460];
        trophyShelves.forEach(sy => {
            // Glass Shelf Thickness & Cyan Refraction
            roomG.fillStyle(0x0284c7, 0.85);
            roomG.fillRect(bayX, sy, bayW, 10);
            roomG.fillStyle(0x38bdf8, 0.95);
            roomG.fillRect(bayX, sy, bayW, 3);
            roomG.fillStyle(0xffffff, 1);
            roomG.fillRect(bayX, sy, bayW, 1.5);

            // Warm LED Under-Shelf Downlight Glow
            roomG.fillStyle(0xfacc15, 0.16);
            roomG.fillRect(bayX + 8, sy + 10, bayW - 16, 12);
            roomG.fillStyle(0x38bdf8, 0.08);
            roomG.fillRect(bayX + 8, sy + 22, bayW - 16, 20);
        });

        // =========================================================================
        // TIER 1 (TOP SHELF): CHAMPIONSHIP CUPS & SCIENCE SPIRES
        // =========================================================================
        const t1ShelfY = trophyShelves[0];

        // --- 1. Grand Gold Championship Cup (Left: X: bayX + 80) ---
        const c1X = bayX + 80;
        // Tiered Black Marble Plinth
        roomG.fillStyle(0x09090b, 1);
        roomG.fillRoundedRect(c1X - 26, t1ShelfY - 14, 52, 14, 3);
        roomG.fillStyle(0x18181b, 1);
        roomG.fillRoundedRect(c1X - 22, t1ShelfY - 24, 44, 10, 2);
        // Engraved Gold Brass Plaque
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(c1X - 16, t1ShelfY - 19, 32, 6);
        roomG.fillStyle(0xfef08a, 1);
        roomG.fillRect(c1X - 12, t1ShelfY - 17, 24, 2);

        // Fluted Gold Pedestal Stem
        roomG.fillStyle(0xb45309, 1);
        roomG.fillRect(c1X - 6, t1ShelfY - 44, 12, 20);
        roomG.fillStyle(0xf59e0b, 1);
        roomG.fillRect(c1X - 3, t1ShelfY - 44, 6, 20);

        // Gold Trophy Cup Chalice
        roomG.fillStyle(0xf59e0b, 1);
        roomG.beginPath();
        roomG.arc(c1X, t1ShelfY - 60, 24, 0, Math.PI, false);
        roomG.lineTo(c1X + 24, t1ShelfY - 82);
        roomG.lineTo(c1X - 24, t1ShelfY - 82);
        roomG.closePath();
        roomG.fillPath();

        // Polished Gold Inner Shadow & Specular Highlights
        roomG.fillStyle(0xfde047, 1);
        roomG.fillRect(c1X - 18, t1ShelfY - 80, 10, 28);
        roomG.fillStyle(0xffffff, 0.9);
        roomG.fillRect(c1X - 14, t1ShelfY - 78, 3, 22);

        // Curved Trophy Handles
        roomG.lineStyle(4, 0xb45309, 1);
        roomG.strokeCircle(c1X - 26, t1ShelfY - 68, 12);
        roomG.strokeCircle(c1X + 26, t1ShelfY - 68, 12);
        roomG.lineStyle(2.5, 0xfde047, 1);
        roomG.strokeCircle(c1X - 26, t1ShelfY - 68, 12);
        roomG.strokeCircle(c1X + 26, t1ShelfY - 68, 12);

        // Trophy Lid & Star Finial
        roomG.fillStyle(0xd97706, 1);
        roomG.fillEllipse(c1X, t1ShelfY - 82, 24, 6);
        roomG.fillStyle(0xfacc15, 1);
        roomG.fillCircle(c1X, t1ShelfY - 92, 7);
        roomG.fillTriangle(c1X, t1ShelfY - 102, c1X - 5, t1ShelfY - 92, c1X + 5, t1ShelfY - 92);

        // --- 2. Crystal Science & AI Innovation Spire (Center: X: bayX + bayW / 2) ---
        const c2X = bayX + bayW / 2;
        // Hexagonal Granite Base
        roomG.fillStyle(0x1e293b, 1);
        roomG.fillRoundedRect(c2X - 28, t1ShelfY - 12, 56, 12, 3);
        roomG.fillStyle(0x0284c7, 1);
        roomG.fillRect(c2X - 20, t1ShelfY - 18, 40, 6);

        // Multi-Faceted Crystal Spire
        roomG.fillStyle(0x0284c7, 0.85);
        roomG.fillTriangle(c2X, t1ShelfY - 98, c2X - 22, t1ShelfY - 18, c2X + 22, t1ShelfY - 18);
        roomG.fillStyle(0x38bdf8, 0.9);
        roomG.fillTriangle(c2X, t1ShelfY - 98, c2X - 10, t1ShelfY - 18, c2X + 18, t1ShelfY - 18);
        roomG.fillStyle(0xffffff, 0.95);
        roomG.fillTriangle(c2X, t1ShelfY - 98, c2X, t1ShelfY - 18, c2X + 6, t1ShelfY - 18);

        // Glowing Orbital Ring & Neural Core inside crystal
        roomG.lineStyle(2, 0x00e5ff, 1);
        roomG.strokeEllipse(c2X, t1ShelfY - 58, 22, 9);
        roomG.fillStyle(0xfde047, 1);
        roomG.fillCircle(c2X, t1ShelfY - 58, 4);

        // --- 3. State Robotics Olympiad Gold Cup (Right: X: bayX + bayW - 80) ---
        const c3X = bayX + bayW - 80;
        // Walnut & Brass Gear Base
        roomG.fillStyle(0x451a03, 1);
        roomG.fillRoundedRect(c3X - 24, t1ShelfY - 14, 48, 14, 3);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillCircle(c3X, t1ShelfY - 22, 14);

        // Platinum/Gold Chalice
        roomG.fillStyle(0xca8a04, 1);
        roomG.fillRoundedRect(c3X - 5, t1ShelfY - 42, 10, 20, 2);
        roomG.fillStyle(0xfacc15, 1);
        roomG.fillCircle(c3X, t1ShelfY - 62, 22);
        roomG.fillStyle(0xfef08a, 1);
        roomG.fillCircle(c3X - 6, t1ShelfY - 66, 10);
        // Laurel Wreath Ring
        roomG.lineStyle(3, 0xf59e0b, 1);
        roomG.strokeCircle(c3X, t1ShelfY - 62, 26);
        roomG.fillStyle(0x10b981, 1);
        roomG.fillCircle(c3X, t1ShelfY - 88, 5);

        // =========================================================================
        // TIER 2: CHAMPIONSHIP PENNANTS & FRAMED OLYMPIC MEDALS
        // =========================================================================
        const t2ShelfY = trophyShelves[1];

        // --- 1. Royal Blue & Gold Championship Felt Pennant (Left) ---
        const penX = bayX + 35;
        const penY = t2ShelfY - 85;
        // Wooden Pennant Pole & Tassel
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(penX, penY - 6, 8, 92);
        roomG.fillCircle(penX + 4, penY - 6, 6);
        // Pennant Body
        roomG.fillStyle(0x1e3a8a, 1);
        roomG.beginPath();
        roomG.moveTo(penX + 8, penY);
        roomG.lineTo(penX + 160, penY + 38);
        roomG.lineTo(penX + 8, penY + 76);
        roomG.closePath();
        roomG.fillPath();
        roomG.lineStyle(2, 0xf59e0b, 1);
        roomG.strokePath();

        // Pennant Gold Border & Text
        roomG.fillStyle(0xf59e0b, 1);
        roomG.fillRect(penX + 14, penY + 8, 8, 60);
        roomG.fillStyle(0xfde047, 0.95);
        roomG.fillRect(penX + 28, penY + 28, 70, 7);
        roomG.fillRect(penX + 28, penY + 40, 48, 5);
        roomG.fillStyle(0xffffff, 1);
        roomG.fillCircle(penX + 120, penY + 38, 7);

        // --- 2. Deluxe Shadowbox Framed Medals (Center & Right) ---
        const medalBoxX = bayX + 225;
        const medalBoxY = t2ShelfY - 95;
        const medalBoxW = bayW - 240;
        const medalBoxH = 90;

        // Shadowbox Mahogany Frame
        roomG.fillStyle(0x271206, 1);
        roomG.fillRoundedRect(medalBoxX, medalBoxY, medalBoxW, medalBoxH, 6);
        roomG.lineStyle(2, 0xd97706, 1);
        roomG.strokeRoundedRect(medalBoxX, medalBoxY, medalBoxW, medalBoxH, 6);

        // Crimson Velvet Inset Backing
        roomG.fillStyle(0x450a0a, 1);
        roomG.fillRoundedRect(medalBoxX + 6, medalBoxY + 6, medalBoxW - 12, medalBoxH - 12, 4);

        // 3 Suspended Medals (Gold, Silver, Bronze)
        const medals = [
            { x: medalBoxX + 40, color: 0xfacc15, border: 0xd97706, ribbon: 0x3b82f6, ribbon2: 0xef4444 },
            { x: medalBoxX + medalBoxW / 2, color: 0xe2e8f0, border: 0x94a3b8, ribbon: 0x10b981, ribbon2: 0xfbbf24 },
            { x: medalBoxX + medalBoxW - 40, color: 0xd97706, border: 0x92400e, ribbon: 0x6366f1, ribbon2: 0xffffff }
        ];

        medals.forEach(m => {
            // Folded V-Ribbon
            roomG.fillStyle(m.ribbon, 1);
            roomG.fillTriangle(m.x - 12, medalBoxY + 10, m.x, medalBoxY + 36, m.x - 4, medalBoxY + 36);
            roomG.fillStyle(m.ribbon2, 1);
            roomG.fillTriangle(m.x + 12, medalBoxY + 10, m.x, medalBoxY + 36, m.x + 4, medalBoxY + 36);

            // Metallic Medal Disc
            roomG.fillStyle(m.color, 1);
            roomG.fillCircle(m.x, medalBoxY + 52, 16);
            roomG.lineStyle(2.5, m.border, 1);
            roomG.strokeCircle(m.x, medalBoxY + 52, 16);

            // Embossed Center Crest & Star
            roomG.fillStyle(0xffffff, 0.9);
            roomG.fillCircle(m.x - 4, medalBoxY + 48, 5);
            roomG.fillStyle(m.border, 1);
            roomG.fillCircle(m.x, medalBoxY + 52, 7);
            roomG.fillStyle(m.color, 1);
            roomG.fillCircle(m.x, medalBoxY + 52, 4);
        });

        // =========================================================================
        // TIER 3: CARVED WOODEN COMMENDATION PLAQUES & CERTIFICATES
        // =========================================================================
        const t3ShelfY = trophyShelves[2];

        const plaqueSpacing = (bayW - 20) / 4;
        for (let i = 0; i < 4; i++) {
            const px = bayX + 12 + i * plaqueSpacing;
            const py = t3ShelfY - 90;
            const pw = plaqueSpacing - 12;
            const ph = 85;

            // Carved Cherry-Wood Beveled Backboard
            roomG.fillStyle(0x381206, 1);
            roomG.fillRoundedRect(px, py, pw, ph, 5);
            roomG.lineStyle(2, 0xd97706, 1);
            roomG.strokeRoundedRect(px, py, pw, ph, 5);

            // Brass / Parchment Inset Certificate Plate
            roomG.fillStyle(0xfef08a, 0.95);
            roomG.fillRoundedRect(px + 6, py + 6, pw - 12, ph - 12, 3);
            roomG.lineStyle(1, 0xb45309, 0.8);
            roomG.strokeRoundedRect(px + 8, py + 8, pw - 16, ph - 16, 2);

            // Certificate Heading & Text lines
            roomG.fillStyle(0x451a03, 0.95);
            roomG.fillRect(px + 14, py + 14, pw - 28, 5);
            roomG.fillStyle(0x78350f, 0.8);
            roomG.fillRect(px + 14, py + 23, pw - 34, 3);
            roomG.fillRect(px + 14, py + 29, pw - 30, 3);
            roomG.fillRect(px + 14, py + 35, pw - 40, 3);

            // Ruby Wax Seal Crest with Ribbon Tail
            const sealX = px + pw / 2;
            const sealY = py + ph - 22;
            roomG.fillStyle(0x991b1b, 1);
            roomG.fillTriangle(sealX - 6, sealY, sealX - 8, sealY + 12, sealX, sealY + 8);
            roomG.fillTriangle(sealX + 6, sealY, sealX + 8, sealY + 12, sealX, sealY + 8);
            roomG.fillCircle(sealX, sealY, 7);
            roomG.fillStyle(0xf59e0b, 1);
            roomG.fillCircle(sealX, sealY, 3);
        }

        // =========================================================================
        // TIER 4: LEATHER-BOUND YEARBOOKS, ROSETTES & BRASS GLOBE
        // =========================================================================
        const t4ShelfY = trophyShelves[3];

        // --- 1. Row of Leather-Bound School Annual Yearbooks (Left Side) ---
        const showcaseYearbooks = [
            { cover: 0x1e3a8a, gold: true },
            { cover: 0x1e293b, gold: true },
            { cover: 0x064e3b, gold: true },
            { cover: 0x450a0a, gold: true },
            { cover: 0x78350f, gold: true },
            { cover: 0x1e1b4b, gold: true },
            { cover: 0x0f172a, gold: false },
            { cover: 0x15803d, gold: true }
        ];

        let bkX = bayX + 14;
        showcaseYearbooks.forEach(bk => {
            const bkW = 24;
            const bkH = 92;
            const bkY = t4ShelfY - bkH;

            // Leather Book Spine
            roomG.fillStyle(bk.cover, 1);
            roomG.fillRoundedRect(bkX, bkY, bkW, bkH, 3);
            roomG.lineStyle(1, 0x0f172a, 0.9);
            roomG.strokeRoundedRect(bkX, bkY, bkW, bkH, 3);

            // Gold-Foil Embossed Spine Bands & Label
            if (bk.gold) {
                roomG.fillStyle(0xd97706, 1);
                roomG.fillRect(bkX + 2, bkY + 10, bkW - 4, 2);
                roomG.fillRect(bkX + 2, bkY + 14, bkW - 4, 2);
                roomG.fillRect(bkX + 2, bkY + bkH - 14, bkW - 4, 2);
                roomG.fillRect(bkX + 2, bkY + bkH - 10, bkW - 4, 2);

                // Title Box
                roomG.fillStyle(0xfde047, 0.9);
                roomG.fillRect(bkX + 5, bkY + 28, bkW - 10, 24);
            }

            bkX += bkW + 5;
        });

        // --- 2. Pair of 1st & 2nd Place Prize Rosettes ---
        const rosX = bkX + 22;
        const rosY = t4ShelfY - 55;
        // Blue 1st Place Rosette
        roomG.fillStyle(0x1d4ed8, 1);
        roomG.fillTriangle(rosX - 4, rosY + 12, rosX - 10, rosY + 40, rosX - 2, rosY + 36);
        roomG.fillTriangle(rosX + 4, rosY + 12, rosX + 10, rosY + 40, rosX + 2, rosY + 36);
        roomG.fillCircle(rosX, rosY, 14);
        roomG.fillStyle(0xfde047, 1);
        roomG.fillCircle(rosX, rosY, 7);

        // Red 2nd Place Rosette
        const ros2X = rosX + 36;
        roomG.fillStyle(0xb91c1c, 1);
        roomG.fillTriangle(ros2X - 4, rosY + 12, ros2X - 10, rosY + 40, ros2X - 2, rosY + 36);
        roomG.fillTriangle(ros2X + 4, rosY + 12, ros2X + 10, rosY + 40, ros2X + 2, rosY + 36);
        roomG.fillCircle(ros2X, rosY, 14);
        roomG.fillStyle(0xe2e8f0, 1);
        roomG.fillCircle(ros2X, rosY, 7);

        // --- 3. Gilded Brass Desktop Armillary Science Globe (Right Side) ---
        const glbX = bayX + bayW - 55;
        const glbY = t4ShelfY - 60;
        // Wooden Stand
        roomG.fillStyle(0x381206, 1);
        roomG.fillRoundedRect(glbX - 18, t4ShelfY - 14, 36, 14, 3);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(glbX - 4, t4ShelfY - 32, 8, 18);
        // Brass Ring & Globe
        roomG.lineStyle(3, 0xf59e0b, 1);
        roomG.strokeCircle(glbX, glbY, 20);
        roomG.lineStyle(2, 0xd97706, 0.9);
        roomG.strokeEllipse(glbX, glbY, 20, 8);
        roomG.fillStyle(0x0284c7, 1);
        roomG.fillCircle(glbX, glbY, 12);
        roomG.fillStyle(0x10b981, 1);
        roomG.fillCircle(glbX - 3, glbY - 2, 5);

        // =========================================================================
        // 7. LOWER STORAGE LOCKERS / PRESENTATION DRAWERS (Y: t4ShelfY + 6 to tcY + tcH - 12)
        // =========================================================================
        const lowY = t4ShelfY + 8;
        const lowH = tcY + tcH - lowY - 12;
        const doorW = (bayW - 12) / 2;

        // Left Door
        roomG.fillStyle(0x271206, 1);
        roomG.fillRoundedRect(bayX, lowY, doorW, lowH, 4);
        roomG.lineStyle(2, 0x451a03, 1);
        roomG.strokeRoundedRect(bayX, lowY, doorW, lowH, 4);
        // Beveled Inner Inset Panel
        roomG.fillStyle(0x1a0c04, 1);
        roomG.fillRoundedRect(bayX + 8, lowY + 8, doorW - 16, lowH - 16, 3);
        // Polished Brass Pull Handle & Keyhole
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRoundedRect(bayX + doorW - 14, lowY + lowH / 2 - 12, 5, 24, 2);
        roomG.fillCircle(bayX + doorW - 12, lowY + lowH / 2 + 18, 3);

        // Right Door
        roomG.fillStyle(0x271206, 1);
        roomG.fillRoundedRect(bayX + doorW + 12, lowY, doorW, lowH, 4);
        roomG.lineStyle(2, 0x451a03, 1);
        roomG.strokeRoundedRect(bayX + doorW + 12, lowY, doorW, lowH, 4);
        // Beveled Inner Inset Panel
        roomG.fillStyle(0x1a0c04, 1);
        roomG.fillRoundedRect(bayX + doorW + 20, lowY + 8, doorW - 16, lowH - 16, 3);
        // Polished Brass Pull Handle & Keyhole
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRoundedRect(bayX + doorW + 21, lowY + lowH / 2 - 12, 5, 24, 2);
        roomG.fillCircle(bayX + doorW + 23, lowY + lowH / 2 + 18, 3);

        // =========================================================================
        // 8. FRONT GLASS SLIDING DOORS & SPECULAR AMBIENT REFLECTION
        // =========================================================================
        // Center Sliding Door Seam / Mullion
        roomG.lineStyle(2, 0x38bdf8, 0.4);
        roomG.lineBetween(bayX + bayW / 2, bayY, bayX + bayW / 2, t4ShelfY);

        // Ambient Specular Diagonal Glare Streaks Across Front Glass
        roomG.fillStyle(0xffffff, 0.04);
        roomG.fillTriangle(bayX, bayY, bayX + 180, bayY, bayX, bayY + 320);
        roomG.fillStyle(0xffffff, 0.03);
        roomG.fillTriangle(bayX + 140, bayY, bayX + 340, bayY, bayX, bayY + 440);

        // Floor 1: Polished Geometric Terrazzo Linoleum Tile (X: 0 to 1920)
        roomG.fillStyle(0x1e293b, 1);
        roomG.fillRect(0, 720, roomW, sh - 720);
        roomG.lineStyle(2, 0x334155, 0.8);
        for (let x = 0; x < roomW; x += 120) {
            for (let y = 720; y < sh; y += 90) {
                roomG.strokeRect(x, y, 120, 90);
                roomG.fillStyle(0x0284c7, 0.12);
                roomG.fillRect(x + 8, y + 8, 104, 74);
            }
        }

        // =========================================================================
        // ARCHWAY 1: FOYER TO STEM LAB CASED PORTAL (X: 1880 to 1960)
        // =========================================================================
        roomG.fillStyle(0x0284c7, 0.95);
        roomG.fillRect(1900, 0, 40, 720);
        roomG.fillStyle(0x0369a1, 1);
        roomG.fillRect(1890, 0, 16, 720);
        roomG.fillRect(1934, 0, 16, 720);
        roomG.fillStyle(0x38bdf8, 1);
        roomG.fillRect(1886, 0, 68, 28);
        // Illuminated Directional Signage Header
        roomG.fillStyle(0x0f172a, 1);
        roomG.fillRoundedRect(1860, 36, 120, 34, 6);
        roomG.lineStyle(2, 0x00e5ff, 1);
        roomG.strokeRoundedRect(1860, 36, 120, 34, 6);

        // =========================================================================
        // ROOM 2: HIGH-TECH COMPUTER LAB (X: 1920 to 3840)
        // =========================================================================
        roomG.fillStyle(0x070d1e, 1); // Deep Tech Navy Wall
        roomG.fillRect(roomW, 0, roomW, 720);
        roomG.fillStyle(0x0b1736, 0.75);
        roomG.fillRect(roomW, 0, roomW, 400);

        // Ambient Ceiling & Perimeter LED Light Strips (X: 1920 to 3840)
        roomG.fillStyle(0x00e5ff, 0.9); // Electric Cyan LED Ceiling Strip
        roomG.fillRect(roomW, 14, roomW, 4);
        roomG.fillStyle(0x00e5ff, 0.15); // LED Downward Ambient Glow
        roomG.fillRect(roomW, 18, roomW, 32);

        // Recessed Modern LED Ceiling Light Panels
        for (let lx = roomW + 160; lx < roomW * 2 - 100; lx += 280) {
            roomG.fillStyle(0x1e293b, 1);
            roomG.fillRoundedRect(lx, 8, 160, 16, 4);
            roomG.fillStyle(0xe0f2fe, 0.95);
            roomG.fillRoundedRect(lx + 8, 11, 144, 10, 2);
            roomG.fillStyle(0x38bdf8, 0.25);
            roomG.fillRect(lx - 20, 24, 200, 45); // Downlight beam
        }

        // Vertical Wall Accent LED Strips & Structural Pillars
        [roomW + 80, roomW + 320, roomW + 980, roomW + 1520, roomW + 1800].forEach(vx => {
            roomG.fillStyle(0x0f172a, 0.9);
            roomG.fillRect(vx, 30, 22, 650);
            roomG.fillStyle(0x00e5ff, 0.85); // Vertical Neon Strip
            roomG.fillRect(vx + 9, 40, 4, 630);
            roomG.fillStyle(0x00e5ff, 0.12);
            roomG.fillRect(vx + 3, 40, 16, 630);
        });

        // Computer Lab Department Sign Header
        roomG.fillStyle(0x0f172a, 0.95);
        roomG.fillRoundedRect(2420, 36, 380, 32, 6);
        roomG.lineStyle(2, 0x00e5ff, 0.8);
        roomG.strokeRoundedRect(2420, 36, 380, 32, 6);
        roomG.fillStyle(0x00e5ff, 1);
        roomG.fillCircle(2440, 52, 5); // Status indicator
        roomG.fillStyle(0x38bdf8, 1);
        roomG.fillRect(2460, 48, 220, 8); // Digital text bar representation
        roomG.fillStyle(0x10b981, 1);
        roomG.fillRoundedRect(2710, 44, 75, 16, 3); // "ONLINE" badge

        // -------------------------------------------------------------------------
        // LARGE SCREEN 1: 85" SMART INTERACTIVE PRESENTATION DISPLAY (X: 2280 to 2840, Y: 85 to 345)
        // -------------------------------------------------------------------------
        // Wall Mount Backing & Ambient LED Backlight
        roomG.fillStyle(0x00e5ff, 0.2);
        roomG.fillRoundedRect(2270, 77, 580, 276, 16);
        roomG.fillStyle(0x020617, 1);
        roomG.fillRoundedRect(2276, 83, 568, 264, 12);
        roomG.lineStyle(3, 0x334155, 1);
        roomG.strokeRoundedRect(2276, 83, 568, 264, 12);

        // Screen Glass Display
        roomG.fillStyle(0x0a1428, 1);
        roomG.fillRoundedRect(2286, 93, 548, 244, 8);

        // UI Header Bar on Screen
        roomG.fillStyle(0x0f2347, 1);
        roomG.fillRoundedRect(2292, 98, 536, 32, 6);
        roomG.fillStyle(0x00e5ff, 0.9);
        roomG.fillRect(2304, 108, 140, 12); // Title block
        roomG.fillStyle(0x10b981, 1);
        roomG.fillCircle(2800, 114, 5); // Green live dot
        roomG.fillStyle(0x38bdf8, 1);
        roomG.fillRect(2720, 110, 68, 8);

        // Left Window: AI Neural Network Architecture Graph
        roomG.fillStyle(0x071126, 0.9);
        roomG.fillRoundedRect(2298, 138, 230, 190, 6);
        roomG.lineStyle(1.5, 0x0284c7, 0.7);
        roomG.strokeRoundedRect(2298, 138, 230, 190, 6);
        // Neural network layers & nodes
        const nnLayers = [
            [155, 185, 215, 245, 275],
            [165, 195, 225, 255, 285],
            [175, 205, 235, 265],
            [200, 230]
        ];
        const layerXs = [2325, 2380, 2440, 2500];
        // Connections
        for (let l = 0; l < layerXs.length - 1; l++) {
            nnLayers[l].forEach(y1 => {
                nnLayers[l + 1].forEach(y2 => {
                    roomG.lineStyle(1, 0x00e5ff, 0.22);
                    roomG.lineBetween(layerXs[l], y1, layerXs[l + 1], y2);
                });
            });
        }
        // Nodes
        nnLayers.forEach((layer, li) => {
            const col = li === 0 ? 0x38bdf8 : li === layerXs.length - 1 ? 0x10b981 : 0x00e5ff;
            layer.forEach(ny => {
                roomG.fillStyle(col, 1);
                roomG.fillCircle(layerXs[li], ny, 4);
                roomG.fillStyle(0xffffff, 0.8);
                roomG.fillCircle(layerXs[li], ny, 1.5);
            });
        });

        // Right Window: Python AI Model Code & Training Loss Curve
        roomG.fillStyle(0x071126, 0.9);
        roomG.fillRoundedRect(2538, 138, 286, 190, 6);
        roomG.lineStyle(1.5, 0x0284c7, 0.7);
        roomG.strokeRoundedRect(2538, 138, 286, 190, 6);

        // Code Lines Representation (Syntax Highlighted)
        const codeColors = [0xec4899, 0x38bdf8, 0x10b981, 0xf59e0b, 0x38bdf8, 0xa855f7, 0x10b981];
        for (let cl = 0; cl < 7; cl++) {
            const cy = 152 + cl * 15;
            roomG.fillStyle(codeColors[cl], 0.9);
            roomG.fillRect(2550 + (cl % 3 === 1 ? 16 : 0), cy, 40 + (cl * 17) % 80, 7);
            roomG.fillStyle(0x94a3b8, 0.7);
            roomG.fillRect(2610 + (cl % 3 === 1 ? 16 : 0), cy, 50 + (cl * 23) % 90, 7);
        }

        // Training Loss Curve Graph (Bottom Right)
        roomG.fillStyle(0x030a17, 1);
        roomG.fillRect(2550, 265, 262, 54);
        roomG.lineStyle(1, 0x1e293b, 1);
        roomG.strokeRect(2550, 265, 262, 54);
        // Grid lines
        roomG.lineStyle(1, 0x1e293b, 0.6);
        roomG.lineBetween(2550, 292, 2812, 292);
        // Loss curve
        roomG.lineStyle(2, 0x10b981, 1);
        roomG.beginPath();
        roomG.moveTo(2555, 275);
        roomG.lineTo(2590, 295);
        roomG.lineTo(2640, 305);
        roomG.lineTo(2710, 311);
        roomG.lineTo(2805, 313);
        roomG.strokePath();

        // -------------------------------------------------------------------------
        // LARGE SCREEN 2: 65" LAB MONITORING & SERVER METRICS DISPLAY (X: 3180 to 3620, Y: 95 to 325)
        // -------------------------------------------------------------------------
        roomG.fillStyle(0x00e5ff, 0.15); // Ambient Backlight Glow
        roomG.fillRoundedRect(3172, 87, 456, 246, 14);
        roomG.fillStyle(0x020617, 1);
        roomG.fillRoundedRect(3178, 93, 444, 234, 10);
        roomG.lineStyle(3, 0x334155, 1);
        roomG.strokeRoundedRect(3178, 93, 444, 234, 10);

        // Screen Surface
        roomG.fillStyle(0x081022, 1);
        roomG.fillRoundedRect(3186, 101, 428, 218, 6);

        // Dashboard Header
        roomG.fillStyle(0x0f2347, 1);
        roomG.fillRect(3190, 106, 420, 26);
        roomG.fillStyle(0x38bdf8, 1);
        roomG.fillRect(3202, 114, 110, 10); // LAB STATUS text bar
        roomG.fillStyle(0x10b981, 1);
        roomG.fillCircle(3580, 119, 4); // Green status LED

        // Dashboard Widgets / Tiles
        // Tile 1: GPU Cluster Load (X: 3200, Y: 140)
        roomG.fillStyle(0x0b1736, 0.95);
        roomG.fillRoundedRect(3198, 138, 195, 80, 4);
        roomG.fillStyle(0x00e5ff, 0.9);
        roomG.fillRect(3210, 146, 75, 8); // "GPU CLUSTER"
        // Load bars
        [0.82, 0.65, 0.91, 0.44].forEach((val, bi) => {
            const by = 162 + bi * 12;
            roomG.fillStyle(0x1e293b, 1);
            roomG.fillRect(3210, by, 170, 7);
            roomG.fillStyle(val > 0.85 ? 0xec4899 : 0x00e5ff, 1);
            roomG.fillRect(3210, by, Math.floor(170 * val), 7);
        });

        // Tile 2: High Speed Network Throughput (X: 3405, Y: 140)
        roomG.fillStyle(0x0b1736, 0.95);
        roomG.fillRoundedRect(3405, 138, 195, 80, 4);
        roomG.fillStyle(0x10b981, 0.9);
        roomG.fillRect(3417, 146, 85, 8); // "10G FIBER LAN"
        // Data flow sparkline
        roomG.lineStyle(1.5, 0x10b981, 0.9);
        roomG.beginPath();
        roomG.moveTo(3417, 195);
        roomG.lineTo(3440, 180);
        roomG.lineTo(3465, 202);
        roomG.lineTo(3490, 172);
        roomG.lineTo(3525, 185);
        roomG.lineTo(3555, 165);
        roomG.lineTo(3585, 178);
        roomG.strokePath();

        // Tile 3: Student Workstation Active Matrix (X: 3200, Y: 226)
        roomG.fillStyle(0x0b1736, 0.95);
        roomG.fillRoundedRect(3198, 226, 402, 84, 4);
        roomG.fillStyle(0x38bdf8, 0.9);
        roomG.fillRect(3210, 234, 130, 8);
        // Student terminals status grid (16 stations)
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 8; c++) {
                const tx = 3212 + c * 48;
                const ty = 250 + r * 26;
                roomG.fillStyle(0x1e293b, 1);
                roomG.fillRoundedRect(tx, ty, 40, 20, 3);
                // Active indicator
                roomG.fillStyle((r * 8 + c) % 5 === 4 ? 0xf59e0b : 0x00e5ff, 1);
                roomG.fillCircle(tx + 8, ty + 10, 3.5);
                roomG.fillStyle(0x94a3b8, 0.7);
                roomG.fillRect(tx + 16, ty + 7, 18, 6);
            }
        }

        // Ceiling Slide Projector & Drop-down Smart Screen Frame (X: 2950 to 3050, Y: 40 to 200)
        roomG.fillStyle(0x334155, 1);
        roomG.fillRect(2985, 40, 30, 120); // Ceiling drop pole
        roomG.fillRoundedRect(2950, 160, 100, 48, 6);
        roomG.fillStyle(0x00e5ff, 0.9);
        roomG.fillCircle(3000, 184, 12); // Projector lens
        roomG.fillStyle(0xffffff, 0.95);
        roomG.fillCircle(2997, 181, 4);
        roomG.fillStyle(0x00e5ff, 0.15); // Projector light cone
        roomG.beginPath();
        roomG.moveTo(3000, 196);
        roomG.lineTo(2880, 420);
        roomG.lineTo(3120, 420);
        roomG.closePath();
        roomG.fillPath();

        // Floor 2: Anti-Static ESD Modular Lab Grid Flooring (X: 1920 to 3840)
        roomG.fillStyle(0x090f1e, 1);
        roomG.fillRect(roomW, 720, roomW, sh - 720);
        roomG.lineStyle(2, 0x0284c7, 0.5);
        for (let x = roomW; x < roomW * 2; x += 120) {
            for (let y = 720; y < sh; y += 85) {
                roomG.strokeRect(x, y, 120, 85);
                roomG.fillStyle(0x0369a1, 0.08);
                roomG.fillRect(x + 4, y + 4, 112, 77);
            }
        }

        // =========================================================================
        // ARCHWAY 2: STEM LAB TO LIBRARY OPEN GLASS PORTAL (X: 3800 to 3880)
        // =========================================================================
        roomG.fillStyle(0x0284c7, 0.95);
        roomG.fillRect(3820, 0, 40, 720);
        roomG.fillStyle(0x0369a1, 1);
        roomG.fillRect(3810, 0, 14, 720);
        roomG.fillRect(3856, 0, 14, 720);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(3806, 0, 68, 28);
        roomG.fillStyle(0x000000, 0.35);
        roomG.fillRect(3870, 0, 60, 720);

        // =========================================================================
        // ROOM 3: SCHOOL LIBRARY & MEDIA CENTER (X: 3840 to 5760)
        // =========================================================================
        roomG.fillStyle(0x14281d, 1); // Scholarly Forest Emerald
        roomG.fillRect(roomW * 2, 0, roomW, 720);
        roomG.fillStyle(0x1e3a2b, 0.75);
        roomG.fillRect(roomW * 2, 0, roomW, 380);

        // Grand Mahogany Library Bookshelves Unit (X: 3940 to 4720, Y: 90 to 670)
        const lbX = 3940;
        const lbY = 90;
        const lbW = 780;
        const lbH = 580;

        roomG.fillStyle(0x000000, 0.4);
        roomG.fillRoundedRect(lbX + 8, lbY + 8, lbW, lbH, 10);
        roomG.fillStyle(0x271202, 0.98);
        roomG.fillRoundedRect(lbX, lbY, lbW, lbH, 10);
        roomG.lineStyle(4, 0x78350f, 1);
        roomG.strokeRoundedRect(lbX, lbY, lbW, lbH, 10);
        roomG.lineStyle(2, 0xd97706, 0.85);
        roomG.strokeRoundedRect(lbX + 4, lbY + 4, lbW - 8, lbH - 8, 8);

        // Horizontal Shelf Planks
        const libShelves = [200, 310, 420, 530];
        libShelves.forEach(sy => {
            roomG.fillStyle(0x451a03, 1);
            roomG.fillRect(lbX + 8, sy, lbW - 16, 14);
            roomG.fillStyle(0x78350f, 1);
            roomG.fillRect(lbX + 8, sy, lbW - 16, 3);
            roomG.fillStyle(0xfde047, 0.18);
            roomG.fillRect(lbX + 12, sy + 14, lbW - 24, 6);
        });

        // Vertical Library Book Dividers & Categorized Book Spines
        const bookPalette = [0x991b1b, 0x1e3a8a, 0x065f46, 0x78350f, 0x581c87, 0x0f766e, 0xb45309, 0x1e293b, 0x0284c7, 0x15803d];
        libShelves.forEach(sy => {
            let curBx = lbX + 18;
            while (curBx < lbX + lbW - 40) {
                const bW = 16 + (Math.abs(curBx * 13) % 16);
                const bH = 65 + (Math.abs(curBx * 7) % 35);
                const bColor = bookPalette[Math.abs(curBx) % bookPalette.length];
                roomG.fillStyle(bColor, 1);
                roomG.fillRoundedRect(curBx, sy - bH, bW, bH, 2);
                roomG.fillStyle(0xfde68a, 0.85);
                roomG.fillRect(curBx + 2, sy - bH + 8, bW - 4, 2);
                roomG.fillRect(curBx + 2, sy - 12, bW - 4, 2);
                curBx += bW + 3;
            }
        });

        // Brass Rolling Ladder Rail across Bookshelf
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(lbX + 4, lbY + 50, lbW - 8, 8);
        roomG.fillCircle(lbX + 20, lbY + 54, 8);
        roomG.fillCircle(lbX + lbW - 20, lbY + 54, 8);

        // Triple Arched Reading Room Windows (X: 4850 to 5600, Y: 90 to 540)
        const archWindows = [4880, 5130, 5380];
        archWindows.forEach(wx => {
            roomG.lineStyle(8, 0xffffff, 0.95);
            // Window Aperture
            roomG.strokeRoundedRect(wx, 120, 200, 420, 16);
            // Window Sashes & Muntins
            roomG.lineStyle(3, 0xffffff, 0.9);
            roomG.lineBetween(wx + 100, 120, wx + 100, 540);
            roomG.lineBetween(wx, 260, wx + 200, 260);
            roomG.lineBetween(wx, 400, wx + 200, 400);
            // Deep Forest Green Velvet Drapes
            roomG.fillStyle(0x064e3b, 1);
            roomG.fillRoundedRect(wx - 18, 95, 30, 460, 8);
            roomG.fillRoundedRect(wx + 188, 95, 30, 460, 8);
            roomG.fillStyle(0xd97706, 1);
            roomG.fillRect(wx - 24, 90, 248, 10);
            roomG.fillCircle(wx - 24, 95, 8);
            roomG.fillCircle(wx + 224, 95, 8);
        });

        // Floor 3: Classic Dark Walnut Hardwood Planks (X: 3840 to 5760)
        roomG.fillStyle(0x3b1807, 1);
        roomG.fillRect(roomW * 2, 720, roomW, sh - 720);
        roomG.lineStyle(2, 0x240e04, 0.85);
        for (let y = 720; y < sh; y += 45) {
            roomG.lineBetween(roomW * 2, y, roomW * 3, y);
        }
        for (let x = roomW * 2; x < roomW * 3; x += 180) {
            roomG.lineBetween(x, 720, x, sh);
        }

        // =========================================================================
        // ARCHWAY 3: LIBRARY TO ART & ROBOTICS WORKSHOP (X: 5720 to 5800)
        // =========================================================================
        roomG.fillStyle(0x1c1917, 0.95);
        roomG.fillRect(5740, 0, 40, 720);
        roomG.fillStyle(0x78350f, 1);
        roomG.fillRect(5730, 0, 14, 720);
        roomG.fillRect(5776, 0, 14, 720);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(5726, 0, 68, 28);
        roomG.fillStyle(0x000000, 0.35);
        roomG.fillRect(5790, 0, 60, 720);

        // =========================================================================
        // ROOM 4: CREATIVE ART & ROBOTICS WORKSHOP (X: 5760 to 7680)
        // =========================================================================
        roomG.fillStyle(0x27272a, 1); // Industrial Studio Charcoal
        roomG.fillRect(roomW * 3, 0, roomW, 720);
        roomG.fillStyle(0x3f3f46, 0.75);
        roomG.fillRect(roomW * 3, 0, roomW, 380);

        // Floor-to-Ceiling Courtyard Glass Wall Curtain Grid (X: 5880 to 7050, Y: 80 to 720)
        roomG.lineStyle(6, 0x0f172a, 1);
        roomG.strokeRoundedRect(5880, 80, 1170, 640, 12);
        for (let gx = 5880 + 195; gx < 7050; gx += 195) {
            roomG.lineBetween(gx, 80, gx, 720);
        }
        for (let gy = 240; gy < 720; gy += 160) {
            roomG.lineBetween(5880, gy, 7050, gy);
        }

        // Workshop Tool Pegboard & Colorful Supply Wall (X: 7120 to 7640, Y: 90 to 670)
        roomG.fillStyle(0x18181b, 1);
        roomG.fillRoundedRect(7120, 90, 520, 580, 8);
        roomG.lineStyle(3, 0xd97706, 1);
        roomG.strokeRoundedRect(7120, 90, 520, 580, 8);
        // Pegboard Grid Dots
        roomG.fillStyle(0x52525b, 0.8);
        for (let px = 7140; px < 7620; px += 24) {
            for (let py = 110; py < 650; py += 24) {
                roomG.fillCircle(px, py, 2);
            }
        }
        // Hanging Tool Outlines & Colorful Art Paint Jars
        const jarColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
        jarColors.forEach((jc, i) => {
            roomG.fillStyle(jc, 1);
            roomG.fillRoundedRect(7150 + i * 75, 480, 48, 65, 6);
            roomG.fillStyle(0xffffff, 0.8);
            roomG.fillRect(7154 + i * 75, 485, 40, 14);
            roomG.fillStyle(0x71717a, 1);
            roomG.fillRect(7160 + i * 75, 470, 28, 10);
        });

        // Floor 4: Polished Studio Sealed Epoxy Concrete Floor (X: 5760 to 7680)
        roomG.fillStyle(0x3f3f46, 1);
        roomG.fillRect(roomW * 3, 720, roomW, sh - 720);
        roomG.lineStyle(2, 0x52525b, 0.8);
        for (let x = roomW * 3; x < ww; x += 160) {
            for (let y = 720; y < sh; y += 90) {
                roomG.strokeRect(x, y, 160, 90);
                roomG.fillStyle(0x71717a, 0.15);
                roomG.fillRect(x + 4, y + 4, 152, 82);
            }
        }

        // =========================================================================
        // CONTINUOUS ARCHITECTURAL CEILING SOFFIT & BASEBOARD SKIRTING
        // =========================================================================
        // Recessed Soffit Ceiling (Y: 0 to 44)
        roomG.fillStyle(0x0a0f1d, 1);
        roomG.fillRect(0, 0, ww, 28);
        roomG.fillStyle(0x1e293b, 1);
        roomG.fillRect(0, 28, ww, 12);
        roomG.fillStyle(0x0284c7, 0.95);
        roomG.fillRect(0, 40, ww, 4);

        // Continuous Modern LED Downlights along Ceiling
        for (let lx = 120; lx < ww; lx += 240) {
            roomG.fillStyle(0xffffff, 0.95);
            roomG.fillCircle(lx, 20, 6);
            roomG.fillStyle(0x38bdf8, 0.3);
            roomG.fillCircle(lx, 20, 16);
        }

        // Baseboard Skirting Trim (Y: 706 to 724)
        roomG.fillStyle(0x0f172a, 1);
        roomG.fillRect(0, 706, ww, 18);
        roomG.fillStyle(0x0284c7, 1);
        roomG.fillRect(0, 706, ww, 3);

        this.midLayerCont.add(roomG);

        // =========================================================================
        // 3. FURNITURE, FIXTURES & CONTACT SHADOWS (Full Room Scale)
        // =========================================================================
        const furnG = this.scene.add.graphics();

        // --- ROOM 1: Administration Reception & Visitor Check-In Console (X: 1050 to 1550) ---
        // Contact Shadow
        furnG.fillStyle(0x000000, 0.45);
        furnG.fillEllipse(1300, 775, 270, 24);
        // Console Body & Countertop
        furnG.fillStyle(0x1e293b, 1);
        furnG.fillRoundedRect(1050, 680, 500, 75, 8);
        furnG.lineStyle(3, 0x0284c7, 1);
        furnG.strokeRoundedRect(1050, 680, 500, 75, 8);
        furnG.fillStyle(0x0f172a, 1);
        furnG.fillRect(1080, 705, 440, 50);
        // Solid Marble Countertop
        furnG.fillStyle(0xf8fafc, 1);
        furnG.fillRoundedRect(1035, 670, 530, 22, 6);
        furnG.lineStyle(2, 0xd97706, 1);
        furnG.strokeRoundedRect(1035, 670, 530, 22, 6);

        // --- ROOM 2: COMPUTER LAB STUDENT WORKSTATIONS, LARGE SCREENS, LEDS & CHAIRS (X: 2240 to 3780) ---
        // Lab Desk Floor Contact Shadow
        furnG.fillStyle(0x000000, 0.5);
        furnG.fillRect(2240, 772, 1540, 20);

        // Desk Chassis & Lower Modular Cable Management Frame
        furnG.fillStyle(0x0a1120, 1);
        furnG.fillRect(2250, 706, 1520, 72);
        for (let kx = 2250; kx < 3750; kx += 160) {
            furnG.lineStyle(1.5, 0x1e293b, 1);
            furnG.strokeRect(kx, 706, 160, 72);
            furnG.fillStyle(0x0f172a, 1);
            furnG.fillRect(kx + 10, 716, 140, 52);
        }

        // Under-Desk Continuous Electric Cyan LED Accent Strip (X: 2240 to 3780)
        furnG.fillStyle(0x00e5ff, 0.95);
        furnG.fillRect(2240, 702, 1540, 4);
        furnG.fillStyle(0x00e5ff, 0.2); // LED underglow on frame
        furnG.fillRect(2240, 706, 1540, 18);

        // Heavy-Duty Slate & Graphite Lab Countertop Slab (Y: 678 to 704)
        furnG.fillStyle(0x1e293b, 1);
        furnG.fillRoundedRect(2230, 678, 1560, 26, 6);
        furnG.lineStyle(2, 0x38bdf8, 0.8);
        furnG.strokeRoundedRect(2230, 678, 1560, 26, 6);

        // Workstation Student Terminals (Stations at 2430, 2780, 3140, 3490)
        const labStations = [
            { x: 2430, hasBgMonitor: false, col: 0x00e5ff },
            { x: 2780, hasBgMonitor: true, app: '3D Neural Mesh', col: 0x38bdf8 },
            { x: 3140, hasBgMonitor: true, app: 'Network Analyzer', col: 0x10b981 },
            { x: 3490, hasBgMonitor: false, col: 0xa855f7 }
        ];

        labStations.forEach(st => {
            // Power Grommet with Cyan LED Ring
            furnG.fillStyle(0x0f172a, 1);
            furnG.fillCircle(st.x - 70, 688, 7);
            furnG.fillStyle(0x00e5ff, 1);
            furnG.fillCircle(st.x - 70, 688, 3.5);

            // Desktop PC Tower (Placed next to monitor)
            furnG.fillStyle(0x020617, 1); // Chassis
            furnG.fillRoundedRect(st.x + 72, 606, 42, 78, 4);
            furnG.lineStyle(1.5, 0x334155, 1);
            furnG.strokeRoundedRect(st.x + 72, 606, 42, 78, 4);
            // Front RGB LED Light Strip
            furnG.fillStyle(st.col, 1);
            furnG.fillRect(st.x + 76, 614, 3, 62);
            furnG.fillStyle(0x00e5ff, 0.25);
            furnG.fillRect(st.x + 79, 614, 8, 62);
            // Power button LED
            furnG.fillStyle(0x10b981, 1);
            furnG.fillCircle(st.x + 104, 614, 2.5);

            // Background Static Monitor (drawn for Stations 2 & 3; Stations 1 & 4 host interactive AI targets)
            if (st.hasBgMonitor) {
                // Heavy Monitor Arm & Stand
                furnG.fillStyle(0x334155, 1);
                furnG.fillRect(st.x - 8, 656, 16, 26);
                furnG.fillStyle(0x475569, 1);
                furnG.fillRoundedRect(st.x - 22, 676, 44, 6, 2);

                // Monitor Outer Frame & Bezel
                furnG.fillStyle(0x00e5ff, 0.15); // Monitor Ambient Glow
                furnG.fillRoundedRect(st.x - 67, 592, 134, 76, 6);
                furnG.fillStyle(0x020617, 1);
                furnG.fillRoundedRect(st.x - 65, 594, 130, 72, 5);
                furnG.lineStyle(1.5, 0x475569, 1);
                furnG.strokeRoundedRect(st.x - 65, 594, 130, 72, 5);

                // Screen Display
                furnG.fillStyle(0x081329, 1);
                furnG.fillRoundedRect(st.x - 61, 598, 122, 62, 3);

                // Screen UI Representation
                furnG.fillStyle(0x0f2347, 1);
                furnG.fillRect(st.x - 59, 600, 118, 10);
                furnG.fillStyle(st.col, 0.9);
                furnG.fillRect(st.x - 55, 603, 34, 4); // Window title

                // Code & Visualization Lines on Screen
                for (let sl = 0; sl < 4; sl++) {
                    furnG.fillStyle(sl % 2 === 0 ? st.col : 0x94a3b8, 0.85);
                    furnG.fillRect(st.x - 55, 614 + sl * 10, 24 + (sl * 19) % 50, 4);
                }
                // Miniature Graph / Diagram on Right of Screen
                furnG.fillStyle(0x040b18, 1);
                furnG.fillRect(st.x + 10, 614, 46, 40);
                furnG.lineStyle(1, st.col, 0.9);
                furnG.strokeRect(st.x + 10, 614, 46, 40);
                furnG.fillStyle(st.col, 0.7);
                furnG.fillCircle(st.x + 24, 630, 4);
                furnG.fillCircle(st.x + 42, 624, 4);
                furnG.fillCircle(st.x + 36, 642, 4);

                // Power LED on Monitor Chin
                furnG.fillStyle(0x00e5ff, 1);
                furnG.fillCircle(st.x, 663, 1.5);
            }

            // Low Profile Mechanical Keyboard & RGB Mouse
            furnG.fillStyle(0x0f172a, 1);
            furnG.fillRoundedRect(st.x - 52, 680, 68, 14, 3);
            furnG.lineStyle(1, 0x00e5ff, 0.6); // Keyboard RGB glow
            furnG.strokeRoundedRect(st.x - 52, 680, 68, 14, 3);
            // Keycaps lines
            furnG.fillStyle(0x334155, 0.9);
            furnG.fillRect(st.x - 48, 683, 60, 8);

            // Ergonomic Optical Mouse & Pad
            furnG.fillStyle(0x020617, 1);
            furnG.fillRoundedRect(st.x + 22, 680, 28, 14, 2); // Mousepad
            furnG.fillStyle(0x1e293b, 1);
            furnG.fillRoundedRect(st.x + 30, 682, 12, 10, 3); // Mouse body
            furnG.fillStyle(0x00e5ff, 1);
            furnG.fillRect(st.x + 35, 683, 2, 4); // Scroll wheel LED
        });

        // -------------------------------------------------------------------------
        // STUDENT TASK CHAIRS (Ergonomic Swivel Chairs with Casters)
        // -------------------------------------------------------------------------
        const chairPositions = [2430, 2780, 3000, 3200, 3490];

        chairPositions.forEach(cx => {
            // Floor Contact Shadow under Chair Base
            furnG.fillStyle(0x000000, 0.4);
            furnG.fillEllipse(cx, 784, 42, 12);

            // 5-Star Wheeled Caster Base (X: cx - 36 to cx + 36, Y: 770 to 784)
            furnG.lineStyle(3, 0x1e293b, 1);
            furnG.lineBetween(cx - 28, 778, cx + 28, 778);
            furnG.lineBetween(cx - 18, 783, cx + 18, 773);
            furnG.lineBetween(cx - 18, 773, cx + 18, 783);

            // Rolling Caster Wheels (Black PU Rollers)
            [-28, 0, 28].forEach(wx => {
                furnG.fillStyle(0x020617, 1);
                furnG.fillCircle(cx + wx, 780, 4);
                furnG.fillStyle(0x475569, 1);
                furnG.fillCircle(cx + wx, 780, 1.5);
            });

            // Chrome Hydraulic Pneumatic Cylinder
            furnG.fillStyle(0x94a3b8, 1);
            furnG.fillRect(cx - 4, 742, 8, 34);
            furnG.fillStyle(0x00e5ff, 0.8);
            furnG.fillRect(cx - 1, 742, 2, 34); // Chrome reflection

            // Ergonomic Contoured Seat Pan (Y: 726 to 744)
            furnG.fillStyle(0x020617, 0.95);
            furnG.fillRoundedRect(cx - 32, 730, 64, 15, 6);
            furnG.fillStyle(0x0f172a, 1);
            furnG.fillRoundedRect(cx - 30, 728, 60, 14, 5);
            // Vibrant Cyan Accent Seat Piping
            furnG.lineStyle(2, 0x0284c7, 0.85);
            furnG.strokeRoundedRect(cx - 30, 728, 60, 14, 5);

            // Adjustable Left & Right Armrests
            furnG.fillStyle(0x334155, 1);
            furnG.fillRect(cx - 33, 706, 5, 24); // Left arm upright
            furnG.fillRoundedRect(cx - 37, 702, 13, 6, 2); // Left arm pad
            furnG.fillRect(cx + 28, 706, 5, 24); // Right arm upright
            furnG.fillRoundedRect(cx + 24, 702, 13, 6, 2); // Right arm pad

            // High-Back Ergonomic Breathable Mesh Backrest (Y: 672 to 726)
            furnG.fillStyle(0x1e293b, 1); // Backrest spine frame
            furnG.fillRect(cx - 4, 700, 8, 28);
            furnG.fillStyle(0x020617, 1);
            furnG.fillRoundedRect(cx - 24, 672, 48, 48, 8);
            furnG.fillStyle(0x0b1736, 1); // Breathable mesh insert
            furnG.fillRoundedRect(cx - 21, 675, 42, 42, 6);
            furnG.lineStyle(2, 0x00e5ff, 0.7); // Mesh perimeter frame
            furnG.strokeRoundedRect(cx - 21, 675, 42, 42, 6);
            // Mesh Texture Horizontal Bars
            for (let my = 680; my < 714; my += 7) {
                furnG.fillStyle(0x00e5ff, 0.35);
                furnG.fillRect(cx - 16, my, 32, 2);
            }
            // Ergonomic Lumbar Support & Headrest Pad
            furnG.fillStyle(0x0284c7, 0.9);
            furnG.fillRoundedRect(cx - 14, 696, 28, 8, 3);
        });

        // --- ROOM 3: Library Media Reading Carrels & Luxury Rug (X: 4850 to 5600) ---
        // Luxury Library Carpet Rug
        furnG.fillStyle(0x000000, 0.35);
        furnG.fillRoundedRect(4850, 755, 750, 180, 24);
        furnG.fillStyle(0x064e3b, 0.95);
        furnG.fillRoundedRect(4860, 750, 730, 170, 20);
        furnG.lineStyle(4, 0x10b981, 0.85);
        furnG.strokeRoundedRect(4860, 750, 730, 170, 20);
        furnG.lineStyle(2, 0xd97706, 0.5);
        furnG.strokeRoundedRect(4880, 765, 690, 140, 14);

        // Library Study Desk (X: 4100 to 4650, Y: 678)
        furnG.fillStyle(0x000000, 0.4);
        furnG.fillRect(4100, 765, 550, 16);
        furnG.fillStyle(0x78350f, 1);
        furnG.fillRoundedRect(4100, 678, 550, 26, 6);
        furnG.lineStyle(3, 0xd97706, 1);
        furnG.strokeRoundedRect(4100, 678, 550, 26, 6);
        furnG.fillStyle(0x1e293b, 1);
        furnG.fillRect(4130, 704, 16, 70);
        furnG.fillRect(4604, 704, 16, 70);

        // --- ROOM 4: Art Easels & 3D Printing Makerspace Station (X: 5760 to 7680) ---
        // Art Easel (X: 6050, Y: 580 to 770)
        furnG.fillStyle(0x000000, 0.35);
        furnG.fillEllipse(6050, 770, 80, 16);
        furnG.fillStyle(0x78350f, 1); // Wooden tripod
        furnG.fillRect(6042, 560, 16, 210);
        furnG.fillRect(6010, 630, 80, 12);
        // Canvas with Colorful Abstract Painting
        furnG.fillStyle(0xf8fafc, 1);
        furnG.fillRect(5990, 520, 120, 110);
        furnG.lineStyle(3, 0xd97706, 1);
        furnG.strokeRect(5990, 520, 120, 110);
        furnG.fillStyle(0xef4444, 1); furnG.fillCircle(6030, 560, 18);
        furnG.fillStyle(0x3b82f6, 1); furnG.fillCircle(6070, 580, 22);
        furnG.fillStyle(0xfde047, 1); furnG.fillTriangle(6030, 590, 6080, 535, 6060, 610);

        // 3D Printing Workbench (X: 6350 to 6950, Y: 678)
        furnG.fillStyle(0x000000, 0.4);
        furnG.fillRect(6350, 765, 600, 18);
        furnG.fillStyle(0x18181b, 1);
        furnG.fillRoundedRect(6350, 678, 600, 28, 6);
        furnG.lineStyle(3, 0x0284c7, 1);
        furnG.strokeRoundedRect(6350, 678, 600, 28, 6);
        furnG.fillStyle(0x27272a, 1);
        furnG.fillRect(6380, 706, 540, 65);

        // Dual High-Tech 3D Printers with Glowing Extruders (X: 6440, 6720)
        [6440, 6720].forEach(px => {
            furnG.fillStyle(0x09090b, 1);
            furnG.fillRoundedRect(px - 45, 590, 90, 88, 6);
            furnG.lineStyle(2, 0x00e5ff, 1);
            furnG.strokeRoundedRect(px - 45, 590, 90, 88, 6);
            furnG.fillStyle(0x00e5ff, 0.25); // Acrylic Enclosure
            furnG.fillRect(px - 38, 598, 76, 72);
            // Extruder Head & Glowing Nozzle
            furnG.fillStyle(0xe4e4e7, 1);
            furnG.fillRect(px - 14, 615, 28, 16);
            furnG.fillStyle(0xef4444, 1); // Hot nozzle tip
            furnG.fillCircle(px, 634, 3.5);
            // Filament Spool
            furnG.fillStyle(0x3b82f6, 1);
            furnG.fillCircle(px + 32, 578, 12);
        });

        this.midLayerCont.add(furnG);

        // Reading Sofa in Library Mid Layer (if prop texture available)
        if (this.scene.textures.exists('prop_sofa')) {
            const sofa = this.scene.add.image(5220, 670, 'prop_sofa').setScale(1.25);
            this.midLayerCont.add(sofa);
        }

        // =========================================================================
        // FRAMED WALL ART & CERTIFICATES ('bg.png')
        // =========================================================================
        // Room 1 (Administration Foyer): Framed School Crest & Core District Values
        this.createFramedPainting(1300, 250, 340, 210, this.midLayerCont);

        // Room 4 (Art Workshop): Student Art Showcase Masterpiece
        this.createFramedPainting(7380, 270, 280, 180, this.midLayerCont);

        // =========================================================================
        // 4. NEAR LAYER (1.0x Ratio): Foreground Vignette & Floor Trim
        // =========================================================================
        const nearG = this.scene.add.graphics();
        nearG.fillStyle(0x0f172a, 0.9);
        nearG.fillRect(0, sh - 14, ww, 14);
        nearG.fillStyle(0x000000, 0.18);
        nearG.fillRect(0, 0, ww, 40);
        nearG.fillRect(0, sh - 60, ww, 60);

        this.nearLayerCont.add(nearG);
    }

    // --- ZONE 3: NEIGHBORHOOD STREET ---
    private buildStreetEnvironment() {
        const ww = this.worldWidth;
        const sh = this.screenHeight;

        // Sky gradient
        const bgG = this.scene.add.graphics();
        bgG.fillStyle(0x0c4a6e, 1);
        bgG.fillRect(0, 0, ww, sh);
        bgG.fillStyle(0x0369a1, 0.7);
        bgG.fillRect(0, 0, ww, 400);
        this.farLayerCont.add(bgG);

        // Distant City Skyline (Parallax backdrop)
        if (this.scene.textures.exists('prop_city_skyline')) {
            for (let x = 0; x < ww; x += 512) {
                const skyTile = this.scene.add.image(x + 256, 360, 'prop_city_skyline').setScale(1.2).setAlpha(0.6);
                this.farLayerCont.add(skyTile);
            }
        }

        // Framed Gallery Displays on Street
        this.createFramedPainting(1800, 240, 250, 155, this.midLayerCont);
        this.createFramedPainting(4200, 240, 250, 155, this.midLayerCont);

        // Neighborhood Stores & Buildings
        const streetG = this.scene.add.graphics();
        for (let x = 100; x < ww; x += 750) {
            // Modern Storefront facade
            streetG.fillStyle(0x1e293b, 0.95);
            streetG.fillRoundedRect(x, 320, 620, 410, 16);
            streetG.lineStyle(4, 0x38bdf8, 0.8);
            streetG.strokeRoundedRect(x, 320, 620, 410, 16);

            // Store Awning Canopy
            streetG.fillStyle(0xe11d48, 1);
            streetG.fillRoundedRect(x + 10, 420, 600, 35, 8);
            streetG.fillStyle(0xffffff, 0.8);
            for (let a = x + 30; a < x + 600; a += 80) {
                streetG.fillRect(a, 420, 40, 35);
            }
        }
        this.midLayerCont.add(streetG);

        // Sidewalk Pavement & Road
        const roadG = this.scene.add.graphics();
        // Sidewalk curb
        roadG.fillStyle(0x475569, 1);
        roadG.fillRect(0, 730, ww, 40);

        // Asphalt Road
        roadG.fillStyle(0x0f172a, 1);
        roadG.fillRect(0, 770, ww, sh - 770);

        // White Road Lane Dashes
        roadG.fillStyle(0xffffff, 0.8);
        for (let x = 0; x < ww; x += 180) {
            roadG.fillRoundedRect(x, 880, 100, 16, 6);
        }
        this.nearLayerCont.add(roadG);
    }

    private createWorldObjects() {
        this.worldObjects = [];

        this.zoneConfig.objects.forEach((objData, idx) => {
            const cont = this.scene.add.container(objData.worldX, objData.worldY);

            // 1. Soft Ambient Pulsing Glow Circle underneath
            const glow = this.scene.add.graphics();
            const glowColor = objData.isAI ? 0x00e5ff : 0xffd600;
            glow.fillStyle(glowColor, 0.22);
            glow.fillCircle(0, 0, Math.max(objData.width, objData.height) * 0.6);
            cont.add(glow);

            // 2. Interactive Object Vector Sprite
            const sprite = this.scene.add.sprite(0, 0, objData.textureKey);
            if (objData.width && objData.height) {
                sprite.setDisplaySize(objData.width, objData.height);
            }
            cont.add(sprite);

            // Subtle gentle floating / breathing tween
            this.scene.tweens.add({
                targets: sprite,
                y: -6,
                duration: 1600 + (idx % 3) * 250,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // 3. Status Discovery Tick Badge (Top Right of Object) - displayed only for AI objects
            const badgeOffset = Math.max(objData.width, objData.height) * 0.38 + 10;
            const statusIconCont = this.scene.add.container(badgeOffset, -badgeOffset);

            const statusBg = this.scene.add.graphics();
            // Glowing emerald check badge
            statusBg.fillStyle(0x00e676, 0.45);
            statusBg.fillCircle(0, 0, 22);
            statusBg.fillStyle(0x059669, 1);
            statusBg.fillCircle(0, 0, 18);
            statusBg.lineStyle(2.5, 0xffffff, 1);
            statusBg.strokeCircle(0, 0, 18);

            // Bold Tick / Checkmark symbol
            const tickText = this.scene.add.text(0, 0, '✓', {
                fontFamily: 'Arial Black',
                fontSize: '20px',
                color: '#ffffff',
                stroke: '#064e3b',
                strokeThickness: 3
            }).setOrigin(0.5);

            statusIconCont.add([statusBg, tickText]);
            statusIconCont.setVisible(false);
            cont.add(statusIconCont);

            // 5. Interactive Hit Zone & Hover FX
            const hitW = Math.max(objData.width + 30, 100);
            const hitH = Math.max(objData.height + 40, 100);
            const hitZone = this.scene.add.zone(0, 0, hitW, hitH).setInteractive({ useHandCursor: true });
            hitZone.setData('isWorldObject', true);

            hitZone.on('pointerover', () => {
                this.scene.tweens.add({
                    targets: cont,
                    scale: 1.06,
                    duration: 160,
                    ease: 'Quad.easeOut'
                });
            });

            hitZone.on('pointerout', () => {
                this.scene.tweens.add({
                    targets: cont,
                    scale: 1.0,
                    duration: 160,
                    ease: 'Quad.easeOut'
                });
            });

            let lastTapTime = 0;
            hitZone.on('pointerdown', () => {
                const now = Date.now();
                const isDoubleTap = now - lastTapTime < 350;
                lastTapTime = now;

                if (isDoubleTap) {
                    this.onObjectDoubleTapCallback(worldItem, idx);
                } else {
                    this.selectObject(idx);
                }
            });

            cont.add(hitZone);
            this.objectLayerCont.add(cont);

            const worldItem: WorldObjectItem = {
                data: objData,
                container: cont,
                sprite: sprite,
                glowGraphics: glow,
                statusIconCont: statusIconCont,
                hitZone: hitZone,
                isDiscovered: false,
                worldX: objData.worldX,
                worldY: objData.worldY
            };

            this.worldObjects.push(worldItem);
        });
    }

    private createChimpuCharacter() {
        this.chimpuWorldX = 380;
        this.chimpuCurrentY = this.chimpuBaseY;

        this.chimpuContainer = this.scene.add.container(this.chimpuWorldX, this.chimpuCurrentY)
            .setDepth(UILayers.GAME_PLAYER);

        // 1. Soft Dynamic Ground Shadow
        this.chimpuShadow = this.scene.add.graphics();
        this.chimpuShadow.fillStyle(0x000000, 0.35);
        this.chimpuShadow.fillEllipse(0, 52, 130, 24);
        this.chimpuContainer.add(this.chimpuShadow);

        // 2. Skateboard Neon Thruster / Hover Glow
        this.chimpuThrusterGlow = this.scene.add.graphics();
        this.chimpuContainer.add(this.chimpuThrusterGlow);

        // 3. Unified Chimpu Riding Skateboard Character Sprite
        const defaultTex = this.scene.textures.exists('chimpu_riding_skateboard')
            ? 'chimpu_riding_skateboard'
            : (this.scene.textures.exists('chimpu_skater_move') ? 'chimpu_skater_move' : 'chimpu_detective_1');
        this.chimpuSprite = this.scene.add.sprite(0, -10, defaultTex)
            .setScale(0.38);
        this.chimpuContainer.add(this.chimpuSprite);

        // Gentle Floating Hover Bob
        this.scene.tweens.add({
            targets: this.chimpuSprite,
            y: '-=6',
            duration: 450,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    public update(_time: number, delta: number) {
        if (this.isPaused || this.isTransitioningRoom) return;

        const dt = Math.min(delta / 1000, 0.1);

        // 1. Read Arrow Keys & WASD Input
        let moveX = this.touchMoveDir;
        let moveY = 0;
        let jumpRequested = false;

        if (this.cursors && this.wasdKeys) {
            const isLeft = this.cursors.left.isDown || this.wasdKeys.A.isDown;
            const isRight = this.cursors.right.isDown || this.wasdKeys.D.isDown;
            const isUp = this.cursors.up.isDown || this.wasdKeys.W.isDown;
            const isDown = this.cursors.down.isDown || this.wasdKeys.S.isDown;

            const leftJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.A);
            const rightJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.D);

            if (leftJustDown) {
                this.applyTapBoost(-1);
            } else if (rightJustDown) {
                this.applyTapBoost(1);
            }

            if (isLeft && !isRight) moveX = -1;
            else if (isRight && !isLeft) moveX = 1;

            if (isUp && !isDown) {
                moveY = -1;
                jumpRequested = true;
            } else if (isDown && !isUp) {
                moveY = 1;
            }
        }

        // Track continuous hold duration for progressive turbo acceleration
        if (moveX !== 0) {
            this.holdDuration += dt;
        } else {
            this.holdDuration = Math.max(0, this.holdDuration - dt * 3.5);
        }

        // Decay tap boost impulse over time
        if (this.tapBoost > 0) {
            this.tapBoost = Math.max(0, this.tapBoost - dt * 260);
        }

        // Progressive hold turbo boost: up to +520 px/s after continuous hold
        const holdProgress = Phaser.Math.Clamp(this.holdDuration / 1.6, 0, 1.0);
        const holdBoost = holdProgress * 520;

        // Dynamic max speeds combining base + hold ramp + rapid tap boost
        const baseCruiseSpeed = this.zoneConfig.scrollSpeed; // e.g. 180 px/s
        const totalExtraSpeed = holdBoost + this.tapBoost;

        const maxForwardSpeed = baseCruiseSpeed + 300 + totalExtraSpeed; // normal max ~480, turbo max ~1150 px/s!
        const maxReverseSpeed = -(260 + totalExtraSpeed * 0.85); // normal max -260, turbo max -920 px/s!

        // Dynamically track which room Chimpu is currently standing in (Room 0 to maxUnlockedRoomIndex)
        const activeRoom = Phaser.Math.Clamp(
            Math.floor(this.chimpuWorldX / this.roomWidth),
            0,
            this.maxUnlockedRoomIndex
        );
        this.currentRoomIndex = activeRoom;

        // Active user interaction state
        this.isUserInteracting = (moveX !== 0);

        // Turnaround points for current room patrol
        const minPatrolX = this.currentRoomIndex * this.roomWidth + 240;
        const maxPatrolX = Math.min(this.worldWidth, (this.currentRoomIndex + 1) * this.roomWidth) - 240;

        // Hard bounds across all unlocked rooms (can skate all the way to Room 0!)
        const minRoomX = 120;
        const maxRoomX = Math.min(this.worldWidth, (this.maxUnlockedRoomIndex + 1) * this.roomWidth) - 120;

        // Auto patrol flip when cruising without user input in the current room
        if (!this.isUserInteracting) {
            if (this.chimpuWorldX >= maxPatrolX && this.patrolDir > 0) {
                this.patrolDir = -1;
            } else if (this.chimpuWorldX <= minPatrolX && this.patrolDir < 0) {
                this.patrolDir = 1;
            }
        }

        // 2. Update Horizontal Velocity (chimpuVx)
        if (moveX > 0) {
            // Accelerate forward with skate thrust & turbo responsiveness
            const accelRate = 8.5 + (holdProgress * 4.5);
            this.chimpuVx = Phaser.Math.Linear(this.chimpuVx, maxForwardSpeed, dt * accelRate);
            this.patrolDir = 1;
        } else if (moveX < 0) {
            // Skate backward into previous rooms
            const accelRate = 9.0 + (holdProgress * 4.5);
            this.chimpuVx = Phaser.Math.Linear(this.chimpuVx, maxReverseSpeed, dt * accelRate);
            this.patrolDir = -1;
        } else {
            // Smoothly glide towards patrol speed in current room and skate continuously
            const targetCruiseVx = this.patrolDir * baseCruiseSpeed;
            this.chimpuVx = Phaser.Math.Linear(this.chimpuVx, targetCruiseVx, dt * 3.5);
        }

        // 3. Update Vertical Position (Lane riding & Jump)
        const targetBaseY = this.chimpuBaseY + moveY * 35; // Lane range: 855 to 925
        this.chimpuCurrentY = Phaser.Math.Linear(this.chimpuCurrentY, targetBaseY, dt * 5.0);

        // Skateboard Ollie / Hop on UP tap
        if (jumpRequested && !this.isJumping) {
            this.isJumping = true;
            this.scene.tweens.add({
                targets: this.chimpuSprite,
                y: -50,
                duration: 250,
                yoyo: true,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    this.chimpuSprite.y = -10;
                    this.isJumping = false;
                }
            });
        }

        // 4. Update Chimpu World Position clamped within Unlocked Space
        this.chimpuWorldX += this.chimpuVx * dt;
        if (this.chimpuWorldX >= maxRoomX) {
            this.chimpuWorldX = maxRoomX;
            if (this.chimpuVx > 0) this.chimpuVx = 0;
            if (!this.isUserInteracting) this.patrolDir = -1;
        } else if (this.chimpuWorldX <= minRoomX) {
            this.chimpuWorldX = minRoomX;
            if (this.chimpuVx < 0) this.chimpuVx = 0;
            if (!this.isUserInteracting) this.patrolDir = 1;
        }

        // 5. Camera stays locked and framed on whichever Room Chimpu is currently visiting
        const roomBaseScroll = this.currentRoomIndex * this.roomWidth;
        this.targetScrollX = Phaser.Math.Clamp(
            roomBaseScroll,
            0,
            this.worldWidth - this.screenWidth
        );

        // Smooth camera scroll interpolation (Lerp)
        const cameraLerpSpeed = Math.min(10.0, 6.0 + holdProgress * 4.0);
        this.scrollX = Phaser.Math.Linear(this.scrollX, this.targetScrollX, dt * cameraLerpSpeed);

        // 6. Apply Parallax Offsets across layers
        this.farLayerCont.x = -this.scrollX * 0.35;
        this.midLayerCont.x = -this.scrollX;
        this.objectLayerCont.x = -this.scrollX;
        this.nearLayerCont.x = -this.scrollX;

        // 7. Update Chimpu Screen Coordinates & Sprite Pose
        const chimpuScreenX = this.chimpuWorldX - this.scrollX;
        this.chimpuContainer.x = chimpuScreenX;
        this.chimpuContainer.y = this.chimpuCurrentY;

        // Dynamic tilt angle and facing direction
        if (this.chimpuVx > 15) {
            this.chimpuSprite.setFlipX(false);
            const targetAngle = Phaser.Math.Clamp((this.chimpuVx / 550) * 8, 0, 9);
            this.chimpuContainer.setAngle(Phaser.Math.Linear(this.chimpuContainer.angle, targetAngle, dt * 8.0));
        } else if (this.chimpuVx < -15) {
            this.chimpuSprite.setFlipX(true);
            const targetAngle = Phaser.Math.Clamp((this.chimpuVx / 450) * -8, -9, 0);
            this.chimpuContainer.setAngle(Phaser.Math.Linear(this.chimpuContainer.angle, targetAngle, dt * 8.0));
        } else {
            this.chimpuContainer.setAngle(Phaser.Math.Linear(this.chimpuContainer.angle, 0, dt * 6.0));
        }

        // 8. Render Dynamic Skateboard Thruster Wake & Glow
        this.chimpuThrusterGlow.clear();
        const isMovingFast = Math.abs(this.chimpuVx) > 220;
        const isSuperTurbo = Math.abs(this.chimpuVx) > 520;
        const isMovingBack = this.chimpuVx < -50;
        const glowColor = this.zoneConfig.themeHex ? parseInt(this.zoneConfig.themeHex.replace('#', '0x')) : 0x00e5ff;

        if (isSuperTurbo) {
            const glowLength = Math.min(130, (Math.abs(this.chimpuVx) / maxForwardSpeed) * 130);
            // Outer blazing cyan flame
            this.chimpuThrusterGlow.fillStyle(0x00e5ff, 0.65);
            this.chimpuThrusterGlow.fillEllipse(this.patrolDir > 0 ? -55 : 55, 38, glowLength, 20);
            // Inner hot core plasma
            this.chimpuThrusterGlow.fillStyle(0xfde047, 0.9);
            this.chimpuThrusterGlow.fillEllipse(this.patrolDir > 0 ? -48 : 48, 38, glowLength * 0.6, 10);
            this.chimpuThrusterGlow.fillStyle(0xffffff, 1);
            this.chimpuThrusterGlow.fillEllipse(this.patrolDir > 0 ? -42 : 42, 38, glowLength * 0.3, 6);
        } else if (isMovingFast) {
            const glowLength = Math.min(85, (Math.abs(this.chimpuVx) / 500) * 85);
            this.chimpuThrusterGlow.fillStyle(0x00f2fe, 0.45);
            this.chimpuThrusterGlow.fillEllipse(this.patrolDir > 0 ? -45 : 45, 38, glowLength, 16);
            this.chimpuThrusterGlow.fillStyle(0xffffff, 0.7);
            this.chimpuThrusterGlow.fillEllipse(this.patrolDir > 0 ? -40 : 40, 38, glowLength * 0.5, 8);
        } else if (isMovingBack) {
            this.chimpuThrusterGlow.fillStyle(0xf59e0b, 0.5);
            this.chimpuThrusterGlow.fillEllipse(45, 38, 50, 14);
        } else {
            this.chimpuThrusterGlow.fillStyle(glowColor, 0.22);
            this.chimpuThrusterGlow.fillEllipse(0, 42, 70, 14);
        }

        // 9. Update Ground Shadow scale based on jump/height
        const shadowScale = this.isJumping ? 0.75 : 1.0;
        const shadowAlpha = this.isJumping ? 0.2 : 0.35;
        this.chimpuShadow.setScale(shadowScale);
        this.chimpuShadow.setAlpha(shadowAlpha);
    }

    public isObjectHitZone(gameObject: GameObjects.GameObject): boolean {
        return gameObject.getData('isWorldObject') === true;
    }

    public deselectObject() {
        this.selectedObjectIndex = -1;
        this.worldObjects.forEach((obj) => {
            obj.glowGraphics.clear();
            const glowColor = obj.data.isAI ? 0x00e5ff : 0xffd600;
            const r = Math.max(obj.data.width, obj.data.height) * 0.65;
            obj.glowGraphics.fillStyle(glowColor, 0.18);
            obj.glowGraphics.fillCircle(0, 0, r * 0.85);
        });
    }

    public applyTapBoost(dir: number) {
        const now = Date.now();
        const timeSinceLast = now - this.lastTapTime;
        if (dir === this.lastTapDir && timeSinceLast < 450) {
            // Rapid repetitive clicks/taps boost impulse
            this.tapBoost = Math.min(this.tapBoost + 180, 520);
            this.chimpuVx += dir * 130;
        } else {
            this.tapBoost = Math.min(this.tapBoost + 80, 520);
            this.chimpuVx += dir * 70;
        }
        this.lastTapTime = now;
        this.lastTapDir = dir;
    }

    public setTouchMoveDir(dir: number) {
        this.touchMoveDir = dir;
        if (dir !== 0) {
            this.applyTapBoost(dir);
            this.isUserInteracting = true;
            this.patrolDir = dir > 0 ? 1 : -1;
        } else {
            this.isUserInteracting = false;
        }
    }

    public selectObject(index: number) {
        if (index < 0 || index >= this.worldObjects.length) return;
        const selected = this.worldObjects[index];

        this.selectedObjectIndex = index;

        // Ensure current room tracks the selected object
        this.currentRoomIndex = Phaser.Math.Clamp(
            Math.floor(selected.worldX / this.roomWidth),
            0,
            this.maxUnlockedRoomIndex
        );

        // Highlight selected object in world with detective scanning reticle
        this.worldObjects.forEach((obj, i) => {
            const isTarget = i === index;
            obj.glowGraphics.clear();
            const glowColor = obj.data.isAI ? 0x00e5ff : 0xffd600;
            const r = Math.max(obj.data.width, obj.data.height) * 0.65;

            if (isTarget) {
                // Outer scan aura
                obj.glowGraphics.fillStyle(glowColor, 0.45);
                obj.glowGraphics.fillCircle(0, 0, r + 14);

                // High-tech scanner reticle ring
                obj.glowGraphics.lineStyle(3, 0xffffff, 1);
                obj.glowGraphics.strokeCircle(0, 0, r + 14);

                // 4 Corner Reticle Brackets
                const bracketSize = 16;
                const offset = r + 18;
                obj.glowGraphics.lineStyle(3, glowColor, 1);
                // Top-Left
                obj.glowGraphics.beginPath();
                obj.glowGraphics.moveTo(-offset, -offset + bracketSize);
                obj.glowGraphics.lineTo(-offset, -offset);
                obj.glowGraphics.lineTo(-offset + bracketSize, -offset);
                obj.glowGraphics.strokePath();
                // Top-Right
                obj.glowGraphics.beginPath();
                obj.glowGraphics.moveTo(offset - bracketSize, -offset);
                obj.glowGraphics.lineTo(offset, -offset);
                obj.glowGraphics.lineTo(offset, -offset + bracketSize);
                obj.glowGraphics.strokePath();
                // Bottom-Left
                obj.glowGraphics.beginPath();
                obj.glowGraphics.moveTo(-offset, offset - bracketSize);
                obj.glowGraphics.lineTo(-offset, offset);
                obj.glowGraphics.lineTo(-offset + bracketSize, offset);
                obj.glowGraphics.strokePath();
                // Bottom-Right
                obj.glowGraphics.beginPath();
                obj.glowGraphics.moveTo(offset - bracketSize, offset);
                obj.glowGraphics.lineTo(offset, offset);
                obj.glowGraphics.lineTo(offset, offset - bracketSize);
                obj.glowGraphics.strokePath();
            } else {
                obj.glowGraphics.fillStyle(glowColor, 0.18);
                obj.glowGraphics.fillCircle(0, 0, r * 0.85);
            }
        });

        this.onObjectSelectCallback(selected, index);
    }

    public markObjectDiscovered(index: number) {
        if (index < 0 || index >= this.worldObjects.length) return;
        const obj = this.worldObjects[index];
        obj.isDiscovered = true;

        // Keep object fully visible, vibrant, full opacity and interactive (NO dark shade/silhouette)
        obj.sprite.clearTint();
        obj.sprite.setAlpha(1.0);

        if (obj.data.isAI) {
            // Display glowing tick sign badge near it - ONLY for AI objects
            obj.statusIconCont.setVisible(true);
            obj.statusIconCont.setScale(0);
            this.scene.tweens.add({
                targets: obj.statusIconCont,
                scale: 1,
                duration: 320,
                ease: 'Back.easeOut'
            });
        } else {
            obj.statusIconCont.setVisible(false);
        }

        // Restore idle glow
        obj.glowGraphics.clear();
        const glowColor = obj.data.isAI ? 0x00e5ff : 0xffd600;
        const r = Math.max(obj.data.width, obj.data.height) * 0.65;
        obj.glowGraphics.fillStyle(glowColor, 0.18);
        obj.glowGraphics.fillCircle(0, 0, r * 0.85);

        // Ensure sprite maintains its exact configured display dimensions
        if (obj.data.width && obj.data.height) {
            obj.sprite.setDisplaySize(obj.data.width, obj.data.height);
        }

        // Celebration bounce on container (so sprite aspect ratio and display size are never corrupted)
        this.scene.tweens.add({
            targets: obj.container,
            scale: 1.12,
            duration: 180,
            yoyo: true,
            repeat: 1,
            ease: 'Back.easeOut',
            onComplete: () => {
                obj.container.setScale(1.0);
            }
        });
    }

    /**
     * Checks if all AI objects in the current highest unlocked room are discovered.
     * If so, automatically unlocks and transitions Chimpu & camera to the next room!
     */
    public checkRoomProgression(): boolean {
        const roomMin = this.maxUnlockedRoomIndex * this.roomWidth;
        const roomMax = (this.maxUnlockedRoomIndex + 1) * this.roomWidth;

        // Get AI targets in latest unlocked room
        const currentRoomAITargets = this.worldObjects.filter(
            (o) => o.data.isAI && o.worldX >= roomMin && o.worldX < roomMax
        );

        if (currentRoomAITargets.length > 0 && currentRoomAITargets.every((o) => o.isDiscovered)) {
            if (this.maxUnlockedRoomIndex + 1 < this.totalRooms) {
                this.advanceToNextRoom();
                return true;
            }
        }
        return false;
    }

    public advanceToNextRoom() {
        if (this.isTransitioningRoom) return;
        this.isTransitioningRoom = true;

        const nextRoomIndex = this.maxUnlockedRoomIndex + 1;
        this.maxUnlockedRoomIndex = nextRoomIndex;
        const nextRoomScrollX = nextRoomIndex * this.roomWidth;
        const targetChimpuX = nextRoomScrollX + 380;

        // Clear current object selection
        this.selectedObjectIndex = -1;
        this.worldObjects.forEach((obj) => {
            obj.glowGraphics.clear();
        });

        // Show celebration room clear banner
        this.showRoomClearBanner(nextRoomIndex + 1);

        // Chimpu skates forward towards the next room
        this.chimpuSprite.setFlipX(false);
        this.patrolDir = 1;

        // Smooth tween for Camera and Chimpu into next room
        const startScrollX = this.scrollX;
        const startChimpuX = this.chimpuWorldX;

        this.scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 1800,
            ease: 'Cubic.easeInOut',
            onUpdate: (tween) => {
                const val = tween.getValue() ?? 0;
                this.scrollX = Phaser.Math.Linear(startScrollX, nextRoomScrollX, val);
                this.chimpuWorldX = Phaser.Math.Linear(startChimpuX, targetChimpuX, val);

                this.farLayerCont.x = -this.scrollX * 0.35;
                this.midLayerCont.x = -this.scrollX;
                this.objectLayerCont.x = -this.scrollX;
                this.nearLayerCont.x = -this.scrollX;

                this.chimpuContainer.x = this.chimpuWorldX - this.scrollX;
            },
            onComplete: () => {
                this.currentRoomIndex = nextRoomIndex;
                this.scrollX = nextRoomScrollX;
                this.targetScrollX = nextRoomScrollX;
                this.chimpuWorldX = targetChimpuX;
                this.chimpuVx = this.zoneConfig.scrollSpeed;
                this.patrolDir = 1;
                this.isTransitioningRoom = false;
                this.isUserInteracting = false;
            }
        });
    }

    private showRoomClearBanner(nextRoomNum: number) {
        const bannerCont = this.scene.add.container(this.screenWidth / 2, this.screenHeight / 2 - 120)
            .setDepth(UILayers.MODAL_PANEL);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x0f172a, 0.94);
        bg.fillRoundedRect(-410, -75, 820, 150, 26);
        bg.lineStyle(4, 0x10b981, 1);
        bg.strokeRoundedRect(-410, -75, 820, 150, 26);

        const text1 = this.scene.add.text(0, -26, '🎉 ROOM CLEARED!', {
            fontSize: '44px',
            fontFamily: 'Arial Black, Outfit, sans-serif',
            color: '#10b981',
            stroke: '#000000',
            strokeThickness: 7
        }).setOrigin(0.5);

        const text2 = this.scene.add.text(0, 26, `Rolling into Room ${nextRoomNum} ➡️`, {
            fontSize: '32px',
            fontFamily: 'Arial Black, Outfit, sans-serif',
            color: '#f8fafc',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        bannerCont.add([bg, text1, text2]);
        bannerCont.setScale(0.7);
        bannerCont.setAlpha(0);

        this.scene.tweens.add({
            targets: bannerCont,
            scale: 1,
            alpha: 1,
            duration: 350,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.time.delayedCall(1200, () => {
                    this.scene.tweens.add({
                        targets: bannerCont,
                        alpha: 0,
                        y: '-=40',
                        duration: 350,
                        ease: 'Quad.easeIn',
                        onComplete: () => {
                            bannerCont.destroy();
                        }
                    });
                });
            }
        });
    }

    public playChimpuTrick() {
        if (this.scene.anims.exists('chimpu_celebrate_cheer')) {
            this.chimpuSprite.play('chimpu_celebrate_cheer');
        } else if (this.scene.textures.exists('chimpu_celebrate_4')) {
            this.chimpuSprite.setTexture('chimpu_celebrate_4');
        } else {
            this.chimpuSprite.setTexture('chimpu_skater_trick');
        }
        this.scene.tweens.add({
            targets: this.chimpuContainer,
            y: this.chimpuBaseY - 60,
            angle: 360,
            duration: 600,
            yoyo: true,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.chimpuContainer.setAngle(0);
                this.chimpuContainer.setY(this.chimpuBaseY);
                if (this.chimpuSprite.anims) {
                    this.chimpuSprite.stop();
                }
                const defaultTex = this.scene.textures.exists('chimpu_riding_skateboard')
                    ? 'chimpu_riding_skateboard'
                    : (this.scene.textures.exists('chimpu_skater_move') ? 'chimpu_skater_move' : 'chimpu_detective_1');
                this.chimpuSprite.setTexture(defaultTex);
            }
        });
    }

    public setChimpuScanPose(active: boolean) {
        if (active) {
            if (this.scene.anims.exists('chimpu_detective_scan')) {
                this.chimpuSprite.play('chimpu_detective_scan');
            } else if (this.scene.textures.exists('chimpu_detective_5')) {
                this.chimpuSprite.setTexture('chimpu_detective_5');
            } else {
                this.chimpuSprite.setTexture('chimpu_skater_scan');
            }
        } else {
            if (this.chimpuSprite.anims) {
                this.chimpuSprite.stop();
            }
            const defaultTex = this.scene.textures.exists('chimpu_riding_skateboard')
                ? 'chimpu_riding_skateboard'
                : (this.scene.textures.exists('chimpu_skater_move') ? 'chimpu_skater_move' : 'chimpu_detective_1');
            this.chimpuSprite.setTexture(defaultTex);
        }
    }

    public pause() {
        this.isPaused = true;
    }

    public resume() {
        this.isPaused = false;
    }

    public getSelectedObject(): WorldObjectItem | null {
        if (this.selectedObjectIndex >= 0 && this.selectedObjectIndex < this.worldObjects.length) {
            return this.worldObjects[this.selectedObjectIndex];
        }
        return null;
    }

    public getAllObjects(): WorldObjectItem[] {
        return this.worldObjects;
    }

    public getScrollX(): number {
        return this.scrollX;
    }

    public getSelectedObjectIndex(): number {
        return this.selectedObjectIndex;
    }

    public getCurrentRoomIndex(): number {
        return this.currentRoomIndex;
    }

    public getMaxUnlockedRoomIndex(): number {
        return this.maxUnlockedRoomIndex;
    }

    public getFirstUndiscoveredAIObjectScreenPos(): { x: number; y: number } | null {
        const roomMin = this.currentRoomIndex * this.roomWidth;
        const roomMax = (this.currentRoomIndex + 1) * this.roomWidth;
        const aiObj = this.worldObjects.find(
            (obj) => obj.data.isAI && !obj.isDiscovered && obj.worldX >= roomMin && obj.worldX < roomMax
        );
        if (!aiObj) return null;
        const halfH = aiObj.data.height ? aiObj.data.height / 2 : 70;
        return {
            x: aiObj.worldX - this.scrollX,
            y: aiObj.worldY - halfH - 45
        };
    }

    public selectNextObject() {
        const roomMin = this.currentRoomIndex * this.roomWidth;
        const roomMax = (this.currentRoomIndex + 1) * this.roomWidth;
        const roomIndices: number[] = [];
        this.worldObjects.forEach((obj, idx) => {
            if (obj.worldX >= roomMin && obj.worldX < roomMax) {
                roomIndices.push(idx);
            }
        });
        if (roomIndices.length === 0) return;

        const currentPos = roomIndices.indexOf(this.selectedObjectIndex);
        const nextPos = (currentPos + 1) % roomIndices.length;
        this.selectObject(roomIndices[nextPos]);
    }

    public selectPrevObject() {
        const roomMin = this.currentRoomIndex * this.roomWidth;
        const roomMax = (this.currentRoomIndex + 1) * this.roomWidth;
        const roomIndices: number[] = [];
        this.worldObjects.forEach((obj, idx) => {
            if (obj.worldX >= roomMin && obj.worldX < roomMax) {
                roomIndices.push(idx);
            }
        });
        if (roomIndices.length === 0) return;

        const currentPos = roomIndices.indexOf(this.selectedObjectIndex);
        const prevPos = (currentPos - 1 + roomIndices.length) % roomIndices.length;
        this.selectObject(roomIndices[prevPos]);
    }

    private createFramedPainting(
        x: number,
        y: number,
        width: number,
        height: number,
        container: Phaser.GameObjects.Container,
    ) {
        const frameG = this.scene.add.graphics();

        // 3. Ornate Gold Filigree Inset Border
        frameG.lineStyle(2, 0xd97706, 0.95);
        frameG.strokeRoundedRect(x - width / 2 + 6, y - height / 2 + 6, width - 12, height - 12, 5);

        // 4. Fine Gallery Passe-Partout (Ivory Matte Border)
        frameG.fillStyle(0xf8fafc, 1);
        frameG.fillRect(x - width / 2 + 10, y - height / 2 + 10, width - 20, height - 20);

        // 5. Canvas Aperture Inner Shadow / Bevel
        frameG.lineStyle(1.5, 0x94a3b8, 0.8);
        frameG.strokeRect(x - width / 2 + 18, y - height / 2 + 18, width - 36, height - 36);

        container.add(frameG);

        // 6. Canvas Painting Image ('bg')
        if (this.scene.textures.exists('bg')) {
            const canvasW = width - 38;
            const canvasH = height - 38;
            const paintingImg = this.scene.add.image(x, y, 'bg')
                .setDisplaySize(canvasW, canvasH);
            container.add(paintingImg);
        }

    }

    public destroy() {
        this.farLayerCont.destroy();
        this.midLayerCont.destroy();
        this.objectLayerCont.destroy();
        this.nearLayerCont.destroy();
        this.chimpuContainer.destroy();
    }
}
