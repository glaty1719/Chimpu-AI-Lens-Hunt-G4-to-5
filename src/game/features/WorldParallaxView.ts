import { Scene, GameObjects } from 'phaser';
import { HuntObjectData, ZoneConfig } from '../data/LensHuntData';
import { UILayers } from '../utils/UILayers';

export interface WorldObjectItem {
    data: HuntObjectData;
    container: GameObjects.Container;
    sprite: GameObjects.Sprite | GameObjects.Image;
    glowGraphics: GameObjects.Graphics;
    labelBadge: GameObjects.Container;
    statusIcon: GameObjects.Image;
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

    // Camera & Scroll State
    private scrollX: number = 0;
    private targetScrollX: number = 0;
    private isAutoScrolling: boolean = true;
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

    // Chimpu Character Object
    private chimpuContainer!: GameObjects.Container;
    private chimpuSprite!: GameObjects.Sprite;
    private chimpuY: number = 890;
    private chimpuTargetX: number = 320;

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
        this.onObjectSelectCallback = onSelect;
        this.onObjectDoubleTapCallback = onDoubleTap;

        this.createEnvironmentLayers();
        this.createWorldObjects();
        this.createChimpuCharacter();
        this.setupDragAndTouchControls();
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

        // Solid Grand Entry Door on the Left Wall (X: 0 to 130, Y: 80 to 720)
        roomG.fillStyle(0x3b1807, 1); // Rich dark mahogany door frame
        roomG.fillRect(0, 80, 130, 640);
        roomG.lineStyle(4, 0x5c2c16, 1);
        roomG.strokeRect(0, 80, 130, 640);
        // Beveled door panels
        roomG.fillStyle(0x240e04, 1);
        roomG.fillRoundedRect(16, 110, 98, 180, 6);
        roomG.fillRoundedRect(16, 320, 98, 180, 6);
        roomG.fillRoundedRect(16, 530, 98, 170, 6);
        // Brushed Brass Lever Handle & Keyhole Plate
        roomG.fillStyle(0xd97706, 1);
        roomG.fillRoundedRect(100, 410, 16, 46, 4);
        roomG.fillCircle(108, 422, 6);
        roomG.fillStyle(0xfde68a, 1);
        roomG.fillRect(106, 444, 4, 22); // Handle lever
        // Entry Welcome Runner on Floor
        roomG.fillStyle(0x1e293b, 0.85);
        roomG.fillRoundedRect(30, 740, 140, 50, 10);
        roomG.lineStyle(2, 0xd97706, 0.6);
        roomG.strokeRoundedRect(30, 740, 140, 50, 10);

        // Fluted Acoustic Walnut Timber Feature Wall (X: 200 to 780)
        roomG.fillStyle(0x0a1410, 1); // Dark acoustic backing
        roomG.fillRect(200, 70, 580, 650);
        for (let x = 208; x < 772; x += 22) {
            roomG.fillStyle(0x78350f, 1); // Solid wood slat face
            roomG.fillRoundedRect(x, 70, 15, 650, 3);
            roomG.fillStyle(0x92400e, 0.6); // Highlight
            roomG.fillRect(x + 2, 70, 4, 650);
        }

        // Executive Study Bookshelf Unit (X: 280 to 700, Y: 150 to 640)
        roomG.fillStyle(0x451a03, 0.95);
        roomG.fillRoundedRect(280, 150, 420, 490, 10);
        roomG.lineStyle(4, 0x78350f, 1);
        roomG.strokeRoundedRect(280, 150, 420, 490, 10);
        // Horizontal Shelves
        [270, 390, 510].forEach(sy => {
            roomG.fillStyle(0x78350f, 1);
            roomG.fillRect(286, sy, 408, 16);
        });
        // Books & Decor on Shelves
        const shelfBooks1 = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0x06b6d4, 0xec4899, 0x14b8a6];
        shelfBooks1.forEach((bc, idx) => {
            roomG.fillStyle(bc, 1);
            roomG.fillRoundedRect(300 + idx * 24, 190, 18, 80, 3);
            roomG.fillRoundedRect(420 + idx * 22, 430, 16, 80, 3);
        });
        // Decorative Gold Globe on Shelf 2
        roomG.fillStyle(0xd97706, 1);
        roomG.fillCircle(350, 340, 26);
        roomG.lineStyle(3, 0xfde68a, 1);
        roomG.strokeCircle(350, 340, 34);
        // Potted trailing plant on Shelf 3
        roomG.fillStyle(0xb45309, 1);
        roomG.fillRect(630, 470, 32, 34);
        roomG.fillStyle(0x10b981, 1);
        roomG.fillCircle(646, 455, 22);
        roomG.fillCircle(632, 480, 14);
        roomG.fillCircle(660, 485, 16);

        // Large Backlit Circular Vanity Mirror (X: 1300, Y: 240)
        roomG.fillStyle(0xfde68a, 0.3);
        roomG.fillCircle(1300, 240, 120);
        roomG.lineStyle(8, 0xd97706, 1);
        roomG.strokeCircle(1300, 240, 105);
        roomG.fillStyle(0x1e3d32, 0.9);
        roomG.fillCircle(1300, 240, 101);
        roomG.fillStyle(0xffffff, 0.15);
        roomG.fillEllipse(1275, 205, 55, 25);

        // Designer Sconce Fixtures with Radiant Downlight Cones (at X: 980, 1620)
        [980, 1620].forEach(sx => {
            roomG.fillStyle(0xd97706, 1);
            roomG.fillRoundedRect(sx - 10, 260, 20, 34, 5);
            roomG.fillStyle(0xfde68a, 1);
            roomG.fillCircle(sx, 277, 6);
            roomG.fillStyle(0xfef08a, 0.15);
            roomG.fillTriangle(sx, 294, sx - 90, 680, sx + 90, 680);
        });

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
        // Under-Cabinet Warm LED Strip Glow
        roomG.fillStyle(0xfef08a, 0.35);
        roomG.fillRect(2290, 280, 1490, 55);

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

        // Frameless 75" Smart OLED Wall TV Ambient Backlight Glow (AmbiLight effect)
        roomG.fillStyle(0x00e5ff, 0.22);
        roomG.fillRoundedRect(4150, 220, 460, 280, 30);
        roomG.fillStyle(0x3b82f6, 0.18);
        roomG.fillRoundedRect(4130, 200, 500, 320, 36);

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

        // Volumetric Moonlight Beams from window
        roomG.fillStyle(0xfef08a, 0.1);
        roomG.fillTriangle(4950, 110, 5350, 110, 4400, 720);
        roomG.fillTriangle(5150, 110, 5550, 110, 4800, 720);

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

        // Recessed Ceiling Downlights across all rooms (casting soft illumination cones)
        for (let lx = 200; lx < ww; lx += 380) {
            roomG.fillStyle(0xd97706, 1);
            roomG.fillCircle(lx, 28, 8);
            roomG.fillStyle(0xfde68a, 1);
            roomG.fillCircle(lx, 28, 4);
            roomG.fillStyle(0xfef08a, 0.08);
            roomG.fillTriangle(lx, 32, lx - 110, 720, lx + 110, 720);
        }

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

        // Hanging Pendant Lamps in Kitchen (X: 2650, 3350)
        [2650, 3350].forEach(px => {
            furnG.fillStyle(0x1e293b, 1);
            furnG.fillRect(px - 2, 40, 4, 180);
            furnG.fillStyle(0xd97706, 1);
            furnG.beginPath();
            furnG.moveTo(px - 36, 250);
            furnG.lineTo(px + 36, 250);
            furnG.lineTo(px + 20, 218);
            furnG.lineTo(px - 20, 218);
            furnG.closePath();
            furnG.fillPath();
            furnG.fillStyle(0xfde68a, 1);
            furnG.fillCircle(px, 252, 12);
            furnG.fillStyle(0xfef08a, 0.18);
            furnG.fillTriangle(px, 252, px - 140, 680, px + 140, 680);
        });

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

        // Modern Standing Arc Floor Lamp (X: 5620)
        furnG.lineStyle(5, 0xd97706, 1);
        const lampArc = new Phaser.Curves.CubicBezier(
            new Phaser.Math.Vector2(5640, 750),
            new Phaser.Math.Vector2(5650, 360),
            new Phaser.Math.Vector2(5540, 260),
            new Phaser.Math.Vector2(5450, 320)
        );
        lampArc.draw(furnG, 24);
        furnG.fillStyle(0xd97706, 1);
        furnG.fillEllipse(5450, 320, 42, 20);
        furnG.fillStyle(0xfef08a, 0.25);
        furnG.fillTriangle(5450, 320, 5280, 750, 5620, 750);

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

    // --- ZONE 2: SCHOOL & CLASSROOM ---
    private buildSchoolEnvironment() {
        const ww = this.worldWidth;
        const sh = this.screenHeight;

        const bgG = this.scene.add.graphics();
        // Modern school classroom wall
        bgG.fillStyle(0x0f172a, 1);
        bgG.fillRect(0, 0, ww, sh);
        bgG.fillStyle(0x1e293b, 0.7);
        bgG.fillRect(0, 0, ww, 480);

        // Hallway Locker Strip & Tile Border
        bgG.fillStyle(0x0284c7, 0.8);
        bgG.fillRect(0, 480, ww, 30);

        // Classroom Linoleum Tiled Floor
        bgG.fillStyle(0x334155, 1);
        bgG.fillRect(0, 720, ww, sh - 720);
        bgG.lineStyle(2, 0x475569, 0.6);
        for (let x = 0; x < ww; x += 100) {
            bgG.strokeRect(x, 720, 100, 90);
            bgG.strokeRect(x, 810, 100, 90);
            bgG.strokeRect(x, 900, 100, 90);
            bgG.strokeRect(x, 990, 100, 90);
        }
        this.midLayerCont.add(bgG);

        // Chalkboards & School Banners
        if (this.scene.textures.exists('prop_chalkboard')) {
            const board1 = this.scene.add.image(850, 260, 'prop_chalkboard').setScale(1.2);
            const board2 = this.scene.add.image(2450, 260, 'prop_chalkboard').setScale(1.2);
            this.midLayerCont.add([board1, board2]);

            // Chalkboard science equations & AI Lens banner text
            const txt1 = this.scene.add.text(850, 260, 'AI DETECTIVE LAB\nPattern Recognition 💡', {
                fontFamily: 'Arial Black', fontSize: '24px', color: '#ffffff', align: 'center'
            }).setOrigin(0.5);
            const txt2 = this.scene.add.text(2450, 260, 'MACHINE LEARNING 🔬\nTraining Data -> Predictions', {
                fontFamily: 'Arial Black', fontSize: '24px', color: '#6ee7b7', align: 'center'
            }).setOrigin(0.5);
            this.midLayerCont.add([txt1, txt2]);
        }

        // Student Desks & Lab Benches
        const deskG = this.scene.add.graphics();
        for (let x = 500; x < ww; x += 800) {
            deskG.fillStyle(0x78350f, 1); // Wooden desktop
            deskG.fillRoundedRect(x, 670, 360, 28, 8);
            deskG.fillStyle(0x1e293b, 1); // Steel legs
            deskG.fillRect(x + 20, 698, 14, 80);
            deskG.fillRect(x + 326, 698, 14, 80);
        }
        this.midLayerCont.add(deskG);
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

            // 3. Modern Glassmorphism Name Tag Pill (positioned neatly below object)
            const badgeW = Math.max(objData.name.length * 9.5 + 42, 130);
            const badgeH = 30;
            const badgeCont = this.scene.add.container(0, objData.height / 2 + 20);

            const badgeG = this.scene.add.graphics();
            badgeG.fillStyle(0x0a1128, 0.9);
            badgeG.fillRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, badgeH / 2);
            badgeG.lineStyle(1.5, objData.isAI ? 0x00e5ff : 0x94a3b8, 0.7);
            badgeG.strokeRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, badgeH / 2);
            // Indicator pip
            badgeG.fillStyle(objData.isAI ? 0x00e5ff : 0xfbbf24, 1);
            badgeG.fillCircle(-badgeW / 2 + 14, 0, 4);

            const badgeTxt = this.scene.add.text(6, 0, objData.name, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '13px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

            badgeCont.add([badgeG, badgeTxt]);
            cont.add(badgeCont);

            // 4. Status Discovery Badge (Top Right of Object)
            const statusIconCont = this.scene.add.container(objData.width / 2 - 4, -objData.height / 2 + 4);
            const statusBg = this.scene.add.graphics();
            statusBg.fillStyle(0x0f172a, 0.95);
            statusBg.fillCircle(0, 0, 16);
            statusBg.lineStyle(2, 0x00e676, 1);
            statusBg.strokeCircle(0, 0, 16);
            const statusIcon = this.scene.add.image(0, 0, 'icon_recognizes').setScale(0.3);
            statusIconCont.add([statusBg, statusIcon]);
            statusIconCont.setVisible(false);
            cont.add(statusIconCont);

            // 5. Interactive Hit Zone & Hover FX
            const hitW = Math.max(objData.width + 30, 100);
            const hitH = Math.max(objData.height + 40, 100);
            const hitZone = this.scene.add.zone(0, 0, hitW, hitH).setInteractive({ useHandCursor: true });

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
                labelBadge: badgeCont,
                statusIcon: statusIcon,
                isDiscovered: false,
                worldX: objData.worldX,
                worldY: objData.worldY
            };

            this.worldObjects.push(worldItem);
        });
    }

    private createChimpuCharacter() {
        this.chimpuContainer = this.scene.add.container(this.chimpuTargetX, this.chimpuY)
            .setDepth(UILayers.GAME_PLAYER);


        // Unified Chimpu Riding Skateboard Character Sprite (Single sprite with feet planted on deck)
        const defaultTex = this.scene.textures.exists('chimpu_riding_skateboard')
            ? 'chimpu_riding_skateboard'
            : (this.scene.textures.exists('chimpu_skater_move') ? 'chimpu_skater_move' : 'chimpu_detective_1');
        this.chimpuSprite = this.scene.add.sprite(0, -10, defaultTex)
            .setScale(0.38);
        this.chimpuContainer.add(this.chimpuSprite);

        // Synchronized Hoverboard Floating Oscillation
        this.scene.tweens.add({
            targets: this.chimpuSprite,
            y: '-=8',
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private setupDragAndTouchControls() {
        let isDragging = false;
        let dragStartX = 0;
        let startScrollX = 0;

        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.y > this.screenHeight - 120 && pointer.x > this.screenWidth - 300) {
                return; // Scanner button area
            }
            isDragging = true;
            this.isUserInteracting = true;
            dragStartX = pointer.x;
            startScrollX = this.targetScrollX;
        });

        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!isDragging) return;
            const deltaX = pointer.x - dragStartX;
            this.targetScrollX = Phaser.Math.Clamp(
                startScrollX - deltaX,
                0,
                this.worldWidth - this.screenWidth
            );
        });

        this.scene.input.on('pointerup', () => {
            isDragging = false;
            // Resume gentle auto-scroll after a pause
            this.scene.time.delayedCall(3000, () => {
                this.isUserInteracting = false;
            });
        });
    }

    public update(_time: number, delta: number) {
        if (this.isPaused) return;

        const dt = delta / 1000;

        // Auto-Scroll Behavior: gently scroll forward until reaching end of corridor
        if (this.isAutoScrolling && !this.isUserInteracting) {
            this.targetScrollX += this.zoneConfig.scrollSpeed * dt;
            if (this.targetScrollX > this.worldWidth - this.screenWidth) {
                this.targetScrollX = this.worldWidth - this.screenWidth;
            }
        }

        // Smooth camera scroll interpolation (Lerp)
        this.scrollX = Phaser.Math.Linear(this.scrollX, this.targetScrollX, 0.12);

        // Apply Parallax Offsets across layers
        // Far background (outdoor scenery seen through windows / distant skyline): 0.35x parallax
        this.farLayerCont.x = -this.scrollX * 0.35;
        // Room interior architecture (walls, floors, furniture, fixtures): 1.0x locked with objects
        this.midLayerCont.x = -this.scrollX;
        // Interactive game objects: 1.0x
        this.objectLayerCont.x = -this.scrollX;
        // Foreground overlay / vignette: 1.0x
        this.nearLayerCont.x = -this.scrollX;

        // Chimpu follows screen position smoothly with skateboard roll
    }

    public selectObject(index: number) {
        if (index < 0 || index >= this.worldObjects.length) return;

        this.selectedObjectIndex = index;
        const selected = this.worldObjects[index];

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

        // Smoothly center the camera near the selected object
        const desiredScroll = Phaser.Math.Clamp(
            selected.worldX - this.screenWidth * 0.45,
            0,
            this.worldWidth - this.screenWidth
        );
        this.targetScrollX = desiredScroll;
        this.isUserInteracting = true;

        this.onObjectSelectCallback(selected, index);
    }

    public markObjectDiscovered(index: number) {
        if (index < 0 || index >= this.worldObjects.length) return;
        const obj = this.worldObjects[index];
        obj.isDiscovered = true;

        // Update status icon
        obj.statusIcon.setTexture(obj.data.isAI ? 'icon_recognizes' : 'icon_gear');
        obj.statusIcon.setVisible(true);

        // Flash celebration particles around object
        this.scene.tweens.add({
            targets: obj.sprite,
            scale: 1.18,
            duration: 180,
            yoyo: true,
            repeat: 1,
            ease: 'Back.easeOut'
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
            y: this.chimpuY - 60,
            angle: 360,
            duration: 600,
            yoyo: true,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.chimpuContainer.setAngle(0);
                this.chimpuContainer.setY(this.chimpuY);
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

    public selectNextObject() {
        const nextIndex = (this.selectedObjectIndex + 1) % this.worldObjects.length;
        this.selectObject(nextIndex);
    }

    public selectPrevObject() {
        const prevIndex = (this.selectedObjectIndex - 1 + this.worldObjects.length) % this.worldObjects.length;
        this.selectObject(prevIndex);
    }

    public destroy() {
        this.farLayerCont.destroy();
        this.midLayerCont.destroy();
        this.objectLayerCont.destroy();
        this.nearLayerCont.destroy();
        this.chimpuContainer.destroy();
    }
}
