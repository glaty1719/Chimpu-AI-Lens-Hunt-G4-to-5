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
    tagline: string;
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
        worldWidth: 3800,
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
                tagline: 'Recognizes a Face',
                detailedExplanation: 'AI uses the camera to map 3D facial landmarks and compares them to your saved face profile to unlock securely.',
                visualDiagramType: 'face_match',
                worldX: 620,
                worldY: 620,
                width: 140,
                height: 190,
                hintText: 'Look at the smartphone glowing on the coffee table!'
            },
            {
                id: 'smart_speaker',
                name: 'Smart Speaker',
                zone: 1,
                isAI: true,
                aiAction: 'LISTENS',
                textureKey: 'obj_smart_speaker',
                shortLabel: 'LISTENS & RESPONDS',
                tagline: 'Listens and Responds',
                detailedExplanation: 'AI listens to acoustic soundwaves, converts speech into words, and understands user voice commands in real time.',
                visualDiagramType: 'soundwave_listen',
                worldX: 1350,
                worldY: 570,
                width: 140,
                height: 180,
                hintText: 'Check the speaker with the glowing LED ring on the shelf!'
            },
            {
                id: 'streaming_tv',
                name: 'Streaming Television',
                zone: 1,
                isAI: true,
                aiAction: 'RECOMMENDS',
                textureKey: 'obj_streaming_tv',
                shortLabel: 'RECOMMENDS',
                tagline: 'Recommends Videos',
                detailedExplanation: 'AI analyzes movies and shows you previously enjoyed to recommend brand-new personalized videos you might like.',
                visualDiagramType: 'card_recommend',
                worldX: 2150,
                worldY: 480,
                width: 250,
                height: 200,
                hintText: 'Observe the smart entertainment TV unit!'
            },
            {
                id: 'robot_vacuum',
                name: 'Smart Robot Vacuum',
                zone: 1,
                isAI: true,
                aiAction: 'PREDICTS',
                textureKey: 'obj_robot_vacuum',
                shortLabel: 'MAPS & PREDICTS',
                tagline: 'Maps the Room & Detects Obstacles',
                detailedExplanation: 'AI uses optical sensors and laser LIDAR to map the floor plan, detect furniture obstacles, and navigate efficiently.',
                visualDiagramType: 'map_obstacles',
                worldX: 3000,
                worldY: 790,
                width: 170,
                height: 120,
                hintText: 'Look down near the rug for the roaming floor vacuum!'
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
                tagline: 'Fixed Heat & Spring',
                detailedExplanation: 'Heating coils warm bread using a simple bi-metal timer spring. It has no camera, voice sensor, or AI logic.',
                visualDiagramType: 'gear_spin',
                worldX: 1000,
                worldY: 620,
                width: 150,
                height: 140,
                hintText: 'A toaster uses electricity and a mechanical spring.'
            },
            {
                id: 'lamp_switch',
                name: 'Ordinary Lamp Switch',
                zone: 1,
                isAI: false,
                mechanismType: 'BUTTON ACTION',
                textureKey: 'obj_lamp_switch',
                shortLabel: 'BUTTON ACTION',
                tagline: 'Physical Circuit Switch',
                detailedExplanation: 'Pressing the switch physically closes a wire circuit to illuminate the bulb. No software or AI calculations happen.',
                visualDiagramType: 'button_arrow',
                worldX: 1750,
                worldY: 590,
                width: 120,
                height: 180,
                hintText: 'Lamps turn on and off through direct electrical circuits.'
            },
            {
                id: 'analog_clock',
                name: 'Mechanical Analog Clock',
                zone: 1,
                isAI: false,
                mechanismType: 'FIXED TIMER',
                textureKey: 'obj_analog_clock',
                shortLabel: 'FIXED TIMER',
                tagline: 'Gear-Driven Quartz Motion',
                detailedExplanation: 'Tick-tock! Escapement gears turn the hands at a fixed constant speed without learning or pattern adjustments.',
                visualDiagramType: 'timer_tick',
                worldX: 2550,
                worldY: 380,
                width: 140,
                height: 140,
                hintText: 'Analog clocks use fixed mechanical clockwork.'
            },
            {
                id: 'regular_blender',
                name: 'Kitchen Blender',
                zone: 1,
                isAI: false,
                mechanismType: 'MECHANICAL',
                textureKey: 'obj_blender',
                shortLabel: 'FIXED MOTOR',
                tagline: 'Direct Motor Spin',
                detailedExplanation: 'A motor turns the blade at whatever speed dial is selected. It does not identify foods or make smart decisions.',
                visualDiagramType: 'gear_spin',
                worldX: 3380,
                worldY: 640,
                width: 130,
                height: 170,
                hintText: 'Blenders spin at fixed motor speeds.'
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
        worldWidth: 3800,
        scrollSpeed: 200,
        requiredAIDiscoveries: 4,
        objects: [
            // --- AI Targets (4) ---
            {
                id: 'speech_to_text_tablet',
                name: 'Speech-to-Text Tablet',
                zone: 2,
                isAI: true,
                aiAction: 'LISTENS',
                textureKey: 'obj_speech_tablet',
                shortLabel: 'LISTENS & TRANSCRIBES',
                tagline: 'Converts Speech into Text',
                detailedExplanation: 'AI acoustic models process microphone audio and transcribe spoken words into accurate on-screen sentences.',
                visualDiagramType: 'speech_to_words',
                worldX: 680,
                worldY: 610,
                width: 150,
                height: 160,
                hintText: 'Check the student desk for the tablet transcribing audio!'
            },
            {
                id: 'translation_app',
                name: 'Language Translation App',
                zone: 2,
                isAI: true,
                aiAction: 'LEARNS',
                textureKey: 'obj_translation_app',
                shortLabel: 'PROCESSES & TRANSLATES',
                tagline: 'Translates Languages',
                detailedExplanation: 'Neural machine translation AI models analyze grammar, vocabulary context, and translate across multiple languages.',
                visualDiagramType: 'language_translate',
                worldX: 1480,
                worldY: 590,
                width: 150,
                height: 170,
                hintText: 'Look for the language learning station!'
            },
            {
                id: 'adaptive_learning_app',
                name: 'Adaptive Learning Application',
                zone: 2,
                isAI: true,
                aiAction: 'RECOMMENDS',
                textureKey: 'obj_adaptive_learning',
                shortLabel: 'ADAPTS & RECOMMENDS',
                tagline: 'Changes Questions Based on Answers',
                detailedExplanation: 'AI tracks student response patterns and dynamically adapts quiz difficulty from easy to challenging cards.',
                visualDiagramType: 'question_cards',
                worldX: 2280,
                worldY: 600,
                width: 150,
                height: 170,
                hintText: 'Check the computer desk testing adaptive quizzes!'
            },
            {
                id: 'camera_recognition_app',
                name: 'Camera Recognition Scanner',
                zone: 2,
                isAI: true,
                aiAction: 'RECOGNIZES',
                textureKey: 'obj_camera_plant',
                shortLabel: 'RECOGNIZES OBJECTS',
                tagline: 'Identifies Plants & Objects',
                detailedExplanation: 'Computer vision AI scans leaf shapes and flower petals to classify plant species and display educational cards.',
                visualDiagramType: 'plant_scan',
                worldX: 3100,
                worldY: 590,
                width: 150,
                height: 180,
                hintText: 'Inspect the science display table with the potted plant!'
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
                tagline: 'Fixed Math Microchip',
                detailedExplanation: 'Calculators execute fixed arithmetic logic gates (2+2=4). It does not learn or recognize patterns.',
                visualDiagramType: 'fixed_calc',
                worldX: 1050,
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
                tagline: 'Projects Optical Light',
                detailedExplanation: 'Lenses and a lamp beam static slides onto a whiteboard screen with no intelligence or autonomous control.',
                visualDiagramType: 'button_arrow',
                worldX: 1850,
                worldY: 340,
                width: 160,
                height: 120,
                hintText: 'Projectors simply display optical video feeds.'
            },
            {
                id: 'ordinary_printer',
                name: 'Classroom Paper Printer',
                zone: 2,
                isAI: false,
                mechanismType: 'FIXED STEPS',
                textureKey: 'obj_printer',
                shortLabel: 'FIXED STEPS',
                tagline: 'Mechanical Ink Rollers',
                detailedExplanation: 'Rollers move paper and spray ink according to pre-formatted document instructions without learning.',
                visualDiagramType: 'gear_spin',
                worldX: 2680,
                worldY: 620,
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
                tagline: 'Swiveling Electric Motor',
                detailedExplanation: 'Winds wire around magnets to rotate fan blades back and forth. No software decisions or AI features are present.',
                visualDiagramType: 'gear_spin',
                worldX: 3450,
                worldY: 600,
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
        worldWidth: 3800,
        scrollSpeed: 210,
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
                tagline: 'Predicts Traffic & Compares Routes',
                detailedExplanation: 'AI aggregates traffic speeds across roads to forecast congestion and recommend the fastest journey route.',
                visualDiagramType: 'route_highlight',
                worldX: 650,
                worldY: 610,
                width: 150,
                height: 170,
                hintText: 'Look at the smartphone navigation map on the kiosk!'
            },
            {
                id: 'delivery_robot',
                name: 'Autonomous Delivery Bot',
                zone: 3,
                isAI: true,
                aiAction: 'PREDICTS',
                textureKey: 'obj_delivery_robot',
                shortLabel: 'AVOIDS OBSTACLES',
                tagline: 'Detects & Avoids Pedestrians',
                detailedExplanation: 'Using cameras and radar, the rover detects pedestrians and recalculates safe steering paths in real time.',
                visualDiagramType: 'robot_swerve',
                worldX: 1450,
                worldY: 760,
                width: 170,
                height: 150,
                hintText: 'Spot the cute rolling delivery cooler on the sidewalk!'
            },
            {
                id: 'adaptive_traffic_camera',
                name: 'Adaptive Traffic Camera',
                zone: 3,
                isAI: true,
                aiAction: 'RECOGNIZES',
                textureKey: 'obj_traffic_cam',
                shortLabel: 'RECOGNIZES TRAFFIC',
                tagline: 'Recognizes Traffic Patterns',
                detailedExplanation: 'Vision AI identifies cars, buses, and cyclists, adjusting green light intervals to reduce road traffic queues.',
                visualDiagramType: 'traffic_boxes',
                worldX: 2250,
                worldY: 410,
                width: 160,
                height: 190,
                hintText: 'Look up at the smart traffic pole camera!'
            },
            {
                id: 'visual_search_camera',
                name: 'Visual Landmark Search',
                zone: 3,
                isAI: true,
                aiAction: 'RECOGNIZES',
                textureKey: 'obj_visual_search',
                shortLabel: 'RECOGNIZES LANDMARKS',
                tagline: 'Recognizes Historic Buildings',
                detailedExplanation: 'AI compares building architecture against a vast world landmark database to instantly show tour facts.',
                visualDiagramType: 'landmark_card',
                worldX: 3080,
                worldY: 600,
                width: 150,
                height: 170,
                hintText: 'Inspect the tourist visual scanner camera!'
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
                tagline: 'Chain & Gear Pedal Drive',
                detailedExplanation: 'Pedals turn sprockets connected by a chain to rotate the back wheel. 100% human-powered mechanics without AI.',
                visualDiagramType: 'gear_spin',
                worldX: 1040,
                worldY: 680,
                width: 180,
                height: 140,
                hintText: 'Bicycles use human legs and mechanical chain gears.'
            },
            {
                id: 'countdown_timer',
                name: 'Countdown Crossing Light',
                zone: 3,
                isAI: false,
                mechanismType: 'FIXED TIMER',
                textureKey: 'obj_crossing_timer',
                shortLabel: 'FIXED TIMER',
                tagline: 'Fixed Numeric Timer',
                detailedExplanation: 'Counts down seconds (15, 14, 13...) using an electronic clock chip. It does not measure pedestrian crowds.',
                visualDiagramType: 'timer_tick',
                worldX: 1840,
                worldY: 480,
                width: 120,
                height: 180,
                hintText: 'Crossing timers count down at fixed second intervals.'
            },
            {
                id: 'vending_machine',
                name: 'Traditional Vending Machine',
                zone: 3,
                isAI: false,
                mechanismType: 'MECHANICAL',
                textureKey: 'obj_vending_machine',
                shortLabel: 'MECHANICAL COILS',
                tagline: 'Coin Sensor & Turning Spiral',
                detailedExplanation: 'A coin weight sensor validates coins, then an electric motor spins a metal spiral coil to drop your drink.',
                visualDiagramType: 'gear_spin',
                worldX: 2660,
                worldY: 570,
                width: 160,
                height: 220,
                hintText: 'Vending machines drop snacks using mechanical spirals.'
            },
            {
                id: 'fixed_streetlight',
                name: 'Fixed-Timer Streetlight',
                zone: 3,
                isAI: false,
                mechanismType: 'FIXED TIMER',
                textureKey: 'obj_streetlight',
                shortLabel: 'FIXED TIMER',
                tagline: 'Preset Schedule Switch',
                detailedExplanation: 'Turns on automatically at 7:00 PM and off at 6:00 AM using a preset mechanical clock. No AI logic is involved.',
                visualDiagramType: 'timer_tick',
                worldX: 3480,
                worldY: 370,
                width: 140,
                height: 240,
                hintText: 'Streetlights switch on based on preset time schedules.'
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
