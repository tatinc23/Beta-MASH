import { GoogleGenAI, Modality } from "@google/genai";
import { MashResults, StoryTone, Players, Player } from '../types';
import { CATEGORY_INFO } from '../constants';

let cachedClient: GoogleGenAI | null = null;

const getClient = () => {
    if (!cachedClient) {
        const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as Record<string, any>).env)
            ? (import.meta as Record<string, any>).env
            : undefined;
        const apiKey = metaEnv?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            throw new Error("Missing Gemini API key. Please set GEMINI_API_KEY before running the app.");
        }
        cachedClient = new GoogleGenAI({ apiKey });
    }
    return cachedClient;
};

export const generateHeadshotAvatar = async (photo: Player['photo']): Promise<string> => {
    if (!photo) throw new Error("A photo is required to generate an avatar.");

    const prompt = `
      **Your Role:** You are a skilled digital painter creating a headshot.
      **Your Task:** Create a stylish digital painting of the person in the photo.

      **Art Style:**
      - **Digital Painting:** The style should be a cool, stylized digital painting, not photorealistic. Think concept art for a modern video game or a stylish graphic novel.
      - It is a head-and-shoulders portrait.
      - The background should be a simple, abstract gradient or texture that complements the character.

      **Guidance on Likeness (CRITICAL):**
      - **The #1 priority is a recognizable likeness.** The painting must clearly look like the person in the photo.
      - Faithfully capture their key features: hairstyle and color, face shape, glasses, facial hair, and their expression.
      - It is crucial to maintain their core features and ethnicity. The goal is a stylized painting of *this specific person*, not a generic character.
    `.trim();

    const imagePart = { inlineData: { data: photo.base64, mimeType: photo.mimeType } };
    const textPart = { text: prompt };

    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
        return firstPart.inlineData.data;
    }
    throw new Error("The AI couldn't create an avatar from that photo. It might be too dark, blurry, or have multiple people. Try a different one!");
};

export const editHeadshotAvatar = async (
    originalPhoto: Player['photo'],
    currentAvatar: string,
    editPrompt: string
): Promise<string> => {
    if (!originalPhoto) throw new Error("Original photo is required for editing.");
    if (!currentAvatar) throw new Error("An existing avatar is required for editing.");
    if (!editPrompt) throw new Error("An edit prompt is required.");

    const prompt = `
      **Your Role:** You are a skilled digital painter making a revision.
      **Your Task:** Apply the user's requested edit to the "Current Avatar" while keeping the "digital painting" style and making sure it still looks like the person in the "Original Photo".

      **Your Materials:**
      1.  **Original Photo:** The real person for likeness reference.
      2.  **Current Avatar:** The digital painting you are editing.
      3.  **Edit Request:** The user wants you to: "${editPrompt}".

      **Art Style:**
      - Maintain the **Digital Painting** style of the "Current Avatar."

      **Important Guidance:**
      - The edited character must still be a clear, recognizable version of the person in the original photo.
      - Apply the edit naturally within the existing art style.
    `.trim();

    const photoPart = { inlineData: { data: originalPhoto.base64, mimeType: originalPhoto.mimeType } };
    const avatarPart = { inlineData: { data: currentAvatar, mimeType: 'image/png' } };
    const textPart = { text: prompt };

    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [photoPart, avatarPart, textPart] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (firstPart && firstPart.inlineData) {
        return firstPart.inlineData.data;
    }
    throw new Error("The AI couldn't make that edit. Try a simpler prompt or a different idea!");
};


function getToneDescription(tone: StoryTone): string {
    switch (tone) {
        case 'sassy': return 'The tone should be cheeky, witty, and a little sassy.';
        case 'wholesome': return 'The tone should be sweet, heartwarming, and positive.';
        case 'roasty': return 'The tone should be a hilarious, over-the-top roast of the results. Really lean into the comedic chaos.';
        default: return 'The tone should be fun and entertaining.';
    }
}

function getRelationshipFlavor(players: Players): string {
    const p1 = players.player1.name;
    const p2 = players.player2?.name;
    if (players.mode === 'coop' && p2 && players.relationship) {
        switch (players.relationship) {
            case 'Besties': return `Capture the chaotic, fun-loving energy between two best friends, ${p1} and ${p2}.`;
            case 'Siblings': return `Have a teasing, classic sibling rivalry tone when describing the future of ${p1} and ${p2}.`;
            case 'Dating': return `Describe the sweet, romantic future ahead for the couple, ${p1} and ${p2}.`;
            case 'Crush': return `Tell the story of ${p1} and their crush ${p2} with a sense of daydreaming, wish-fulfillment, and romantic comedy.`;
            case 'Exes': return `Describe the hilariously awkward and ironic shared future of the two exes, ${p1} and ${p2}.`;
            case 'Married': return `Portray the comfortable, loving, and established partnership of the married couple, ${p1} and ${p2}.`;
            case 'Sabotage': return `Write a funny, slightly mean-spirited story about the future of ${p2}, as imagined by their friend ${p1}.`;
            default: return `Describe the shared future of ${p1} and ${p2}.`;
        }
    }
    return 'Focus on the individual and their unique journey.';
}

const getStorySubject = (players: Players): string => {
    switch (players.mode) {
        case 'solo': return `the future of ${players.player1.name}`;
        case 'coop': return `the shared future of two people, ${players.player1.name} and ${players.player2!.name}`;
    }
}

const getPlayerInfoForPrompt = (players: Players): string => {
    const { player1, player2, mode } = players;
    let info = '';

    const p1Info = player1.name;
    
    if (mode === 'solo') {
        info += `Player: ${p1Info}.`;
    }
    
    if (mode === 'coop' && player2) {
        const p2Info = player2.name;
        info += `Players: ${p1Info} and ${p2Info}.`;
    }

    return info;
}


export const generateStory = async (results: MashResults, players: Players, tone: StoryTone): Promise<string> => {
    const relationshipFlavor = getRelationshipFlavor(players);
    const storySubject = getStorySubject(players);
    const playerInfo = getPlayerInfoForPrompt(players);
    const resultsString = Object.entries(results)
        .map(([key, value]) => `- ${CATEGORY_INFO[key]?.name || key}: ${value}`)
        .join('\n');
    
    const prompt = `
        You are a super funny, slightly immature storyteller creating a M.A.S.H. story.

        **Core Instructions:**
        1.  **Reading Level (SUPER IMPORTANT):** Use simple, everyday words. Keep sentences short. Aim for a 5th-grade reading level.
        2.  **Humor:** Be as funny and silly as possible. Connect the M.A.S.H. results in ridiculous ways.
        3.  **Point of View (CRITICAL):** Use a third-person perspective. Use their names and gender-neutral pronouns (they/them) when referring to the players. Never use "you" or "I."
        4.  **Length:** Write 3-4 short, funny paragraphs.
        5.  **Vibe:** Funny cartoon, silly 90s kids' show. Include 2-3 easy 90s references.
        6.  **Relationship Flavor:** ${relationshipFlavor}
        7.  **Tone:** ${getToneDescription(tone)}

        **Story Context:** This story is about ${storySubject}.
        **Player Info:** ${playerInfo}
        
        **M.A.S.H. Results to include:**
        ${resultsString}
    `.trim();

    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
};

export const generateFortuneImage = async (
    player1Avatar: string | null,
    player2Avatar: string | null,
    results: MashResults,
    players: Players,
): Promise<string> => {
    const imageParts = [];
    if (player1Avatar) imageParts.push({ inlineData: { data: player1Avatar, mimeType: 'image/png' } });
    if (player2Avatar) imageParts.push({ inlineData: { data: player2Avatar, mimeType: 'image/png' } });

    let characterGuidance = `
      **Character Likeness (NON-NEGOTIABLE CORE INSTRUCTION):**
      - Your absolute #1 priority is to perfectly recreate the character(s) from the provided avatar images.
      - **DO NOT CHANGE THE FACES. DO NOT CHANGE THE HAIR. DO NOT CHANGE THE FEATURES.**
      - Replicate the avatar's face, hair style, hair color, glasses, expression, and ethnicity with zero changes. The likeness to the avatar image is more important than any other part of this task.
    `.trim();

    if (players.mode === 'solo') {
        characterGuidance += `\n- The character in the scene is ${players.player1.name}. Place this exact character into the new scene.`;
    } else if (players.mode === 'coop' && player2Avatar) {
        characterGuidance += `\n- There are two characters: ${players.player1.name} (first avatar image) and ${players.player2!.name} (second avatar image). Place these exact characters into the new scene together.`;
    }

    const sceneBrief = () => {
         const mainCharName = players.player1.name;
         switch(players.mode) {
            case 'solo':
                return `
                - **Character:** ${mainCharName} is the focal point.
                - **Spouse:** Their spouse is a digital painting interpretation of '${results.Spouse}'. Include them in a fun, secondary way (e.g., in a framed photo, a thought bubble, or as a fun background character).
                - **Setting:** A ${results.Housing} in ${results.City}.
                - **Job:** ${mainCharName} is dressed for or doing an action related to their job as a "${results.Job}".
                - **Vehicle:** Their ${results.Car} is visible.
                - **Pet:** Their pet, a ${results.Pet}, is in the scene.
                - **Kids:** They have ${results.Kids}. Represent this contextually (e.g., kids' toys, drawings).
                - **Wealth:** Their wealth level of '${results.Wealth}' is shown through their lifestyle (e.g., lavish items for rich, humble setting for poor).
                `;
            case 'coop':
                 // Dynamically build the scene brief from the co-op results
                 const coopBrief = Object.entries(results)
                    .map(([key, value]) => `- **${CATEGORY_INFO[key]?.name || key}:** Visually represent "${value}" in the scene.`)
                    .join('\n');

                 return `
                - **Characters:** ${players.player1.name} and ${players.player2!.name} are together and are the main focus.
                ${coopBrief}
                 `;
         }
    }
    
    const prompt = `
      **Your Role:** You are a head illustrator creating a key scene in a stylish graphic novel.
      **Your Task:** Create a single, fun "digital painting" that shows the M.A.S.H. results for the character(s) provided.

      ${characterGuidance}

      **Art Style:**
      - The whole scene—characters, background, everything—must be in the same **Digital Painting** style as the input avatar(s). Use a painterly, concept-art feel.

      **Scene Composition:**
      - Draw a single, unified scene. No collages.
      - Make it funny and full of 90s details that creatively interpret the M.A.S.H. results.
      - The scene should tell a story at a glance.

      **Scene Brief - Here's what to include:**
      ${sceneBrief()}
    `.trim();

    const textPart = { text: prompt };
    
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [...imageParts, textPart] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (firstPart && firstPart.inlineData) {
        return firstPart.inlineData.data;
    }
    throw new Error("Major bummer! The AI art studio had a meltdown. Try generating again.");
};
