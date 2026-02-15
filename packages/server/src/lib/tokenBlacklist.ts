// In-memory token blacklist. Use Redis in production for persistence across restarts.
export const tokenBlacklist = new Set<string>();
