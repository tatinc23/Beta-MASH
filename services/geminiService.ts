import { GoogleGenAI, Modality } from "@google/genai";
import { MashResults, StoryTone, Players, Player } from '../types';
import { CATEGORY_INFO } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateHeadshotAvatar = async (photo: Player['photo']): Promise<string> => {
    if (!photo) throw new Error("A photo is required to generate an avatar.");

    const prompt = `
      **MASTER PROMPT: Pixar-Style Character Portrait**

      **1. CORE DIRECTIVE:**
      You are a world-class 3D character artist from a top animation studio like Pixar or DreamWorks. Your task is to transform the person in the provided photograph into a high-fidelity, cinematic 3D character portrait. The final result should look like a promotional still from a major animated film.

      **2. CRITICAL GOAL: LIKENESS & TRANSLATION:**
      - **Primary Goal:** Achieve a strong, recognizable likeness to the person in the photo.
      - **Method:** Faithfully translate their key facial structures (eye shape, nose, jawline, smile) into the stylized language of 3D animation. Do not simply caricature them; find the authentic appeal in their features and enhance it. Capture their unique expression and personality.

      **3. ART STYLE & EXECUTION (NON-NEGOTIABLE):**
      - **Overall Style:** Modern, high-end 3D animation (Pixar/DreamWorks aesthetic).
      - **Textures & Materials:** Employ photorealistic textures within the stylized forms.
          - **Skin:** Must have subtle details like pores, freckles, and subsurface scattering to give it a soft, lifelike glow.
          - **Hair:** Render individual hair strands and clumps with realistic sheen and highlights. Avoid a "helmet" or plastic look.
          - **Eyes:** Create expressive, soulful eyes with depth, reflections, and detailed irises. This is key to personality.
      - **Lighting:** Use cinematic three-point lighting (key, fill, rim light) to sculpt the character's face, creating depth and dimension. Shadows should be soft and natural.
      - **Rendering Quality:** The final image must be a high-resolution, polished render. No low-poly models, flat shading, or 2D elements.

      **4. COMPOSITION & BACKGROUND:**
      - **Framing:** A classic head-and-shoulders portrait. The character should be the undeniable focus.
      - **Background:** A simple, out-of-focus background with a soft gradient or bokeh effect. The colors should complement the character's tones.

      **5. ABSOLUTE PROHIBITIONS:**
      - **NO** 2D, cel-shading, anime, or cartoon styles with hard outlines.
      - **NO** flat, plastic-looking textures.
      - **NO** harsh, unrealistic lighting.
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
      **ROLE:** You are a senior 3D character artist at a major animation studio, tasked with revising a character model.

      **TASK:** Modify the "Current Avatar" based on the user's "Edit Instruction," while preserving the character's core identity and the established high-quality art style.

      **REFERENCE IMAGES:**
      1.  **Original Photo:** The source of truth for the character's likeness.
      2.  **Current Avatar:** The existing 3D character render you are modifying.

      **USER'S EDIT INSTRUCTION:** "${editPrompt}"

      **CRITICAL RULES (NON-NEGOTIABLE):**
      1.  **PRESERVE LIKENESS:** The edited avatar MUST still be a strong, recognizable likeness of the person in the "Original Photo." Do not deviate from their core facial structure.
      2.  **MAINTAIN ART STYLE INTEGRITY:** The final image must remain in the **exact same high-fidelity 3D animation style** as the "Current Avatar." This includes:
          - **Textures:** Photorealistic skin with subsurface scattering, detailed hair strands, and expressive eyes.
          - **Lighting:** Cinematic three-point lighting with soft shadows.
          - **Quality:** A polished, high-resolution final render.
      3.  **SEAMLESS INTEGRATION:** Apply the user's requested edit naturally and believably within the established character design and art style.
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
        4.  **Length:** Write 3-4 short, funny paragraphs.
        5.  **Vibe:** Funny cartoon, silly 90s kids' show. Include 2-3 easy 90s references.
        6.  **Relationship Flavor:** ${relationshipFlavor}
        
        **Parody Guideline:** If the story involves a real person (like a celebrity from the 'Spouse' category), portray them in a funny, over-the-top, parody style. This is satire and for entertainment purposes only. The humor should be about the absurd situation, not mean-spirited towards the person.

        **Story Context:** This story is about ${storySubject}.
        **Player Info:** ${playerInfo}
        
        **M.A.S.H. Results to include:**
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
                return `The character in the scene MUST be a perfect recreation of the 3D-style headshot avatar provided as input. This avatar is the reference for ${players.player1.name}.`;
            case 'coop':
                return `The two characters in the scene MUST be perfect recreations of the two 3D-style headshot avatars provided as input. This is the single most important goal.
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
                - **Spouse (Parody Rule):** Their spouse is a comical, exaggerated, Pixar-style CARICATURE of '${results.Spouse}'. This is a parody for entertainment. Include them in a fun, secondary way (e.g., in a framed photo, a thought bubble, or as a fun background character).
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
                    .map(([key, value]) => {
                        // Add the parody rule specifically for the spouse category in coop mode too
                        if (key === 'Spouse') {
                            return `- **${CATEGORY_INFO[key]?.name || key} (Parody Rule):** Visually represent a comical, exaggerated, Pixar-style CARICATURE of "${value}" in the scene.`;
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
      **ROLE:** You are a scene and lighting artist for a 3D animated film, in the style of Pixar.
      **TASK:** Create a full scene illustrating a M.A.S.H. future, featuring the 3D character(s) from the input avatar(s).
      **STYLE:** The illustration must be in the **exact same high-quality 3D animation style** as the input character avatar(s). The entire scene—characters, backgrounds, and objects—must be stylistically consistent. Use cinematic lighting, rich textures, and a sense of depth. It should look like a final frame from a modern 3D animated movie.
      
      **NON-NEGOTIABLE CORE INSTRUCTION: CHARACTER RECREATION**
      This is the most important rule. You must perfectly and exactly recreate the 3D character(s) from the provided avatar image(s). **Your task is to place these specific, pre-designed 3D characters into a new scene.** Do not alter their design, features, style, or colors.
      ${characterDirectives()}
      
      **SCENE COMPOSITION:**
      - The final image must be a single, unified scene, not a collage.
      - The scene should be full of fun, whimsical details that bring the M.A.S.H. results to life.
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