import React from 'react';
import { 
  Camera, User, Activity, Sun, Zap, Layers, Heart, Video, Sparkles, Box, Cpu, Film, Move, Wind, Tv, Maximize2, Microscope, Palette, Binary, Monitor, Play, FastForward, Anchor, Target, Droplets, Focus, ShieldAlert, ZapOff, Accessibility, Droplet, Waves, MessageSquare
} from 'lucide-react';
import { TagCategory, AIModel, AIModelType, TagItem, ModelParameter } from './types';

const COMMON_IMG_PARAMS: ModelParameter[] = [
  {
    id: 'aspect_ratio',
    label: 'Aspect Ratio',
    label_es: 'Relación de Aspecto',
    type: 'select',
    options: [
      { value: '1:1', label: '1:1 Square' },
      { value: '16:9', label: '16:9 Cinema' },
      { value: '9:16', label: '9:16 Portrait' },
      { value: '4:5', label: '4:5 Social' },
      { value: '2:3', label: '2:3 Classic' },
      { value: '21:9', label: '21:9 Ultrawide' }
    ],
    defaultValue: '1:1'
  }
];

const SEEDREAM_PARAMS: ModelParameter[] = [
  ...COMMON_IMG_PARAMS,
  { id: 'nsfw_mode', label: 'NSFW Mode', label_es: 'Modo NSFW', type: 'toggle', defaultValue: 'false' },
  { id: 'skin_porosity', label: 'Skin Porosity', label_es: 'Porosidad de Piel', type: 'slider', min: 0.0, max: 2.0, step: 0.1, defaultValue: '0.0' },
  { id: 'vellus_hair', label: 'Vellus Hair', label_es: 'Vello Facial', type: 'slider', min: 0.0, max: 2.0, step: 0.1, defaultValue: '0.0' },
  { id: 'anatomical_weight', label: 'Anatomical Precision', label_es: 'Precisión Anatómica', type: 'slider', min: 0.0, max: 2.0, step: 0.1, defaultValue: '0.0' },
  { id: 'moisture_level', label: 'Lubrication/Sweat', label_es: 'Humedad/Lubricación', type: 'slider', min: 0.0, max: 2.0, step: 0.1, defaultValue: '0.0' },
  { id: 'focal_length', label: 'Focal Length', label_es: 'Distancia Focal', type: 'select', options: [{ value: '35mm', label: '35mm' }, { value: '50mm', label: '50mm' }, { value: '85mm', label: '85mm' }, { value: '100mm', label: '100mm Macro' }], defaultValue: '50mm' },
  { id: 'aperture', label: 'Aperture (f/)', label_es: 'Apertura (f/)', type: 'select', options: [{ value: 'f/1.2', label: 'f/1.2 Extreme' }, { value: 'f/1.8', label: 'f/1.8 Soft' }, { value: 'f/2.8', label: 'f/2.8' }, { value: 'f/8.0', label: 'f/8.0' }], defaultValue: 'f/1.8' }
];

const FLUX_PARAMS: ModelParameter[] = [
  ...COMMON_IMG_PARAMS,
  { id: 'chaos', label: 'Chaos', label_es: 'Caos', type: 'slider', min: 0, max: 100, step: 1, defaultValue: '0' },
  { id: 'stylize', label: 'Stylize', label_es: 'Estilizar', type: 'slider', min: 0, max: 1000, step: 50, defaultValue: '250' },
  { id: 'guidance', label: 'Guidance Scale', label_es: 'Escala de Guía', type: 'slider', min: 1, max: 10, step: 0.5, defaultValue: '3.5' }
];

const VIDEO_PARAMS: ModelParameter[] = [
  { id: 'motion_scale', label: 'Motion Scale', label_es: 'Escala de Movimiento', type: 'slider', min: 1, max: 10, step: 1, defaultValue: '5' },
  { id: 'temporal_consistency', label: 'Consistency', label_es: 'Consistencia', type: 'slider', min: 1, max: 10, step: 1, defaultValue: '8' },
  { id: 'camera_move', label: 'Camera Move', label_es: 'Movimiento Cámara', type: 'select', options: [{ value: 'static', label: 'Estático' }, { value: 'dolly zoom', label: 'Dolly Zoom' }, { value: 'slow pan', label: 'Pan' }, { value: 'tilt up', label: 'Tilt Up' }], defaultValue: 'static' }
];

export const MODELS: AIModel[] = [
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    version: 'CLAUDE VISION PRO',
    description: 'Detalle microscópico impulsado por Claude Vision Pro.',
    icon: <Cpu className="w-5 h-5" />,
    color: 'from-yellow-400 to-orange-500',
    engine: 'claude-opus-4-6',
    capabilities: ['Micro-Textures'],
    modality: 'image',
    negativeFormat: { label: 'NEGATIVE PROMPT: ' },
    parameters: COMMON_IMG_PARAMS
  },
  {
    id: 'seedream',
    name: 'Seedream 5.0',
    version: 'V5.0 ULTRA',
    description: 'Narrativa técnica bio-realista con enfoque en micro-textura RAW y porosidad real.',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-cyan-500 to-blue-500',
    engine: 'Seedream Core v5.0',
    capabilities: ['Prosa Técnica', 'Textura RAW', 'Bio-Realismo'],
    modality: 'image',
    negativeFormat: { prefix: '--no ' },
    parameters: SEEDREAM_PARAMS
  },
  {
    id: 'flux-3-pro',
    name: 'FLUX.3 Pro',
    version: 'PRO V3',
    description: 'Generación de imagen ultra-realista con control fino de detalles.',
    icon: <Layers className="w-5 h-5" />,
    color: 'from-emerald-400 to-green-600',
    engine: 'Flux Pro v3',
    capabilities: ['High Fidelity'],
    modality: 'image',
    negativeFormat: { prefix: '--no ' },
    parameters: FLUX_PARAMS
  },
  {
    id: 'flux-3-realism',
    name: 'FLUX.3 Realism',
    version: 'REALISM V3',
    description: 'Realismo fotográfico extremo y precisión anatómica.',
    icon: <Box className="w-5 h-5" />,
    color: 'from-green-500 to-teal-700',
    engine: 'Flux Realism v3',
    capabilities: ['Photorealism'],
    modality: 'image',
    negativeFormat: { prefix: '--no ' },
    parameters: FLUX_PARAMS
  },
  {
    id: 'flux-3-lo',
    name: 'FLUX.3 Lora Optimized',
    version: 'LO V3',
    description: 'Optimizado para aplicar estilos y adaptaciones visuales personalizadas.',
    icon: <Waves className="w-5 h-5" />,
    color: 'from-orange-400 to-rose-500',
    engine: 'Flux Lora v3',
    capabilities: ['Style Adaptation'],
    modality: 'image',
    negativeFormat: { prefix: '--no ' },
    parameters: FLUX_PARAMS
  },
  {
    id: 'kling-4-image',
    name: 'Kling 4.0 (Img)',
    version: 'CORE V4',
    description: 'Cinematografía estática de nueva generación con detalle extremo.',
    icon: <Camera className="w-5 h-5" />,
    color: 'from-purple-500 to-indigo-600',
    engine: 'Kling Image v4',
    capabilities: ['Ultra Detail'],
    modality: 'image',
    negativeFormat: { label: 'NEGATIVE:' },
    parameters: COMMON_IMG_PARAMS
  },
  {
    id: 'dall-e-4',
    name: 'DALL-E 4',
    version: 'DALL-E 4 TURBO',
    description: 'Sintaxis descriptiva expansiva con coherencia textual avanzada.',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'from-emerald-600 to-green-800',
    engine: 'DALL-E 4 Turbo',
    capabilities: ['Text Coherence', 'Instruction Following'],
    modality: 'image',
    negativeFormat: { label: 'Avoid: ' },
    parameters: COMMON_IMG_PARAMS
  },
  {
    id: 'kling-4-video',
    name: 'Kling 4.0',
    version: 'V4.0 ULTRA',
    description: 'La cima absoluta de la coherencia temporal y física de video con 10min duración.',
    icon: <Play className="w-5 h-5" />,
    color: 'from-red-600 to-rose-900',
    engine: 'Kling Video v4.0 Ultra',
    capabilities: ['Master Physics', 'Ultra Coherence', '10min Videos'],
    modality: 'video',
    negativeFormat: { label: 'NEGATIVE:' },
    parameters: VIDEO_PARAMS
  },
  {
    id: 'sora-3',
    name: 'Sora 3',
    version: 'GEN-3 ULTRA',
    description: 'El pináculo del video generativo con física realista y movimiento fluido.',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-blue-400 to-indigo-600',
    engine: 'Sora Engine v3',
    capabilities: ['Physics Simulation', 'Long Duration'],
    modality: 'video',
    negativeFormat: { label: 'Avoid:' },
    parameters: VIDEO_PARAMS
  },
  {
    id: 'veo-4-pro',
    name: 'Veo 4.0 Pro',
    version: 'VEO 4.0 PRO',
    description: 'Video profesional de Google con control director integrado.',
    icon: <Film className="w-5 h-5" />,
    color: 'from-blue-600 to-indigo-700',
    engine: 'veo-4.0-pro',
    capabilities: ['Director Control', '4K Cinematic'],
    modality: 'video',
    negativeFormat: { label: 'NEGATIVE PROMPT:' },
    parameters: VIDEO_PARAMS
  },
  {
    id: 'kling-3-5-video',
    name: 'Kling 3.5',
    version: 'V3.5 ULTRA',
    description: 'Generación de video de alta fidelidad con movimiento naturalista.',
    icon: <Video className="w-5 h-5" />,
    color: 'from-red-600 to-rose-700',
    engine: 'Kling Video v3.5',
    capabilities: ['Natural Motion', 'High Fidelity'],
    modality: 'video',
    negativeFormat: { label: 'NEGATIVE:' },
    parameters: VIDEO_PARAMS
  },
  {
    id: 'haiper-6-ai',
    name: 'Haiper 6.0',
    version: 'V6.0 ULTIMATE',
    description: 'Consistencia de personajes y coherencia narrativa suprema.',
    icon: <Monitor className="w-5 h-5" />,
    color: 'from-teal-400 to-green-600',
    engine: 'Haiper Video v6.0',
    capabilities: ['Character Consistency', 'Narrative Flow'],
    modality: 'video',
    negativeFormat: { label: 'NEGATIVE:' },
    parameters: VIDEO_PARAMS
  },
  {
    id: 'runway-gen3-5',
    name: 'Runway Gen-3.5',
    version: 'GEN-3.5 TURBO',
    description: 'Generación de video ultra-rápida con calidad profesional.',
    icon: <Play className="w-5 h-5" />,
    color: 'from-rose-500 to-red-800',
    engine: 'Runway Gen-3.5',
    capabilities: ['Fast Generation', 'Pro Quality'],
    modality: 'video',
    negativeFormat: { label: 'NEGATIVE:' },
    parameters: VIDEO_PARAMS
  },
  {
    id: 'pika-3-alpha',
    name: 'Pika 3.0 Alpha',
    version: 'V3.0 ALPHA',
    description: 'Especialista en animación de personajes y movimiento expresivo.',
    icon: <User className="w-5 h-5" />,
    color: 'from-teal-500 to-emerald-600',
    engine: 'Pika Video v3.0',
    capabilities: ['Character Animation'],
    modality: 'video',
    negativeFormat: { label: 'NEGATIVE:' },
    parameters: VIDEO_PARAMS
  }
];

export const CATEGORIES = (selectedModel: AIModelType): TagCategory[] => {
  const isSeedream = selectedModel === 'seedream';
  
  if (isSeedream) {
    return [
      {
        id: 'seedream_bio',
        title: 'Micro-Texture RAW', title_es: 'Micro-Textura RAW',
        icon: <Microscope className="w-8 h-8 text-cyan-400" />,
        borderColor: 'border-cyan-500/20', bgColor: 'bg-cyan-500/10', shadowClass: 'hover:shadow-cyan-500/10',
        activeClass: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
        items: [
          { value: 'visible skin pores and fine granular texture', label_en: 'Skin Pores', label_es: 'Poros Piel' },
          { value: 'natural skin pigment irregularities, tiny freckles', label_en: 'Pigment', label_es: 'Pigmentación' },
          { value: 'soft vellus hair peach fuzz', label_en: 'Peach Fuzz', label_es: 'Vello Facial' }
        ]
      },
      {
        id: 'seedream_anatomy_nsfw',
        title: 'Natural Human RAW (NSFW)', title_es: 'Realismo Humano (NSFW)',
        icon: <Droplets className="w-8 h-8 text-rose-500" />,
        borderColor: 'border-rose-500/20', bgColor: 'bg-rose-500/10', shadowClass: 'hover:shadow-rose-500/10',
        activeClass: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
        items: [
          { value: 'natural biological human proportions, zero exaggeration', label_en: 'Natural Proportions', label_es: 'Proporciones Naturales' },
          { value: 'realistic mucosal textures and standard biological folds', label_en: 'Authentic Mucosa', label_es: 'Mucosa Realista' },
          { value: 'meticulous natural anatomical biological textures', label_en: 'Human Anatomy', label_es: 'Anatomía Humana' },
          { value: 'realistic biological integration, balanced volumes', label_en: 'Balanced Realism', label_es: 'Realismo Equilibrado' }
        ]
      }
    ];
  }

  return [
    {
      id: 'cinematic',
      title: 'Cinematic Quality', title_es: 'Calidad Cine',
      icon: <Camera className="w-8 h-8 text-amber-500" />,
      borderColor: 'border-amber-500/20', bgColor: 'bg-amber-500/10', shadowClass: 'hover:shadow-amber-500/10',
      activeClass: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
      items: [
        { value: 'photorealistic masterpiece', label_en: 'Masterpiece', label_es: 'Obra Maestra' },
        { value: 'shot on 35mm film, highly detailed', label_en: '35mm Film', label_es: 'Cine 35mm' },
        { value: 'cinematic volumetric lighting', label_en: 'Lighting', label_es: 'Luz Cine' }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Excellence', title_es: 'Excelencia Técnica',
      icon: <Cpu className="w-8 h-8 text-indigo-500" />,
      borderColor: 'border-indigo-500/20', bgColor: 'bg-indigo-500/10', shadowClass: 'hover:shadow-indigo-500/10',
      activeClass: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
      items: [
        { value: 'ultra high resolution 8K', label_en: 'Ultra Resolution', label_es: 'Ultra Resolución' },
        { value: 'perfectly sharp focus and intricate details', label_en: 'Sharp Focus', label_es: 'Enfoque Nítido' },
        { value: 'professional color grading and white balance', label_en: 'Color Grade', label_es: 'Gradación Color' }
      ]
    }
  ];
};
