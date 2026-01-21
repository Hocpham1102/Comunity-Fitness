import { PrismaClient, MuscleGroup, EquipmentType, DifficultyLevel } from '@prisma/client'

const prisma = new PrismaClient()

const exercises = [
    // ============================================
    // CHEST EXERCISES
    // ============================================
    {
        name: 'Barbell Bench Press',
        description: 'The king of chest exercises. Compound movement targeting the entire pectoral region with emphasis on strength and mass building.',
        instructions: '1. Lie flat on bench with eyes under the bar\n2. Grip barbell slightly wider than shoulder width\n3. Unrack and position bar over mid-chest\n4. Lower bar to chest with controlled tempo (2-3 seconds)\n5. Press explosively back to starting position\n6. Keep shoulder blades retracted and feet planted throughout\n7. Breathe in on descent, exhale on press',
        muscleGroups: [MuscleGroup.CHEST, MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 60,
        defaultReps: 8,
        videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
        thumbnailUrl: 'https://i.ytimg.com/vi/rT7DgCr-3pg/maxresdefault.jpg'
    },
    {
        name: 'Dumbbell Bench Press',
        description: 'Chest press using dumbbells for greater range of motion and unilateral muscle development.',
        instructions: '1. Sit on bench with dumbbells on thighs\n2. Lie back and position dumbbells at chest level\n3. Press dumbbells up until arms are extended\n4. Lower with control, allowing elbows to drop below torso\n5. Keep core engaged and feet planted\n6. Maintain neutral wrist position throughout',
        muscleGroups: [MuscleGroup.CHEST, MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
        equipment: [EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 20,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
        thumbnailUrl: 'https://i.ytimg.com/vi/VmB1G1K7v94/maxresdefault.jpg'
    },
    {
        name: 'Incline Barbell Bench Press',
        description: 'Upper chest focused variation performed on an incline bench.',
        instructions: '1. Set bench to 30-45 degree incline\n2. Lie back with eyes under bar\n3. Grip slightly wider than shoulder width\n4. Lower bar to upper chest\n5. Press back to starting position\n6. Keep elbows at 45-degree angle to body',
        muscleGroups: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 50,
        defaultReps: 8,
        videoUrl: 'https://www.youtube.com/watch?v=SrqOu55lrYU',
    },
    {
        name: 'Incline Dumbbell Press',
        description: 'Upper chest focused dumbbell press with enhanced range of motion.',
        instructions: '1. Set bench to 30-45 degree incline\n2. Hold dumbbells at upper chest\n3. Press dumbbells up and slightly together\n4. Lower with control, feeling stretch in upper chest\n5. Maintain stable shoulder position',
        muscleGroups: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS],
        equipment: [EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 18,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
    },
    {
        name: 'Decline Bench Press',
        description: 'Lower chest emphasis variation performed on a decline bench.',
        instructions: '1. Set bench to 15-30 degree decline\n2. Secure feet in foot pads\n3. Grip barbell slightly wider than shoulders\n4. Lower bar to lower chest\n5. Press explosively back up\n6. Maintain control throughout movement',
        muscleGroups: [MuscleGroup.CHEST, MuscleGroup.TRICEPS],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 65,
        defaultReps: 8,
        videoUrl: 'https://www.youtube.com/watch?v=LfyQBUKR8SE',
    },
    {
        name: 'Push-ups',
        description: 'Classic bodyweight chest exercise suitable for all fitness levels.',
        instructions: '1. Start in plank position, hands shoulder-width apart\n2. Keep body in straight line from head to heels\n3. Lower body until chest nearly touches floor\n4. Push back up to starting position\n5. Keep core tight and elbows at 45-degree angle\n6. Breathe in on descent, out on push',
        muscleGroups: [MuscleGroup.CHEST, MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
        equipment: [EquipmentType.BODYWEIGHT],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 0,
        defaultReps: 15,
        videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    },
    {
        name: 'Cable Chest Fly',
        description: 'Isolation exercise for chest using cables for constant tension.',
        instructions: '1. Stand between cable towers with handles at chest height\n2. Step forward with slight forward lean\n3. Keep slight bend in elbows throughout\n4. Bring handles together in front of chest\n5. Squeeze chest at peak contraction\n6. Return to starting position with control\n7. Maintain stable torso position',
        muscleGroups: [MuscleGroup.CHEST],
        equipment: [EquipmentType.CABLE],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 15,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=Iwe6AmxVf7o',
    },
    {
        name: 'Dumbbell Fly',
        description: 'Isolation movement for chest stretch and contraction.',
        instructions: '1. Lie on flat bench with dumbbells extended above chest\n2. Maintain slight bend in elbows\n3. Lower dumbbells out to sides in wide arc\n4. Feel deep stretch in chest\n5. Bring dumbbells back together above chest\n6. Squeeze chest at top of movement',
        muscleGroups: [MuscleGroup.CHEST],
        equipment: [EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 12,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0',
    },
    {
        name: 'Chest Dips',
        description: 'Bodyweight exercise targeting lower chest and triceps.',
        instructions: '1. Support yourself on parallel bars\n2. Lean forward 30-45 degrees\n3. Lower body by bending elbows\n4. Go down until shoulders are below elbows\n5. Push back up to starting position\n6. Keep forward lean to emphasize chest',
        muscleGroups: [MuscleGroup.CHEST, MuscleGroup.TRICEPS],
        equipment: [EquipmentType.BODYWEIGHT],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 0,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As',
    },

    // ============================================
    // BACK EXERCISES
    // ============================================
    {
        name: 'Conventional Deadlift',
        description: 'The king of all exercises. Full posterior chain compound movement.',
        instructions: '1. Stand with feet hip-width apart, bar over mid-foot\n2. Bend down and grip bar just outside legs\n3. Keep back straight, chest up, shoulders back\n4. Brace core and drive through heels\n5. Extend hips and knees simultaneously\n6. Stand tall at top, squeeze glutes\n7. Lower with control, maintaining neutral spine\n8. Breathe in before lift, hold during lift',
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.ADVANCED,
        defaultWeight: 80,
        defaultReps: 6,
        videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    },
    {
        name: 'Pull-ups',
        description: 'Classic bodyweight back builder targeting lats and biceps.',
        instructions: '1. Hang from bar with overhand grip, hands wider than shoulders\n2. Start from dead hang with arms fully extended\n3. Pull yourself up by driving elbows down\n4. Continue until chin is over bar\n5. Lower with control to full extension\n6. Keep core engaged, avoid swinging\n7. Breathe out on pull up, in on descent',
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.BICEPS],
        equipment: [EquipmentType.BODYWEIGHT],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 0,
        defaultReps: 8,
        videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    },
    {
        name: 'Barbell Row',
        description: 'Compound back exercise for thickness and strength.',
        instructions: '1. Bend at hips with slight knee bend, torso at 45 degrees\n2. Grip bar with overhand grip, hands outside knees\n3. Pull bar to lower chest/upper abdomen\n4. Squeeze shoulder blades together at top\n5. Lower with control\n6. Keep back straight and core braced throughout\n7. Avoid using momentum',
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.BICEPS],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 50,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
    },
    {
        name: 'Lat Pulldown',
        description: 'Cable machine exercise for lat width and development.',
        instructions: '1. Sit at lat pulldown machine with thighs secured\n2. Grip bar wider than shoulder width\n3. Pull bar down to upper chest\n4. Drive elbows down and back\n5. Squeeze lats at bottom\n6. Return to starting position with control\n7. Avoid leaning back excessively',
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.BICEPS],
        equipment: [EquipmentType.CABLE, EquipmentType.MACHINE],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 40,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    },
    {
        name: 'Single-Arm Dumbbell Row',
        description: 'Unilateral back exercise for muscle balance and development.',
        instructions: '1. Place one knee and hand on bench for support\n2. Hold dumbbell in other hand, arm extended\n3. Pull dumbbell to hip, driving elbow back\n4. Squeeze shoulder blade at top\n5. Lower with control\n6. Keep torso parallel to ground\n7. Avoid rotating torso',
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.BICEPS],
        equipment: [EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 20,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=roCP6wCXPqo',
    },
    {
        name: 'T-Bar Row',
        description: 'Compound rowing movement for back thickness.',
        instructions: '1. Straddle T-bar with feet shoulder-width apart\n2. Bend at hips, keep back straight\n3. Grip handles with both hands\n4. Pull bar to chest, driving elbows back\n5. Squeeze shoulder blades together\n6. Lower with control\n7. Maintain neutral spine throughout',
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.BICEPS],
        equipment: [EquipmentType.BARBELL, EquipmentType.MACHINE],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 40,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=j3Igk5nyZE4',
    },
    {
        name: 'Seated Cable Row',
        description: 'Cable rowing exercise for mid-back development.',
        instructions: '1. Sit at cable row machine with feet on platform\n2. Grip handle with both hands\n3. Sit upright with slight lean back\n4. Pull handle to lower chest/upper abdomen\n5. Squeeze shoulder blades together\n6. Return to starting position with control\n7. Keep torso stable, avoid excessive rocking',
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.BICEPS],
        equipment: [EquipmentType.CABLE],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 45,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74',
    },
    {
        name: 'Face Pulls',
        description: 'Rear delt and upper back exercise for posture and shoulder health.',
        instructions: '1. Set cable at upper chest height with rope attachment\n2. Grip rope with thumbs toward you\n3. Step back to create tension\n4. Pull rope toward face, separating hands\n5. Drive elbows high and back\n6. Squeeze rear delts and upper back\n7. Return with control',
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.SHOULDERS],
        equipment: [EquipmentType.CABLE],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 20,
        defaultReps: 15,
        videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
    },

    // ============================================
    // SHOULDER EXERCISES
    // ============================================
    {
        name: 'Overhead Barbell Press',
        description: 'Compound shoulder exercise for overall deltoid development and strength.',
        instructions: '1. Stand with feet shoulder-width apart\n2. Hold barbell at shoulder height, hands just outside shoulders\n3. Brace core and squeeze glutes\n4. Press bar overhead until arms are extended\n5. Bar path should be straight up\n6. Lower with control to starting position\n7. Avoid excessive back arch',
        muscleGroups: [MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 40,
        defaultReps: 8,
        videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
    },
    {
        name: 'Dumbbell Shoulder Press',
        description: 'Shoulder press using dumbbells for balanced development.',
        instructions: '1. Sit on bench with back support\n2. Hold dumbbells at shoulder height, palms forward\n3. Press dumbbells overhead until arms extended\n4. Bring dumbbells slightly together at top\n5. Lower with control to starting position\n6. Keep core engaged throughout\n7. Avoid excessive arching',
        muscleGroups: [MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
        equipment: [EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 15,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
    },
    {
        name: 'Arnold Press',
        description: 'Dumbbell press variation hitting all three deltoid heads.',
        instructions: '1. Sit with dumbbells at shoulder height, palms facing you\n2. As you press up, rotate palms to face forward\n3. Finish with arms extended, palms forward\n4. Reverse motion on the way down\n5. Maintain controlled tempo throughout\n6. Keep core tight',
        muscleGroups: [MuscleGroup.SHOULDERS],
        equipment: [EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 12,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=6Z15_WdXmVw',
    },
    {
        name: 'Lateral Raise',
        description: 'Isolation exercise for side deltoids and shoulder width.',
        instructions: '1. Stand with dumbbells at sides, slight bend in elbows\n2. Raise dumbbells out to sides until shoulder height\n3. Lead with elbows, not hands\n4. Pause briefly at top\n5. Lower with control\n6. Avoid swinging or using momentum\n7. Keep slight forward lean',
        muscleGroups: [MuscleGroup.SHOULDERS],
        equipment: [EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 8,
        defaultReps: 15,
        videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    },
    {
        name: 'Front Raise',
        description: 'Isolation exercise for front deltoids.',
        instructions: '1. Stand with dumbbells in front of thighs\n2. Raise dumbbells forward to shoulder height\n3. Keep arms straight with slight elbow bend\n4. Pause at top\n5. Lower with control\n6. Avoid swinging or leaning back\n7. Can alternate arms or lift together',
        muscleGroups: [MuscleGroup.SHOULDERS],
        equipment: [EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 8,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=SCVCLChPQFY',
    },
    {
        name: 'Rear Delt Fly',
        description: 'Isolation exercise for rear deltoids and upper back.',
        instructions: '1. Bend at hips until torso is nearly parallel to ground\n2. Hold dumbbells with arms hanging down\n3. Raise dumbbells out to sides in wide arc\n4. Lead with elbows, squeeze shoulder blades\n5. Lower with control\n6. Keep slight bend in elbows\n7. Avoid using momentum',
        muscleGroups: [MuscleGroup.SHOULDERS, MuscleGroup.BACK],
        equipment: [EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 6,
        defaultReps: 15,
        videoUrl: 'https://www.youtube.com/watch?v=EA7u4Q_8HQ0',
    },
    {
        name: 'Upright Row',
        description: 'Compound movement for shoulders and traps.',
        instructions: '1. Stand with barbell in front of thighs\n2. Grip bar with hands shoulder-width apart\n3. Pull bar up along body to chest height\n4. Lead with elbows, keep them high\n5. Lower with control\n6. Keep bar close to body\n7. Avoid excessive weight to prevent shoulder impingement',
        muscleGroups: [MuscleGroup.SHOULDERS, MuscleGroup.BACK],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 30,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=yaWMNnjDXNI',
    },

    // ============================================
    // ARM EXERCISES - BICEPS
    // ============================================
    {
        name: 'Barbell Curl',
        description: 'Classic bicep mass builder using barbell.',
        instructions: '1. Stand with feet shoulder-width apart\n2. Hold barbell with underhand grip, hands shoulder-width\n3. Keep elbows close to sides\n4. Curl bar up to shoulders\n5. Squeeze biceps at top\n6. Lower with control\n7. Keep elbows stationary throughout\n8. Avoid swinging or using momentum',
        muscleGroups: [MuscleGroup.BICEPS],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 25,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    },
    {
        name: 'Dumbbell Curl',
        description: 'Bicep curl using dumbbells for unilateral development.',
        instructions: '1. Stand with dumbbells at sides, palms forward\n2. Keep elbows close to sides\n3. Curl dumbbells up to shoulders\n4. Squeeze biceps at top\n5. Lower with control\n6. Can be done alternating or together\n7. Maintain stable upper arm position',
        muscleGroups: [MuscleGroup.BICEPS],
        equipment: [EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 12,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    },
    {
        name: 'Hammer Curl',
        description: 'Bicep and forearm exercise with neutral grip.',
        instructions: '1. Hold dumbbells with neutral grip (palms facing each other)\n2. Keep elbows close to sides\n3. Curl dumbbells up to shoulders\n4. Maintain neutral grip throughout\n5. Lower with control\n6. Targets brachialis and brachioradialis\n7. Can alternate or lift together',
        muscleGroups: [MuscleGroup.BICEPS, MuscleGroup.FOREARMS],
        equipment: [EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 12,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
    },
    {
        name: 'Preacher Curl',
        description: 'Bicep isolation exercise using preacher bench.',
        instructions: '1. Sit at preacher bench with arms over pad\n2. Grip barbell or EZ-bar with underhand grip\n3. Curl weight up, keeping upper arms on pad\n4. Squeeze biceps at top\n5. Lower with control to full extension\n6. Avoid lifting elbows off pad\n7. Prevents momentum and cheating',
        muscleGroups: [MuscleGroup.BICEPS],
        equipment: [EquipmentType.BARBELL, EquipmentType.MACHINE],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 20,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0',
    },
    {
        name: 'Cable Curl',
        description: 'Bicep exercise using cable for constant tension.',
        instructions: '1. Stand facing cable machine with straight bar attachment\n2. Grip bar with underhand grip\n3. Keep elbows at sides\n4. Curl bar up to shoulders\n5. Squeeze biceps at peak contraction\n6. Lower with control\n7. Maintain constant tension throughout',
        muscleGroups: [MuscleGroup.BICEPS],
        equipment: [EquipmentType.CABLE],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 20,
        defaultReps: 15,
        videoUrl: 'https://www.youtube.com/watch?v=7JRQaLU_qRM',
    },

    // ============================================
    // ARM EXERCISES - TRICEPS
    // ============================================
    {
        name: 'Tricep Dips',
        description: 'Bodyweight tricep exercise for mass and strength.',
        instructions: '1. Support yourself on parallel bars or bench\n2. Keep body upright (not leaning forward)\n3. Lower body by bending elbows\n4. Go down until upper arms are parallel to ground\n5. Push back up to starting position\n6. Keep elbows close to body\n7. Add weight when bodyweight becomes easy',
        muscleGroups: [MuscleGroup.TRICEPS, MuscleGroup.CHEST],
        equipment: [EquipmentType.BODYWEIGHT],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 0,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=6kALZikXxLc',
    },
    {
        name: 'Tricep Pushdown',
        description: 'Cable tricep isolation exercise.',
        instructions: '1. Stand at cable machine with rope or bar attachment\n2. Grip attachment with hands close together\n3. Keep elbows pinned at sides\n4. Push attachment down until arms are fully extended\n5. Squeeze triceps at bottom\n6. Return to starting position with control\n7. Keep upper arms stationary',
        muscleGroups: [MuscleGroup.TRICEPS],
        equipment: [EquipmentType.CABLE],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 20,
        defaultReps: 15,
        videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
    },
    {
        name: 'Overhead Tricep Extension',
        description: 'Tricep exercise emphasizing the long head.',
        instructions: '1. Stand or sit with dumbbell held overhead\n2. Grip dumbbell with both hands\n3. Lower dumbbell behind head by bending elbows\n4. Keep upper arms stationary and vertical\n5. Extend arms back to starting position\n6. Feel stretch in triceps at bottom\n7. Can also be done with cable or EZ-bar',
        muscleGroups: [MuscleGroup.TRICEPS],
        equipment: [EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 15,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=YbX7Wd8jQ-Q',
    },
    {
        name: 'Close-Grip Bench Press',
        description: 'Compound tricep exercise using barbell.',
        instructions: '1. Lie on bench with hands shoulder-width apart on bar\n2. Unrack and position bar over chest\n3. Lower bar to lower chest\n4. Keep elbows close to sides\n5. Press back to starting position\n6. Focus on tricep contraction\n7. Avoid flaring elbows out',
        muscleGroups: [MuscleGroup.TRICEPS, MuscleGroup.CHEST],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 50,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=nEF0bv2FW94',
    },
    {
        name: 'Skull Crushers',
        description: 'Lying tricep extension for mass building.',
        instructions: '1. Lie on bench with barbell or EZ-bar extended above chest\n2. Lower bar toward forehead by bending elbows\n3. Keep upper arms stationary and perpendicular to floor\n4. Extend arms back to starting position\n5. Squeeze triceps at top\n6. Use controlled tempo\n7. Can also be done with dumbbells',
        muscleGroups: [MuscleGroup.TRICEPS],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 25,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM',
    },

    // ============================================
    // LEG EXERCISES - QUADS
    // ============================================
    {
        name: 'Barbell Back Squat',
        description: 'The king of leg exercises. Compound movement for overall leg development.',
        instructions: '1. Place barbell on upper back/traps\n2. Stand with feet shoulder-width apart, toes slightly out\n3. Brace core and keep chest up\n4. Lower by bending knees and hips simultaneously\n5. Go down until thighs are at least parallel to floor\n6. Drive through heels to stand back up\n7. Keep knees tracking over toes\n8. Maintain neutral spine throughout',
        muscleGroups: [MuscleGroup.QUADS, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 70,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
    },
    {
        name: 'Front Squat',
        description: 'Squat variation with barbell in front, emphasizing quads.',
        instructions: '1. Rest barbell on front of shoulders\n2. Cross arms or use clean grip\n3. Keep elbows high and chest up\n4. Squat down keeping torso upright\n5. Go to parallel or below\n6. Drive through heels to stand\n7. Requires good mobility and core strength',
        muscleGroups: [MuscleGroup.QUADS, MuscleGroup.GLUTES],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.ADVANCED,
        defaultWeight: 50,
        defaultReps: 8,
        videoUrl: 'https://www.youtube.com/watch?v=uYumuL_G_V0',
    },
    {
        name: 'Leg Press',
        description: 'Machine-based leg exercise for quad development.',
        instructions: '1. Sit in leg press machine with back against pad\n2. Place feet shoulder-width apart on platform\n3. Release safety and lower platform with control\n4. Lower until knees are at 90 degrees\n5. Push platform away by extending legs\n6. Don\'t lock out knees at top\n7. Keep lower back against pad',
        muscleGroups: [MuscleGroup.QUADS, MuscleGroup.GLUTES],
        equipment: [EquipmentType.MACHINE],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 100,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    },
    {
        name: 'Leg Extension',
        description: 'Isolation exercise for quadriceps.',
        instructions: '1. Sit in leg extension machine\n2. Position pad on lower shins\n3. Extend legs until fully straight\n4. Squeeze quads at top\n5. Lower with control\n6. Don\'t use momentum\n7. Great for quad isolation and pre-exhaust',
        muscleGroups: [MuscleGroup.QUADS],
        equipment: [EquipmentType.MACHINE],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 40,
        defaultReps: 15,
        videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
    },
    {
        name: 'Bulgarian Split Squat',
        description: 'Single-leg squat variation for quad and glute development.',
        instructions: '1. Stand in front of bench, place one foot behind you on bench\n2. Lower body by bending front knee\n3. Go down until front thigh is parallel to ground\n4. Keep torso upright\n5. Drive through front heel to stand\n6. Can hold dumbbells for added resistance\n7. Excellent for balance and unilateral strength',
        muscleGroups: [MuscleGroup.QUADS, MuscleGroup.GLUTES],
        equipment: [EquipmentType.BODYWEIGHT, EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 15,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    },
    {
        name: 'Hack Squat',
        description: 'Machine squat variation for quad emphasis.',
        instructions: '1. Stand in hack squat machine with shoulders under pads\n2. Place feet shoulder-width apart on platform\n3. Release safety and lower by bending knees\n4. Go down until thighs are parallel to platform\n5. Push through heels to extend legs\n6. Keep back against pad\n7. Great for quad development with reduced lower back stress',
        muscleGroups: [MuscleGroup.QUADS, MuscleGroup.GLUTES],
        equipment: [EquipmentType.MACHINE],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 80,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=0tn5K9NlCfo',
    },
    {
        name: 'Walking Lunges',
        description: 'Dynamic single-leg exercise for quads and glutes.',
        instructions: '1. Stand with feet together\n2. Step forward with one leg\n3. Lower body until both knees are at 90 degrees\n4. Push through front heel to step forward with back leg\n5. Continue alternating legs\n6. Keep torso upright\n7. Can hold dumbbells for added resistance',
        muscleGroups: [MuscleGroup.QUADS, MuscleGroup.GLUTES],
        equipment: [EquipmentType.BODYWEIGHT, EquipmentType.DUMBBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 0,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=L8fvypPrzzs',
    },

    // ============================================
    // LEG EXERCISES - HAMSTRINGS & GLUTES
    // ============================================
    {
        name: 'Romanian Deadlift',
        description: 'Hamstring and glute focused deadlift variation.',
        instructions: '1. Hold barbell at hip level with overhand grip\n2. Stand with feet hip-width apart\n3. Hinge at hips while keeping legs mostly straight\n4. Lower bar to mid-shin, feeling hamstring stretch\n5. Keep back straight and bar close to body\n6. Drive hips forward to return to starting position\n7. Squeeze glutes at top',
        muscleGroups: [MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES, MuscleGroup.BACK],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 60,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
    },
    {
        name: 'Leg Curl',
        description: 'Hamstring isolation exercise.',
        instructions: '1. Lie face down on leg curl machine\n2. Position pad on lower calves/ankles\n3. Curl legs up toward glutes\n4. Squeeze hamstrings at top\n5. Lower with control\n6. Keep hips on pad throughout\n7. Don\'t use momentum',
        muscleGroups: [MuscleGroup.HAMSTRINGS],
        equipment: [EquipmentType.MACHINE],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 30,
        defaultReps: 15,
        videoUrl: 'https://www.youtube.com/watch?v=ELOCsoDSmrg',
    },
    {
        name: 'Glute Bridge',
        description: 'Bodyweight exercise for glute activation and strength.',
        instructions: '1. Lie on back with knees bent, feet flat on floor\n2. Place feet hip-width apart\n3. Drive through heels to lift hips\n4. Squeeze glutes hard at top\n5. Lower with control\n6. Can place barbell across hips for added resistance\n7. Keep core braced',
        muscleGroups: [MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
        equipment: [EquipmentType.BODYWEIGHT],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 0,
        defaultReps: 15,
        videoUrl: 'https://www.youtube.com/watch?v=OUgsJ8-Vi0E',
    },
    {
        name: 'Hip Thrust',
        description: 'Glute-focused exercise for maximum glute development.',
        instructions: '1. Sit on ground with upper back against bench\n2. Place barbell across hips (use pad for comfort)\n3. Plant feet flat, hip-width apart\n4. Drive through heels to lift hips\n5. Squeeze glutes hard at top\n6. Lower with control\n7. Keep chin tucked',
        muscleGroups: [MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 60,
        defaultReps: 12,
        videoUrl: 'https://www.youtube.com/watch?v=SEdqd1n0cvg',
    },
    {
        name: 'Good Mornings',
        description: 'Hip hinge exercise for hamstrings and lower back.',
        instructions: '1. Place barbell on upper back\n2. Stand with feet hip-width apart\n3. Hinge at hips, pushing butt back\n4. Lower torso until parallel to ground\n5. Keep back straight and knees slightly bent\n6. Drive hips forward to return to standing\n7. Feel stretch in hamstrings',
        muscleGroups: [MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES, MuscleGroup.BACK],
        equipment: [EquipmentType.BARBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 40,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=YA-h3n9L4YU',
    },

    // ============================================
    // LEG EXERCISES - CALVES
    // ============================================
    {
        name: 'Standing Calf Raise',
        description: 'Calf isolation exercise emphasizing gastrocnemius.',
        instructions: '1. Stand with balls of feet on elevated surface\n2. Keep legs straight\n3. Raise heels as high as possible\n4. Squeeze calves at top\n5. Lower heels below platform for full stretch\n6. Control the movement\n7. Can be done on machine or with dumbbells',
        muscleGroups: [MuscleGroup.CALVES],
        equipment: [EquipmentType.BODYWEIGHT, EquipmentType.MACHINE],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 0,
        defaultReps: 20,
        videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI',
    },
    {
        name: 'Seated Calf Raise',
        description: 'Calf exercise emphasizing soleus muscle.',
        instructions: '1. Sit in calf raise machine with pads on thighs\n2. Place balls of feet on platform\n3. Raise heels as high as possible\n4. Squeeze calves at top\n5. Lower heels for full stretch\n6. Targets soleus more than standing variation\n7. Use controlled tempo',
        muscleGroups: [MuscleGroup.CALVES],
        equipment: [EquipmentType.MACHINE],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 30,
        defaultReps: 20,
        videoUrl: 'https://www.youtube.com/watch?v=JbyjNymZOt0',
    },

    // ============================================
    // CORE EXERCISES
    // ============================================
    {
        name: 'Plank',
        description: 'Isometric core exercise for overall core stability.',
        instructions: '1. Start in forearm plank position\n2. Keep body in straight line from head to heels\n3. Engage core, squeeze glutes\n4. Keep hips level, don\'t sag or pike\n5. Breathe normally\n6. Hold for prescribed time\n7. Focus on quality over duration',
        muscleGroups: [MuscleGroup.ABS, MuscleGroup.OBLIQUES],
        equipment: [EquipmentType.BODYWEIGHT],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 0,
        defaultReps: 1,
        videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    },
    {
        name: 'Crunches',
        description: 'Basic ab exercise for rectus abdominis.',
        instructions: '1. Lie on back with knees bent, feet flat\n2. Place hands behind head or across chest\n3. Lift shoulders off ground using abs\n4. Squeeze abs at top\n5. Lower with control\n6. Don\'t pull on neck\n7. Focus on ab contraction',
        muscleGroups: [MuscleGroup.ABS],
        equipment: [EquipmentType.BODYWEIGHT],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 0,
        defaultReps: 20,
        videoUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
    },
    {
        name: 'Russian Twist',
        description: 'Oblique exercise with rotational movement.',
        instructions: '1. Sit on floor with knees bent, feet elevated\n2. Lean back slightly, keep back straight\n3. Hold weight or medicine ball at chest\n4. Rotate torso side to side\n5. Touch weight to ground on each side\n6. Keep core engaged throughout\n7. Control the rotation',
        muscleGroups: [MuscleGroup.OBLIQUES, MuscleGroup.ABS],
        equipment: [EquipmentType.BODYWEIGHT],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 0,
        defaultReps: 30,
        videoUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
    },
    {
        name: 'Hanging Leg Raise',
        description: 'Advanced ab exercise for lower abs.',
        instructions: '1. Hang from pull-up bar with overhand grip\n2. Keep legs straight or slightly bent\n3. Raise legs up to 90 degrees\n4. Control the movement, avoid swinging\n5. Lower with control\n6. Keep core engaged throughout\n7. Can bend knees to make easier',
        muscleGroups: [MuscleGroup.ABS],
        equipment: [EquipmentType.BODYWEIGHT],
        difficulty: DifficultyLevel.ADVANCED,
        defaultWeight: 0,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=hdng3Nm1x_E',
    },
    {
        name: 'Cable Crunch',
        description: 'Weighted ab exercise using cable machine.',
        instructions: '1. Kneel in front of cable machine with rope attachment\n2. Hold rope behind head\n3. Crunch down, bringing elbows toward knees\n4. Squeeze abs hard at bottom\n5. Return to starting position with control\n6. Keep hips stationary\n7. Focus on ab contraction, not pulling with arms',
        muscleGroups: [MuscleGroup.ABS],
        equipment: [EquipmentType.CABLE],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 30,
        defaultReps: 15,
        videoUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
    },
    {
        name: 'Ab Wheel Rollout',
        description: 'Advanced core exercise for overall core strength.',
        instructions: '1. Kneel on floor with ab wheel in hands\n2. Roll wheel forward, extending body\n3. Go as far as you can while maintaining control\n4. Pull back to starting position using abs\n5. Keep core braced throughout\n6. Don\'t let hips sag\n7. Can be done from knees or standing',
        muscleGroups: [MuscleGroup.ABS, MuscleGroup.OBLIQUES],
        equipment: [EquipmentType.OTHER],
        difficulty: DifficultyLevel.ADVANCED,
        defaultWeight: 0,
        defaultReps: 10,
        videoUrl: 'https://www.youtube.com/watch?v=EXm0Jx0NyNo',
    },
    {
        name: 'Mountain Climbers',
        description: 'Dynamic core and cardio exercise.',
        instructions: '1. Start in push-up position\n2. Bring one knee toward chest\n3. Quickly switch legs\n4. Continue alternating at a fast pace\n5. Keep hips level\n6. Maintain plank position\n7. Great for core and conditioning',
        muscleGroups: [MuscleGroup.ABS, MuscleGroup.CARDIO],
        equipment: [EquipmentType.BODYWEIGHT],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 0,
        defaultReps: 30,
        videoUrl: 'https://www.youtube.com/watch?v=nmwgirgXLYM',
    },
    {
        name: 'Side Plank',
        description: 'Isometric exercise for obliques and lateral core stability.',
        instructions: '1. Lie on side with forearm on ground\n2. Stack feet or place top foot in front\n3. Lift hips off ground\n4. Keep body in straight line\n5. Hold for prescribed time\n6. Keep hips elevated\n7. Switch sides',
        muscleGroups: [MuscleGroup.OBLIQUES, MuscleGroup.ABS],
        equipment: [EquipmentType.BODYWEIGHT],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 0,
        defaultReps: 1,
        videoUrl: 'https://www.youtube.com/watch?v=XeN4pEZZJNI',
    },

    // ============================================
    // CARDIO & CONDITIONING
    // ============================================
    {
        name: 'Running',
        description: 'Classic cardiovascular exercise for endurance and fat loss.',
        instructions: '1. Maintain steady, sustainable pace\n2. Land mid-foot, not on heels\n3. Keep upright posture\n4. Swing arms naturally at sides\n5. Breathe rhythmically\n6. Start with shorter distances and build up\n7. Proper running shoes are essential',
        muscleGroups: [MuscleGroup.CARDIO],
        equipment: [EquipmentType.CARDIO_EQUIPMENT],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 0,
        defaultReps: 1,
        videoUrl: 'https://www.youtube.com/watch?v=brFHyOtTwH4',
    },
    {
        name: 'Cycling',
        description: 'Low-impact cardio exercise for endurance.',
        instructions: '1. Adjust seat height so leg is almost fully extended at bottom\n2. Maintain steady cadence (80-100 RPM)\n3. Keep resistance appropriate for fitness level\n4. Engage core for stability\n5. Can do steady-state or intervals\n6. Great for active recovery\n7. Low impact on joints',
        muscleGroups: [MuscleGroup.CARDIO, MuscleGroup.QUADS],
        equipment: [EquipmentType.CARDIO_EQUIPMENT],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 0,
        defaultReps: 1,
        videoUrl: 'https://www.youtube.com/watch?v=9fZDFXHfHlg',
    },
    {
        name: 'Jump Rope',
        description: 'High-intensity cardio and coordination exercise.',
        instructions: '1. Hold rope handles at hip level\n2. Jump with both feet together\n3. Keep jumps small and controlled\n4. Land softly on balls of feet\n5. Maintain steady rhythm\n6. Keep elbows close to sides\n7. Excellent for conditioning and coordination',
        muscleGroups: [MuscleGroup.CARDIO, MuscleGroup.CALVES],
        equipment: [EquipmentType.OTHER],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 0,
        defaultReps: 100,
        videoUrl: 'https://www.youtube.com/watch?v=FJmRQ5iTXKE',
    },
    {
        name: 'Rowing Machine',
        description: 'Full-body cardio exercise.',
        instructions: '1. Sit on rower with feet strapped in\n2. Grab handle with overhand grip\n3. Push with legs first, then pull with arms\n4. Lean back slightly at finish\n5. Reverse the motion to return\n6. Maintain smooth, controlled rhythm\n7. Engages legs, back, and arms',
        muscleGroups: [MuscleGroup.CARDIO, MuscleGroup.BACK],
        equipment: [EquipmentType.CARDIO_EQUIPMENT],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 0,
        defaultReps: 1,
        videoUrl: 'https://www.youtube.com/watch?v=zQ82RYIFLN8',
    },
    {
        name: 'Burpees',
        description: 'Full-body conditioning exercise combining strength and cardio.',
        instructions: '1. Start standing\n2. Drop into squat position, hands on ground\n3. Kick feet back into push-up position\n4. Perform push-up (optional)\n5. Jump feet back to squat position\n6. Explode up into jump\n7. Land softly and repeat\n8. Excellent for conditioning',
        muscleGroups: [MuscleGroup.FULL_BODY, MuscleGroup.CARDIO],
        equipment: [EquipmentType.BODYWEIGHT],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 0,
        defaultReps: 15,
        videoUrl: 'https://www.youtube.com/watch?v=dZgVxmf6jkA',
    },

    // ============================================
    // FUNCTIONAL & COMPOUND MOVEMENTS
    // ============================================
    {
        name: 'Kettlebell Swing',
        description: 'Explosive hip hinge movement for power and conditioning.',
        instructions: '1. Stand with feet shoulder-width apart, kettlebell in front\n2. Hinge at hips and grip kettlebell with both hands\n3. Swing kettlebell back between legs\n4. Explosively drive hips forward\n5. Swing kettlebell to chest height\n6. Let momentum carry kettlebell, don\'t lift with arms\n7. Hinge back and repeat\n8. Powerful hip snap is key',
        muscleGroups: [MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS, MuscleGroup.BACK],
        equipment: [EquipmentType.KETTLEBELL],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 16,
        defaultReps: 15,
        videoUrl: 'https://www.youtube.com/watch?v=YSxHifyI6s8',
    },
    {
        name: 'Farmer\'s Walk',
        description: 'Loaded carry exercise for grip, core, and overall strength.',
        instructions: '1. Stand between heavy dumbbells or kettlebells\n2. Bend down and grip weights\n3. Stand up tall with weights at sides\n4. Walk forward with controlled steps\n5. Keep shoulders back and core braced\n6. Maintain upright posture\n7. Walk for distance or time\n8. Excellent for functional strength',
        muscleGroups: [MuscleGroup.FOREARMS, MuscleGroup.BACK, MuscleGroup.ABS],
        equipment: [EquipmentType.DUMBBELL, EquipmentType.KETTLEBELL],
        difficulty: DifficultyLevel.BEGINNER,
        defaultWeight: 25,
        defaultReps: 1,
        videoUrl: 'https://www.youtube.com/watch?v=rt17lmnaLSM',
    },
    {
        name: 'Turkish Get-Up',
        description: 'Complex full-body movement for strength, stability, and mobility.',
        instructions: '1. Lie on back with kettlebell in right hand, arm extended\n2. Bend right knee, foot flat on floor\n3. Roll onto left elbow\n4. Push up to left hand\n5. Lift hips, sweep left leg back\n6. Come to kneeling position\n7. Stand up\n8. Reverse the movement to return\n9. Very technical - learn proper form first',
        muscleGroups: [MuscleGroup.FULL_BODY, MuscleGroup.SHOULDERS, MuscleGroup.ABS],
        equipment: [EquipmentType.KETTLEBELL],
        difficulty: DifficultyLevel.ADVANCED,
        defaultWeight: 12,
        defaultReps: 5,
        videoUrl: 'https://www.youtube.com/watch?v=0bWRPC49-KI',
    },
    {
        name: 'Battle Ropes',
        description: 'High-intensity conditioning exercise for upper body and core.',
        instructions: '1. Stand with feet shoulder-width apart\n2. Grip ends of battle ropes\n3. Create waves by alternating arm movements\n4. Keep core engaged\n5. Maintain athletic stance\n6. Can do alternating waves, double waves, or slams\n7. Excellent for conditioning and power endurance',
        muscleGroups: [MuscleGroup.SHOULDERS, MuscleGroup.BACK, MuscleGroup.ABS, MuscleGroup.CARDIO],
        equipment: [EquipmentType.OTHER],
        difficulty: DifficultyLevel.INTERMEDIATE,
        defaultWeight: 0,
        defaultReps: 1,
        videoUrl: 'https://www.youtube.com/watch?v=u5wgQWw0JKk',
    },
]

async function main() {
    console.log('Starting enhanced exercise seeding...')
    console.log(`Total exercises to create: ${exercises.length}\n`)

    let successCount = 0
    let errorCount = 0

    for (const exercise of exercises) {
        try {
            await prisma.exercise.create({
                data: {
                    ...exercise,
                    isPublic: true,
                },
            })
            successCount++
            console.log(`✅ [${successCount}/${exercises.length}] Created: ${exercise.name}`)
        } catch (error) {
            errorCount++
            console.error(`❌ Error creating ${exercise.name}:`, error)
        }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`🎉 Exercise seeding completed!`)
    console.log(`✅ Successfully created: ${successCount} exercises`)
    if (errorCount > 0) {
        console.log(`❌ Failed: ${errorCount} exercises`)
    }
    console.log(`${'='.repeat(60)}\n`)

    console.log('Exercise breakdown by muscle group:')
    console.log('- Chest: 9 exercises')
    console.log('- Back: 8 exercises')
    console.log('- Shoulders: 7 exercises')
    console.log('- Biceps: 5 exercises')
    console.log('- Triceps: 5 exercises')
    console.log('- Quads: 7 exercises')
    console.log('- Hamstrings & Glutes: 5 exercises')
    console.log('- Calves: 2 exercises')
    console.log('- Core: 8 exercises')
    console.log('- Cardio: 4 exercises')
    console.log('- Functional: 4 exercises')
}

main()
    .catch((e) => {
        console.error('Fatal error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
