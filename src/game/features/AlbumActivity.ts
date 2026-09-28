import { Scene, GameObjects } from 'phaser';
import { REAL_LIFE_AI_ALBUM_CARDS, RealLifeAICard } from '../data/LensHuntData';
import { UILayers } from '../utils/UILayers';
import { AudioManager } from '../services/AudioManager';

export class AlbumActivity {
    private scene: Scene;
    private modalContainer: GameObjects.Container | null = null;
    private activeCategory: 'Home' | 'School' | 'Street' = 'Home';
    private stampedCardIds: Set<string> = new Set();
    private onCompleteCallback: () => void;

    constructor(scene: Scene, onComplete: () => void) {
        this.scene = scene;
        this.onCompleteCallback = onComplete;
        this.createAlbumModal();
    }

    private createAlbumModal() {
        const { width, height } = this.scene.scale;
        this.modalContainer = this.scene.add.container(width / 2, height / 2)
            .setDepth(UILayers.MODAL_PANEL + 20)
            .setScale(0.85)
            .setAlpha(0);

        const mw = 1420;
        const mh = 780;
        const r = 32;

        // Dark Backdrop
        const blocker = this.scene.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.8)
            .setInteractive();
        this.modalContainer.add(blocker);

        // Scrapbook Frame
        const frameG = this.scene.add.graphics();
        frameG.fillStyle(0x7c3aed, 0.25);
        frameG.fillRoundedRect(-mw / 2 - 12, -mh / 2 - 12, mw + 24, mh + 24, r + 6);
        frameG.fillStyle(0x0c1022, 0.98);
        frameG.fillRoundedRect(-mw / 2, -mh / 2, mw, mh, r);
        frameG.lineStyle(4, 0x00f2fe, 1);
        frameG.strokeRoundedRect(-mw / 2, -mh / 2, mw, mh, r);

        // Header Plaque
        frameG.fillStyle(0x6b21a8, 1);
        frameG.fillRoundedRect(-mw / 2 + 20, -mh / 2 + 16, mw - 40, 95, 20);
        frameG.lineStyle(3, 0xffd166, 1);
        frameG.strokeRoundedRect(-mw / 2 + 20, -mh / 2 + 16, mw - 40, 95, 20);
        this.modalContainer.add(frameG);

        // Header Title
        const title = this.scene.add.text(0, -mh / 2 + 62, '📖 AI DETECTIVE ALBUM: REAL-LIFE DISCOVERIES', {
            fontFamily: 'Arial Black',
            fontSize: '44px',
            color: '#fef08a',
            stroke: '#3b0764',
            strokeThickness: 8
        }).setOrigin(0.5);
        this.modalContainer.add(title);

        // Subtitle Instructions
        const subTxt = this.scene.add.text(0, -mh / 2 + 140, 'Select an environment and stamp the AI features you have encountered in real life!', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#38bdf8',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.modalContainer.add(subTxt);

        // 3 Category Tabs (Home, School, Street)
        this.createCategoryTabs();

        // Cards Container
        this.renderCardsForCategory();

        // Done / Claim Badge Button
        const doneBtnW = 500;
        const doneBtnH = 80;
        const doneCont = this.scene.add.container(0, mh / 2 - 55);

        const doneG = this.scene.add.graphics();
        doneG.fillStyle(0x059669, 1);
        doneG.fillRoundedRect(-doneBtnW / 2, -doneBtnH / 2, doneBtnW, doneBtnH, 22);
        doneG.fillStyle(0x34d399, 0.4);
        doneG.fillRoundedRect(-doneBtnW / 2 + 4, -doneBtnH / 2 + 4, doneBtnW - 8, doneBtnH / 2 - 4, 18);
        doneG.lineStyle(3.5, 0xffffff, 1);
        doneG.strokeRoundedRect(-doneBtnW / 2, -doneBtnH / 2, doneBtnW, doneBtnH, 22);
        doneCont.add(doneG);

        const doneTxt = this.scene.add.text(0, 0, 'SEAL ALBUM & FINISH  ⭐', {
            fontFamily: 'Arial Black',
            fontSize: '34px',
            color: '#ffffff',
            stroke: '#064e3b',
            strokeThickness: 7
        }).setOrigin(0.5);
        doneCont.add(doneTxt);

        const hit = this.scene.add.zone(0, 0, doneBtnW, doneBtnH).setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
            AudioManager.getInstance().playSFX('button_tap');
            this.closeModal();
        });
        doneCont.add(hit);
        this.modalContainer.add(doneCont);

        // Pop in animation
        this.scene.tweens.add({
            targets: this.modalContainer,
            scale: 1,
            alpha: 1,
            duration: 350,
            ease: 'Back.easeOut'
        });
    }

    private createCategoryTabs() {
        if (!this.modalContainer) return;
        const cats: ('Home' | 'School' | 'Street')[] = ['Home', 'School', 'Street'];
        const tabW = 280;
        const tabH = 60;

        cats.forEach((cat, idx) => {
            const x = (idx - 1) * (tabW + 25);
            const y = -185;
            const tabCont = this.scene.add.container(x, y);

            const tabG = this.scene.add.graphics();
            const isActive = this.activeCategory === cat;
            const tabBg = isActive ? 0x0284c7 : 0x1e293b;
            tabG.fillStyle(tabBg, 1);
            tabG.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 16);
            tabG.lineStyle(2.5, isActive ? 0x00f2fe : 0x475569, 1);
            tabG.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 16);
            tabCont.add(tabG);

            const tabTxt = this.scene.add.text(0, 0, `${cat === 'Home' ? '🏠' : cat === 'School' ? '🏫' : '🛣️'} ${cat}`, {
                fontFamily: 'Arial Black',
                fontSize: '30px',
                color: isActive ? '#ffffff' : '#94a3b8',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
            tabCont.add(tabTxt);

            const hit = this.scene.add.zone(0, 0, tabW, tabH).setInteractive({ useHandCursor: true });
            hit.on('pointerdown', () => {
                AudioManager.getInstance().playSFX('button_tap');
                this.activeCategory = cat;
                this.rebuildModal();
            });
            tabCont.add(hit);
            this.modalContainer?.add(tabCont);
        });
    }

    private cardsContainer: GameObjects.Container | null = null;

    private renderCardsForCategory() {
        if (!this.modalContainer) return;
        this.cardsContainer?.destroy();

        this.cardsContainer = this.scene.add.container(0, 75);
        this.modalContainer.add(this.cardsContainer);

        const filtered = REAL_LIFE_AI_ALBUM_CARDS.filter(c => c.zoneCategory === this.activeCategory);
        const cardW = 580;
        const cardH = 300;

        filtered.forEach((card, idx) => {
            const cx = (idx === 0 ? -325 : 325);
            const cardCont = this.scene.add.container(cx, 0);

            const isStamped = this.stampedCardIds.has(card.id);
            const cardG = this.scene.add.graphics();

            // Card background plate
            cardG.fillStyle(isStamped ? 0x064e3b : 0x1e293b, 0.96);
            cardG.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);
            cardG.lineStyle(3, isStamped ? 0x00e676 : 0x38bdf8, 1);
            cardG.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);
            cardCont.add(cardG);

            // AI Action Icon
            if (this.scene.textures.exists(card.icon)) {
                const icon = this.scene.add.image(-cardW / 2 + 75, -cardH / 2 + 75, card.icon).setScale(0.7);
                cardCont.add(icon);
            }

            // Card Title & Verb
            const titleTxt = this.scene.add.text(-cardW / 2 + 155, -cardH / 2 + 42, card.title, {
                fontFamily: 'Arial Black', fontSize: '32px', color: '#ffffff', stroke: '#000000', strokeThickness: 5
            });
            const verbTxt = this.scene.add.text(-cardW / 2 + 155, -cardH / 2 + 84, `AI Action: ${card.verb}`, {
                fontFamily: 'Arial Black', fontSize: '24px', color: '#69f0ae'
            });
            cardCont.add([titleTxt, verbTxt]);

            // Description
            const descTxt = this.scene.add.text(0, 20, card.description, {
                fontFamily: 'Arial Black',
                fontSize: '26px',
                color: '#e2e8f0',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center',
                wordWrap: { width: cardW - 40 },
                lineSpacing: 10
            }).setOrigin(0.5);
            cardCont.add(descTxt);

            // Stamp Button / Verified Stamp Mark
            const stampBtnCont = this.scene.add.container(0, cardH / 2 - 45);
            const stampG = this.scene.add.graphics();
            const sW = 340;
            const sH = 56;

            if (isStamped) {
                stampG.fillStyle(0x00e676, 1);
                stampG.fillRoundedRect(-sW / 2, -sH / 2, sW, sH, 16);
                const sTxt = this.scene.add.text(0, 0, '✓ STAMPED IN ALBUM', {
                    fontFamily: 'Arial Black', fontSize: '24px', color: '#0f172a'
                }).setOrigin(0.5);
                stampBtnCont.add([stampG, sTxt]);
            } else {
                stampG.fillStyle(0x0284c7, 1);
                stampG.fillRoundedRect(-sW / 2, -sH / 2, sW, sH, 16);
                stampG.lineStyle(2, 0xffffff, 0.9);
                stampG.strokeRoundedRect(-sW / 2, -sH / 2, sW, sH, 16);
                const sTxt = this.scene.add.text(0, 0, '🏷️ STAMP THIS FEATURE', {
                    fontFamily: 'Arial Black', fontSize: '24px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
                }).setOrigin(0.5);
                stampBtnCont.add([stampG, sTxt]);

                const hit = this.scene.add.zone(0, 0, sW, sH).setInteractive({ useHandCursor: true });
                hit.on('pointerdown', () => {
                    this.stampCard(card);
                });
                stampBtnCont.add(hit);
            }

            cardCont.add(stampBtnCont);
            this.cardsContainer?.add(cardCont);
        });
    }

    private stampCard(card: RealLifeAICard) {
        AudioManager.getInstance().playSFX('correct_ai');
        this.stampedCardIds.add(card.id);
        this.rebuildModal();
    }

    private rebuildModal() {
        this.modalContainer?.destroy();
        this.createAlbumModal();
    }

    private closeModal() {
        if (!this.modalContainer) return;
        this.scene.tweens.add({
            targets: this.modalContainer,
            scale: 0.85,
            alpha: 0,
            duration: 250,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.modalContainer?.destroy();
                this.modalContainer = null;
                this.onCompleteCallback();
            }
        });
    }

    public destroy() {
        this.modalContainer?.destroy();
    }
}
