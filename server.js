import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Analizar imágenes y fusionar con descripción
app.post('/api/analyze-media', async (req, res) => {
  try {
    const { 
      images = [], 
      description = '', 
      modelType = 'flux-3-pro',
      tags = [],
      analysisType = 'visual',
      apiKey = null
    } = req.body;

    console.log(`📸 Analyzing ${images.length} image(s) for ${modelType}`);

    // Validar que venga API Key
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'API Key required. Please configure it in the app.' 
      });
    }

    // Validar formato de API Key
    if (!apiKey.startsWith('sk-ant-')) {
      return res.status(400).json({ 
        error: 'Invalid API Key format. Must start with sk-ant-' 
      });
    }

    if (apiKey.length < 20) {
      return res.status(400).json({ 
        error: 'API Key appears to be too short' 
      });
    }

    if (images.length === 0) {
      return res.status(400).json({ 
        error: 'No images provided' 
      });
    }

    // Crear cliente con API Key del request
    const client = new Anthropic({ apiKey });

    // Construir mensaje con imágenes
    const messageContent = [];

    // Agregar imágenes
    for (const imageData of images) {
      let cleanBase64 = imageData.base64;  // ← Acceder a .base64
      let mimeType = imageData.mimeType;   // ← Acceder a .mimeType
      
      if (cleanBase64.includes(',')) {
        cleanBase64 = cleanBase64.split(',')[1];
      }

      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mimeType,
          data: cleanBase64
        }
      });
    }

    // Agregar texto con descripción
    const tagsText = tags.length > 0 ? `\n\nTags: ${tags.join(', ')}` : '';
    const systemPrompt = `You are a professional prompt engineer for AI image/video generation.

Analyze the provided image(s) and the user's written idea.
Fusion them into a coherent, professional prompt that:
1. Captures the visual essence from the images
2. Incorporates the user's creative direction
3. Maintains consistency with the selected model and tags
4. Generates bilingual outputs (English and Spanish)

Mode: ${analysisType.toUpperCase()}

IMPORTANT: Output ONLY valid JSON (no markdown, no extra text):
{
  "positive_en": "Professional English prompt based on image analysis + user idea",
  "negative_en": "Elements to avoid",
  "positive_es": "Prompt profesional en español basado en análisis + idea",
  "negative_es": "Elementos a evitar"
}`;

    const userMessage = `Analyze these ${images.length} reference image(s) and fuse them with this idea:

**User's Idea:** "${description}"${tagsText}

**Model:** ${modelType}
**Analysis Type:** ${analysisType}

Generate a professional prompt that merges the visual analysis of the image(s) with the user's written idea, ensuring coherence and quality.`;

    messageContent.push({
      type: 'text',
      text: userMessage
    });

    console.log('📤 Sending to Claude API with image analysis...');
    console.log('✅ API Key validated and received from frontend');

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ 
        role: 'user', 
        content: messageContent 
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      console.log('✅ Analysis complete');
      
      // Intentar parsear JSON
      try {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json(parsed);
        }
      } catch (e) {
        console.log('Could not parse JSON response:', e);
      }
      
      // Si no es JSON válido, retornar el texto
      return res.json({ error: 'Invalid response format', raw: content.text });
    }

    res.status(500).json({ error: 'Unexpected response format from Claude' });

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Mensajes de error específicos
    if (error.message.includes('401')) {
      return res.status(401).json({ 
        error: 'Invalid API Key. Please check and try again.' 
      });
    }
    if (error.message.includes('429')) {
      return res.status(429).json({ 
        error: 'Rate limited. Please wait a few seconds.' 
      });
    }
    if (error.message.includes('Connection')) {
      return res.status(500).json({ 
        error: 'Connection error. Check your internet and API Key.' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to analyze media'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MOGA Studio Backend running on http://localhost:${PORT}`);
  console.log(`📸 Image analysis endpoint: POST /api/analyze-media`);
  console.log(`✅ Ready to receive API Key from frontend`);
});
