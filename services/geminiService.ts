import { GoogleGenAI, Modality } from "@google/genai";
import { MashResults } from '../types';
import { Players } from '../App';
import { STORY_MODES } from '../constants';

// Helper function to convert a File to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const RELATIONSHIP_ROLES: { [key: string]: [string, string] } = {
    'Besties': ['Bestie 1', 'Bestie 2'],
    'Siblings': ['Older Sibling', 'Younger Sibling'],
    'Dating': ['Partner 1', 'Partner 2'],
    'Rivals': ['Rival 1', 'Rival 2'],
    'Parent/Kid': ["Parent", "Kid"],
};

const getPromptForMode = (modeId: string, results: MashResults, players: Players): string => {
  const mode = STORY_MODES.find(m => m.id === modeId);
  if (!mode) throw new Error("Invalid story mode selected");

  const p1Name = players.player1.name || (players.mode === 'friend' ? 'Your Friend' : 'Player 1');
  const p2Name = players.player2?.name || 'Player 2';
  
  const subjects = {
      self: p1Name,
      friend: p2Name,
      coop: `${p1Name} and ${p2Name}`
  };
  const playerName = subjects[players.mode] || 'You';

  const resultsString = Object.entries(results)
      .map(([category, result]) => `- **${category}:** ${result}`)
      .join('\n');

  let toneInstructions = `Write a fun, cheeky, and over-the-top future prediction. Use tons of 90s slang (e.g., "as if!", "all that and a bag of chips", "da bomb", "word up", "booyah"). Keep it short and punchy (150-200 words). **Variety Guideline:** Don't overuse the same 90s clichés (like Tamagotchis) in every story. Mix it up unless the result is literally about that cliché.`;

  if (players.mode === 'friend' && players.friendModeStyle === 'naughty') {
      toneInstructions = `This is a "naughty" or "roast" story for a friend. Be extra sassy, sarcastic, and lovingly make fun of their future. Exaggerate their results for maximum comedic effect. Focus on the *worst*, most hilarious possible interpretation of their future. Turn their dream house into a chaotic mess, their cool job into a slapstick comedy of errors. Be a savage, but a funny one. It's all in good fun!`;
  }

  let relationshipContext = '';
  let playerRoles = '';
  if (players.relationship && (players.mode === 'coop' || players.mode === 'friend')) {
      const roles = RELATIONSHIP_ROLES[players.relationship];
      if (roles) {
          playerRoles = `\n**Player Roles:**\n- ${p1Name} is the ${players.mode === 'friend' ? 'storyteller' : roles[0]}.\n- ${p2Name} is the ${roles[1]}.`;
      }

      switch (players.relationship) {
          case 'Besties': relationshipContext = 'Frame this as one bestie telling the other their wild future.'; break;
          case 'Siblings': relationshipContext = 'Write this with a classic sibling rivalry tone - a mix of teasing and affection.'; break;
          case 'Dating': relationshipContext = 'Write this like a super sweet, gushy love note about your future together.'; break;
          case 'Rivals': relationshipContext = 'Frame this as a bitter rival begrudgingly admitting how awesome their future is.'; break;
          case 'Parent/Kid': relationshipContext = `Write this as a proud parent (${p1Name}) telling their kid (${p2Name}) about the amazing life they have ahead.`; break;
      }
  }

  // Base prompt structure
  let prompt = `
    You are a 90s teen magazine columnist. Your task is to generate a creative story based on the M.A.S.H. results provided, using a specific point of view or style.

    **Tone Guideline:** ${toneInstructions}
    **Relationship Context:** ${relationshipContext}
    ${playerRoles}
    
    **M.A.S.H. Results for ${playerName}:**
    ${resultsString}

    ---
    
    **Your Mission:** Write the story from the following perspective:
    
    **Mode: ${mode.title} (${mode.description})**
  `;
  
  // Specific prompt adjustments per mode can go here
  switch (modeId) {
    case 'mode06': // Movie Trailer
        prompt += `\nWrite the story in the style of an epic 90s movie trailer voiceover. Start with "In a world..." and make it dramatic!`;
        break;
    case 'mode10': // Bestie Roast
        prompt += `\nWrite this as if ${p1Name} is roasting ${p2Name}. Make it funny and savage, but in a friendly way.`;
        break;
    // ... other specific mode instructions can be added here
    default:
        prompt += `\nNow, spill the tea! What's the 4-1-1 on their future from this point of view?`;
        break;
  }

  return prompt;
};


export const generateStory = async (results: MashResults, players: Players, modeId: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const prompt = getPromptForMode(modeId, results, players);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.8 // A little more creative for story telling
        }
    });

    return response.text;
};

export const generateCharacterPortrait = async (players: Players, results: MashResults, photos: { p1: File | null, p2: File | null }): Promise<string> => {
    if (!photos.p1) throw new Error("Player 1 photo is required.");
    if (players.mode === 'coop' && !photos.p2) throw new Error("Player 2 photo is required.");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const p1Base64 = await fileToBase64(photos.p1);
    const imageParts = [{
        inlineData: { mimeType: photos.p1.type, data: p1Base64 }
    }];

    let playerDescription = `a character that looks like the person in the first photo, named ${players.player1.name || 'Player 1'}`;
    let spouseDescription = `Their spouse should be a 90s-style cartoon interpretation of '${results.Spouse}'.`;

    if (players.mode === 'coop' && photos.p2) {
        const p2Base64 = await fileToBase64(photos.p2);
        imageParts.push({
            inlineData: { mimeType: photos.p2.type, data: p2Base64 }
        });
        playerDescription = `two characters posing together. The first should look like the person in the first photo (${players.player1.name || 'Player 1'}). The second should look like the person in the second photo (${players.player2!.name || 'Player 2'}).`;
        spouseDescription = ''; // Spouse is the other player
    }

    const naughtyModePrompt = players.mode === 'friend' && players.friendModeStyle === 'naughty' 
        ? `
        **NAUGHTY MODE ACTIVE - SABOTAGE DIRECTIVE:**
        This is a "naughty" portrait meant to be funny and embarrassing for the friend. While keeping the character's likeness, introduce a humorous, chaotic, or silly element based on one of their MASH results. Pick one MASH result and make it comedically disastrous or absurd in the portrait. The vibe is 'loving roast'. The person from the photo should look stressed, embarrassed, or comically serious amidst the chaos.
        ` 
        : '';

    const prompt = `
      **ROLE:** You are an expert 90s cartoon art director. Your job is to create a single, cohesive "Magic Future Portrait" that is packed with detail and personality.

      **ART STYLE:** Create a vibrant, cool, 90s cartoon/animated movie style. Think bright colors, expressive characters, and a fun, nostalgic vibe. It should look like a high-quality animation cell, not a photo.
      
      **CRITICAL LIKENESS DIRECTIVE:** Your absolute highest priority is achieving a strong likeness to the people in the reference photos. This is more important than any other instruction. Analyze their key facial features—eye shape, nose, mouth, and jawline—and replicate them accurately within the 90s cartoon art style. The final characters MUST be immediately recognizable as the people in the photos.

      ${naughtyModePrompt}

      ---
      **SCENE BRIEF: The Perfect Future Portrait**
      
      **1. FOCAL POINT - THE CHARACTERS:**
      - The absolute main focus is the characters. Create ${playerDescription}.
      - ${spouseDescription}
      - They should be in the **foreground**, posing for the camera like a cool, candid 90s magazine photoshoot.
      - Their interaction should be positive and engaging (e.g., an arm around a shoulder, a shared laugh, looking happily at the camera).

      **2. STAGING & LAYERING (M.A.S.H. ELEMENTS):**
      - Arrange the other M.A.S.H. results to create a rich scene with depth.
      - **Background:** The '${results.Housing}' should be clearly visible in the background.
      - **Mid-ground:** Place the '${results.Ride}' and visual elements related to their job: '${results.Job}'.
      - **Character Grouping:** Creatively and naturally integrate their kids: '${results.Kids}'.
      - **Subtle Details:** Weave in a visual representation of their salary level: '${results.Salary}'.

      **3. STAGING FOR ANIMATION (CRUCIAL!):**
      - To prepare this image for a 'living photo' animation, you MUST deliberately include these elements:
      - Give at least one character hair that is slightly blowing or has a few stray strands that can move.
      - Add a subtle glint or twinkle to a metallic or glass surface (like the car, a window, or jewelry).
      - Ensure the characters' eyes are open and clear, ready for a slow blink.

      **FINAL INSTRUCTIONS:** Combine all these elements into one single, amazing, detailed portrait. Do not create a collage. Create one beautiful scene. The final image must be a vertical 9:16 aspect ratio.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [...imageParts, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!imagePart?.inlineData?.data) {
        throw new Error("Portrait generation failed to return an image.");
    }
    return imagePart.inlineData.data;
};

export const animatePortrait = async (portraitBase64: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const videoPrompt = `
      Animate this portrait image to create a very short, 2-3 second, seamlessly looping 'living photo' or cinemagraph.
      
      **Animation Instructions:**
      - The motion must be subtle and high-quality.
      - Make the character(s) slowly blink, share a gentle smile, or slightly shift their gaze.
      - Add a simple, magical animation to one background element (e.g., a car headlight twinkles, a window glows, steam gently rises from a soda can, or hair sways slightly).
      - Maintain the exact art style and character likeness from the original image.
      - The output MUST be a silent video. Do not generate any audio.
    `;

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        image: {
            imageBytes: portraitBase64,
            mimeType: 'image/jpeg',
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '9:16' // Matches portrait style
        }
    });
    
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        const pollingAi = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        try {
            operation = await pollingAi.operations.getVideosOperation({ operation: operation });
        } catch (e) {
            console.error("Polling failed, retrying...", e);
        }
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video animation failed or returned no URI.");
    }
    
    return downloadLink;
};