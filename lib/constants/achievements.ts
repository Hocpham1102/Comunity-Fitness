import { AchievementType, AchievementTier } from "@prisma/client";

export interface AchievementDefinition {
    type: AchievementType;
    tier: AchievementTier;
    title: string;
    description: string;
    icon: string;
    target: number;
    points: number;
}

// Tier colors for UI
export const TIER_COLORS = {
    BRONZE: "#CD7F32",
    SILVER: "#C0C0C0",
    GOLD: "#FFD700",
    PLATINUM: "#E5E4E2",
    DIAMOND: "#B9F2FF",
} as const;

// Tier gradients for enhanced UI
export const TIER_GRADIENTS = {
    BRONZE: "from-amber-700 to-orange-600",
    SILVER: "from-gray-400 to-gray-500",
    GOLD: "from-yellow-400 to-yellow-600",
    PLATINUM: "from-gray-300 to-gray-400",
    DIAMOND: "from-cyan-300 to-blue-400",
} as const;

// Points awarded per tier
export const TIER_POINTS = {
    BRONZE: 1,
    SILVER: 2,
    GOLD: 5,
    PLATINUM: 10,
    DIAMOND: 20,
} as const;

// All achievement definitions
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
    // ============================================
    // WORKOUT COUNT
    // ============================================
    {
        type: "WORKOUT_COUNT",
        tier: "BRONZE",
        title: "First Step",
        description: "Complete your first workout",
        icon: "🏆",
        target: 1,
        points: TIER_POINTS.BRONZE,
    },
    {
        type: "WORKOUT_COUNT",
        tier: "BRONZE",
        title: "Getting Started",
        description: "Complete 5 workouts",
        icon: "💪",
        target: 5,
        points: TIER_POINTS.BRONZE,
    },
    {
        type: "WORKOUT_COUNT",
        tier: "SILVER",
        title: "Dedicated",
        description: "Complete 10 workouts",
        icon: "🔥",
        target: 10,
        points: TIER_POINTS.SILVER,
    },
    {
        type: "WORKOUT_COUNT",
        tier: "GOLD",
        title: "Committed",
        description: "Complete 25 workouts",
        icon: "⚡",
        target: 25,
        points: TIER_POINTS.GOLD,
    },
    {
        type: "WORKOUT_COUNT",
        tier: "PLATINUM",
        title: "Warrior",
        description: "Complete 50 workouts",
        icon: "🌟",
        target: 50,
        points: TIER_POINTS.PLATINUM,
    },
    {
        type: "WORKOUT_COUNT",
        tier: "DIAMOND",
        title: "Legend",
        description: "Complete 100 workouts",
        icon: "💎",
        target: 100,
        points: TIER_POINTS.DIAMOND,
    },

    // ============================================
    // STREAK
    // ============================================
    {
        type: "STREAK",
        tier: "BRONZE",
        title: "Two Days Strong",
        description: "Workout for 2 consecutive days",
        icon: "📅",
        target: 2,
        points: TIER_POINTS.BRONZE,
    },
    {
        type: "STREAK",
        tier: "SILVER",
        title: "Week Warrior",
        description: "Workout for 7 consecutive days",
        icon: "🔥",
        target: 7,
        points: TIER_POINTS.SILVER,
    },
    {
        type: "STREAK",
        tier: "GOLD",
        title: "Two Weeks Champion",
        description: "Workout for 14 consecutive days",
        icon: "⚡",
        target: 14,
        points: TIER_POINTS.GOLD,
    },
    {
        type: "STREAK",
        tier: "PLATINUM",
        title: "Month Master",
        description: "Workout for 30 consecutive days",
        icon: "🏆",
        target: 30,
        points: TIER_POINTS.PLATINUM,
    },
    {
        type: "STREAK",
        tier: "DIAMOND",
        title: "Unstoppable",
        description: "Workout for 60 consecutive days",
        icon: "💎",
        target: 60,
        points: TIER_POINTS.DIAMOND,
    },

    // ============================================
    // VOLUME (Total weight lifted in kg)
    // ============================================
    {
        type: "VOLUME",
        tier: "BRONZE",
        title: "Rookie Lifter",
        description: "Lift a total of 1,000 kg",
        icon: "💪",
        target: 1000,
        points: TIER_POINTS.BRONZE,
    },
    {
        type: "VOLUME",
        tier: "SILVER",
        title: "Strong Lifter",
        description: "Lift a total of 10,000 kg",
        icon: "🏋️",
        target: 10000,
        points: TIER_POINTS.SILVER,
    },
    {
        type: "VOLUME",
        tier: "GOLD",
        title: "Power Lifter",
        description: "Lift a total of 50,000 kg",
        icon: "⚡",
        target: 50000,
        points: TIER_POINTS.GOLD,
    },
    {
        type: "VOLUME",
        tier: "PLATINUM",
        title: "Beast Mode",
        description: "Lift a total of 100,000 kg",
        icon: "🦍",
        target: 100000,
        points: TIER_POINTS.PLATINUM,
    },
    {
        type: "VOLUME",
        tier: "DIAMOND",
        title: "Titan",
        description: "Lift a total of 250,000 kg",
        icon: "💎",
        target: 250000,
        points: TIER_POINTS.DIAMOND,
    },

    // ============================================
    // DURATION (Total workout time in minutes)
    // ============================================
    {
        type: "DURATION",
        tier: "BRONZE",
        title: "First Hour",
        description: "Complete 60 minutes of workouts",
        icon: "⏱️",
        target: 60,
        points: TIER_POINTS.BRONZE,
    },
    {
        type: "DURATION",
        tier: "SILVER",
        title: "10 Hours Strong",
        description: "Complete 600 minutes (10 hours) of workouts",
        icon: "🕐",
        target: 600,
        points: TIER_POINTS.SILVER,
    },
    {
        type: "DURATION",
        tier: "GOLD",
        title: "Marathon",
        description: "Complete 3,000 minutes (50 hours) of workouts",
        icon: "⏳",
        target: 3000,
        points: TIER_POINTS.GOLD,
    },
    {
        type: "DURATION",
        tier: "PLATINUM",
        title: "Endurance King",
        description: "Complete 6,000 minutes (100 hours) of workouts",
        icon: "🏃",
        target: 6000,
        points: TIER_POINTS.PLATINUM,
    },
    {
        type: "DURATION",
        tier: "DIAMOND",
        title: "Time Master",
        description: "Complete 15,000 minutes (250 hours) of workouts",
        icon: "💎",
        target: 15000,
        points: TIER_POINTS.DIAMOND,
    },

    // ============================================
    // CONSISTENCY (Regular patterns)
    // ============================================
    {
        type: "CONSISTENCY",
        tier: "SILVER",
        title: "Weekly Regular",
        description: "Workout at least 3 times per week for 4 weeks",
        icon: "📊",
        target: 12, // 3 workouts × 4 weeks
        points: TIER_POINTS.SILVER,
    },
    {
        type: "CONSISTENCY",
        tier: "GOLD",
        title: "Monthly Consistent",
        description: "Workout at least 12 times per month for 3 months",
        icon: "📈",
        target: 36, // 12 workouts × 3 months
        points: TIER_POINTS.GOLD,
    },
    {
        type: "CONSISTENCY",
        tier: "PLATINUM",
        title: "Year Round",
        description: "Workout at least 3 times per week for 26 weeks",
        icon: "🎯",
        target: 78, // 3 workouts × 26 weeks
        points: TIER_POINTS.PLATINUM,
    },

    // ============================================
    // PERSONAL RECORDS
    // ============================================
    {
        type: "PERSONAL_RECORD",
        tier: "BRONZE",
        title: "First PR",
        description: "Break your first personal record",
        icon: "📈",
        target: 1,
        points: TIER_POINTS.BRONZE,
    },
    {
        type: "PERSONAL_RECORD",
        tier: "SILVER",
        title: "PR Breaker",
        description: "Break 5 personal records",
        icon: "🚀",
        target: 5,
        points: TIER_POINTS.SILVER,
    },
    {
        type: "PERSONAL_RECORD",
        tier: "GOLD",
        title: "Record Setter",
        description: "Break 15 personal records",
        icon: "⚡",
        target: 15,
        points: TIER_POINTS.GOLD,
    },
    {
        type: "PERSONAL_RECORD",
        tier: "PLATINUM",
        title: "PR King",
        description: "Break 30 personal records",
        icon: "💪",
        target: 30,
        points: TIER_POINTS.PLATINUM,
    },

    // ============================================
    // VARIETY (Different workouts)
    // ============================================
    {
        type: "VARIETY",
        tier: "SILVER",
        title: "Explorer",
        description: "Complete 5 different workout templates",
        icon: "🎭",
        target: 5,
        points: TIER_POINTS.SILVER,
    },
    {
        type: "VARIETY",
        tier: "GOLD",
        title: "Versatile",
        description: "Complete 15 different workout templates",
        icon: "🌈",
        target: 15,
        points: TIER_POINTS.GOLD,
    },
    {
        type: "VARIETY",
        tier: "PLATINUM",
        title: "All-Rounder",
        description: "Complete 30 different workout templates",
        icon: "🎪",
        target: 30,
        points: TIER_POINTS.PLATINUM,
    },

    // ============================================
    // EARLY BIRD (Morning workouts before 7am)
    // ============================================
    {
        type: "EARLY_BIRD",
        tier: "SILVER",
        title: "Early Bird",
        description: "Complete 10 workouts before 7am",
        icon: "🌅",
        target: 10,
        points: TIER_POINTS.SILVER,
    },
    {
        type: "EARLY_BIRD",
        tier: "GOLD",
        title: "Morning Champion",
        description: "Complete 25 workouts before 7am",
        icon: "☀️",
        target: 25,
        points: TIER_POINTS.GOLD,
    },
    {
        type: "EARLY_BIRD",
        tier: "PLATINUM",
        title: "Sunrise Warrior",
        description: "Complete 50 workouts before 7am",
        icon: "🌄",
        target: 50,
        points: TIER_POINTS.PLATINUM,
    },

    // ============================================
    // NIGHT OWL (Evening workouts after 9pm)
    // ============================================
    {
        type: "NIGHT_OWL",
        tier: "SILVER",
        title: "Night Owl",
        description: "Complete 10 workouts after 9pm",
        icon: "🌙",
        target: 10,
        points: TIER_POINTS.SILVER,
    },
    {
        type: "NIGHT_OWL",
        tier: "GOLD",
        title: "Midnight Warrior",
        description: "Complete 25 workouts after 9pm",
        icon: "🦉",
        target: 25,
        points: TIER_POINTS.GOLD,
    },
    {
        type: "NIGHT_OWL",
        tier: "PLATINUM",
        title: "Night Champion",
        description: "Complete 50 workouts after 9pm",
        icon: "✨",
        target: 50,
        points: TIER_POINTS.PLATINUM,
    },

    // ============================================
    // WEEKEND WARRIOR (Weekend workouts)
    // ============================================
    {
        type: "WEEKEND_WARRIOR",
        tier: "SILVER",
        title: "Weekend Starter",
        description: "Complete 10 weekend workouts",
        icon: "🏖️",
        target: 10,
        points: TIER_POINTS.SILVER,
    },
    {
        type: "WEEKEND_WARRIOR",
        tier: "GOLD",
        title: "Weekend Warrior",
        description: "Complete 20 weekend workouts",
        icon: "🎉",
        target: 20,
        points: TIER_POINTS.GOLD,
    },
    {
        type: "WEEKEND_WARRIOR",
        tier: "PLATINUM",
        title: "Weekend Champion",
        description: "Complete 40 weekend workouts",
        icon: "🏆",
        target: 40,
        points: TIER_POINTS.PLATINUM,
    },

    // ============================================
    // NUTRITION (Nutrition tracking)
    // ============================================
    {
        type: "NUTRITION",
        tier: "SILVER",
        title: "Nutrition Aware",
        description: "Track nutrition for 7 consecutive days",
        icon: "🥗",
        target: 7,
        points: TIER_POINTS.SILVER,
    },
    {
        type: "NUTRITION",
        tier: "GOLD",
        title: "Macro Master",
        description: "Track nutrition for 14 consecutive days",
        icon: "📊",
        target: 14,
        points: TIER_POINTS.GOLD,
    },
    {
        type: "NUTRITION",
        tier: "PLATINUM",
        title: "Nutrition Expert",
        description: "Track nutrition for 30 consecutive days",
        icon: "🎯",
        target: 30,
        points: TIER_POINTS.PLATINUM,
    },
];

// Helper to get achievement definition by type and tier
export function getAchievementDefinition(
    type: AchievementType,
    tier: AchievementTier
): AchievementDefinition | undefined {
    return ACHIEVEMENT_DEFINITIONS.find(
        (def) => def.type === type && def.tier === tier
    );
}

// Get all achievements for a specific type
export function getAchievementsByType(
    type: AchievementType
): AchievementDefinition[] {
    return ACHIEVEMENT_DEFINITIONS.filter((def) => def.type === type);
}

// Get all achievements for a specific tier
export function getAchievementsByTier(
    tier: AchievementTier
): AchievementDefinition[] {
    return ACHIEVEMENT_DEFINITIONS.filter((def) => def.tier === tier);
}
