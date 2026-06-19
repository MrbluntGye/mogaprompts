import Anthropic from "@anthropic-ai/sdk";
import { AIModelType } from "./types";

/**
 * IMPROVED: Better error handling, debugging, and API Key management
 */

// ============================================================================
// DEBUG: API KEY VALIDATION
// ============================================================================

const validateApiKey = (apiKey: string | undefined): string => {
  if (!apiKey) {
    console.error('❌ API Key is missing!');
    console.error('Checked:');
    console.error('  - Parameter apiKey:', !!apiKey);
    console.error('  - REACT_APP_CLAUDE_API_KEY:', !!process.env.REACT_APP_CLAUDE_API_KEY);
    console.error('  - CLAUDE_API_KEY:', !!process.env.CLAUDE_API_KEY);
    
    throw new Error(
      'API Key not found. Please:\n' +
      '1. Create .env.local in project root\n' +
      '2. Add: REACT_APP_CLAUDE_API_KEY=sk-ant-your-key-here\n' +
      '3. Restart: npm run dev'
    );
  }

  if (!apiKey.startsWith('sk-ant-')) {
    console.error('❌ Invalid API Key format!');
    console.error('Key should start with "sk-ant-"');
    throw new Error('Invalid API Key format. Get a new key from console.anthropic.com');
  }

  if (apiKey.length < 20) {
    console.error('❌ API Key too short!');
    throw new Error('API Key appears to be invalid (too short)');
  }

  console.log('✅ API Key validated');
  return apiKey;
};

// ============================================================================
// MODEL INSTRUCTIONS (same as before)
// ============================================================================

interface ModelInstruction {
  systemPrompt: string;
  guidelines: string[];
  qualityChecks: string[];
}

const getModelInstruction = (modelType: AIModelType): ModelInstruction => {
  const instructions: Record<AIModelType, ModelInstruction> = {
    seedream: {
      systemPrompt: `You are SEEDREAM 5.0 RAW BIO-VISUAL ENGINEERING EXPERT.

CORE MISSION: Generate technical, anatomically-accurate prose for hyper-realistic human rendering.

MANDATORY REQUIREMENTS:
1. BIOLOGICAL ACCURACY: Every texture, proportion, and anatomical feature must reflect natural human biology
2. MICRO-TEXTURE FOCUS: Explicit descriptions of skin porosity, fine hair, pigment variation
3. NO EXAGGERATION: Zero distortion, zero stylization, zero fantasy elements
4. PHOTOGRAPHIC REALISM: Render as if photographed by a professional with technical precision
5. TECHNICAL LANGUAGE: Use scientific terminology for anatomical structures`,
      
      guidelines: [
        "Start with biological baseline (natural human proportions)",
        "Layer in micro-texture specifics (pores, hair, pigmentation)",
        "Add anatomical precision (organ visibility, muscle definition, fat distribution)",
        "Incorporate lighting that reveals texture (directional, non-diffuse)",
        "Use precise measurements when describing proportions",
      ],
      
      qualityChecks: [
        "Does the prompt describe actual human anatomy, not fantasy?",
        "Are proportions within ±5% of natural human variation?",
        "Is skin texture described with scientific precision?",
        "Does it avoid all exaggeration or stylization?",
        "Are technical lighting parameters specified?",
      ]
    },

    'flux-3-pro': {
      systemPrompt: `You are FLUX.3 PRO PROMPT ARCHITECT. Generate detailed, technical prompts for ultra-high-fidelity image generation.`,
      guidelines: ["Maximize detail", "Specify composition", "Include lighting", "Add color theory", "Reference style"],
      qualityChecks: ["Is composition intentional?", "Are technical parameters specified?", "Is detail extreme?"]
    },

    'flux-3-realism': {
      systemPrompt: `You are FLUX.3 REALISM SPECIALIST. Generate prompts for photorealistic imagery with maximum physics accuracy.`,
      guidelines: ["Define environmental physics", "Specify material properties", "Layer anatomical detail", "Include atmospheric effects"],
      qualityChecks: ["Could this exist in reality?", "Are materials physically accurate?", "Is anatomy correct?"]
    },

    'flux-3-lo': {
      systemPrompt: `You are FLUX.3 LORA SPECIALIST. Generate prompts for stylistically consistent image generation using LoRA adaptations.`,
      guidelines: ["Define aesthetic school", "Reference artists", "Specify palette", "Describe patterns"],
      qualityChecks: ["Is style clearly defined?", "Are references specific?", "Is it flexible?"]
    },

    'kling-4-image': {
      systemPrompt: `You are KLING 4.0 IMAGE SPECIALIST. Generate cinematic image prompts with extreme detail.`,
      guidelines: ["Shot composition", "Three-point lighting", "Depth layering", "Character details"],
      qualityChecks: ["Is composition cinematic?", "Is depth created?", "Are details specific?"]
    },

    'kling-4-video': {
      systemPrompt: `You are KLING 4.0 VIDEO ARCHITECT. Generate prompts for 10-minute coherent video with perfect physics.`,
      guidelines: ["Narrative structure", "Temporal consistency", "Physics simulation", "Camera language"],
      qualityChecks: ["Is narrative clear?", "Would character persist?", "Does physics compound?"]
    },

    'sora-3': {
      systemPrompt: `You are SORA 3 PHYSICS EXPERT. Generate prompts optimized for physics-accurate video simulation.`,
      guidelines: ["Physical laws", "Material behavior", "Environmental forces", "Dynamic camera"],
      qualityChecks: ["Do motions obey physics?", "Are materials accurate?", "Is camera motivated?"]
    },

    'veo-3-pro': {
      systemPrompt: `You are VEO 4.0 DIRECTOR. Generate prompts with directorial intent and cinematographic precision.`,
      guidelines: ["Directorial intention", "Visual language", "Character psychology", "Composition"],
      qualityChecks: ["Is intention clear?", "Does visual serve emotion?", "Is composition intentional?"]
    },

    'dall-e-4': {
      systemPrompt: `You are DALL-E 4 TEXT SPECIALIST. Generate prompts optimized for text rendering and symbolic accuracy.`,
      guidelines: ["Text specifications", "Font styling", "Text color", "Positioning"],
      qualityChecks: ["Is text exact?", "Are fonts specified?", "Is text readable?"]
    },

    'nano-banana-pro': {
      systemPrompt: `You are NANO BANANA PRO. Generate prompts for micro-detail analysis and precision rendering.`,
      guidelines: ["Micro-detail focus", "Technical accuracy", "Magnified perspective"],
      qualityChecks: ["Is detail at micro level?", "Is terminology scientific?"]
    },

    'flux-2-pro': {
      systemPrompt: `FLUX.2 PRO specialist.`,
      guidelines: ["Detail", "Composition"],
      qualityChecks: ["Detail maximized?"]
    },
    'flux-2-max': {
      systemPrompt: `FLUX.2 MAX specialist.`,
      guidelines: ["Balance speed and quality"],
      qualityChecks: ["Optimized?"]
    },
    'flux-2-flex': {
      systemPrompt: `FLUX.2 FLEX specialist.`,
      guidelines: ["Style flexibility"],
      qualityChecks: ["Style clear?"]
    },
    'kling-01': {
      systemPrompt: `KLING 1.0 specialist.`,
      guidelines: ["Cinematic"],
      qualityChecks: ["Cinematic?"]
    },
    'chatgpt-ia': {
      systemPrompt: `DALL-E specialist.`,
      guidelines: ["Text clarity"],
      qualityChecks: ["Text clear?"]
    },
    'kling-2-5-video': {
      systemPrompt: `KLING 2.5 VIDEO specialist.`,
      guidelines: ["Fluid physics"],
      qualityChecks: ["Physics realistic?"]
    },
    'kling-2-6-video': {
      systemPrompt: `KLING 2.6 VIDEO specialist.`,
      guidelines: ["High fidelity"],
      qualityChecks: ["Quality high?"]
    },
    'kling-3-video': {
      systemPrompt: `KLING 3.0 VIDEO specialist.`,
      guidelines: ["Physics accuracy"],
      qualityChecks: ["Physics accurate?"]
    },
    'minimax-hailuo-01': {
      systemPrompt: `MINIMAX 1.0 specialist.`,
      guidelines: ["Human realism"],
      qualityChecks: ["Realism high?"]
    },
    'minimax-hailuo-02': {
      systemPrompt: `MINIMAX 2.0 specialist.`,
      guidelines: ["Actor consistency"],
      qualityChecks: ["Consistency high?"]
    }
  };

  return instructions[modelType] || instructions['nano-banana-pro'];
};

// ============================================================================
// TECHNICAL CONTEXT & TAG HANDLING (same as before)
// ============================================================================

const buildTechnicalContext = (params: Record<string, string>, modelType: AIModelType): string => {
  const relevantParams: string[] = [];

  if (params.aspect_ratio && params.aspect_ratio !== '1:1') {
    relevantParams.push(`Aspect ratio: ${params.aspect_ratio}`);
  }

  if (modelType === 'seedream') {
    if (params.skin_porosity && parseFloat(params.skin_porosity) > 0) {
      relevantParams.push(`Skin porosity: ${params.skin_porosity}`);
    }
    if (params.focal_length) relevantParams.push(`Focal length: ${params.focal_length}`);
    if (params.aperture) relevantParams.push(`Aperture: ${params.aperture}`);
  }

  if (modelType.includes('flux')) {
    if (params.chaos && parseFloat(params.chaos) > 0) {
      relevantParams.push(`Chaos: ${params.chaos}%`);
    }
    if (params.stylize && parseFloat(params.stylize) > 0) {
      relevantParams.push(`Stylization: ${params.stylize}/1000`);
    }
    if (params.guidance && parseFloat(params.guidance) > 0) {
      relevantParams.push(`Guidance: ${params.guidance}`);
    }
  }

  if (modelType.includes('video')) {
    if (params.motion_scale && parseFloat(params.motion_scale) > 0) {
      relevantParams.push(`Motion scale: ${params.motion_scale}/10`);
    }
    if (params.temporal_consistency && parseFloat(params.temporal_consistency) > 0) {
      relevantParams.push(`Consistency: ${params.temporal_consistency}/10`);
    }
    if (params.camera_move && params.camera_move !== 'static') {
      relevantParams.push(`Camera: ${params.camera_move}`);
    }
  }

  if (relevantParams.length === 0) return '';
  return `\nTECHNICAL PARAMETERS:\n${relevantParams.map(p => `• ${p}`).join('\n')}`;
};

const buildTagContext = (selectedTags: string[]): string => {
  if (selectedTags.length === 0) return '';

  const tagGroups = selectedTags.reduce((acc, tag) => {
    if (tag.includes('pore') || tag.includes('texture') || tag.includes('grain')) {
      if (!acc.texture) acc.texture = [];
      acc.texture.push(tag);
    } else if (tag.includes('light') || tag.includes('luminous')) {
      if (!acc.lighting) acc.lighting = [];
      acc.lighting.push(tag);
    } else if (tag.includes('film') || tag.includes('cinema')) {
      if (!acc.cinema) acc.cinema = [];
      acc.cinema.push(tag);
    } else {
      if (!acc.other) acc.other = [];
      acc.other.push(tag);
    }
    return acc;
  }, {} as Record<string, string[]>);

  let context = '\nVISUAL ENHANCEMENTS:\n';
  if (tagGroups.texture) context += `• TEXTURE: ${tagGroups.texture.join(', ')}\n`;
  if (tagGroups.lighting) context += `• LIGHTING: ${tagGroups.lighting.join(', ')}\n`;
  if (tagGroups.cinema) context += `• CINEMATIC: ${tagGroups.cinema.join(', ')}\n`;
  if (tagGroups.other) context += `• OTHER: ${tagGroups.other.join(', ')}\n`;

  return context;
};

// ============================================================================
// IMPROVED PARSING WITH DEBUGGING
// ============================================================================

const safeParse = (text: string) => {
  try {
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanText);

    if (!parsed.positive_en || !parsed.positive_es) {
      console.warn('⚠️ Missing bilingual fields, using fallback');
      throw new Error('Missing bilingual fields');
    }

    if (parsed.positive_en.length < 20) {
      console.warn('⚠️ Prompt too short, using fallback');
      throw new Error('Prompt too short');
    }

    console.log('✅ Parse successful');
    return {
      positive_en: parsed.positive_en.trim(),
      negative_en: (parsed.negative_en || '').trim(),
      positive_es: parsed.positive_es.trim(),
      negative_es: (parsed.negative_es || '').trim()
    };
  } catch (e) {
    console.error('❌ Parse error:', e);
    return {
      positive_en: "Error generating prompt. Please check your API Key and try again.",
      negative_en: "Processing error",
      positive_es: "Error al generar el prompt. Por favor verifica tu API Key e intenta de nuevo.",
      negative_es: "Error de procesamiento"
    };
  }
};

// ============================================================================
// MAIN EXPORTS WITH IMPROVED ERROR HANDLING
// ============================================================================

export const generateProfessionalPrompt = async (
  userInput: string,
  modelType: AIModelType,
  selectedTags: string[] = [],
  params: Record<string, string> = {},
  apiKey?: string
) => {
  try {
    console.log('🚀 Starting prompt generation for:', modelType);
    
    const finalApiKey = validateApiKey(apiKey || process.env.REACT_APP_CLAUDE_API_KEY);
    const client = new Anthropic({ apiKey: finalApiKey });

    const modelInstruction = getModelInstruction(modelType);
    const technicalContext = buildTechnicalContext(params, modelType);
    const tagContext = buildTagContext(selectedTags);

    const systemPrompt = `${modelInstruction.systemPrompt}

GUIDELINES:
${modelInstruction.guidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}

OUTPUT: Valid JSON ONLY
{
  "positive_en": "Professional English prompt",
  "negative_en": "What to avoid",
  "positive_es": "Prompt en español",
  "negative_es": "Qué evitar"
}`;

    const userPrompt = `Generate prompt for ${modelType}.
${userInput || 'High-quality masterpiece'}
${tagContext}${technicalContext}`;

    console.log('📤 Sending request to Claude API...');
    
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return safeParse(content.text);
    }
    throw new Error("Unexpected response format from Claude");
  } catch (error: any) {
    console.error('❌ Generation Error:', error);
    
    // Provide helpful error messages
    if (error.message.includes('API')) {
      throw new Error('API Connection failed. Check your API Key in Settings.');
    }
    if (error.status === 401) {
      throw new Error('Invalid API Key. Get a new one from console.anthropic.com');
    }
    if (error.status === 429) {
      throw new Error('Too many requests. Wait a moment and try again.');
    }
    
    throw error;
  }
};

export const generatePromptFromMedia = async (
  media: { data: string; mimeType: string }[],
  modelType: AIModelType,
  userInput?: string,
  selectedTags: string[] = [],
  params: Record<string, string> = {},
  isVideoDNA: boolean = false,
  analysisType: 'visual' | 'dialogue' | 'both' = 'visual',
  apiKey?: string
) => {
  try {
    console.log('🖼️ Starting media analysis for:', modelType);
    
    // Filtrar solo imágenes PRIMERO (antes de usarlas)
    const images = media
      .filter(m => m.mimeType.startsWith('image/'))
      .map(m => ({
        base64: m.data,
        mimeType: m.mimeType  // ✅ ENVIAR MIME TYPE
      }));

    console.log(`📸 Media count: ${images.length}`);
    
    // Validar API Key
    const finalApiKey = apiKey || localStorage.getItem('moga_api_key');
    if (!finalApiKey) {
      throw new Error('API Key not found. Please configure it in the app.');
    }

    if (images.length === 0) {
      throw new Error('No valid images provided');
    }

    console.log('📤 Sending images to backend for analysis...');

    // Llamar al backend CON el API Key
    const response = await fetch('http://localhost:3001/api/analyze-media', {  // ← URL para backend en 3001
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        images,
        description: userInput || 'Generate a professional prompt',
        modelType,
        tags: selectedTags,
        analysisType,
        apiKey: finalApiKey  // ✅ ENVIAR API KEY AL BACKEND
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Backend error');
    }

    const result = await response.json();
    console.log('✅ Image analysis complete');
    return result;

  } catch (error: any) {
    console.error('❌ Media Analysis Error:', error);
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Backend server not running. Start it with: npm run server');
    }
    if (error.message.includes('not running')) {
      throw new Error('Backend server not running on port 3001');
    }
    if (error.message.includes('Invalid API Key')) {
      throw new Error('API Key is invalid. Check console.anthropic.com/keys');
    }
    
    throw new Error(`Image analysis failed: ${error.message}`);
  }
};

export const improveExistingPrompt = async (
  currentPrompt: string,
  modelType: AIModelType,
  apiKey?: string
) => {
  try {
    console.log('✨ Starting prompt improvement...');
    
    const finalApiKey = validateApiKey(apiKey || process.env.REACT_APP_CLAUDE_API_KEY);
    const client = new Anthropic({ apiKey: finalApiKey });

    const modelInstruction = getModelInstruction(modelType);

    const systemPrompt = `PROMPT OPTIMIZATION SPECIALIST.

MODEL GUIDELINES:
${modelInstruction.guidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}

OUTPUT: Valid JSON ONLY
{
  "positive_en": "Enhanced English prompt",
  "negative_en": "Refined negatives",
  "positive_es": "Prompt mejorado",
  "negative_es": "Negativos refinados"
}`;

    console.log('📤 Sending optimization request...');

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: `Optimize for ${modelType}:\n\n${currentPrompt}`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return safeParse(content.text);
    }
    throw new Error("Unexpected response format");
  } catch (error: any) {
    console.error('❌ Optimization Error:', error);
    throw new Error('Prompt optimization failed. Check your API Key.');
  }
};
