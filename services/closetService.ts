const CLOSET_KEY = 'mash_avatar_closet';
const MAX_CLOSET_SIZE = 20; // To prevent localStorage from getting too bloated

/**
 * Retrieves the list of saved avatar base64 strings from localStorage.
 * @returns {string[]} An array of base64 encoded avatar images.
 */
export const getCloset = (): string[] => {
    try {
        const closetJson = localStorage.getItem(CLOSET_KEY);
        if (!closetJson) return [];
        const closet = JSON.parse(closetJson);
        return Array.isArray(closet) ? closet : [];
    } catch (error) {
        console.error("Failed to retrieve avatar closet:", error);
        return [];
    }
};

/**
 * Saves a new avatar to the closet in localStorage.
 * It prevents duplicates and manages the closet size.
 * @param {string} avatarBase64 The base64 string of the avatar to save.
 */
export const saveToCloset = (avatarBase64: string): void => {
    if (!avatarBase64) return;
    try {
        let closet = getCloset();
        // Don't add if it's already there
        if (closet.includes(avatarBase64)) return;

        // Add the new avatar to the beginning
        closet.unshift(avatarBase64);

        // Enforce the maximum size
        if (closet.length > MAX_CLOSET_SIZE) {
            closet = closet.slice(0, MAX_CLOSET_SIZE);
        }

        localStorage.setItem(CLOSET_KEY, JSON.stringify(closet));
    } catch (error) {
        console.error("Failed to save avatar to closet:", error);
    }
};

/**
 * Removes an avatar from the closet in localStorage.
 * @param {string} avatarBase64 The base64 string of the avatar to remove.
 */
export const removeFromCloset = (avatarBase64: string): void => {
    try {
        let closet = getCloset();
        const updatedCloset = closet.filter(avatar => avatar !== avatarBase64);
        localStorage.setItem(CLOSET_KEY, JSON.stringify(updatedCloset));
    } catch (error) {
        console.error("Failed to remove avatar from closet:", error);
    }
}
