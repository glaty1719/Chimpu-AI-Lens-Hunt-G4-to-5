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
        const farWidth = 5400;

        // --- Continuous Night Sky & Sunset Twilight Gradient (X: 0 to 5400) ---
        // Base Deep Space / Midnight Sky
        farG.fillStyle(0x020617, 1);
        farG.fillRect(0, 0, farWidth, 720);
        // Midnight Navy & Indigo Sky Glow
        farG.fillStyle(0x0f172a, 0.85);
        farG.fillRect(0, 100, farWidth, 420);
        farG.fillStyle(0x1e1b4b, 0.5);
        farG.fillRect(0, 240, farWidth, 300);

        // Sunset Glow on Far Right (X: 2800 to 5400 - behind Sunroom & Patio)
        farG.fillStyle(0xf59e0b, 0.45);
        farG.fillRect(2800, 60, 2600, 420);
        farG.fillStyle(0xf43f5e, 0.35);
        farG.fillRect(2800, 220, 2600, 260);
        farG.fillStyle(0x7c2d12, 0.6);
        farG.fillRect(2800, 420, 2600, 220);

        // --- Celestial Moon & Stars ---
        // Radiant Crescent Moon & Lunar Aura (X: 1950, Y: 150 - visible in living room window)
        farG.fillStyle(0xfef08a, 0.15);
        farG.fillCircle(1950, 150, 65);
        farG.fillStyle(0xfef08a, 0.35);
        farG.fillCircle(1950, 150, 42);
        farG.fillStyle(0xfef08a, 0.95);
        farG.fillCircle(1950, 150, 26);
        farG.fillStyle(0x020617, 1);
        farG.fillCircle(1960, 144, 22);

        // Star Constellations across Night Sky
        const starCoords = [
            [120, 90], [240, 140], [380, 80], [520, 160], [680, 110], [820, 170],
            [1050, 80], [1220, 150], [1380, 90], [1520, 180], [1680, 120], [1820, 90],
            [2050, 110], [2180, 160], [2320, 85], [2480, 140], [2620, 100], [2780, 160],
            [3050, 90], [3220, 140], [3380, 80], [3540, 130], [3720, 95], [3920, 150],
            [4150, 80], [4320, 130], [4500, 90], [4720, 140], [4950, 100], [5200, 130]
        ];
        farG.fillStyle(0xffffff, 0.9);
        starCoords.forEach(([sx, sy]) => {
            farG.fillCircle(sx, sy, 2.5);
            farG.fillStyle(0x38bdf8, 0.4);
            farG.fillCircle(sx, sy, 5.5);
            farG.fillStyle(0xffffff, 0.9);
        });

        // --- Distant Rolling Mountains & Horizon Ridges ---
        farG.fillStyle(0x0a192f, 0.95);
        for (let mx = 0; mx < farWidth; mx += 360) {
            farG.beginPath();
            farG.moveTo(mx, 560);
            farG.lineTo(mx + 180, 360 + (mx % 80));
            farG.lineTo(mx + 360, 560);
            farG.closePath();
            farG.fillPath();
        }

        // --- Distant Illuminated Modern City Skyline (X: 800 to 4200) ---
        const skylineBuildings = [
            { x: 840, y: 320, w: 90, h: 260, color: 0x0f172a },
            { x: 960, y: 260, w: 120, h: 320, color: 0x1e293b },
            { x: 1110, y: 300, w: 100, h: 280, color: 0x0f172a },
            { x: 1240, y: 230, w: 140, h: 350, color: 0x1e293b },
            { x: 1410, y: 280, w: 110, h: 300, color: 0x0f172a },
            { x: 1550, y: 250, w: 130, h: 330, color: 0x1e293b },
            { x: 1710, y: 310, w: 95, h: 270, color: 0x0f172a },
            { x: 1830, y: 220, w: 150, h: 360, color: 0x1e293b },
            { x: 2010, y: 270, w: 120, h: 310, color: 0x0f172a },
            { x: 2160, y: 240, w: 135, h: 340, color: 0x1e293b },
            { x: 2320, y: 290, w: 110, h: 290, color: 0x0f172a },
            { x: 2460, y: 230, w: 145, h: 350, color: 0x1e293b },
            { x: 2630, y: 270, w: 120, h: 310, color: 0x0f172a },
            { x: 2780, y: 240, w: 140, h: 340, color: 0x1e293b },
            { x: 2950, y: 290, w: 115, h: 290, color: 0x0f172a },
            { x: 3100, y: 250, w: 130, h: 330, color: 0x1e293b },
            { x: 3260, y: 300, w: 105, h: 280, color: 0x0f172a },
            { x: 3400, y: 260, w: 125, h: 320, color: 0x1e293b },
            { x: 3550, y: 280, w: 120, h: 300, color: 0x0f172a },
            { x: 3700, y: 240, w: 140, h: 340, color: 0x1e293b },
            { x: 3870, y: 300, w: 110, h: 280, color: 0x0f172a }
        ];

        skylineBuildings.forEach(b => {
            farG.fillStyle(b.color, 0.95);
            farG.fillRect(b.x, b.y, b.w, b.h);
            // Roof Antenna / Spire
            farG.fillStyle(0x64748b, 1);
            farG.fillRect(b.x + b.w / 2 - 2, b.y - 30, 4, 30);
            farG.fillStyle(0xef4444, 0.9);
            farG.fillCircle(b.x + b.w / 2, b.y - 30, 3); // Red aviation beacon

            // Illuminated Windows Matrix
            farG.fillStyle(0xfde047, 0.75);
            for (let wx = b.x + 10; wx < b.x + b.w - 10; wx += 16) {
                for (let wy = b.y + 16; wy < b.y + b.h - 20; wy += 22) {
                    if ((wx * 7 + wy * 13) % 4 !== 0) { // Organic lit windows
                        farG.fillRect(wx, wy, 8, 11);
                    }
                }
            }
        });

        // --- Outdoor Night Garden & Terrace Tree Foliage ---
        const outdoorTrees = [
            { x: 350, y: 520, r: 85, c: 0x064e3b },
            { x: 620, y: 540, r: 95, c: 0x065f46 },
            { x: 920, y: 510, r: 90, c: 0x064e3b },
            { x: 1250, y: 530, r: 105, c: 0x065f46 },
            { x: 1550, y: 500, r: 95, c: 0x064e3b },
            { x: 1820, y: 525, r: 115, c: 0x065f46 },
            { x: 2150, y: 510, r: 100, c: 0x064e3b },
            { x: 2450, y: 535, r: 110, c: 0x065f46 },
            { x: 2750, y: 505, r: 95, c: 0x064e3b },
            { x: 3050, y: 530, r: 115, c: 0x065f46 },
            { x: 3350, y: 515, r: 100, c: 0x064e3b },
            { x: 3650, y: 540, r: 110, c: 0x065f46 },
            { x: 3950, y: 510, r: 105, c: 0x064e3b },
            { x: 4250, y: 530, r: 115, c: 0x065f46 },
            { x: 4550, y: 515, r: 100, c: 0x064e3b },
            { x: 4850, y: 535, r: 110, c: 0x065f46 },
            { x: 5150, y: 520, r: 105, c: 0x064e3b }
        ];

        outdoorTrees.forEach(t => {
            farG.fillStyle(t.c, 0.95);
            farG.fillCircle(t.x, t.y, t.r);
            farG.fillStyle(0x10b981, 0.25);
            farG.fillCircle(t.x - 12, t.y - 16, t.r * 0.65);
        });

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

        // White Subway Tile Backsplash Wall (X: 1960 to 3800, Y: 270 to 720)
        roomG.fillStyle(0xf8fafc, 0.98);
        roomG.fillRect(1960, 270, 1840, 450);
        roomG.lineStyle(1.5, 0x94a3b8, 0.7);
        let rowIdx = 0;
        for (let y = 270; y < 720; y += 22) {
            const xOffset = (rowIdx % 2 === 0) ? 0 : 25;
            for (let x = 1960 - 50; x < 3800; x += 50) {
                roomG.strokeRect(Math.max(1960, x + xOffset), y, Math.min(50, 3800 - (x + xOffset)), 22);
            }
            rowIdx++;
        }

        // Warm LED Under-Cabinet Ambient Light Wash on Subway Tile Backsplash
        roomG.fillStyle(0xfef08a, 0.22);
        roomG.fillRect(2280, 275, 1500, 14);
        roomG.fillStyle(0xf59e0b, 0.10);
        roomG.fillRect(2280, 289, 1500, 28);

        // =========================================================================
        // 1. CHEF'S FLOATING SOLID OAK SPICE & HERB SHELVES WITH BRASS UTENSIL RAILS
        // =========================================================================
        // Left Spice Shelf (X: 2330 to 2760, Y: 360)
        const leftShX = 2330;
        roomG.fillStyle(0x000000, 0.25);
        roomG.fillRect(leftShX + 4, 372, 430, 8);
        roomG.fillStyle(0x78350f, 1); // Solid oak shelf
        roomG.fillRoundedRect(leftShX, 360, 430, 14, 3);
        roomG.fillStyle(0xd97706, 1); // Brass edge trim
        roomG.fillRect(leftShX, 372, 430, 2);
        // Brass Wall Brackets
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(leftShX + 40, 374, 10, 22);
        roomG.fillRect(leftShX + 380, 374, 10, 22);

        // Left Shelf Items: Spice Jars & Potted Basil
        const spiceColors = [0xd97706, 0xb91c1c, 0x15803d, 0x78350f, 0xca8a04];
        spiceColors.forEach((sc, i) => {
            const jx = leftShX + 25 + i * 36;
            // Glass Jar
            roomG.fillStyle(0xf8fafc, 0.9);
            roomG.fillRoundedRect(jx, 325, 24, 35, 3);
            roomG.fillStyle(sc, 0.85); // Spice powder fill
            roomG.fillRect(jx + 2, 335, 20, 23);
            roomG.fillStyle(0xd97706, 1); // Brass screw lid
            roomG.fillRect(jx + 2, 321, 20, 5);
        });
        // Glass Olive Oil Cruet with Golden Liquid
        roomG.fillStyle(0xfde047, 0.75);
        roomG.fillRoundedRect(leftShX + 225, 310, 26, 50, 4);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(leftShX + 233, 298, 10, 12);
        // Potted Kitchen Herbs (Basil & Rosemary)
        roomG.fillStyle(0xb45309, 1); // Terracotta pot
        roomG.fillRoundedRect(leftShX + 310, 325, 38, 35, 3);
        roomG.fillStyle(0x15803d, 1); // Herb leaves
        roomG.fillCircle(leftShX + 325, 312, 14);
        roomG.fillCircle(leftShX + 338, 316, 12);
        roomG.fillStyle(0x22c55e, 0.9);
        roomG.fillCircle(leftShX + 330, 305, 10);

        // Brass Hanging Utensil Rail beneath Left Shelf
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(leftShX + 20, 395, 390, 4);
        // Hanging Utensils: Ladle, Whisk, Slotted Turner, Copper Measuring Cup
        const utensils = [
            { x: leftShX + 60, type: 'ladle' },
            { x: leftShX + 130, type: 'whisk' },
            { x: leftShX + 200, type: 'turner' },
            { x: leftShX + 270, type: 'cup' }
        ];
        utensils.forEach(u => {
            roomG.fillStyle(0xd97706, 1);
            roomG.fillRect(u.x + 3, 388, 3, 8); // S-hook
            if (u.type === 'ladle') {
                roomG.fillRect(u.x + 4, 396, 2, 42);
                roomG.fillCircle(u.x + 5, 442, 9);
            } else if (u.type === 'whisk') {
                roomG.fillRect(u.x + 4, 396, 2, 28);
                roomG.lineStyle(1.5, 0xd97706, 1);
                roomG.strokeEllipse(u.x + 5, 436, 7, 14);
            } else if (u.type === 'turner') {
                roomG.fillRect(u.x + 4, 396, 2, 34);
                roomG.fillRoundedRect(u.x - 2, 430, 14, 20, 2);
            } else {
                roomG.fillStyle(0xb45309, 1);
                roomG.fillRect(u.x + 4, 396, 2, 24);
                roomG.fillCircle(u.x + 5, 430, 11);
            }
        });

        // Right Spice Shelf (X: 3360 to 3760, Y: 360)
        const rightShX = 3360;
        roomG.fillStyle(0x000000, 0.25);
        roomG.fillRect(rightShX + 4, 372, 400, 8);
        roomG.fillStyle(0x78350f, 1);
        roomG.fillRoundedRect(rightShX, 360, 400, 14, 3);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(rightShX, 372, 400, 2);
        // Ceramic Coffee Cannister & Tea Tins
        roomG.fillStyle(0x1e293b, 1);
        roomG.fillRoundedRect(rightShX + 30, 305, 42, 55, 4);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(rightShX + 35, 298, 32, 8);
        roomG.fillStyle(0x065f46, 1);
        roomG.fillRoundedRect(rightShX + 90, 315, 38, 45, 4);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRect(rightShX + 94, 309, 30, 7);
        // Salt & Pepper Wooden Grinders
        roomG.fillStyle(0x3b1807, 1);
        roomG.fillRoundedRect(rightShX + 160, 300, 22, 60, 4);
        roomG.fillStyle(0xf8fafc, 1);
        roomG.fillRoundedRect(rightShX + 195, 300, 22, 60, 4);
        roomG.fillStyle(0xd97706, 1);
        roomG.fillCircle(rightShX + 171, 296, 6);
        roomG.fillCircle(rightShX + 206, 296, 6);

        // =========================================================================
        // 2. FULL-HEIGHT SMART REFRIGERATOR ALCOVE (X: 1980 to 2260, Y: 70 to 720)
        // =========================================================================
        const frX = 1980;
        const frY = 70;
        const frW = 280;
        const frH = 650;

        // Refrigerator Alcove Drop Shadow & Floor Contact Shadow
        roomG.fillStyle(0x000000, 0.45);
        roomG.fillRoundedRect(frX - 6, frY - 4, frW + 12, frH + 8, 12);
        roomG.fillStyle(0x000000, 0.5);
        roomG.fillEllipse(frX + frW / 2, frY + frH + 4, frW + 30, 24);

        // =========================================================================
        // 3. ARCHITECTURAL MODERN UPPER WALL CABINETS (X: 2280 to 3780, Y: 60 to 275)
        // =========================================================================
        const cabX = 2280;
        const cabY = 60;
        const cabW = 1500;
        const cabH = 215;

        // Outer Cabinet Casing (Deep Midnight Navy with Gold Reveal Inlay)
        roomG.fillStyle(0x0a1020, 1);
        roomG.fillRoundedRect(cabX, cabY, cabW, cabH, 8);
        roomG.lineStyle(3, 0x1e293b, 1);
        roomG.strokeRoundedRect(cabX, cabY, cabW, cabH, 8);
        roomG.lineStyle(1.5, 0xd97706, 0.9); // Gold reveal inlay
        roomG.strokeRoundedRect(cabX + 3, cabY + 3, cabW - 6, cabH - 6, 6);

        // Individual Cabinet Door Modules (Left & Right Wings with Center Extraction Unit)
        // Module Left: 3 Doors (X: 2285 to 2900)
        const leftDoorW = 198;
        for (let i = 0; i < 3; i++) {
            const dx = cabX + 8 + i * (leftDoorW + 6);
            roomG.fillStyle(0x0f172a, 1);
            roomG.fillRoundedRect(dx, cabY + 8, leftDoorW, cabH - 16, 4);
            roomG.lineStyle(1.5, 0x1e293b, 1);
            roomG.strokeRoundedRect(dx, cabY + 8, leftDoorW, cabH - 16, 4);
            // Shaker Bevel Inset
            roomG.fillStyle(0x152238, 0.85);
            roomG.fillRoundedRect(dx + 12, cabY + 18, leftDoorW - 24, cabH - 36, 3);
            // Brushed Brass Vertical Handle
            roomG.fillStyle(0xd97706, 1);
            roomG.fillRoundedRect(dx + leftDoorW - 16, cabY + cabH - 65, 6, 36, 2);
            roomG.fillStyle(0xfde68a, 0.9);
            roomG.fillRect(dx + leftDoorW - 15, cabY + cabH - 63, 2, 32);
        }

        // Module Right: 3 Doors (Fluted Glass Display in Center, X: 3220 to 3770)
        const rightDoorW = 176;
        for (let i = 0; i < 3; i++) {
            const dx = cabX + 935 + i * (rightDoorW + 6);
            roomG.fillStyle(0x0f172a, 1);
            roomG.fillRoundedRect(dx, cabY + 8, rightDoorW, cabH - 16, 4);
            roomG.lineStyle(1.5, 0x1e293b, 1);
            roomG.strokeRoundedRect(dx, cabY + 8, rightDoorW, cabH - 16, 4);

            if (i === 1) {
                // Fluted Glass Display Cabinet with Backlit Crystal Stemware
                roomG.fillStyle(0x020617, 1);
                roomG.fillRoundedRect(dx + 10, cabY + 16, rightDoorW - 20, cabH - 32, 4);
                roomG.fillStyle(0xfde68a, 0.22); // Warm interior LED backlight
                roomG.fillRect(dx + 12, cabY + 18, rightDoorW - 24, cabH - 36);
                // Wine Glass & Decanter Silhouettes
                roomG.lineStyle(1.5, 0xf8fafc, 0.7);
                for (let gx = dx + 28; gx < dx + rightDoorW - 20; gx += 32) {
                    roomG.strokeCircle(gx, cabY + 65, 10);
                    roomG.lineBetween(gx, cabY + 75, gx, cabY + 110);
                    roomG.lineBetween(gx - 8, cabY + 110, gx + 8, cabY + 110);
                }
            } else {
                roomG.fillStyle(0x152238, 0.85);
                roomG.fillRoundedRect(dx + 12, cabY + 18, rightDoorW - 24, cabH - 36, 3);
            }
            // Brushed Brass Handle
            roomG.fillStyle(0xd97706, 1);
            roomG.fillRoundedRect(dx + 12, cabY + cabH - 65, 6, 36, 2);
            roomG.fillStyle(0xfde68a, 0.9);
            roomG.fillRect(dx + 13, cabY + cabH - 63, 2, 32);
        }

        // =========================================================================
        // 4. COMMERCIAL-GRADE STAINLESS STEEL & SMOKED GLASS RANGE HOOD (X: 2905 to 3205)
        // =========================================================================
        const rhX = 2905;
        const rhW = 300;

        // Stainless Chimney Flue Column
        roomG.fillStyle(0x334155, 1);
        roomG.fillRect(rhX + 75, cabY - 10, 150, 140);
        roomG.lineStyle(2, 0x64748b, 1);
        roomG.strokeRect(rhX + 75, cabY - 10, 150, 140);
        roomG.fillStyle(0x475569, 1);
        roomG.fillRect(rhX + 85, cabY - 10, 20, 140); // Highlight gradient stripe

        // Angled Smoked Glass & Steel Extraction Canopy
        roomG.fillStyle(0x1e293b, 1);
        roomG.beginPath();
        roomG.moveTo(rhX + 50, 190);
        roomG.lineTo(rhX + rhW - 50, 190);
        roomG.lineTo(rhX + rhW, 268);
        roomG.lineTo(rhX, 268);
        roomG.closePath();
        roomG.fillPath();
        roomG.lineStyle(3, 0x64748b, 1);
        roomG.strokePath();

        // High-Tech Capacitive Touch Control Panel on Hood Bevel
        roomG.fillStyle(0x020617, 1);
        roomG.fillRoundedRect(rhX + 60, 240, rhW - 120, 22, 4);
        roomG.lineStyle(1, 0x00e5ff, 0.8);
        roomG.strokeRoundedRect(rhX + 60, 240, rhW - 120, 22, 4);
        // Illuminated Buttons: Power (Green), Fan Speeds 1-2-3-Boost (Cyan), Spotlights (Amber)
        roomG.fillStyle(0x10b981, 1);
        roomG.fillCircle(rhX + 80, 251, 3.5); // Power
        for (let sp = 0; sp < 4; sp++) {
            roomG.fillStyle(sp < 2 ? 0x00e5ff : 0x334155, 1);
            roomG.fillRect(rhX + 105 + sp * 18, 248, 12, 6);
        }
        roomG.fillStyle(0xfde047, 1);
        roomG.fillCircle(rhX + rhW - 80, 251, 3.5); // Light On

        // Downward Dual LED Cooktop Spotlights
        roomG.fillStyle(0xfef08a, 0.85);
        roomG.fillCircle(rhX + 45, 266, 6);
        roomG.fillCircle(rhX + rhW - 45, 266, 6);
        // Spotlight Light Cones
        roomG.fillStyle(0xfef08a, 0.08);
        roomG.beginPath();
        roomG.moveTo(rhX + 35, 268);
        roomG.lineTo(rhX + 55, 268);
        roomG.lineTo(rhX + 100, 674);
        roomG.lineTo(rhX - 10, 674);
        roomG.closePath();
        roomG.fillPath();
        roomG.beginPath();
        roomG.moveTo(rhX + rhW - 55, 268);
        roomG.lineTo(rhX + rhW - 35, 268);
        roomG.lineTo(rhX + rhW + 10, 674);
        roomG.lineTo(rhX + rhW - 100, 674);
        roomG.closePath();
        roomG.fillPath();

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
        // Wall Left of Window (X: 3840 to 4900):
        roomG.fillStyle(0x042f2e, 1); // Deep royal emerald
        roomG.fillRect(3840, 0, 4900 - 3840, 720);
        roomG.fillStyle(0x064e3b, 0.8);
        roomG.fillRect(3840, 0, 4900 - 3840, 380);

        // Wall Right of Window (X: 5550 to 5760):
        roomG.fillStyle(0x042f2e, 1);
        roomG.fillRect(5550, 0, 5760 - 5550, 720);
        roomG.fillStyle(0x064e3b, 0.8);
        roomG.fillRect(5550, 0, 5760 - 5550, 380);

        // Wall Top of Window (X: 4900 to 5550, Y: 0 to 110):
        roomG.fillStyle(0x042f2e, 1);
        roomG.fillRect(4900, 0, 650, 110);
        roomG.fillStyle(0x064e3b, 0.8);
        roomG.fillRect(4900, 0, 650, 110);

        // Wall Bottom of Window (X: 4900 to 5550, Y: 540 to 720):
        roomG.fillStyle(0x042f2e, 1);
        roomG.fillRect(4900, 540, 650, 180);

        // Window Glass Subtle Atmospheric Sheen (Transparent - reveals Far Layer)
        roomG.fillStyle(0x38bdf8, 0.06);
        roomG.fillRect(4900, 110, 650, 430);
        roomG.fillStyle(0xffffff, 0.05);
        roomG.beginPath();
        roomG.moveTo(4980, 110);
        roomG.lineTo(5140, 110);
        roomG.lineTo(5020, 540);
        roomG.lineTo(4860, 540);
        roomG.closePath();
        roomG.fillPath();

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
        // Wall Left of French Doors (X: 5760 to 5880):
        roomG.fillStyle(0x431407, 1); // Warm terracotta wall
        roomG.fillRect(5760, 0, 5880 - 5760, 720);
        roomG.fillStyle(0x7c2d12, 0.7);
        roomG.fillRect(5760, 0, 5880 - 5760, 380);

        // Wall Right of French Doors (X: 7050 to 7680):
        roomG.fillStyle(0x431407, 1);
        roomG.fillRect(7050, 0, 7680 - 7050, 720);
        roomG.fillStyle(0x7c2d12, 0.7);
        roomG.fillRect(7050, 0, 7680 - 7050, 380);

        // Wall Top of French Doors (X: 5880 to 7050, Y: 0 to 80):
        roomG.fillStyle(0x431407, 1);
        roomG.fillRect(5880, 0, 1170, 80);
        roomG.fillStyle(0x7c2d12, 0.7);
        roomG.fillRect(5880, 0, 1170, 80);

        // Translucent French Doors Glass Sheen (reveals Far Layer Sunset Terrace):
        roomG.fillStyle(0xfde68a, 0.06);
        roomG.fillRect(5880, 80, 1170, 640);
        roomG.fillStyle(0xffffff, 0.04);
        roomG.beginPath();
        roomG.moveTo(6000, 80);
        roomG.lineTo(6250, 80);
        roomG.lineTo(6050, 720);
        roomG.lineTo(5800, 720);
        roomG.closePath();
        roomG.fillPath();

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

        // --- ROOM 2: Chef's Gourmet Quartz Island Counter & Smart Appliances (X: 2300 to 3780) ---
        furnG.fillStyle(0x000000, 0.45);
        furnG.fillRect(2300, 770, 1480, 22);

        // Lower Cabinet Base (Midnight Navy with Shaker Panels & Brass Inlays)
        furnG.fillStyle(0x0f172a, 1);
        furnG.fillRect(2310, 704, 1460, 76);
        for (let kx = 2310; kx < 3750; kx += 182) {
            furnG.lineStyle(2, 0x1e293b, 1);
            furnG.strokeRect(kx, 704, 182, 76);
            furnG.fillStyle(0xd97706, 1);
            furnG.fillRoundedRect(kx + 75, 714, 35, 6, 2);
        }

        // Built-in Smart Convection Oven & Warming Drawer (X: 2950 to 3170, Y: 704 to 776)
        furnG.fillStyle(0x020617, 1);
        furnG.fillRoundedRect(2950, 704, 220, 76, 4);
        furnG.lineStyle(2, 0x334155, 1);
        furnG.strokeRoundedRect(2950, 704, 220, 76, 4);
        // Oven Window with Golden Internal Glow
        furnG.fillStyle(0xf59e0b, 0.25);
        furnG.fillRoundedRect(2970, 722, 180, 48, 4);
        furnG.fillStyle(0x000000, 0.6);
        furnG.fillRect(2980, 730, 160, 32);
        // Digital Oven Status Display: 375°F PREHEAT
        furnG.fillStyle(0x38bdf8, 1);
        furnG.fillRect(2970, 710, 48, 5);
        furnG.fillStyle(0x10b981, 1);
        furnG.fillCircle(3150, 712, 3); // Preheated Ready LED
        furnG.fillStyle(0xd97706, 1);
        furnG.fillRoundedRect(2990, 718, 140, 4, 2); // Brass handle

        // Built-in Under-Counter Wine Cellar Cooler (X: 2320 to 2480, Y: 704 to 776)
        furnG.fillStyle(0x020617, 1);
        furnG.fillRoundedRect(2320, 704, 160, 76, 4);
        furnG.lineStyle(2, 0x38bdf8, 0.7);
        furnG.strokeRoundedRect(2320, 704, 160, 76, 4);
        // Cool Blue LED Interior Lighting & Beechwood Racks
        furnG.fillStyle(0x0284c7, 0.2);
        furnG.fillRect(2326, 710, 148, 64);
        for (let wy = 720; wy < 770; wy += 14) {
            furnG.fillStyle(0x78350f, 1);
            furnG.fillRect(2330, wy, 140, 4);
            // Wine bottle necks
            furnG.fillStyle(0x065f46, 0.9);
            furnG.fillCircle(2345, wy - 2, 4);
            furnG.fillCircle(2375, wy - 2, 4);
            furnG.fillCircle(2405, wy - 2, 4);
            furnG.fillCircle(2435, wy - 2, 4);
        }

        // Solid Calacatta Gold Quartz Waterfall Island Slab (X: 2290 to 3780, Y: 676 to 704)
        furnG.fillStyle(0xf8fafc, 1);
        furnG.fillRoundedRect(2290, 676, 1490, 28, 8);
        furnG.lineStyle(2, 0xcfd8dc, 1);
        furnG.strokeRoundedRect(2290, 676, 1490, 28, 8);
        // Subtle Gold & Slate Marble Veining
        furnG.lineStyle(1.5, 0xd97706, 0.35);
        furnG.beginPath();
        furnG.moveTo(2380, 678);
        furnG.lineTo(2460, 700);
        furnG.lineTo(2520, 692);
        furnG.strokePath();
        furnG.beginPath();
        furnG.moveTo(3300, 680);
        furnG.lineTo(3390, 702);
        furnG.lineTo(3450, 695);
        furnG.strokePath();

        // High-Tech Induction Cooktop (X: 2940 to 3180, Y: 672 to 684)
        furnG.fillStyle(0x020617, 1);
        furnG.fillRoundedRect(2940, 672, 240, 12, 3);
        furnG.lineStyle(1.5, 0x334155, 1);
        furnG.strokeRoundedRect(2940, 672, 240, 12, 3);
        // Active Induction Burner Rings with Glowing Red/Amber Elements
        furnG.lineStyle(2, 0xef4444, 0.9); // Active Front Burner
        furnG.strokeCircle(2985, 678, 14);
        furnG.fillStyle(0xef4444, 0.4);
        furnG.fillCircle(2985, 678, 10);
        furnG.lineStyle(2, 0xf59e0b, 0.85); // Simmer Back Burner
        furnG.strokeCircle(3055, 678, 12);
        furnG.lineStyle(1.5, 0x00e5ff, 0.7); // Standby Burners
        furnG.strokeCircle(3125, 678, 14);
        // Touch Heat Slider UI on Cooktop
        furnG.fillStyle(0x00e5ff, 1);
        furnG.fillRect(3015, 676, 25, 3);

        // Undermount Granite Composite Sink & Spring Gooseneck Brass Faucet (X: 2630 to 2750)
        furnG.fillStyle(0x1e293b, 1);
        furnG.fillRoundedRect(2630, 672, 120, 10, 2);
        furnG.fillStyle(0x38bdf8, 0.5); // Water basin sheen
        furnG.fillRect(2640, 674, 100, 6);
        // Brass Spring Gooseneck Faucet with Pull-Down Sprayer
        furnG.lineStyle(4, 0xd97706, 1);
        furnG.beginPath();
        furnG.moveTo(2690, 672);
        furnG.lineTo(2690, 600);
        furnG.lineTo(2662, 600);
        furnG.lineTo(2662, 624);
        furnG.strokePath();
        furnG.fillStyle(0xfde68a, 1); // Sprayer Head
        furnG.fillRoundedRect(2658, 624, 8, 12, 2);
        furnG.fillStyle(0x00e5ff, 1); // LED Water Temp Indicator
        furnG.fillCircle(2690, 635, 3);

        // Smart Robot Vacuum Wall Charging Base Station at Refrigerator Base (X: 2040, Y: 710)
        furnG.fillStyle(0x000000, 0.35);
        furnG.fillEllipse(2040, 755, 70, 18);
        furnG.fillStyle(0x0f172a, 1);
        furnG.fillRoundedRect(2015, 700, 60, 44, 6);
        furnG.lineStyle(2, 0x00e676, 1);
        furnG.strokeRoundedRect(2015, 700, 60, 44, 6);
        furnG.fillStyle(0x00e676, 1);
        furnG.fillCircle(2045, 712, 4); // Glowing Green Status LED
        furnG.fillStyle(0xd97706, 1); // Charging Contact Pins
        furnG.fillRect(2028, 734, 8, 4);
        furnG.fillRect(2052, 734, 8, 4);



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

        // Designer Walnut & Brass End Table beside Sofa for Lamp (X: 5480, Y: 675)
        furnG.fillStyle(0x000000, 0.35);
        furnG.fillEllipse(5480, 765, 110, 20);
        furnG.fillStyle(0x240e04, 1);
        furnG.fillRoundedRect(5420, 675, 120, 18, 6);
        furnG.lineStyle(2, 0xd97706, 1);
        furnG.strokeRoundedRect(5420, 675, 120, 18, 6);
        furnG.fillStyle(0xd97706, 1);
        furnG.fillRect(5440, 693, 8, 70);
        furnG.fillRect(5512, 693, 8, 70);
        furnG.fillRect(5436, 755, 88, 8);



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

        // Room 2 Kitchen Smart Refrigerator (AI Generated Cartoonish Asset)
        const fridgeKey = this.scene.textures.exists('prop_fridge')
            ? 'prop_fridge'
            : (this.scene.textures.exists('obj_smart_fridge') ? 'obj_smart_fridge' : null);
        if (fridgeKey) {
            const fridge = this.scene.add.image(2120, 395, fridgeKey);
            fridge.setDisplaySize(340, 650);
            this.midLayerCont.add(fridge);
        }

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
        const ww = this.worldWidth; // 7680px (4 Sectors * 1920px)
        const sh = this.screenHeight; // 1080px

        // =========================================================================
        // 1. FAR LAYER (0.35x Parallax): Twilight Sky, Skyscraper Skyline, Stars & Moon
        // =========================================================================
        const farG = this.scene.add.graphics();

        // Atmospheric Twilight / Sunset Sky Gradient (Deep Indigo to Warm Sunset Glow)
        farG.fillStyle(0x0a0f29, 1);
        farG.fillRect(0, 0, ww, sh);
        farG.fillStyle(0x1e1b4b, 0.85);
        farG.fillRect(0, 150, ww, 300);
        farG.fillStyle(0x4c1d95, 0.55);
        farG.fillRect(0, 320, ww, 220);
        farG.fillStyle(0xd97706, 0.25);
        farG.fillRect(0, 480, ww, 120);

        // Glowing Crescent Moon with Soft Ambient Aura
        farG.fillStyle(0xfef08a, 0.15);
        farG.fillCircle(1450, 140, 65);
        farG.fillStyle(0xfef08a, 0.95);
        farG.fillCircle(1450, 140, 32);
        farG.fillStyle(0x0a0f29, 1);
        farG.fillCircle(1464, 134, 28);

        // Twinkling Star Field
        farG.fillStyle(0xffffff, 0.9);
        const starCoordinates = [
            [220, 90], [540, 140], [880, 70], [1200, 180], [1750, 95],
            [2150, 110], [2600, 80], [3100, 160], [3580, 90], [4120, 130],
            [4650, 75], [5180, 150], [5720, 85], [6240, 140], [6780, 95], [7320, 130]
        ];
        starCoordinates.forEach(([sx, sy]) => {
            farG.fillCircle(sx, sy, 2.5);
            farG.fillStyle(0x38bdf8, 0.4);
            farG.fillCircle(sx, sy, 5);
            farG.fillStyle(0xffffff, 0.9);
        });

        // Distant Illuminated City Skyscraper Skyline Silhouettes (Every 240px across 7680px)
        const buildingTypes = [
            { w: 140, h: 360, roof: 'flat' },
            { w: 180, h: 440, roof: 'spire' },
            { w: 120, h: 310, roof: 'slant' },
            { w: 160, h: 480, roof: 'steps' },
            { w: 200, h: 390, roof: 'flat' },
            { w: 130, h: 420, roof: 'spire' }
        ];

        for (let bx = 0, idx = 0; bx < ww; bx += 170, idx++) {
            const b = buildingTypes[idx % buildingTypes.length];
            const by = 550 - b.h;

            // Skyscraper Dark Silhouette Body
            farG.fillStyle(0x0f172a, 0.94);
            farG.fillRect(bx, by, b.w, b.h);

            // Roof Architecture
            if (b.roof === 'spire') {
                farG.fillStyle(0x1e293b, 1);
                farG.fillTriangle(bx + b.w / 2 - 12, by, bx + b.w / 2 + 12, by, bx + b.w / 2, by - 55);
                // Red Warning Aviation Beacon Strobe
                farG.fillStyle(0xef4444, 0.9);
                farG.fillCircle(bx + b.w / 2, by - 55, 3.5);
            } else if (b.roof === 'slant') {
                farG.fillStyle(0x1e293b, 1);
                farG.fillTriangle(bx, by, bx + b.w, by, bx + b.w, by - 30);
            } else if (b.roof === 'steps') {
                farG.fillStyle(0x1e293b, 1);
                farG.fillRect(bx + 20, by - 25, b.w - 40, 25);
                farG.fillRect(bx + 40, by - 45, b.w - 80, 20);
            }

            // Distant Illuminated Window Matrix (Warm Yellow / Cyan Glows)
            farG.fillStyle(idx % 2 === 0 ? 0xfef08a : 0x38bdf8, 0.65);
            for (let wx = bx + 16; wx < bx + b.w - 16; wx += 18) {
                for (let wy = by + 25; wy < 530; wy += 26) {
                    if ((wx * 7 + wy * 13) % 5 !== 0) { // random lit windows
                        farG.fillRect(wx, wy, 8, 12);
                    }
                }
            }
        }

        // Parallax Skyline Tile Overlay (if available in textures)
        if (this.scene.textures.exists('prop_city_skyline')) {
            for (let x = 0; x < ww; x += 512) {
                const skyTile = this.scene.add.image(x + 256, 420, 'prop_city_skyline').setScale(1.2).setAlpha(0.45);
                this.farLayerCont.add(skyTile);
            }
        }

        this.farLayerCont.add(farG);

        // =========================================================================
        // 2. MID LAYER (1.0x Ratio): 4 Distinct 1920px Street Sectors
        // =========================================================================
        const midG = this.scene.add.graphics();

        // -------------------------------------------------------------------------
        // SECTOR 1: METRO TRANSIT PLAZA & HIGH-TECH CONCOURSE (X: 0 to 1920)
        // -------------------------------------------------------------------------
        // Modern Steel & Glass Metro Terminal Facade
        midG.fillStyle(0x1e293b, 1);
        midG.fillRect(0, 180, 1920, 560);
        midG.fillStyle(0x0f172a, 0.95);
        midG.fillRect(40, 240, 1840, 480);

        // Structural Glass Canopy Arch & Columns
        midG.lineStyle(6, 0x0284c7, 0.9);
        for (let colX = 120; colX < 1900; colX += 320) {
            midG.strokeRect(colX, 260, 260, 440);
            midG.fillStyle(0x0c4a6e, 0.4);
            midG.fillRect(colX + 4, 264, 252, 432);

            // Interior Terminal Floor Silhouettes & Concourse Lights
            midG.fillStyle(0x38bdf8, 0.85);
            midG.fillRect(colX + 30, 320, 200, 14);
            midG.fillStyle(0x00e676, 0.7);
            midG.fillRect(colX + 40, 460, 180, 8); // Digital train timetable screen
        }

        // Glowing High-Tech Canopy Neon Header: [ 🚆 METRO TECH PLAZA • SMART TRANSIT HUB ]
        midG.fillStyle(0x0369a1, 1);
        midG.fillRoundedRect(620, 200, 680, 52, 12);
        midG.lineStyle(3, 0x00e5ff, 1);
        midG.strokeRoundedRect(620, 200, 680, 52, 12);
        midG.fillStyle(0x00e5ff, 0.95);
        midG.fillRect(660, 218, 600, 16); // Header text glow bar

        // Modern Stainless Steel Bicycle Parking Racks (at X: 1550 - 1750)
        midG.lineStyle(4, 0x94a3b8, 1);
        for (let rx = 1560; rx < 1780; rx += 45) {
            midG.strokeCircle(rx, 690, 22);
            midG.fillRect(rx - 2, 690, 4, 45);
        }

        // Architectural Concrete Planters & Lush Manicured Hedges
        midG.fillStyle(0x475569, 1);
        midG.fillRoundedRect(220, 680, 240, 55, 8);
        midG.fillStyle(0x065f46, 1);
        midG.fillCircle(280, 675, 38);
        midG.fillCircle(340, 665, 46);
        midG.fillCircle(400, 675, 38);

        // -------------------------------------------------------------------------
        // SECTOR 2: CYBER BOULEVARD & AUTONOMOUS DELIVERY LANE (X: 1920 to 3840)
        // -------------------------------------------------------------------------
        // Boutique Urban Retail Stores (Coffee Roaster, Bakery, Smart Tech Shop)
        const stores = [
            { x: 1980, w: 540, color: 0x312e81, canopy: 0xef4444, name: 'CYBER ROAST CAFE' },
            { x: 2580, w: 580, color: 0x1e293b, canopy: 0x059669, name: 'URBAN ARTISAN BAKERY' },
            { x: 3220, w: 560, color: 0x431407, canopy: 0xd97706, name: 'FUTURE GADGETS LAB' }
        ];

        stores.forEach(st => {
            // Storefront Facade
            midG.fillStyle(st.color, 1);
            midG.fillRoundedRect(st.x, 260, st.w, 475, 14);
            midG.lineStyle(3.5, 0x94a3b8, 0.8);
            midG.strokeRoundedRect(st.x, 260, st.w, 475, 14);

            // Store Name Marquee Sign
            midG.fillStyle(0x0f172a, 1);
            midG.fillRoundedRect(st.x + 30, 290, st.w - 60, 44, 8);
            midG.fillStyle(0xfde047, 1);
            midG.fillRect(st.x + 60, 306, st.w - 120, 12);

            // Striped Parisian Canopy Awning
            midG.fillStyle(st.canopy, 1);
            midG.fillRoundedRect(st.x + 15, 360, st.w - 30, 42, 8);
            midG.fillStyle(0xffffff, 0.9);
            for (let ax = st.x + 30; ax < st.x + st.w - 30; ax += 50) {
                midG.fillRect(ax, 360, 25, 42);
            }

            // Warm Glowing Showcase Display Windows
            midG.fillStyle(0x090d16, 1);
            midG.fillRoundedRect(st.x + 35, 430, st.w - 70, 280, 10);
            midG.lineStyle(2, 0xfde047, 0.6);
            midG.strokeRoundedRect(st.x + 35, 430, st.w - 70, 280, 10);

            // Interior Warm Ambient Lighting & Display Shelves
            midG.fillStyle(0xfef08a, 0.25);
            midG.fillRect(st.x + 45, 440, st.w - 90, 260);
            midG.fillStyle(0x78350f, 0.9);
            midG.fillRect(st.x + 55, 540, st.w - 110, 12);
            midG.fillRect(st.x + 55, 620, st.w - 110, 12);
        });

        // Sidewalk Bistro Tables & Chairs outside Cafe
        midG.fillStyle(0x334155, 1);
        midG.fillRect(2120, 660, 60, 60); // Tabletop
        midG.fillRect(2145, 680, 10, 50); // Leg
        midG.fillStyle(0xd97706, 1);
        midG.fillCircle(2150, 655, 6); // Coffee mug

        // -------------------------------------------------------------------------
        // SECTOR 3: SMART TRAFFIC INTERSECTION & PEDESTRIAN CROSSING (X: 3840 to 5760)
        // -------------------------------------------------------------------------
        // Modern Commercial Glass Corporate Towers
        midG.fillStyle(0x0f172a, 1);
        midG.fillRect(3880, 200, 1800, 535);

        for (let bx = 3920; bx < 5640; bx += 420) {
            midG.fillStyle(0x1e293b, 1);
            midG.fillRoundedRect(bx, 220, 380, 505, 12);
            midG.lineStyle(3, 0x38bdf8, 0.7);
            midG.strokeRoundedRect(bx, 220, 380, 505, 12);

            // Commercial Office Window Grids
            midG.fillStyle(0x38bdf8, 0.35);
            for (let wx = bx + 24; wx < bx + 350; wx += 55) {
                for (let wy = 260; wy < 680; wy += 60) {
                    midG.fillRect(wx, wy, 42, 44);
                }
            }
        }

        // -------------------------------------------------------------------------
        // SMART TRAFFIC INTERSECTION GANTRY & CAMERA MAST (X: 4740 to 5250)
        // Provides physical mounting post & structural support for adaptive_traffic_camera (X: 4850, Y: 385)
        // -------------------------------------------------------------------------
        // 1. Sidewalk Foundation Concrete Pedestal & Anchor Bolts
        midG.fillStyle(0x1e293b, 1);
        midG.fillRoundedRect(4756, 700, 36, 30, 4);
        midG.fillStyle(0x64748b, 1);
        midG.fillRect(4752, 722, 44, 8); // Steel base plate
        midG.fillStyle(0xf1f5f9, 1);
        midG.fillCircle(4758, 726, 2.5); // Bolt 1
        midG.fillCircle(4790, 726, 2.5); // Bolt 2

        // 2. Heavy-Duty Galvanized Steel Vertical Mast Pole (X: 4768, Y: 250 to 720)
        midG.fillStyle(0x334155, 1);
        midG.fillRect(4768, 260, 16, 445);
        midG.fillStyle(0x475569, 1);
        midG.fillRect(4770, 260, 4, 445); // Metallic specular line

        // 3. Camera Mounting Stanchion Clamp & Articulated Extension Arm
        midG.fillStyle(0x1e293b, 1);
        midG.fillRoundedRect(4762, 335, 26, 60, 4);
        midG.lineStyle(2, 0x64748b, 1);
        midG.strokeRoundedRect(4762, 335, 26, 60, 4);
        // Heavy clamping collar bands around vertical pole
        midG.fillStyle(0x64748b, 1);
        midG.fillRect(4760, 342, 30, 8);
        midG.fillRect(4760, 380, 30, 8);
        midG.fillStyle(0x94a3b8, 1);
        midG.fillCircle(4765, 346, 2.5);
        midG.fillCircle(4785, 346, 2.5);
        midG.fillCircle(4765, 384, 2.5);
        midG.fillCircle(4785, 384, 2.5);

        // Horizontal articulated mounting bracket connecting mast directly to camera backplate
        midG.fillStyle(0x334155, 1);
        midG.fillRect(4784, 348, 56, 14);
        midG.fillStyle(0x64748b, 1);
        midG.fillRect(4784, 350, 56, 4); // Specular highlight on bracket
        // Top vertical support drop bracket from overhead gantry (Y: 290)
        midG.fillStyle(0x334155, 1);
        midG.fillRect(4836, 290, 8, 30);

        // 4. Weatherproof AI Edge Compute & Telemetry Controller Box on Pole (X: 4744, Y: 460)
        midG.fillStyle(0x1e293b, 1);
        midG.fillRoundedRect(4744, 460, 32, 60, 4);
        midG.lineStyle(2, 0x475569, 1);
        midG.strokeRoundedRect(4744, 460, 32, 60, 4);
        // Louvered heat-sink vents
        midG.fillStyle(0x0f172a, 1);
        for (let vy = 470; vy <= 500; vy += 6) {
            midG.fillRect(4748, vy, 16, 2.5);
        }
        // Warning Electrical AI Symbol
        midG.fillStyle(0xf59e0b, 1);
        midG.fillTriangle(4764, 472, 4772, 486, 4756, 486);
        // Flexible black power & data conduit cable connecting controller to camera clamp
        midG.lineStyle(3, 0x0f172a, 1);
        midG.beginPath();
        midG.moveTo(4760, 460);
        midG.lineTo(4756, 430);
        midG.lineTo(4766, 395);
        midG.strokePath();

        // 5. Overhead Cantilever Arm Gantry across Road (X: 4768 to 5220, Y: 260 to 290)
        midG.fillStyle(0x334155, 1);
        midG.fillRect(4768, 260, 450, 18); // Main overhead tubular arm
        midG.fillRect(4768, 290, 450, 12); // Lower reinforcement rail
        // Diagonal Webbing Truss Struts
        midG.lineStyle(2, 0x64748b, 0.9);
        for (let gx = 4780; gx < 5200; gx += 40) {
            midG.lineBetween(gx, 260, gx + 20, 290);
            midG.lineBetween(gx + 20, 290, gx + 40, 260);
        }
        // Curved gusset corner bracket connecting mast to overhead arm
        midG.fillStyle(0x475569, 1);
        midG.fillTriangle(4768, 260, 4768, 320, 4830, 260);

        // 6. Overhead Overhead 3-Aspect Traffic Signals on Gantry (X: 5040)
        midG.fillStyle(0x0f172a, 1);
        midG.fillRoundedRect(5040, 295, 34, 90, 6);
        midG.lineStyle(2, 0x334155, 1);
        midG.strokeRoundedRect(5040, 295, 34, 90, 6);
        // Visor Hoods & Signal Lenses (Green illuminated for intersection traffic)
        midG.fillStyle(0xef4444, 0.35); midG.fillCircle(5057, 312, 10); // Red (Dim)
        midG.fillStyle(0xf59e0b, 0.35); midG.fillCircle(5057, 340, 10); // Amber (Dim)
        midG.fillStyle(0x10b981, 1); midG.fillCircle(5057, 368, 10); // Green (Active Glowing)
        midG.fillStyle(0xa7f3d0, 0.8); midG.fillCircle(5057, 368, 4);

        // 7. Overhead Street Direction Sign on Truss
        midG.fillStyle(0x047857, 1);
        midG.fillRoundedRect(4870, 225, 160, 32, 4);
        midG.lineStyle(1.5, 0xffffff, 0.9);
        midG.strokeRoundedRect(4870, 225, 160, 32, 4);
        midG.fillStyle(0xffffff, 1);
        midG.fillRect(4882, 238, 136, 6); // Street text placeholder

        // Modern Glass Bus Transit Shelter (at X: 5320 - 5640)
        midG.fillStyle(0x0284c7, 0.4);
        midG.fillRoundedRect(5340, 480, 280, 245, 10);
        midG.lineStyle(3.5, 0x0284c7, 1);
        midG.strokeRoundedRect(5340, 480, 280, 245, 10);
        // Roof Canopy
        midG.fillStyle(0x1e293b, 1);
        midG.fillRoundedRect(5320, 470, 320, 24, 6);
        // Illuminated Digital Route Map inside Shelter
        midG.fillStyle(0x0f172a, 1);
        midG.fillRect(5360, 510, 80, 110);
        midG.fillStyle(0x00e676, 1);
        midG.fillRect(5370, 525, 60, 6); // Green bus route
        midG.fillStyle(0x38bdf8, 1);
        midG.fillRect(5370, 545, 60, 6); // Blue express line
        // Passenger Bench
        midG.fillStyle(0x78350f, 1);
        midG.fillRoundedRect(5460, 650, 140, 14, 4);

        // -------------------------------------------------------------------------
        // SECTOR 4: HERITAGE PROMENADE & ARTISAN COURTYARD (X: 5760 to 7680)
        // -------------------------------------------------------------------------
        // Historic Victorian Brick & Stonework Facades
        midG.fillStyle(0x7c2d12, 1); // Rich Terracotta Brick
        midG.fillRect(5800, 200, 1840, 535);

        // Detailed Brick Texture Lines
        midG.fillStyle(0x451a03, 0.35);
        for (let y = 220; y < 730; y += 22) {
            midG.fillRect(5800, y, 1840, 2);
        }

        // Arched Heritage Windows with White Stone Lintels
        for (let hx = 5880; hx < 7580; hx += 380) {
            // Arched Window Frame
            midG.fillStyle(0xf1f5f9, 1);
            midG.fillRoundedRect(hx, 280, 240, 380, 24);
            midG.fillStyle(0x1e1b4b, 1);
            midG.fillRoundedRect(hx + 12, 292, 216, 356, 18);

            // Warm Lantern Glow inside Heritage Rooms
            midG.fillStyle(0xfef08a, 0.4);
            midG.fillCircle(hx + 120, 380, 50);

            // Window Muntin Grid
            midG.fillStyle(0xf1f5f9, 1);
            midG.fillRect(hx + 116, 292, 8, 356);
            midG.fillRect(hx + 12, 450, 216, 8);
        }

        // Ornate Wrought-Iron Park Benches on Heritage Walkway
        midG.fillStyle(0x1e293b, 1);
        midG.fillRoundedRect(6180, 670, 160, 16, 4);
        midG.fillRect(6200, 686, 10, 45);
        midG.fillRect(6310, 686, 10, 45);

        // Decorative Street Trees with Ambient Golden Fairy Light Strings
        const treeXPositions = [5820, 6720, 7520];
        treeXPositions.forEach(tx => {
            // Textured Tree Trunk
            midG.fillStyle(0x522e17, 1);
            midG.fillRect(tx - 12, 450, 24, 280);

            // Lush Foliage Canopy
            midG.fillStyle(0x064e3b, 1);
            midG.fillCircle(tx, 390, 85);
            midG.fillCircle(tx - 45, 430, 65);
            midG.fillCircle(tx + 45, 430, 65);

            // Twinkling Golden Fairy Lights
            midG.fillStyle(0xfde047, 0.95);
            const lightOffsets = [[-30, 360], [15, 340], [45, 380], [-40, 420], [0, 410], [35, 440]];
            lightOffsets.forEach(([lx, ly]) => {
                midG.fillCircle(tx + lx, ly, 3.5);
            });
        });

        // High-Quality Granite Paved Sidewalk Walkway (Y: 720 to 765)
        midG.fillStyle(0x64748b, 1);
        midG.fillRect(0, 720, ww, 45);
        // Granite Sidewalk Paving Paver Stones
        midG.fillStyle(0x475569, 0.7);
        for (let px = 0; px < ww; px += 80) {
            midG.fillRect(px, 720, 2, 45);
        }

        // Tactile Yellow Guidance Raised Domes Strip (Along robot lane & curb ramps)
        midG.fillStyle(0xf59e0b, 1);
        midG.fillRect(0, 755, ww, 10);
        midG.fillStyle(0xffd600, 1);
        for (let dx = 8; dx < ww; dx += 16) {
            midG.fillCircle(dx, 760, 2.5);
        }

        // Heavy Concrete Sidewalk Curbstone Edge (Y: 765 to 780)
        midG.fillStyle(0x334155, 1);
        midG.fillRect(0, 765, ww, 15);

        // High-Traction Asphalt Roadway (Y: 780 to sh: 1080)
        midG.fillStyle(0x0f172a, 1);
        midG.fillRect(0, 780, ww, sh - 780);

        // Dedicated Green-Painted Autonomous Delivery & Bicycle Lane (Y: 780 to 830)
        midG.fillStyle(0x059669, 0.45);
        midG.fillRect(0, 780, ww, 50);
        midG.fillStyle(0xffffff, 0.9);
        // Bicycle & Rover Icon Dashes
        for (let bx = 120; bx < ww; bx += 480) {
            midG.fillRect(bx, 802, 40, 6);
        }

        // White Road Lane Dashes (Y: 900)
        midG.fillStyle(0xffffff, 0.9);
        for (let x = 0; x < ww; x += 220) {
            midG.fillRoundedRect(x, 900, 120, 14, 4);
        }

        // Cast-Iron Storm Drain Grates & Street Manhole Covers
        for (let mx = 450; mx < ww; mx += 1400) {
            // Circular Utility Manhole Cover
            midG.fillStyle(0x1e293b, 1);
            midG.fillCircle(mx, 860, 28);
            midG.lineStyle(2.5, 0x475569, 1);
            midG.strokeCircle(mx, 860, 28);
            midG.strokeCircle(mx, 860, 16);

            // Drainage Grate near Curb
            midG.fillStyle(0x0f172a, 1);
            midG.fillRect(mx + 600, 782, 60, 26);
            midG.fillStyle(0x334155, 1);
            for (let gx = mx + 606; gx < mx + 655; gx += 8) {
                midG.fillRect(gx, 784, 4, 22);
            }
        }

        this.midLayerCont.add(midG);

        // =========================================================================
        // 3. NEAR LAYER (1.2x Parallax): Top/Bottom Ambient Vignette
        // =========================================================================
        const nearG = this.scene.add.graphics();
        nearG.fillStyle(0x000000, 0.18);
        nearG.fillRect(0, 0, ww, 35);
        nearG.fillRect(0, sh - 15, ww, 15);
        this.nearLayerCont.add(nearG);
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
        this.showRoomClearBanner();

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

    private showRoomClearBanner() {
        const bannerCont = this.scene.add.container(this.screenWidth / 2, this.screenHeight / 2 - 120)
            .setDepth(UILayers.MODAL_PANEL);

        const text1 = this.scene.add.text(0, 0, '🎉🎉🎉', {
            fontSize: '150px',
            fontFamily: 'Arial Black, Outfit, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 7
        }).setOrigin(0.5);

        bannerCont.add(text1);
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

    // public playChimpuTrick(onComplete?: () => void) {
    //     if (this.scene.anims.exists('chimpu_celebrate_cheer')) {
    //         this.chimpuSprite.play('chimpu_celebrate_cheer');
    //     } else if (this.scene.textures.exists('chimpu_celebrate_4')) {
    //         this.chimpuSprite.setTexture('chimpu_celebrate_4');
    //     } else {
    //         this.chimpuSprite.setTexture('chimpu_skater_trick');
    //     }
    //     this.scene.tweens.add({
    //         targets: this.chimpuContainer,
    //         y: this.chimpuBaseY - 60,
    //         angle: 360,
    //         duration: 600,
    //         yoyo: true,
    //         ease: 'Back.easeOut',
    //         onComplete: () => {
    //             if (onComplete) {
    //                 onComplete();
    //             }
    //             this.chimpuContainer.setAngle(0);
    //             this.chimpuContainer.setY(this.chimpuBaseY);
    //             if (this.chimpuSprite.anims) {
    //                 this.chimpuSprite.stop();
    //             }
    //             const defaultTex = this.scene.textures.exists('chimpu_riding_skateboard')
    //                 ? 'chimpu_riding_skateboard'
    //                 : (this.scene.textures.exists('chimpu_skater_move') ? 'chimpu_skater_move' : 'chimpu_detective_1');
    //             this.chimpuSprite.setTexture(defaultTex);
    //         }
    //     });
    // }

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
