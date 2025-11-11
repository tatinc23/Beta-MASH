import { GoogleGenAI, Modality } from "@google/genai";
import { MashResults, StoryTone, Players, Player } from '../types';
import { CATEGORY_INFO } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateHeadshotAvatar = async (photo: Player['photo']): Promise<string> => {
    if (!photo) throw new Error("A photo is required to generate an avatar.");

    const prompt = `
      **MASTER PROMPT: Cinematic Digital Painting Character Portrait**

      **1. CORE DIRECTIVE:**
      You are a senior concept artist for a major video game studio. Your task is to transform the person in the provided photograph into a high-quality, expressive, and artistic character portrait. The final result should look like official concept art or a loading screen portrait from a top-tier video game.

      **2. CRITICAL GOAL: LIKENESS & ARTISTIC INTERPRETATION:**
      - **Primary Goal:** Achieve a strong, unmistakable likeness to the person in the photo. This is the most important objective.
      - **Method:** Do not just trace or filter the photo. Instead, interpret their features as a skilled digital painter would. Capture their unique expression, the shape of their eyes, nose, and mouth, and the overall structure of their face. The final piece must feel like a deliberate artistic creation that is clearly based on the subject.

      **3. ART STYLE & EXECUTION (NON-NEGOTIABLE):**
      - **Overall Style:** A polished, high-fidelity digital painting. It should not look like a 3D render, a cartoon, or an anime character. Think "realistic but painterly."
      - **Brushwork & Texture:** Use visible, confident brushstrokes that suggest form and texture. The skin should have realistic tones but with artistic texture, not photographic smoothness. Hair should be rendered with painterly strokes that show flow and volume.
      - **Lighting:** Employ dramatic, cinematic lighting (like Rembrandt or chiaroscuro) to create mood, depth, and focus. Soft, directional light is key. Avoid flat, uniform lighting.
      - **Eyes:** The eyes are the focus. They must be expressive and capture the personality of the subject.

      **4. COMPOSITION & BACKGROUND:**
      - **Framing:** A classic head-and-shoulders portrait. The character should be looking slightly off-camera or engaging the viewer.
      - **Background:** A simple, textured, painterly background. A muted, abstract color field or a soft vignette is perfect. It should complement the portrait, not distract from it.

      **5. ABSOLUTE PROHIBITIONS:**
      - **NO** 3D rendering styles (e.g., Pixar, DreamWorks).
      - **NO** hard outlines, cel-shading, or anime/cartoon styles.
      - **NO** photorealistic filtering. This must be an artistic painting.
    `.trim();

    const imagePart = { inlineData: { data: photo.base64, mimeType: photo.mimeType } };
    const textPart = { text: prompt };

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
      **ROLE:** You are a senior concept artist revising a character portrait.

      **TASK:** Modify the "Current Avatar" based on the user's "Edit Instruction," while preserving the character's core identity and the established art style.

      **REFERENCE IMAGES:**
      1.  **Original Photo:** The source of truth for the character's likeness.
      2.  **Current Avatar:** The existing digital painting you are modifying.

      **USER'S EDIT INSTRUCTION:** "${editPrompt}"

      **CRITICAL RULES (NON-NEGOTIABLE):**
      1.  **PRESERVE LIKENESS:** The edited avatar MUST still be a strong, recognizable likeness of the person in the "Original Photo."
      2.  **MAINTAIN ART STYLE INTEGRITY:** The final image must remain in the **exact same cinematic digital painting style** as the "Current Avatar." This includes expressive brushwork and dramatic lighting.
      3.  **SEAMLESS INTEGRATION:** Apply the user's requested edit naturally within the established character portrait.
    `.trim();

    const photoPart = { inlineData: { data: originalPhoto.base64, mimeType: originalPhoto.mimeType } };
    const avatarPart = { inlineData: { data: currentAvatar, mimeType: 'image/png' } };
    const textPart = { text: prompt };

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


export const generateStory = async (results: MashResults, players: Players): Promise<string> => {
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
        4.  **Length (CRITICAL):** Write **exactly 2 short, funny paragraphs**. A paragraph is 3-5 sentences. Do not write more than 2 paragraphs.
        5.  **Vibe:** Funny cartoon, silly 90s kids' show. Include 1-2 easy 90s references.
        6.  **Relationship Flavor:** ${relationshipFlavor}
        
        **Parody Guideline:** If the story involves a real person (like a celebrity from the 'Spouse' category), portray them in a funny, over-the-top, parody style. This is satire and for entertainment purposes only. The humor should be about the absurd situation, not mean-spirited towards the person.

        **Story Context:** This story is about ${storySubject}.
        **Player Info:** ${playerInfo}
        
        **M.A.S.H. Results (CRITICAL):** You must cleverly include ALL of these results in the story:
        ${resultsString}
    `.trim();

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const storyText = response.text.trim();
    if (!storyText) {
      throw new Error("The AI returned an empty story. It might have writer's block!");
    }

    return storyText;
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

    const characterDirectives = () => {
        switch(players.mode) {
            case 'solo':
                return `The character in the scene MUST be a perfect recreation of the digital painting-style portrait provided as input. This portrait is the reference for ${players.player1.name}.`;
            case 'coop':
                return `The two characters in the scene MUST be perfect recreations of the two digital painting-style portraits provided as input. This is the single most important goal.
                - **Image 1** is the reference for ${players.player1.name}.
                - **Image 2** is the reference for ${players.player2!.name}.`;
        }
    }

    const sceneBrief = () => {
         const mainCharName = players.player1.name;
         switch(players.mode) {
            case 'solo':
                return `
                - **Character:** ${mainCharName} is the focal point.
                - **Spouse (Parody Rule):** Their spouse is a comical, exaggerated, painterly CARICATURE of '${results.Spouse}'. This is a parody for entertainment. Include them in a fun, secondary way.
                - **Setting:** A ${results.Housing} in ${results.City}.
                - **Job:** ${mainCharName} is dressed for or doing an action related to their job as a "${results.Job}".
                - **Vehicle:** Their ${results.Car} is visible.
                - **Pet:** Their pet, a ${results.Pet}, is in the scene.
                - **Kids:** They have ${results.Kids}. Represent this contextually (e.g., kids' toys, drawings).
                - **Wealth:** Their wealth level of '${results.Wealth}' is shown through their lifestyle.
                `;
            case 'coop':
                 const coopBrief = Object.entries(results)
                    .map(([key, value]) => {
                        if (key === 'Spouse') {
                            return `- **${CATEGORY_INFO[key]?.name || key} (Parody Rule):** Visually represent a comical, exaggerated, painterly CARICATURE of "${value}" in the scene.`;
                        }
                        return `- **${CATEGORY_INFO[key]?.name || key}:** Visually represent "${value}" in the scene.`;
                    })
                    .join('\n');

                 return `
                - **Characters:** ${players.player1.name} and ${players.player2!.name} are together and are the main focus.
                ${coopBrief}
                 `;
         }
    }
    
    const prompt = `
      **ROLE:** You are a senior concept artist creating a scene for a video game.
      **TASK:** Create a full scene illustrating a M.A.S.H. future, featuring the character(s) from the input portrait(s).
      **STYLE:** The illustration must be in the **exact same high-quality digital painting style** as the input character portrait(s). The entire scene—characters, backgrounds, and objects—must be stylistically consistent. Use cinematic lighting, expressive brushwork, and a sense of depth. It should look like a final piece of concept art.
      
      **NON-NEGOTIABLE CORE INSTRUCTION: CHARACTER RECREATION**
      This is the most important rule. You must perfectly and exactly recreate the character(s) from the provided portrait image(s). **Your task is to place these specific, pre-designed characters into a new scene.** Do not alter their design, features, or style.
      ${characterDirectives()}
      
      **SCENE COMPOSITION (CRITICAL):**
      - The final image must be a **single, cohesive, and believable scene**, not a collage.
      - **Harmoniously integrate all the M.A.S.H. results** in a way that tells a clear, whimsical story at a glance. The scene must make logical and visual sense.
      - The composition should be dynamic and tell a story, like a key frame from an animation.

      **SCENE BRIEF - VISUALIZE THESE ELEMENTS:**
      ${sceneBrief()}
    `.trim();

    const textPart = { text: prompt };
    
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