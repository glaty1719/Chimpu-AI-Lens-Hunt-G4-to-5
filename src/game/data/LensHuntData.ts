export type AIActionVerb = 'RECOGNIZES' | 'LISTENS' | 'PREDICTS' | 'RECOMMENDS' | 'LEARNS';
export type DecoyMechanism = 'MECHANICAL' | 'FIXED TIMER' | 'BUTTON ACTION' | 'FIXED STEPS';

export interface HuntObjectData {
    id: string;
    name: string;
    zone: 1 | 2 | 3; // 1 = Home, 2 = School, 3 = Street
    isAI: boolean;
    aiAction?: AIActionVerb;
    mechanismType?: DecoyMechanism;
    textureKey: string;
    shortLabel: string;
    detailedExplanation: string;
    visualDiagramType:
    | 'face_match'
    | 'soundwave_listen'
    | 'card_recommend'
    | 'map_obstacles'
    | 'speech_to_words'
    | 'language_translate'
    | 'question_cards'
    | 'plant_scan'
    | 'route_highlight'
    | 'robot_swerve'
    | 'traffic_boxes'
    | 'landmark_card'
    | 'gear_spin'
    | 'timer_tick'
    | 'button_arrow'
    | 'fixed_calc';
    worldX: number; // corridor X position
    worldY: number; // corridor Y position
    width: number;
    height: number;
    anchorY?: number;
    hintText: string;
}

export interface ZoneConfig {
    id: 1 | 2 | 3;
    title: string;
    subtitle: string;
    lensName: string;
    lensKey: string;
    themeColor: number;
    themeHex: string;
    bgMusicKey: string;
    worldWidth: number;
    scrollSpeed: number;
    objects: HuntObjectData[];
    requiredAIDiscoveries: number;
}

export const HUNT_ZONES: ZoneConfig[] = [
    {
        id: 1,
        title: 'Zone 1: Home Interior',
        subtitle: 'AI at Home',
        lensName: 'Home Lens',
        lensKey: 'lens_home',
        themeColor: 0x10b981, // Emerald Mint
        themeHex: '#10b981',
        bgMusicKey: 'detective_home',
        worldWidth: 7680,
        scrollSpeed: 180,
        requiredAIDiscoveries: 4,
        objects: [
            // --- AI Targets (4) ---
            {
                id: 'smartphone_face_unlock',
                name: 'Smartphone Face Unlock',
                zone: 1,
                isAI: true,
                aiAction: 'RECOGNIZES',
                textureKey: 'obj_phone_face',
                shortLabel: 'RECOGNIZES',
                detailedExplanation: 'Maps 3D facial points and compares them with your saved profile to unlock.',
                visualDiagramType: 'face_match',
                worldX: 1300,
                worldY: 610,
                width: 100,
                height: 206,
                hintText: 'Look at the smartphone glowing on the foyer console table!'
            },
            {
                id: 'smart_speaker',
                name: 'Smart Speaker',
                zone: 1,
                isAI: true,
                aiAction: 'LISTENS',
                textureKey: 'obj_smart_speaker',
                shortLabel: 'LISTENS & RESPONDS',
                detailedExplanation: 'Converts voice soundwaves into text to understand and carry out commands.',
                visualDiagramType: 'soundwave_listen',
                worldX: 6800,
                worldY: 588,
                width: 120,
                height: 220,
                hintText: 'Check the smart speaker with the glowing LED ring on the sunroom breakfast bar!'
            },
            {
                id: 'streaming_tv',
                name: 'Streaming Television',
                zone: 1,
                isAI: true,
                aiAction: 'RECOMMENDS',
                textureKey: 'obj_streaming_tv',
                shortLabel: 'RECOMMENDS',
                detailedExplanation: 'Analyzes your watch history to suggest new shows you might enjoy.',
                visualDiagramType: 'card_recommend',
                worldX: 4380,
                worldY: 370,
                width: 250,
                height: 168,
                hintText: 'Observe the smart entertainment TV unit in the living room!'
            },
            {
                id: 'robot_vacuum',
                name: 'Smart Robot Vacuum',
                zone: 1,
                isAI: true,
                aiAction: 'PREDICTS',
                textureKey: 'obj_robot_vacuum',
                shortLabel: 'MAPS & PREDICTS',
                detailedExplanation: 'Uses sensors to map room layouts and navigate around obstacles.',
                visualDiagramType: 'map_obstacles',
                worldX: 2580,
                worldY: 810,
                width: 170,
                height: 114,
                hintText: 'Look down in the kitchen aisle for the roaming smart robot vacuum!'
            },
            // --- Non-AI Decoys (4) ---
            {
                id: 'manual_toaster',
                name: 'Manual Kitchen Toaster',
                zone: 1,
                isAI: false,
                mechanismType: 'MECHANICAL',
                textureKey: 'obj_toaster',
                shortLabel: 'MECHANICAL',
                detailedExplanation: 'Uses a simple heating coil and spring timer with no software logic.',
                visualDiagramType: 'gear_spin',
                worldX: 7100,
                worldY: 608,
                width: 150,
                height: 132,
                hintText: 'Look for the manual toaster on the sunroom patio counter!'
            },
            {
                id: 'lamp_switch',
                name: 'Ordinary Lamp Switch',
                zone: 1,
                isAI: false,
                mechanismType: 'BUTTON ACTION',
                textureKey: 'obj_lamp_switch',
                shortLabel: 'BUTTON ACTION',
                detailedExplanation: 'Physically opens or closes an electric circuit to power the bulb.',
                visualDiagramType: 'button_arrow',
                worldX: 5480,
                worldY: 575,
                width: 130,
                height: 161,
                hintText: 'Observe the reading lamp beside the sofa in the living room!'
            },
            {
                id: 'analog_clock',
                name: 'Mechanical Analog Clock',
                zone: 1,
                isAI: false,
                mechanismType: 'FIXED TIMER',
                textureKey: 'obj_analog_clock',
                shortLabel: 'FIXED TIMER',
                detailedExplanation: 'Gears rotate clock hands at a constant speed without smart processing.',
                visualDiagramType: 'timer_tick',
                worldX: 1675,
                worldY: 250,
                width: 140,
                height: 140,
                hintText: 'Check the wall in the foyer/study for the mechanical ticking clock!'
            },
            {
                id: 'regular_blender',
                name: 'Kitchen Blender',
                zone: 1,
                isAI: false,
                mechanismType: 'MECHANICAL',
                textureKey: 'obj_blender',
                shortLabel: 'FIXED MOTOR',
                detailedExplanation: 'Spins blades at a selected dial speed using an electric motor.',
                visualDiagramType: 'gear_spin',
                worldX: 3450,
                worldY: 593,
                width: 115,
                height: 220,
                hintText: 'Look for the electric blender on the kitchen quartz countertop!'
            }
        ]
    },
    {
        id: 2,
        title: 'Zone 2: Classroom & Hallway',
        subtitle: 'AI at School',
        lensName: 'School Lens',
        lensKey: 'lens_school',
        themeColor: 0x0284c7, // Sapphire Azure
        themeHex: '#0284c7',
        bgMusicKey: 'detective_school',
        worldWidth: 7680,
        scrollSpeed: 200,
        requiredAIDiscoveries: 4,
        objects: [
            // --- AI Targets (4) ---
            {
                id: 'speech_to_text_app',
                name: 'Speech-to-Text Mobile App',
                zone: 2,
                isAI: true,
                aiAction: 'LISTENS',
                textureKey: 'obj_speech_app',
                shortLabel: 'LISTENS & TRANSCRIBES',
                detailedExplanation: 'Processes microphone audio to transcribe spoken words into text instantly.',
                visualDiagramType: 'speech_to_words',
                worldX: 1300,
                worldY: 615,
                width: 90,
                height: 185,
                hintText: 'Look for the speech-to-text mobile app on the administration reception desk!'
            },
            {
                id: 'translation_app',
                name: 'Language Translation Mobile App',
                zone: 2,
                isAI: true,
                aiAction: 'LEARNS',
                textureKey: 'obj_translation_app',
                shortLabel: 'PROCESSES & TRANSLATES',
                detailedExplanation: 'Translates spoken or written text across multiple languages in real time.',
                visualDiagramType: 'language_translate',
                worldX: 2430,
                worldY: 595,
                width: 95,
                height: 190,
                hintText: 'Check Station 1 on the computer lab desk for the real-time language translation mobile app!'
            },
            {
                id: 'adaptive_learning_app',
                name: 'Adaptive Learning Application',
                zone: 2,
                isAI: true,
                aiAction: 'RECOMMENDS',
                textureKey: 'obj_adaptive_learning',
                shortLabel: 'ADAPTS & RECOMMENDS',
                detailedExplanation: 'Adjusts quiz difficulty based on your correct and incorrect answers.',
                visualDiagramType: 'question_cards',
                worldX: 3490,
                worldY: 595,
                width: 175,
                height: 175,
                hintText: 'Check Station 4 in the computer lab for the interactive adaptive quiz terminal!'
            },
            {
                id: 'camera_recognition_app',
                name: 'AI Camera Recognition App',
                zone: 2,
                isAI: true,
                aiAction: 'RECOGNIZES',
                textureKey: 'obj_camera_plant',
                shortLabel: 'RECOGNIZES OBJECTS',
                detailedExplanation: 'Identifies plants and objects using computer vision analysis.',
                visualDiagramType: 'plant_scan',
                worldX: 5150,
                worldY: 595,
                width: 95,
                height: 190,
                hintText: 'Inspect the library study desk for the AI camera recognition mobile scanner app!'
            },
            // --- Non-AI Decoys (4) ---
            {
                id: 'basic_calculator',
                name: 'Basic Pocket Calculator',
                zone: 2,
                isAI: false,
                mechanismType: 'FIXED STEPS',
                textureKey: 'obj_calculator',
                shortLabel: 'FIXED STEPS',
                detailedExplanation: 'Performs pre-programmed math rules without learning or reasoning.',
                visualDiagramType: 'fixed_calc',
                worldX: 720,
                worldY: 630,
                width: 120,
                height: 140,
                hintText: 'Calculators follow fixed arithmetic rules without AI.'
            },
            {
                id: 'classroom_projector',
                name: 'Ceiling Slide Projector',
                zone: 2,
                isAI: false,
                mechanismType: 'BUTTON ACTION',
                textureKey: 'obj_projector',
                shortLabel: 'FIXED DISPLAY',
                detailedExplanation: 'Shines light through lenses to project static images onto a screen.',
                visualDiagramType: 'button_arrow',
                worldX: 3000,
                worldY: 270,
                width: 160,
                height: 120,
                hintText: 'Check the ceiling mount in the computer lab for the optical slide projector!'
            },
            {
                id: 'ordinary_printer',
                name: 'Classroom Paper Printer',
                zone: 2,
                isAI: false,
                mechanismType: 'FIXED STEPS',
                textureKey: 'obj_printer',
                shortLabel: 'FIXED STEPS',
                detailedExplanation: 'Feeds paper and sprays ink following fixed document instructions.',
                visualDiagramType: 'gear_spin',
                worldX: 4350,
                worldY: 615,
                width: 160,
                height: 150,
                hintText: 'Printers feed paper and spray fixed dots.'
            },
            {
                id: 'electric_fan',
                name: 'Electric Oscillating Fan',
                zone: 2,
                isAI: false,
                mechanismType: 'MECHANICAL',
                textureKey: 'obj_fan',
                shortLabel: 'MECHANICAL',
                detailedExplanation: 'Uses a motorized mechanism to spin blades and move air.',
                visualDiagramType: 'gear_spin',
                worldX: 6850,
                worldY: 590,
                width: 130,
                height: 170,
                hintText: 'Fans spin mechanically to blow air.'
            }
        ]
    },
    {
        id: 3,
        title: 'Zone 3: Neighborhood Street',
        subtitle: 'AI on the Street',
        lensName: 'Street Lens',
        lensKey: 'lens_street',
        themeColor: 0x9333ea, // Cyber Purple
        themeHex: '#9333ea',
        bgMusicKey: 'detective_street',
        worldWidth: 7680,
        scrollSpeed: 200,
        requiredAIDiscoveries: 4,
        objects: [
            // --- AI Targets (4) ---
            {
                id: 'map_traffic_app',
                name: 'Smart Map & Route App',
                zone: 3,
                isAI: true,
                aiAction: 'PREDICTS',
                textureKey: 'obj_map_app',
                shortLabel: 'PREDICTS ROUTES',
                detailedExplanation: 'Evaluates live traffic data to predict delays and recommend fast routes.',
                visualDiagramType: 'route_highlight',
                worldX: 1100,
                worldY: 590,
                width: 135,
                height: 275,
                hintText: 'Look at the smart navigation map on the Metro Transit Kiosk!'
            },
            {
                id: 'delivery_robot',
                name: 'Autonomous Delivery Bot',
                zone: 3,
                isAI: true,
                aiAction: 'PREDICTS',
                textureKey: 'obj_delivery_robot',
                shortLabel: 'AVOIDS OBSTACLES',
                detailedExplanation: 'Detects pedestrians and plans safe paths around obstacles in real time.',
                visualDiagramType: 'robot_swerve',
                worldX: 2950,
                worldY: 710,
                width: 200,
                height: 175,
                hintText: 'Spot the high-tech delivery bot cruising along the sidewalk delivery lane!'
            },
            {
                id: 'adaptive_traffic_camera',
                name: 'Adaptive Traffic Camera',
                zone: 3,
                isAI: true,
                aiAction: 'RECOGNIZES',
                textureKey: 'obj_traffic_cam',
                shortLabel: 'RECOGNIZES TRAFFIC',
                detailedExplanation: 'Detects road vehicles and adjusts signal timing to reduce congestion.',
                visualDiagramType: 'traffic_boxes',
                worldX: 4840,
                worldY: 355,
                width: 120,
                height: 128,
                hintText: 'Look up at the smart traffic gantry pole camera over the intersection!'
            },
            {
                id: 'visual_search_camera',
                name: 'Visual Landmark Search',
                zone: 3,
                isAI: true,
                aiAction: 'RECOGNIZES',
                textureKey: 'obj_visual_search',
                shortLabel: 'RECOGNIZES LANDMARKS',
                detailedExplanation: 'Scans building shapes to identify landmarks and display historical info.',
                visualDiagramType: 'landmark_card',
                worldX: 6500,
                worldY: 575,
                width: 135,
                height: 297,
                hintText: 'Inspect the tourist visual scanner phone capturing the historic clock tower!'
            },
            // --- Non-AI Decoys (4) ---
            {
                id: 'regular_bicycle',
                name: 'Regular Bicycle',
                zone: 3,
                isAI: false,
                mechanismType: 'MECHANICAL',
                textureKey: 'obj_bicycle',
                shortLabel: 'MECHANICAL',
                detailedExplanation: 'Transfers rider pedaling power to wheels through gears and a chain.',
                visualDiagramType: 'gear_spin',
                worldX: 1650,
                worldY: 670,
                width: 240,
                height: 179,
                hintText: 'Bicycles use human pedaling power and mechanical chain gears.'
            },
            {
                id: 'countdown_timer',
                name: 'Countdown Crossing Light',
                zone: 3,
                isAI: false,
                mechanismType: 'FIXED TIMER',
                textureKey: 'obj_crossing_timer',
                shortLabel: 'FIXED TIMER',
                detailedExplanation: 'Counts down seconds on a fixed electronic timer without viewing traffic.',
                visualDiagramType: 'timer_tick',
                worldX: 3620,
                worldY: 565,
                width: 80,
                height: 397,
                hintText: 'Crossing timers tick down at fixed second intervals regardless of traffic.'
            },
            {
                id: 'vending_machine',
                name: 'Traditional Vending Machine',
                zone: 3,
                isAI: false,
                mechanismType: 'MECHANICAL',
                textureKey: 'obj_vending_machine',
                shortLabel: 'MECHANICAL COILS',
                detailedExplanation: 'Validates inserted coins mechanically and spins a spiral coil to release items.',
                visualDiagramType: 'gear_spin',
                worldX: 5500,
                worldY: 615,
                width: 160,
                height: 251,
                hintText: 'Vending machines drop snacks using mechanical turning spirals.'
            },
            {
                id: 'fixed_streetlight',
                name: 'Fixed-Timer Streetlight',
                zone: 3,
                isAI: false,
                mechanismType: 'FIXED TIMER',
                textureKey: 'obj_streetlight',
                shortLabel: 'FIXED TIMER',
                detailedExplanation: 'Toggles light on and off based on a fixed schedule timer.',
                visualDiagramType: 'timer_tick',
                worldX: 7200,
                worldY: 540,
                width: 55,
                height: 405,
                hintText: 'Streetlights switch on based on a preset mechanical time schedule.'
            }
        ]
    }
];

export interface RealLifeAICard {
    id: string;
    zoneCategory: 'Home' | 'School' | 'Street';
    title: string;
    verb: AIActionVerb;
    description: string;
    icon: string;
}

export const REAL_LIFE_AI_ALBUM_CARDS: RealLifeAICard[] = [
    {
        id: 'voice_assistant',
        zoneCategory: 'Home',
        title: 'Voice Assistant',
        verb: 'LISTENS',
        description: 'Understands your spoken questions and plays your favorite music.',
        icon: 'icon_listens'
    },
    {
        id: 'face_unlock',
        zoneCategory: 'Home',
        title: 'Face Unlock',
        verb: 'RECOGNIZES',
        description: 'Unlocks devices instantly by recognizing unique facial features.',
        icon: 'icon_recognizes'
    },
    {
        id: 'auto_complete',
        zoneCategory: 'School',
        title: 'Smart Typing / Auto-Complete',
        verb: 'PREDICTS',
        description: 'Predicts the next word as you type essays and messages.',
        icon: 'icon_predicts'
    },
    {
        id: 'language_translator',
        zoneCategory: 'School',
        title: 'Instant Translator',
        verb: 'LEARNS',
        description: 'Translates foreign languages on school assignments and signs.',
        icon: 'icon_learns'
    },
    {
        id: 'traffic_maps',
        zoneCategory: 'Street',
        title: 'Live GPS Traffic',
        verb: 'PREDICTS',
        description: 'Forecasts traffic jams and finds the smoothest detour route.',
        icon: 'icon_predicts'
    },
    {
        id: 'photo_search',
        zoneCategory: 'Street',
        title: 'Visual Search Lens',
        verb: 'RECOGNIZES',
        description: 'Snaps a photo of a dog or statue to identify its exact breed or history.',
        icon: 'icon_recognizes'
    }
];