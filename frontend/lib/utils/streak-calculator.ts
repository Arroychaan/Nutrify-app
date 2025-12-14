/**
 * Utility to calculate streak levels and messages
 */
export const getStreakInfo = (streakDays: number) => {
    let message = 'dashboard.streakMessages.beginner'
    let color = 'text-emerald-500'
    let bg = 'bg-emerald-500'
    let level = 'Beginner'
    let fireIntensity = 0 // 0-3

    if (streakDays > 0) {
        message = 'dashboard.streakMessages.active'
        color = 'text-amber-500'
        bg = 'bg-amber-500'
        level = 'Active'
        fireIntensity = 1
    }
    if (streakDays >= 3) {
        message = 'dashboard.streakMessages.consistent'
        color = 'text-orange-500'
        bg = 'bg-orange-500'
        level = 'Consistent'
        fireIntensity = 2
    }
    if (streakDays >= 7) {
        message = 'dashboard.streakMessages.onFire'
        color = 'text-orange-600'
        bg = 'bg-orange-600'
        level = 'On Fire'
        fireIntensity = 3
    }
    if (streakDays >= 30) {
        message = 'dashboard.streakMessages.legend'
        color = 'text-red-600'
        bg = 'bg-red-600'
        level = 'Legend'
        fireIntensity = 3
    }

    return { message, color, bg, level, fireIntensity }
}
