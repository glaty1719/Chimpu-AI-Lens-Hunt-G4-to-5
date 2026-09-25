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
        const ww = this.worldWidth;
        const sh = this.screenHeight;

        // 1. Warm Wallpaper Background with Cozy Pattern
        const bgG = this.scene.add.graphics();
        // Warm peach/cream wall
        bgG.fillStyle(0x1e1b4b, 1);
        bgG.fillRect(0, 0, ww, sh);
        // Top warm ambient lighting
        bgG.fillStyle(0x312e81, 0.6);
        bgG.fillRect(0, 0, ww, 450);

        // Wallpaper vertical stripes
        bgG.lineStyle(2, 0x4338ca, 0.25);
        for (let x = 0; x < ww; x += 120) {
            bgG.lineBetween(x, 0, x, 720);
        }

        // Baseboard / Molding
        bgG.fillStyle(0x475569, 1);
        bgG.fillRect(0, 710, ww, 22);

        // Hardwood Floor
        bgG.fillStyle(0x78350f, 1);
        bgG.fillRect(0, 732, ww, sh - 732);
        bgG.fillStyle(0x92400e, 0.6);
        for (let x = 0; x < ww; x += 160) {
            bgG.lineStyle(1.5, 0x451a03, 0.4);
            bgG.lineBetween(x, 732, x + 80, sh);
        }
        this.farLayerCont.add(bgG);

        // Midground Cozy Home Furniture Props
        // Large Cozy Rugs
        const rug1 = this.scene.add.graphics();
        rug1.fillStyle(0x047857, 0.8);
        rug1.fillRoundedRect(500, 760, 680, 150, 24);
        rug1.lineStyle(3, 0x10b981, 0.8);
        rug1.strokeRoundedRect(500, 760, 680, 150, 24);

        const rug2 = this.scene.add.graphics();
        rug2.fillStyle(0x0369a1, 0.8);
        rug2.fillRoundedRect(1900, 760, 700, 150, 24);
        rug2.lineStyle(3, 0x38bdf8, 0.8);
        rug2.strokeRoundedRect(1900, 760, 700, 150, 24);

        this.midLayerCont.add([rug1, rug2]);

        // Living Room Sofas & Shelves
        if (this.scene.textures.exists('prop_sofa')) {
            const sofa1 = this.scene.add.image(720, 680, 'prop_sofa').setScale(1.1);
            const sofa2 = this.scene.add.image(2200, 680, 'prop_sofa').setScale(1.1);
            this.midLayerCont.add([sofa1, sofa2]);
        }

        // Floating Cozy Windows & Wall Art
        const artG = this.scene.add.graphics();
        for (let x = 400; x < ww; x += 900) {
            // Window Frame
            artG.fillStyle(0x0c4a6e, 0.9);
            artG.fillRoundedRect(x, 140, 240, 220, 16);
            artG.lineStyle(6, 0xffffff, 0.95);
            artG.strokeRoundedRect(x, 140, 240, 220, 16);
            artG.lineBetween(x + 120, 140, x + 120, 360);
            artG.lineBetween(x, 250, x + 240, 250);

            // Sunlight glow
            artG.fillStyle(0xfef08a, 0.2);
            artG.fillTriangle(x + 40, 360, x + 200, 360, x - 100, 732);
        }
        this.farLayerCont.add(artG);
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
        this.farLayerCont.add(bgG);

        // Chalkboards & School Banners
        if (this.scene.textures.exists('prop_chalkboard')) {
            const board1 = this.scene.add.image(850, 260, 'prop_chalkboard').setScale(1.2);
            const board2 = this.scene.add.image(2450, 260, 'prop_chalkboard').setScale(1.2);
            this.farLayerCont.add([board1, board2]);

            // Chalkboard science equations & AI Lens banner text
            const txt1 = this.scene.add.text(850, 260, 'AI DETECTIVE LAB\nPattern Recognition 💡', {
                fontFamily: 'Arial Black', fontSize: '24px', color: '#ffffff', align: 'center'
            }).setOrigin(0.5);
            const txt2 = this.scene.add.text(2450, 260, 'MACHINE LEARNING 🔬\nTraining Data -> Predictions', {
                fontFamily: 'Arial Black', fontSize: '24px', color: '#6ee7b7', align: 'center'
            }).setOrigin(0.5);
            this.farLayerCont.add([txt1, txt2]);
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
            glow.fillStyle(glowColor, 0.25);
            glow.fillCircle(0, 0, Math.max(objData.width, objData.height) * 0.65);
            cont.add(glow);

            // 2. Interactive Object Vector Sprite
            const sprite = this.scene.add.sprite(0, 0, objData.textureKey);
            cont.add(sprite);

            // Subtle gentle floating / breathing tween
            this.scene.tweens.add({
                targets: sprite,
                y: -8,
                duration: 1500 + (idx % 3) * 300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // 3. Status Discovery Tag / Pill (below object)
            const badgeCont = this.scene.add.container(0, objData.height / 2 + 20);
            const badgeG = this.scene.add.graphics();
            badgeG.fillStyle(0x0a1128, 0.9);
            badgeG.fillRoundedRect(-90, -18, 180, 36, 12);
            badgeG.lineStyle(2, 0x64748b, 0.8);
            badgeG.strokeRoundedRect(-90, -18, 180, 36, 12);

            const badgeTxt = this.scene.add.text(0, 0, objData.name, {
                fontFamily: 'Arial Black',
                fontSize: '15px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

            badgeCont.add([badgeG, badgeTxt]);
            cont.add(badgeCont);

            // 4. Status Icon (Checkmark if already discovered)
            const statusIcon = this.scene.add.image(objData.width / 2 - 10, -objData.height / 2 + 10, 'icon_recognizes')
                .setScale(0.35)
                .setVisible(false);
            cont.add(statusIcon);

            // 5. Interactive Hit Zone
            const hitW = Math.max(objData.width + 30, 90);
            const hitH = Math.max(objData.height + 40, 90);
            const hitZone = this.scene.add.zone(0, 0, hitW, hitH).setInteractive({ useHandCursor: true });

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
        this.farLayerCont.x = -this.scrollX * 0.35;
        this.midLayerCont.x = -this.scrollX * 0.7;
        this.objectLayerCont.x = -this.scrollX;
        this.nearLayerCont.x = -this.scrollX * 1.15;

        // Chimpu follows screen position smoothly with skateboard roll
    }

    public selectObject(index: number) {
        if (index < 0 || index >= this.worldObjects.length) return;

        this.selectedObjectIndex = index;
        const selected = this.worldObjects[index];

        // Highlight selected object in world
        this.worldObjects.forEach((obj, i) => {
            const isTarget = i === index;
            obj.glowGraphics.clear();
            const glowColor = obj.data.isAI ? 0x00e5ff : 0xffd600;

            if (isTarget) {
                obj.glowGraphics.fillStyle(glowColor, 0.55);
                obj.glowGraphics.fillCircle(0, 0, Math.max(obj.data.width, obj.data.height) * 0.85);
                obj.glowGraphics.lineStyle(4, 0xffffff, 1);
                obj.glowGraphics.strokeCircle(0, 0, Math.max(obj.data.width, obj.data.height) * 0.85);
            } else {
                obj.glowGraphics.fillStyle(glowColor, 0.2);
                obj.glowGraphics.fillCircle(0, 0, Math.max(obj.data.width, obj.data.height) * 0.6);
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
