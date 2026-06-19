
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Sparkles, Wand2, Loader2, Copy, Check, Zap, AlertTriangle, Image as ImageIcon, ChevronDown, Trash2, RefreshCw, Info, Film, Play, XCircle, Camera, HelpCircle, BookOpen, ArrowRight, X, MousePointer2, Layers, Terminal, Cpu, Plus, Hash, EyeOff, Eye, User, Fingerprint, Languages, ArrowDownCircle, Code, Settings2, Beaker, ShieldCheck, Microscope, Tag, Share2, Smartphone, Monitor, ArrowRightLeft, Sliders, Braces, Clapperboard, Video, Activity, MessageSquarePlus, ShieldAlert, Binary, Mic, FileText, Combine, RefreshCcw, Key
} from 'lucide-react';
import { CATEGORIES, MODELS } from './constants';
import { generateProfessionalPrompt, improveExistingPrompt, generatePromptFromMedia } from './claudeService';
import { AIModelType, TagItem, ModelParameter } from './types';

interface BilingualPrompt {
  positive_en: string;
  negative_en: string;
  positive_es: string;
  negative_es: string;
}

const App: React.FC = () => {
  const [manualApiKey, setManualApiKey] = useState<string>(() => localStorage.getItem('moga_api_key') || '');
  const [hasApiKey, setHasApiKey] = useState<boolean>(!!localStorage.getItem('moga_api_key'));
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [tempKey, setTempKey] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<BilingualPrompt>({
    positive_en: '', negative_en: '', positive_es: '', negative_es: ''
  });
  const [viewLanguage, setViewLanguage] = useState<'en' | 'es'>('en');
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isVideoDNAOpen, setIsVideoDNAOpen] = useState(false);
  const [showNegative, setShowNegative] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelType>('nano-banana-pro');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyBlur, setPrivacyBlur] = useState(true);
  const [isParamsOpen, setIsParamsOpen] = useState(false);
  const [manualParams, setManualParams] = useState<Record<string, string>>({});
  
  // Camera & Mobile Optimization States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [isCapturing, setIsCapturing] = useState(false); // Shutter animation state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [videoIdea, setVideoIdea] = useState('');
  const [videoAnalysisType, setVideoAnalysisType] = useState<'visual' | 'dialogue' | 'both'>('visual');

  const [sourceImages, setSourceImages] = useState<( {data: string, mime: string} | null )[]>([]);
  const [sourceVideo, setSourceVideo] = useState<{data: string, mime: string, frames: string[], size: number} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const activeModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];
  const isVideoMode = activeModel.modality === 'video';
  const isI2V_Duo = ['veo-3-pro', 'kling-2-5-video', 'minimax-hailuo-02', 'sora-2', 'kling-3-video'].includes(selectedModel);

  useEffect(() => {
    const checkKey = async () => {
      const storedKey = localStorage.getItem('moga_api_key');
      if (storedKey) {
        setManualApiKey(storedKey);
        setHasApiKey(true);
      } else if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) {
          setHasApiKey(true);
        } else {
          setHasApiKey(false);
        }
      } else {
        setHasApiKey(false);
      }
      setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleSaveManualKey = () => {
    if (tempKey.trim()) {
      localStorage.setItem('moga_api_key', tempKey.trim());
      setManualApiKey(tempKey.trim());
      setHasApiKey(true);
      triggerHaptic('heavy');
    }
  };

  const handleOpenKeySelector = () => {
    setTempKey(manualApiKey);
    setHasApiKey(false);
    triggerHaptic();
  };

  const handleUseAIStudioSelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  useEffect(() => {
    const defaults: Record<string, string> = {};
    activeModel.parameters?.forEach(p => { defaults[p.id] = p.defaultValue; });
    setManualParams(defaults);
    
    if (isVideoMode) {
      if (isI2V_Duo) setSourceImages([null, null]);
      else setSourceImages([null]);
    } else {
      setSourceImages([null, null, null, null, null, null]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    setSelectedTags([]);
  }, [selectedModel]);

  // Haptic Feedback Helper
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator.vibrate === 'function') {
      const patterns = { light: 10, medium: 30, heavy: 60 };
      navigator.vibrate(patterns[type]);
    }
  };

  // Camera Logic
  const startCamera = async (facing: 'user' | 'environment') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      setError("Permiso de cámara denegado o no disponible.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && activeSlot !== null) {
      triggerHaptic('heavy');
      setIsCapturing(true); // Trigger flash effect
      
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current!.videoWidth;
        canvas.height = videoRef.current!.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoRef.current!, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const next = [...sourceImages];
        next[activeSlot!] = { data: dataUrl, mime: 'image/jpeg' };
        setSourceImages(next);
        
        setIsCapturing(false);
        stopCamera();
        setActiveSlot(null);
      }, 100);
    }
  };

  const extractFrames = async (videoFile: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(videoFile);
      video.muted = true;
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error("Formato de video no compatible."));
      };

      video.onloadedmetadata = () => {
        const frames: string[] = [];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Mobile optimized frame size
        canvas.width = video.videoWidth > 800 ? 800 : video.videoWidth;
        canvas.height = video.videoHeight > 450 ? 450 : video.videoHeight;

        const capture = async (time: number) => {
          return new Promise<void>((res) => {
            const onSeeked = () => {
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
              frames.push(canvas.toDataURL('image/jpeg', 0.5).split(',')[1]);
              video.removeEventListener('seeked', onSeeked);
              res();
            };
            video.addEventListener('seeked', onSeeked);
            video.currentTime = time;
          });
        };

        const duration = video.duration;
        (async () => {
          try {
            await capture(0.1);
            await capture(duration * 0.5);
            await capture(duration * 0.9);
            URL.revokeObjectURL(video.src);
            resolve(frames);
          } catch (e) {
            reject(e);
          }
        })();
      };
    });
  };

  const insertChip = useCallback((label: string, value: string) => {
    triggerHaptic('light');
    if (!editorRef.current) return;
    const chip = document.createElement('span');
    chip.contentEditable = 'false';
    chip.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 mx-1 bg-white text-slate-900 rounded-full font-bold text-[10px] select-none shadow-sm align-middle mb-1 border border-slate-200';
    chip.dataset.value = value;
    chip.innerText = label;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      range.insertNode(chip);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current.appendChild(chip);
      editorRef.current.appendChild(document.createTextNode(' '));
    }
    editorRef.current.focus();
  }, []);

  const getPromptText = useCallback(() => {
    if (!editorRef.current) return '';
    let text = "";
    editorRef.current.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
      else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        text += el.dataset.value ? ` ${el.dataset.value} ` : el.innerText;
      }
    });
    return text.trim();
  }, []);

  const handleAIGenerate = async (isManualVideo = false) => {
    if (isGenerating) return;
    triggerHaptic('medium');
    setIsGenerating(true);
    setError(null);
    try {
      const fullText = getPromptText();
      const mediaParts: {data: string, mimeType: string}[] = [];
      
      const combinedIdea = isManualVideo 
        ? (videoIdea ? `[IDEAL: ${videoIdea}] ${fullText}` : fullText)
        : fullText;

      if (isManualVideo && sourceVideo) {
        if (sourceVideo.size > 20 * 1024 * 1024) {
          throw new Error("Video demasiado grande. Limite: 20MB.");
        }
        if (videoAnalysisType === 'visual' || videoAnalysisType === 'both') {
          sourceVideo.frames.forEach(f => mediaParts.push({ data: f, mimeType: 'image/jpeg' }));
        }
        if (videoAnalysisType === 'dialogue' || videoAnalysisType === 'both') {
          mediaParts.push({ data: sourceVideo.data.split(',')[1], mimeType: sourceVideo.mime });
        }
      } else {
        sourceImages.forEach(img => {
          if (img?.data) mediaParts.push({ data: img.data.split(',')[1], mimeType: img.mime });
        });
      }
      
      let result;
      if (mediaParts.length > 0) {
        result = await generatePromptFromMedia(
          mediaParts, 
          selectedModel, 
          combinedIdea, 
          selectedTags, 
          manualParams, 
          isManualVideo,
          isManualVideo ? videoAnalysisType : 'visual',
          manualApiKey
        );
      } else {
        result = await generateProfessionalPrompt(combinedIdea || "Visual masterpiece", selectedModel, selectedTags, manualParams, manualApiKey);
      }
      setPrompts(result);
      setIsStudioOpen(true);
      if(isManualVideo) setIsVideoDNAOpen(false);
    } catch (err: any) {
      setError(err.message || "Error en síntesis neural.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    triggerHaptic('medium');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const modelColor = ['seedream'].includes(selectedModel) ? 'cyan' : 
                     ['nano-banana-pro'].includes(selectedModel) ? 'amber' : 
                     ['flux-2-pro', 'flux-2-max', 'flux-2-flex'].includes(selectedModel) ? 'emerald' : 
                     ['kling-2-5-video', 'kling-2-6-video', 'kling-3-video'].includes(selectedModel) ? 'rose' : 'blue';

  const colorClass = {
    cyan: {
      text: 'text-cyan-400',
      borderStrong: 'border-cyan-500/40',
      bg: 'bg-cyan-500/10',
      gradient: 'from-cyan-500 to-cyan-600',
      titleGradient: 'bg-gradient-to-r from-white via-cyan-400 to-cyan-600 bg-clip-text text-transparent',
      accent: 'accent-cyan-500',
      glow: 'bg-cyan-500/5',
      btnActive: 'bg-cyan-500 text-white shadow-lg scale-105',
      dot: 'bg-cyan-500'
    },
    amber: {
      text: 'text-amber-400',
      borderStrong: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      gradient: 'from-amber-500 to-amber-600',
      titleGradient: 'bg-gradient-to-r from-white via-amber-400 to-amber-600 bg-clip-text text-transparent',
      accent: 'accent-amber-500',
      glow: 'bg-amber-500/5',
      btnActive: 'bg-amber-500 text-white shadow-lg scale-105',
      dot: 'bg-amber-500'
    },
    emerald: {
      text: 'text-emerald-400',
      borderStrong: 'border-emerald-500/40',
      bg: 'bg-emerald-500/10',
      gradient: 'from-emerald-500 to-emerald-600',
      titleGradient: 'bg-gradient-to-r from-white via-emerald-400 to-emerald-600 bg-clip-text text-transparent',
      accent: 'accent-emerald-500',
      glow: 'bg-emerald-500/5',
      btnActive: 'bg-emerald-500 text-white shadow-lg scale-105',
      dot: 'bg-emerald-500'
    },
    rose: {
      text: 'text-rose-400',
      borderStrong: 'border-rose-500/40',
      bg: 'bg-rose-500/10',
      gradient: 'from-rose-500 to-rose-600',
      titleGradient: 'bg-gradient-to-r from-white via-rose-400 to-rose-600 bg-clip-text text-transparent',
      accent: 'accent-rose-500',
      glow: 'bg-rose-500/5',
      btnActive: 'bg-rose-500 text-white shadow-lg scale-105',
      dot: 'bg-rose-500'
    },
    blue: {
      text: 'text-blue-400',
      borderStrong: 'border-blue-500/40',
      bg: 'bg-blue-500/10',
      gradient: 'from-blue-500 to-blue-600',
      titleGradient: 'bg-gradient-to-r from-white via-blue-400 to-blue-600 bg-clip-text text-transparent',
      accent: 'accent-blue-500',
      glow: 'bg-blue-500/5',
      btnActive: 'bg-blue-500 text-white shadow-lg scale-105',
      dot: 'bg-blue-500'
    }
  }[modelColor];

  const currentPositive = viewLanguage === 'en' ? prompts.positive_en : prompts.positive_es;
  const rawNegative = viewLanguage === 'en' ? prompts.negative_en : prompts.negative_es;
  const currentNegative = rawNegative ? (activeModel.negativeFormat.prefix ? `${activeModel.negativeFormat.prefix}${rawNegative}` : `${activeModel.negativeFormat.label || 'NEGATIVE: '}${rawNegative}`) : '';
  const combinedFinalPrompt = currentPositive + (currentNegative ? `\n\n${currentNegative}` : '');

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full max-h-2xl bg-indigo-500/10 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md glass rounded-[2.5rem] p-10 border-2 border-indigo-500/30 text-center space-y-8 shadow-3xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto text-indigo-400">
            <Key size={40} />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Configuración de API</h2>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">
              Ingresa tu Gemini API Key para activar los motores de MOGA Studio.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input 
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Ingresa tu API Key aquí..."
                className="w-full bg-slate-950 border-2 border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSaveManualKey}
                disabled={!tempKey.trim()}
                className="w-full py-5 rounded-2xl bg-indigo-500 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-indigo-500/20 hover:bg-indigo-400 active:scale-95 transition-all disabled:opacity-30"
              >
                Activar MOGA Studio
              </button>
              
              {manualApiKey && (
                <button 
                  onClick={() => setHasApiKey(true)}
                  className="w-full py-4 rounded-2xl bg-white/5 text-slate-500 font-black uppercase tracking-widest text-[9px] hover:text-white transition-all"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-left">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tu clave se guarda localmente en tu navegador. Si estás en AI Studio, también puedes usar el selector oficial.
            </p>
            {window.aistudio && (
              <button 
                onClick={handleUseAIStudioSelector}
                className="mt-3 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-all"
              >
                Usar Selector de AI Studio
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden selection:bg-indigo-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute -top-1/4 -right-1/4 w-3/4 h-3/4 ${colorClass.glow} blur-[140px] rounded-full animate-pulse transition-all duration-1000`}></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 md:py-8 pt-[var(--safe-top)]">
        <header className="flex flex-col items-center mb-6">
          <div className="w-full flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
               <button 
                 onClick={handleOpenKeySelector}
                 className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
                 title="Configurar API Key"
               >
                 <Key size={16} />
               </button>
               <Fingerprint className={colorClass.text} size={18} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">MOGA Studio 4.5</span>
            </div>
            <button 
              onClick={() => { triggerHaptic(); setIsVideoDNAOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all active:scale-95"
            >
               <Clapperboard size={14} />
               <span className="text-[9px] font-black uppercase tracking-widest">Universal Video DNA</span>
            </button>
          </div>

          <h1 className={`text-4xl md:text-8xl font-black tracking-tighter uppercase text-center mb-6 leading-none pointer-events-none select-none ${colorClass.titleGradient}`}>
            MOGA STUDIO
          </h1>
          
          <div className="w-full glass rounded-full p-1.5 flex gap-2 overflow-x-auto no-scrollbar border-white/5 shadow-2xl">
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => { triggerHaptic(); setSelectedModel(model.id); }}
                className={`flex-shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-full transition-all duration-300 ${
                  selectedModel === model.id 
                    ? colorClass.btnActive
                    : 'hover:bg-white/5 text-slate-400'
                }`}
              >
                {model.icon}
                <span className="text-[11px] font-black uppercase tracking-wider whitespace-nowrap">{model.name}</span>
              </button>
            ))}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-40">
          <div className="lg:col-span-8 space-y-6">
            <section className={`glass rounded-[2rem] md:rounded-[2.5rem] p-1 border-2 ${colorClass.borderStrong} shadow-2xl relative overflow-hidden`}>
              <div className="scan-effect"></div>
              <div 
                ref={editorRef}
                contentEditable
                className={`w-full min-h-[300px] md:min-h-[350px] bg-transparent px-6 md:px-10 pt-20 pb-8 text-lg md:text-3xl font-light leading-relaxed outline-none overflow-y-auto custom-scrollbar relative z-10`}
                data-placeholder="Inserta tu visión artística aquí..."
              />

              <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-slate-950/60 border-t border-white/5 gap-4 rounded-b-[1.9rem] md:rounded-b-[2.4rem] relative z-20">
                <div className="flex gap-3 overflow-x-auto no-scrollbar w-full md:w-auto">
                  <button onClick={() => { triggerHaptic(); setIsParamsOpen(true); }} className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center flex-shrink-0"><Settings2 size={20} /></button>
                  <div className="flex gap-2">
                    {sourceImages.map((img, i) => img && (
                      <button key={i} onClick={() => insertChip(isVideoMode ? (i === 0 ? 'START' : 'END') : `REF${i+1}`, `[REF${i+1}]`)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${colorClass.bg} ${colorClass.text} ${colorClass.borderStrong} hover:bg-white/10 flex-shrink-0`}>{isVideoMode ? (i === 0 ? 'START' : 'END') : `REF${i+1}`}</button>
                    ))}
                  </div>
                </div>
                <button
                  disabled={isGenerating}
                  onClick={() => handleAIGenerate()}
                  className={`w-full md:w-72 h-14 rounded-full font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95 ${
                    isGenerating ? 'bg-slate-800 text-slate-500' : `bg-gradient-to-br ${colorClass.gradient} text-white shadow-2xl shadow-indigo-500/20`
                  }`}
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                  <span className="text-xs">{isGenerating ? 'Synthesizing...' : 'Generate DNA'}</span>
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES(selectedModel).map(cat => (
                <div key={cat.id} className="glass rounded-[2rem] p-6 md:p-8 border-white/5">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={colorClass.text}>{cat.icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{cat.title_es}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map(item => (
                      <button key={item.value} onClick={() => insertChip(item.label_es, item.value)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-white">{item.label_es}</button>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <section className={`glass rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border-2 ${colorClass.borderStrong} shadow-2xl`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ImageIcon size={18} className={colorClass.text} />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-200">DNA Slots</span>
                </div>
                <button onClick={() => { triggerHaptic(); setPrivacyBlur(!privacyBlur); }} className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">{privacyBlur ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div>

              <div className={`grid ${sourceImages.length > 2 ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                {sourceImages.map((img, i) => (
                  <div key={i} className={`aspect-square rounded-2xl border-2 border-dashed overflow-hidden relative group cursor-pointer transition-all ${img ? colorClass.borderStrong : 'border-slate-800 hover:border-slate-700 hover:bg-white/5'}`}>
                    {img ? (
                      <>
                        <img src={img.data} className={`w-full h-full object-cover transition-all duration-700 ${privacyBlur ? 'blur-2xl brightness-50 scale-110' : ''}`} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                           <button onClick={(e) => { e.stopPropagation(); insertChip(isVideoMode ? (i === 0 ? 'START' : 'END') : `REF${i+1}`, `[REF${i+1}]`); }} className="p-2 bg-white rounded-full text-slate-900 shadow-xl hover:scale-110 active:scale-95 transition-all"><Hash size={14} /></button>
                           <button onClick={(e) => { e.stopPropagation(); triggerHaptic(); const n = [...sourceImages]; n[i] = null; setSourceImages(n); }} className="p-2 bg-rose-600 rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all"><X size={14} /></button>
                        </div>
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[7px] font-black text-white uppercase tracking-widest">{isVideoMode ? (i === 0 ? 'START' : 'END') : `REF ${i+1}`}</div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { triggerHaptic(); setActiveSlot(i); fileInputRef.current?.click(); }}
                            className="w-10 h-10 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-slate-500 hover:text-white flex items-center justify-center"
                          >
                            <Plus size={20} />
                          </button>
                          {!isVideoMode && (
                            <button 
                              onClick={() => { triggerHaptic(); setActiveSlot(i); startCamera(cameraFacing); }}
                              className="w-10 h-10 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-slate-500 hover:text-white flex items-center justify-center"
                            >
                              <Camera size={20} />
                            </button>
                          )}
                        </div>
                        <span className="text-[7px] font-black uppercase text-slate-700 tracking-[0.2em]">{isVideoMode ? (i === 0 ? 'START' : 'END') : `REF ${i+1}`}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedModel === 'seedream' && (
                <div className="mt-6 p-5 glass rounded-[1.5rem] border-rose-500/10 bg-rose-500/5 space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <ShieldAlert size={16} className={manualParams['nsfw_mode'] === 'true' ? 'text-rose-500 animate-pulse' : 'text-slate-600'} />
                         <span className={`text-[9px] font-black uppercase tracking-widest ${manualParams['nsfw_mode'] === 'true' ? 'text-rose-400' : 'text-slate-500'}`}>Biological Mode</span>
                      </div>
                      <button
                         onClick={() => { triggerHaptic(); setManualParams(prev => ({...prev, nsfw_mode: prev['nsfw_mode'] === 'true' ? 'false' : 'true'})); }}
                         className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${manualParams['nsfw_mode'] === 'true' ? 'bg-rose-600' : 'bg-slate-800'}`}
                      >
                         <div className={`w-4 h-4 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${manualParams['nsfw_mode'] === 'true' ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                   </div>
                </div>
              )}
            </section>
          </aside>
        </main>

        {/* NATIVE-LIKE CAMERA MODAL */}
        {isCameraActive && (
          <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={`w-full h-full object-cover transition-opacity duration-300 ${isCapturing ? 'opacity-0' : 'opacity-100'} ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            
            {/* Flash Effect Overlay */}
            <div className={`fixed inset-0 bg-white transition-opacity duration-100 pointer-events-none z-[1100] ${isCapturing ? 'opacity-100' : 'opacity-0'}`} />

            <div className="absolute top-12 left-0 right-0 px-8 flex justify-between items-center z-20 pt-[var(--safe-top)]">
              <button 
                onClick={stopCamera} 
                className="p-4 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20 active:scale-90"
              >
                <X size={24} />
              </button>
              <div className="px-6 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Live DNA Capture</span>
              </div>
              <button 
                onClick={() => {
                  triggerHaptic();
                  const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
                  setCameraFacing(newFacing);
                  startCamera(newFacing);
                }}
                className="p-4 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20 active:scale-90"
              >
                <RefreshCcw size={24} />
              </button>
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center z-20 pb-[var(--safe-bottom)]">
              <button 
                onClick={takePhoto}
                className="w-20 h-20 rounded-full border-4 border-white p-1.5 transition-transform active:scale-90 shadow-[0_0_50px_rgba(255,255,255,0.3)]"
              >
                <div className="w-full h-full bg-white rounded-full" />
              </button>
            </div>
            
            <div className="absolute inset-0 border-[20px] border-black/10 pointer-events-none" />
          </div>
        )}

        {/* MODAL VIDEO DNA */}
        {isVideoDNAOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" onClick={() => setIsVideoDNAOpen(false)}></div>
            <div className="relative w-full max-w-2xl glass rounded-[2.5rem] border-2 border-indigo-500/30 overflow-hidden animate-in zoom-in-95 duration-300 shadow-3xl my-auto">
              <div className="p-6 md:p-10 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Clapperboard size={20} /></div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tighter text-white">Universal Video DNA</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Physics & Dialogue Extraction</p>
                      </div>
                   </div>
                   <button onClick={() => setIsVideoDNAOpen(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10"><X size={18} /></button>
                </div>

                <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
                   <button 
                    onClick={() => { triggerHaptic(); setVideoAnalysisType('visual'); }} 
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${videoAnalysisType === 'visual' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-600'}`}
                   >
                     <ImageIcon size={14} /> Visual
                   </button>
                   <button 
                    onClick={() => { triggerHaptic(); setVideoAnalysisType('dialogue'); }} 
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${videoAnalysisType === 'dialogue' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-600'}`}
                   >
                     <Mic size={14} /> Dialogue
                   </button>
                   <button 
                    onClick={() => { triggerHaptic(); setVideoAnalysisType('both'); }} 
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${videoAnalysisType === 'both' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-600'}`}
                   >
                     <Combine size={14} /> Hybrid
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => !isProcessingVideo && videoInputRef.current?.click()}
                    className={`aspect-video rounded-[1.5rem] border-2 border-dashed overflow-hidden relative group cursor-pointer transition-all ${sourceVideo ? 'border-indigo-500/50' : 'border-slate-800 hover:border-slate-600'}`}
                  >
                    {isProcessingVideo ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                        <Loader2 className="animate-spin text-indigo-500 mb-2" size={28} />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Extracting DNA...</span>
                      </div>
                    ) : sourceVideo ? (
                      <>
                        <video src={sourceVideo.data} className="w-full h-full object-cover brightness-50" muted loop autoPlay />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                           <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-2xl mb-2"><Play size={16} fill="white" /></div>
                           <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Media Ready</span>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-4">
                        <Plus size={28} className="text-slate-800" />
                        <span className="text-[9px] font-black uppercase text-slate-600 tracking-[0.3em]">Load Clip</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                     <textarea 
                        value={videoIdea}
                        onChange={(e) => setVideoIdea(e.target.value)}
                        placeholder={videoAnalysisType === 'dialogue' ? "Contexto o idioma específico..." : "Instrucciones de transformación..."}
                        className="flex-1 bg-slate-900/50 border-2 border-white/5 rounded-2xl p-5 text-sm font-medium text-indigo-100 outline-none focus:border-indigo-500/30 transition-all resize-none custom-scrollbar placeholder:text-slate-700"
                     />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button onClick={() => { triggerHaptic(); setSourceVideo(null); setVideoIdea(''); }} className="flex-1 h-14 rounded-2xl border-2 border-white/5 font-black uppercase tracking-widest text-[9px] text-slate-500">Reset</button>
                  <button 
                    disabled={!sourceVideo || isGenerating || isProcessingVideo}
                    onClick={() => handleAIGenerate(true)}
                    className="flex-[2] h-14 rounded-2xl bg-indigo-500 text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                    <span>{isGenerating ? 'Analyzing...' : `EXTRACT DNA`}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS BOTTOM SHEET */}
        <div className={`fixed bottom-0 left-0 right-0 z-[100] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isStudioOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px-var(--safe-bottom))]'}`}>
          <div className="flex justify-center -mb-px">
             <button onClick={() => { triggerHaptic(); setIsStudioOpen(!isStudioOpen); }} className="glass px-20 md:px-24 py-4 rounded-t-[2.5rem] md:rounded-t-[3rem] border-b-0 text-slate-500 hover:text-white transition-all shadow-2xl">
                <ChevronDown size={28} className={`transition-transform duration-700 ${isStudioOpen ? '' : 'rotate-180'}`} />
             </button>
          </div>
          <div className="glass p-6 md:p-12 border-x-0 border-b-0 backdrop-blur-[100px] max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl pb-[calc(2rem+var(--safe-bottom))]">
            <div className="max-w-7xl mx-auto space-y-8 md:y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                 <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${colorClass.dot} animate-pulse`}></div>
                    <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${colorClass.text}`}>SYNTHESIS READY</span>
                 </div>
                 <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-white/10">
                   <button onClick={() => { triggerHaptic(); setViewLanguage('en'); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewLanguage === 'en' ? colorClass.btnActive : 'text-slate-600'}`}>English</button>
                   <button onClick={() => { triggerHaptic(); setViewLanguage('es'); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewLanguage === 'es' ? colorClass.btnActive : 'text-slate-600'}`}>Español</button>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                <div className="lg:col-span-8 space-y-6 md:space-y-8">
                   <textarea value={currentPositive} readOnly className={`w-full h-48 md:h-96 bg-slate-950/40 border-2 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-lg md:text-3xl font-light text-slate-100 outline-none resize-none leading-relaxed custom-scrollbar ${colorClass.borderStrong}`} />
                   {showNegative && currentNegative && (
                     <div className="p-6 md:p-10 bg-rose-500/5 border-2 border-rose-500/10 rounded-[1.5rem] md:rounded-[2.5rem]">
                        <p className="text-xs md:text-base font-mono text-rose-400/60 leading-relaxed italic select-all">{currentNegative}</p>
                     </div>
                   )}
                </div>
                <div className="lg:col-span-4 space-y-4 md:space-y-5">
                   <button onClick={() => handleCopy(combinedFinalPrompt, 'all')} className={`w-full py-8 md:py-12 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center gap-4 font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${copiedId === 'all' ? 'bg-emerald-500' : `bg-gradient-to-br ${colorClass.gradient}`} text-white shadow-2xl`}>
                     {copiedId === 'all' ? <Check size={32} /> : <Share2 size={32} />}
                     <span className="text-[9px]">{copiedId === 'all' ? 'Copied' : 'Copy Sequence'}</span>
                   </button>
                   <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => { triggerHaptic(); setShowNegative(!showNegative); }} className={`h-16 glass rounded-2xl flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest transition-all ${showNegative ? 'text-rose-400 border-rose-500/20 shadow-lg' : 'text-slate-600'}`}><Eye size={18} /> Neg</button>
                      <button onClick={async () => { triggerHaptic(); setIsImproving(true); try { setPrompts(await improveExistingPrompt(currentPositive, selectedModel, manualApiKey)); } finally { setIsImproving(false); } }} className="h-16 glass rounded-2xl flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-500 active:scale-95">{isImproving ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />} Refine</button>
                   </div>
                   <button 
                    onClick={() => {
                      triggerHaptic('heavy');
                      if (editorRef.current) {
                        const content = document.createTextNode(currentPositive);
                        editorRef.current.appendChild(content);
                        editorRef.current.focus();
                        setIsStudioOpen(false);
                      }
                    }}
                    className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2"
                   >
                     <Plus size={16} /> Inject to Editor
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PARAMS MODAL */}
        <div className={`fixed inset-0 z-[600] transition-opacity duration-300 ${isParamsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsParamsOpen(false)}></div>
          <div className={`absolute top-0 right-0 h-full w-full max-w-sm glass border-l border-white/10 transition-transform duration-500 shadow-2xl ${isParamsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="h-full flex flex-col p-8 md:p-10 overflow-y-auto custom-scrollbar pt-[calc(2rem+var(--safe-top))] pb-[calc(2rem+var(--safe-bottom))]">
                <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <Key className={colorClass.text} size={20} />
                    <span className="font-black uppercase tracking-[0.3em] text-xs">API & Engine Params</span>
                  </div>
                  <button onClick={() => setIsParamsOpen(false)} className="p-3 bg-white/5 rounded-full"><X size={18} /></button>
                </div>

                <div className="space-y-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Manual API Key</label>
                      <div className="flex gap-2">
                        <input 
                          type="password"
                          value={manualApiKey}
                          onChange={(e) => {
                            const val = e.target.value;
                            setManualApiKey(val);
                            localStorage.setItem('moga_api_key', val);
                          }}
                          placeholder="Tu API Key..."
                          className="flex-1 bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-indigo-500/30 transition-all"
                        />
                        <button 
                          onClick={() => {
                            localStorage.removeItem('moga_api_key');
                            setManualApiKey('');
                            setHasApiKey(false);
                          }}
                          className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500/20 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                   </div>

                   {activeModel.parameters?.map(p => (
                      <div key={p.id} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className={`text-[10px] font-black uppercase tracking-[0.2em] text-slate-400`}>{p.label_es}</label>
                          {p.type === 'slider' && <span className={`text-[10px] font-mono font-bold ${colorClass.text} bg-white/5 px-2 py-1 rounded-md`}>{manualParams[p.id]}</span>}
                        </div>
                        {p.type === 'select' ? (
                          <div className="relative">
                            <select value={manualParams[p.id] || p.defaultValue} onChange={(e) => { triggerHaptic(); setManualParams(prev => ({...prev, [p.id]: e.target.value})); }} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-xs font-bold outline-none appearance-none cursor-pointer">
                              {p.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={16} />
                          </div>
                        ) : p.type === 'toggle' ? (
                          <button onClick={() => { triggerHaptic(); setManualParams(prev => ({...prev, [p.id]: prev[p.id] === 'true' ? 'false' : 'true'})); }} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${manualParams[p.id] === 'true' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-white/5 border-white/5'}`}>
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${manualParams[p.id] === 'true' ? 'text-rose-400' : 'text-slate-600'}`}>{manualParams[p.id] === 'true' ? 'ACTIVO' : 'INACTIVO'}</span>
                            <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-all ${manualParams[p.id] === 'true' ? 'bg-rose-600 justify-end' : 'bg-slate-800 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full"></div></div>
                          </button>
                        ) : (
                          <div className="px-1"><input type="range" min={p.min} max={p.max} step={p.step} value={manualParams[p.id] || p.defaultValue} onChange={(e) => setManualParams(prev => ({...prev, [p.id]: e.target.value}))} className={`w-full h-1.5 rounded-full appearance-none bg-slate-800 ${colorClass.accent} cursor-pointer`} /></div>
                        )}
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

      </div>

      {error && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1100] bg-rose-600 text-white px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-5 animate-in slide-in-from-top-12 max-w-[90vw]">
          <AlertTriangle size={20} className="flex-shrink-0" /> <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-2 hover:bg-white/10 rounded-full flex-shrink-0"><X size={18} /></button>
        </div>
      )}
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const f = e.target.files?.[0];
        if(f) {
          const r = new FileReader();
          r.onload = () => {
            const next = [...sourceImages];
            if(activeSlot !== null) next[activeSlot] = { data: r.result as string, mime: f.type };
            else next.push({ data: r.result as string, mime: f.type });
            setSourceImages(next);
            setActiveSlot(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
          };
          r.readAsDataURL(f);
        }
      }} />

      <input 
        type="file" 
        ref={videoInputRef} 
        className="hidden" 
        accept="video/*" 
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if(f) {
            setIsProcessingVideo(true);
            setError(null);
            try {
              const frames = await extractFrames(f);
              const r = new FileReader();
              r.onload = () => {
                setSourceVideo({ data: r.result as string, mime: f.type, frames, size: f.size });
                setIsProcessingVideo(false);
              };
              r.readAsDataURL(f);
            } catch (err: any) {
              setError(err.message || "Error al procesar el video.");
              setIsProcessingVideo(false);
            } finally {
              if(videoInputRef.current) videoInputRef.current.value = "";
            }
          }
        }} 
      />
    </div>
  );
};

export default App;
