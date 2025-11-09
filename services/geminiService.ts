import { GoogleGenAI, Modality } from "@google/genai";
import { MashResults, StoryTone, Players, Player } from '../types';
import { CATEGORY_INFO } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const HARDCODED_STYLE_PROMPT = "The style is modern 3D animation, but rendered as a 2D portrait, reminiscent of a top-tier animation studio (like Pixar or Dreamworks). It should be expressive, vibrant, and full of personality with clean lines and expert shading.";

export const generateHeadshotAvatar = async (photo: Player['photo']): Promise<string> => {
    if (!photo) throw new Error("A photo is required to generate an avatar.");

    const prompt = `
      **ROLE:** You are an expert character artist from a top-tier animation studio.
      **TASK:** Create a single, high-quality, stylized cartoon headshot avatar based on the provided photo.
      
      **STYLE:** ${HARDCODED_STYLE_PROMPT} 
      
      **STYLE CONSISTENCY (ABSOLUTELY CRITICAL):** You will be asked to generate multiple avatars for different people in this game session. They must ALL share the exact same artistic style, as if drawn by the same artist for the same animated film. This is a non-negotiable rule. The lighting, line weight, shading, and overall feel must be uniform across all generated characters. DO NOT VARY THE STYLE.

      **CRITICAL LIKENESS DIRECTIVE (ABSOLUTE #1 PRIORITY):** Achieve a 9/10 or higher likeness to the person in the photo. This is more important than any other instruction. Meticulously analyze their key facial features—eye shape and color, nose, mouth, jawline, and unique characteristics like moles, freckles, or specific hair styles—and replicate them with extreme accuracy within the defined art style. The final character MUST be immediately recognizable as the person in the photo.
      
      **OUTPUT:** Create a head-and-shoulders portrait with a simple, neutral background.
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
    throw new Error("The AI failed to generate a headshot. Please try a different photo.");
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
      **ROLE:** You are an expert character artist and retoucher.
      **TASK:** Modify an existing cartoon avatar based on a text instruction, while strictly preserving the person's likeness and the art style.

      **INPUTS:**
      1.  **Original Photo:** The primary source for the person's facial features. Likeness to this photo is the #1 priority.
      2.  **Current Avatar:** The source for the artistic style. The output must match this style perfectly.
      3.  **Edit Instruction:** The user's requested change.

      **STYLE:** ${HARDCODED_STYLE_PROMPT}

      **CRITICAL INSTRUCTIONS (MUST BE FOLLOWED):**
      1.  **PRESERVE LIKENESS:** The modified avatar MUST still look exactly like the person in the original photo. Do not change their core facial structure.
      2.  **PRESERVE STYLE:** The output MUST be in the identical art style as the "Current Avatar". Do not change lighting, shading, line work, or texture.
      3.  **APPLY EDIT:** Apply the following modification based on the user's instruction: "${editPrompt}".

      **OUTPUT:** Generate a new head-and-shoulders portrait that incorporates the edit while following all other instructions.
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
    throw new Error("The AI failed to edit the avatar. Please try a different prompt.");
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
            default: return `Describe the shared future of ${p1} and ${p2}.`;
        }
    }
    return 'Focus on the individual and their unique journey.';
}

const getStorySubject = (players: Players): string => {
    switch (players.mode) {
        case 'solo': return `the future of ${players.player1.name}`;
        case 'sabotage': return `the future of ${players.player2!.name}, as imagined by their friend ${players.player1.name}`;
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

    if (mode === 'sabotage' && player2) {
        const p2Info = player2.name;
        info += `This story is imagined by ${p1Info} for their friend, ${p2Info}.`;
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

    const characterDirectives = () => {
        switch(players.mode) {
            case 'solo':
                return `The character in the scene MUST be 10/10 identical to the cartoon headshot avatar provided as input. This avatar is the reference for ${players.player1.name}.`;
            case 'sabotage':
                 return `The character in the scene MUST be 10/10 identical to the cartoon headshot avatar provided as input. This avatar is the reference for ${players.player2!.name}.`;
            case 'coop':
                return `The two characters in the scene MUST be 10/10 identical to the two cartoon headshot avatars provided as input. This is the single most important goal.
                - **Image 1** is the reference for ${players.player1.name}.
                - **Image 2** is the reference for ${players.player2!.name}.`;
        }
    }

    const sceneBrief = () => {
         const mainCharName = players.mode === 'sabotage' ? players.player2!.name : players.player1.name;
         switch(players.mode) {
            case 'solo':
            case 'sabotage':
                return `
                - **Character:** ${mainCharName} is the focal point.
                - **Spouse:** Their spouse is a 90s-style cartoon interpretation of '${results.Spouse}'. Include them in a fun, secondary way (e.g., in a framed photo, a thought bubble, or as a fun background character).
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
    
    const sabotageNote = players.mode === 'sabotage'
     ? `**SABOTAGE MODE ACTIVE:** This is a "roast" portrait meant to be a funny roast. Introduce a humorous, chaotic, or silly element based on one of their MASH results. Make it comedically disastrous or absurd in the portrait. The person from the photo should look stressed or comically serious amidst the chaos.`
     : '';

    const prompt = `
      **ROLE:** You are an expert character artist and scene illustrator.
      **TASK:** Create a single, cohesive, story-rich illustration of a M.A.S.H. future.
      **STYLE:** ${HARDCODED_STYLE_PROMPT} The entire image must be a unified piece of art.
      ${sabotageNote}
      
      **CRITICAL LIKENESS DIRECTIVE (ABSOLUTE #1 PRIORITY):** ${characterDirectives()}
      If there is a conflict between maintaining likeness and another instruction, ALWAYS prioritize likeness. Maintain their facial structure, features, and hair exactly. Do not alter their appearance.
      
      **ANIMATION PREPARATION (IMPORTANT):** The character's(s') eyes must be open, clear, and well-defined. The eyelids should be visible and distinct. This is crucial as the image will be used in a follow-up step to create a blinking animation. Generating clear, open eyes is essential for the animation to work correctly.

      **SCENE COMPOSITION & STORYTELLING:**
      Create a single, dynamic scene. The character(s) should be the focal point, interacting with their environment in a way that tells a story.
      
      **SCENE BRIEF (Visually represent ALL of these elements):**
      ${sceneBrief()}

      Bring this entire future to life in one stunning, story-rich illustration. The final image MUST be a vertical 9:16 aspect ratio.
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
    throw new Error("The AI failed to generate a portrait. Please try again.");
};