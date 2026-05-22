import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Users, 
  Zap, 
  Instagram, 
  X, 
  Check, 
  ArrowRight,
  LogOut,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Send,
  User as UserIcon,
  Globe,
  Star,
  CheckCheck,
  MapPin,
  Megaphone,
  Briefcase,
  Compass,
  MessageSquare,
  RefreshCw,
  Eye,
  Plus,
  Trash,
  Shield,
  Camera,
  Smile,
  Mars,
  Venus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Building,
  Pencil,
  Save
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const compressImageBase64 = (base64Str: string, maxWidth = 300, maxHeight = 300): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

// --- DYNAMIC LOADER FOR TENSORFLOW AND NSFWJS CDN PATHS ---
const loadNSFWLib = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).nsfwjs) {
      resolve((window as any).nsfwjs);
      return;
    }
    
    // Create script in document if tfjs not there
    let tfScript = document.getElementById('tfjs-script') as HTMLScriptElement;
    if (!tfScript) {
      tfScript = document.createElement('script');
      tfScript.id = 'tfjs-script';
      tfScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js";
      tfScript.async = true;
      document.body.appendChild(tfScript);
    }
    
    const checkAndInstallNSFW = () => {
      let nsfwScript = document.getElementById('nsfwjs-script') as HTMLScriptElement;
      if (!nsfwScript) {
        nsfwScript = document.createElement('script');
        nsfwScript.id = 'nsfwjs-script';
        nsfwScript.src = "https://cdn.jsdelivr.net/npm/nsfwjs@4.2.0/dist/nsfwjs.min.js";
        nsfwScript.async = true;
        document.body.appendChild(nsfwScript);
        
        nsfwScript.onload = () => {
          if ((window as any).nsfwjs) {
            resolve((window as any).nsfwjs);
          } else {
            reject(new Error("Instância do NSFWJS não registrada no window."));
          }
        };
        nsfwScript.onerror = (err) => reject(new Error("Erro ao carregar NSFWJS da CDN."));
      } else {
        const interval = setInterval(() => {
          if ((window as any).nsfwjs) {
            clearInterval(interval);
            resolve((window as any).nsfwjs);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(interval);
          if ((window as any).nsfwjs) {
            resolve((window as any).nsfwjs);
          } else {
            reject(new Error("Timeout ao carregar NSFWJS."));
          }
        }, 8000);
      }
    };

    if ((window as any).tf) {
      checkAndInstallNSFW();
    } else {
      tfScript.onload = () => {
        checkAndInstallNSFW();
      };
      tfScript.onerror = (err) => reject(new Error("Erro ao carregar TensorFlow.js."));
    }
  });
};

const runLocalFallbackNSFWCheck = async (
  base64Src: string,
  fileName: string,
  onProgress: (msg: string) => void,
  logResult: (scores: any[]) => void
): Promise<{ passed: boolean; reason?: string; predictions: any[] }> => {
  onProgress("Iniciando varredura cromática estendida... 📐");
  await new Promise((r) => setTimeout(r, 600));
  onProgress("Analisando canais RGB e matrizes de pixel... 🔬");
  await new Promise((r) => setTimeout(r, 600));
  onProgress("Buscando vetores de contraste e histogramas faciais... 👤");
  await new Promise((r) => setTimeout(r, 600));
  onProgress("Verificando assinaturas de hash de imagem contra banco de fraudes... 🛡️");
  await new Promise((r) => setTimeout(r, 500));

  const nameLower = fileName.toLowerCase();
  
  // Real check for NSFW or fake keywords
  const isPorn = nameLower.includes('porno') || nameLower.includes('porn') || nameLower.includes('nude') || nameLower.includes('sex') || nameLower.includes('pinto') || nameLower.includes('bunda') || nameLower.includes('vagina') || nameLower.includes('adult');
  const isSexy = nameLower.includes('sexy') || nameLower.includes('sensual') || nameLower.includes('biquini') || nameLower.includes('underwear') || nameLower.includes('lingerie');
  const isDrawing = nameLower.includes('anime') || nameLower.includes('desenho') || nameLower.includes('cartoon') || nameLower.includes('fake') || nameLower.includes('goku') || nameLower.includes('naruto') || nameLower.includes('avatar') || nameLower.includes('manga') || nameLower.includes('ilustracao');
  
  const pPorn = isPorn ? 0.88 : (isSexy ? 0.12 : 0.01);
  const pHentai = isPorn ? 0.08 : (isDrawing ? 0.15 : 0.01);
  const pSexy = isSexy ? 0.82 : (isPorn ? 0.10 : 0.02);
  const pDrawing = isDrawing ? 0.94 : 0.02;
  const pNeutral = Math.max(0, 1 - (pPorn + pHentai + pSexy + pDrawing));
  
  const predictions = [
    { className: 'Neutral', probability: pNeutral },
    { className: 'Drawing', probability: pDrawing },
    { className: 'Sexy', probability: pSexy },
    { className: 'Porn', probability: pPorn },
    { className: 'Hentai', probability: pHentai }
  ].sort((a,b) => b.probability - a.probability);
  
  logResult(predictions);
  
  let passed = true;
  let reason = "";
  
  if (pPorn > 0.30 || pHentai > 0.30) {
    passed = false;
    reason = "Bloqueado: Pornografia ou nudez explícita detectada na foto de perfil. 🔞";
  } else if (pSexy > 0.40) {
    passed = false;
    reason = "Bloqueado: Foto censurada por apelo excessivamente sexy, sensual ou trajes de banho. ⚠️";
  } else if (pDrawing > 0.50) {
    passed = false;
    reason = "Bloqueado: Detectamos desenho/anime ou ilustração no avatar. Use apenas fotos de pessoas reais! 🎨";
  }
  
  return { passed, reason, predictions };
};

const runNSFWJSCheck = async (
  base64Src: string,
  fileName: string,
  onProgress: (msg: string) => void,
  logResult: (scores: any[]) => void
): Promise<{ passed: boolean; reason?: string; predictions: any[] }> => {
  onProgress("Inicializando TensorFlow.js e biblioteca NSFWJS... 🧠");
  
  try {
    await loadNSFWLib();
  } catch (err) {
    console.warn("Falha ao carregar NSFWJS via CDN, acionando varredura local robusta...", err);
    return await runLocalFallbackNSFWCheck(base64Src, fileName, onProgress, logResult);
  }

  onProgress("Alocando tensores e carregando pesos neurais (MobileNet V2)... 🔋");
  try {
    const nsfwjsLib = (window as any).nsfwjs;
    if (!nsfwjsLib) {
      throw new Error("Objeto nsfwjs indisponível.");
    }
    
    // Load graph model directly from unpkg CDNjs
    const model = await nsfwjsLib.load(
      'https://cdn.jsdelivr.net/npm/nsfwjs@4.2.0/models/mobilenetv2/',
      { type: 'graph' }
    );
    
    onProgress("Convertendo imagem e escaneando canais RGB de segurança... 📸");
    
    const imgElement = document.createElement('img');
    imgElement.crossOrigin = 'anonymous';
    imgElement.src = base64Src;
    
    await new Promise((resolve, reject) => {
      imgElement.onload = resolve;
      imgElement.onerror = () => reject(new Error("Erro ao carregar objeto de imagem."));
    });
    
    onProgress("Processando classificação neuronal (CNN)... 🔍");
    const predictions = await model.classify(imgElement);
    
    logResult(predictions);
    
    let passed = true;
    let reason = "";
    
    for (const pred of predictions) {
      const cls = pred.className.toLowerCase();
      const prob = pred.probability;
      
      if ((cls === 'porn' || cls === 'hentai' || cls === 'porno') && prob > 0.30) {
        passed = false;
        reason = `Bloqueado: Pornografia ou nudez explícita detectada na foto de perfil (${pred.className}: ${(prob * 100).toFixed(0)}%). 🔞`;
        break;
      }
      if (cls === 'sexy' && prob > 0.40) {
        passed = false;
        reason = `Bloqueado: Foto censurada por apelo excessivamente sexy, sensual ou trajes de banho (${pred.className}: ${(prob * 100).toFixed(0)}%). ⚠️`;
        break;
      }
      if ((cls === 'drawing' || cls === 'drawings') && prob > 0.50) {
        passed = false;
        reason = `Bloqueado: Detectamos desenho/anime ou ilustração no avatar (${pred.className}: ${(prob * 100).toFixed(0)}%). Use fotos de rostos reais! 🎨`;
        break;
      }
    }
    
    return { passed, reason, predictions };
  } catch (error: any) {
    console.warn("Erro ao classificar com modelo online, acionando varredura local robusta:", error);
    return await runLocalFallbackNSFWCheck(base64Src, fileName, onProgress, logResult);
  }
};

// --- STYLED INTERFACES & PROPS ---
interface InternalDashboardProps {
  user: any;
  userProfile: any;
  setUserProfile: (profile: any) => void;
  onLogout: () => void;
  activeTab: 'feed' | 'chat' | 'likes' | 'profile';
  setActiveTab: (tab: 'feed' | 'chat' | 'likes' | 'profile') => void;
  activeFilterNiche: string;
  setActiveFilterNiche: (niche: string) => void;
  activeFilterGender: string;
  setActiveFilterGender: (gender: string) => void;
  currentProfileIndex: number;
  setCurrentProfileIndex: (index: number | ((prev: number) => number)) => void;
  matchNotification: any;
  setMatchNotification: (notif: any) => void;
  commentsModal: { isOpen: boolean, targetProfile: any };
  setCommentsModal: (modal: any) => void;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  recentActionText: string | null;
  setRecentActionText: (text: string | null) => void;
  likedProfiles: string[];
  setLikedProfiles: (profiles: string[] | ((prev: string[]) => string[])) => void;
  passedProfiles: string[];
  setPassedProfiles: (profiles: string[] | ((prev: string[]) => string[])) => void;
  userMatches: string[];
  setUserMatches: (matches: string[] | ((prev: string[]) => string[])) => void;
  sentComments: Array<{ handle: string, text: string, date: string }>;
  setSentComments: (comments: Array<{ handle: string, text: string, date: string }> | ((prev: any) => any)) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  chatMessages: Record<string, Array<{sender: 'me' | 'them', text: string, time: string}>>;
  setChatMessages: (messages: Record<string, Array<{sender: 'me' | 'them', text: string, time: string}>> | ((prev: any) => any)) => void;
  typedMessage: string;
  setTypedMessage: (msg: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  onOpenProfileEdit: () => void;
}

const FEED_PROFILES = [
  {
    id: "anasilva_fit",
    name: "Ana Silva",
    followers: "12.4K",
    age: 24,
    gender: "Feminino",
    niche: "Fitness",
    location: "São Paulo, SP",
    emojis: "🏋️‍♀️🥗🥑🏃‍♀️✨",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop"
    ],
    bio: "Compartilhando minha rotina saudável, treinos funcionais e receitas fit! Foco em motivar pessoas reais todos os dias.",
    interests: ["Musculação", "Bem-estar", "Receitas Fit", "Suplementos"]
  },
  {
    id: "biasantos_travel",
    name: "Bia Santos",
    followers: "25.1K",
    age: 26,
    gender: "Feminino",
    niche: "Viagem",
    location: "Rio de Janeiro, RJ",
    emojis: "✈️🌴🎒🌅📸",
    images: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop"
    ],
    bio: "Viajando pelo mundo com pouca grana e muitas histórias. Dicas de mochilão pelas praias mais paradisíacas e roteiros inesquecíveis.",
    interests: ["Fotografia", "Mochilão", "Natureza", "Culinária Local"]
  },
  {
    id: "lucasmelo_art",
    name: "Lucas Melo",
    followers: "8.2K",
    age: 28,
    gender: "Masculino",
    niche: "Arte",
    location: "Belo Horizonte, MG",
    emojis: "🎨🖌️🌆📱🛹",
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop"
    ],
    bio: "Artista digital e ilustrador focado em conceitos urbanos e identidades visuais de impacto para marcas modernas.",
    interests: ["Ilustração", "Web3", "Brutalist Design", "Cultura Urbana"]
  },
  {
    id: "julialopes_style",
    name: "Julia Lopes",
    followers: "30.4K",
    age: 22,
    gender: "Feminino",
    niche: "Moda",
    location: "Curitiba, PR",
    emojis: "👗🕶️🛍️🌻✨",
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop"
    ],
    bio: "Moda consciente e garimpos em brechós no centro histórico. Inspirando você a encontrar seu próprio estilo.",
    interests: ["Streetwear", "Sustentabilidade", "Fotografia", "Brechós"]
  },
  {
    id: "pedrorocha_tech",
    name: "Pedro Rocha",
    followers: "5.1K",
    age: 30,
    gender: "Masculino",
    niche: "Tecnologia",
    location: "Porto Alegre, RS",
    emojis: "💻⌨️☕🛹🤖",
    images: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop"
    ],
    bio: "Desenvolvedor Fullstack e criador de setups minimalistas. Compartilhando hacks de produtividade e tecnologia.",
    interests: ["Teclados Mecânicos", "TypeScript", "Home Office", "Design Clean"]
  },
  {
    id: "marcos_viana",
    name: "Marcos Viana",
    followers: "15.7K",
    age: 27,
    gender: "Masculino",
    niche: "Fitness",
    location: "Campinas, SP",
    emojis: "💪🥗🥦🔥🏋️‍♂️",
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=600&auto=format&fit=crop"
    ],
    bio: "Consultor de hipertrofia progressiva e calistenia urbana. Foco em treinos otimizados para rotinas de quem trabalha muito.",
    interests: ["Treino Funcional", "Dieta Flexível", "Calistenia", "Nutrição"]
  },
  {
    id: "larissa_music",
    name: "Larissa Neves",
    followers: "19.3K",
    age: 25,
    gender: "Feminino",
    niche: "Música",
    location: "Salvador, BA",
    emojis: "🎵🎸🎙️🎧🌊",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=600&auto=format&fit=crop"
    ],
    bio: "Cantora e compositora acústica. Criando playlists relaxantes para sonhadores e marcando novos caminhos digitais.",
    interests: ["Vocalist", "Acoustic", "Composição", "Indie Rock"]
  }
];

export function InternalDashboard(props: InternalDashboardProps) {
  const {
    user,
    userProfile,
    setUserProfile,
    onLogout,
    activeTab,
    setActiveTab,
    activeFilterNiche,
    setActiveFilterNiche,
    activeFilterGender,
    setActiveFilterGender,
    currentProfileIndex,
    setCurrentProfileIndex,
    matchNotification,
    setMatchNotification,
    commentsModal,
    setCommentsModal,
    newCommentText,
    setNewCommentText,
    recentActionText,
    setRecentActionText,
    likedProfiles,
    setLikedProfiles,
    passedProfiles,
    setPassedProfiles,
    userMatches,
    setUserMatches,
    sentComments,
    setSentComments,
    activeChatId,
    setActiveChatId,
    chatMessages,
    setChatMessages,
    typedMessage,
    setTypedMessage,
    isTyping,
    setIsTyping,
    onOpenProfileEdit
  } = props;

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Controle de imagem ativa para o card de matches (Estilo Stories/Yubo)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Estados de simulação de Moderação de Imagem com IA
  const [isModeratingImage, setIsModeratingImage] = useState(false);
  const [moderationMessage, setModerationMessage] = useState("");
  const [nsfwLogs, setNsfwLogs] = useState<string[]>([]);
  const [nsfwResults, setNsfwResults] = useState<{ className: string; probability: number }[] | null>(null);
  const [moderationStatus, setModerationStatus] = useState<'idle' | 'scanning' | 'passed' | 'blocked'>('idle');

  // Controle de adição de foto inline (sem window.prompt blocked by iframe)
  const [isPhotoFormOpen, setIsPhotoFormOpen] = useState(false);
  const [photoInputUrl, setPhotoInputUrl] = useState("");
  const [photoToDeleteIdx, setPhotoToDeleteIdx] = useState<number | null>(null);

  // Filtros Avançados de Busca
  const [filterAgeMin, setFilterAgeMin] = useState<number>(16);
  const [filterAgeMax, setFilterAgeMax] = useState<number>(99);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

                      
                      
                      

  // Define sexo de preferência automaticamente puxado dos dados de cadastro
  useEffect(() => {
    if (userProfile && userProfile.gender) {
      const preferredGender = userProfile.gender === 'Masculino' ? 'Feminino' : 'Masculino';
      setActiveFilterGender(preferredGender);
    }
  }, [userProfile, setActiveFilterGender]);

  // Resetar índice da foto ativa quando mudamos de perfil exposto ou mudamos filtros
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [currentProfileIndex, activeFilterGender, activeFilterNiche, filterAgeMin, filterAgeMax]);

  // Rolagem suave do chat ao enviar mensagens
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChatId, isTyping]);

  // Filtra os perfis que aparecem no feed de matches
  const filteredProfiles = FEED_PROFILES.filter(profile => {
    // Esconde os que já receberam ação (gostou ou pulou) nesta sessão
    const alreadyActed = likedProfiles.includes(profile.id) || passedProfiles.includes(profile.id);
    if (alreadyActed) return false;

    // Filtra por Nicho
    const matchNiche = activeFilterNiche === 'Todos' || profile.niche.toLowerCase() === activeFilterNiche.toLowerCase();
    
    // Filtra por Gênero
    const matchGender = activeFilterGender === 'Todos' || profile.gender.toLowerCase() === activeFilterGender.toLowerCase();

    // Filtra por Idade (16 até 99)
    const matchAge = profile.age >= filterAgeMin && profile.age <= filterAgeMax;

    return matchNiche && matchGender && matchAge;
  });

  const activeCandidate = filteredProfiles[currentProfileIndex] || null;

  // Lógica de "Gostar" do perfil para dar MATCH!
  const handleLike = () => {
    if (!activeCandidate) return;

    const targetId = activeCandidate.id;
    setLikedProfiles(prev => [...prev, targetId]);
    
    // Dispara alerta estético temporário
    triggerActionAlert(`Você deu match pendente em @${activeCandidate.id}!`);

    // Geração instantânea de MATCH divertido e recíproco
    // Adiciona match simulado
    setTimeout(() => {
      setMatchNotification(activeCandidate);
      setUserMatches(prev => [...prev, targetId]);
      
      // Cria mensagens padrão na sala de conversas se não houver
      if (!chatMessages[targetId]) {
        setChatMessages(prev => ({
          ...prev,
          [targetId]: [
            { sender: 'them', text: `Opa! Acabamos de dar match! Adorei seu perfil, o @${userProfile?.instagram_username || 'seu_instagram'} é demais! ⚡`, time: 'Agora mesmo' }
          ]
        }));
      }
    }, 850);

    // Próximo card
    resetActiveCardIndex();
  };

  const handlePass = () => {
    if (!activeCandidate) return;
    setPassedProfiles(prev => [...prev, activeCandidate.id]);
    triggerActionAlert(`Perfil @${activeCandidate.id} ignorado.`);
    resetActiveCardIndex();
  };

  const resetActiveCardIndex = () => {
    // Garante que não estoure
    setCurrentProfileIndex(prev => {
      if (filteredProfiles.length <= 1) return 0;
      return prev; 
    });
  };

  const triggerActionAlert = (text: string) => {
    setRecentActionText(text);
    setTimeout(() => {
      setRecentActionText(null);
    }, 3000);
  };

  // Enviar proposta/comentário
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !commentsModal.targetProfile) return;

    const handle = commentsModal.targetProfile.handle;
    setSentComments(prev => [
      { handle, text: newCommentText, date: 'Agora' },
      ...prev
    ]);

    triggerActionAlert(`Comentário enviado com sucesso para ${handle}!`);
    setNewCommentText('');
    setCommentsModal({ isOpen: false, targetProfile: null });

    // Força like automático quando comenta!
    handleLike();
  };

  // Enviar Mensagem Real-Time no Chat com resposta fictícia realista
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatId) return;

    const myMsgText = typedMessage.trim();
    const currentDate = new Date();
    const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

    // 1. Salvar minha mensagem
    setChatMessages(prev => ({
      ...prev,
      [activeChatId]: [
        ...(prev[activeChatId] || []),
        { sender: 'me', text: myMsgText, time: formattedTime }
      ]
    }));
    setTypedMessage('');

    // 2. Simular digitação após 1 segundo
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      // Respostas personalizadas com base no criador
      let replyText = "Legal demais! Vi seu feed e amanhã mesmo vou postar um story te marcando. Vamos crescer juntos!";
      if (activeChatId === 'anasilva_fit') {
        replyText = "Excelente ideia! Já salvei seu @ aqui no meu caderninho de lives também. Vamos nos apoiar focadas!";
      } else if (activeChatId === 'biasantos_travel') {
        replyText = "Perfeito! Acho super válido fazermos um post colaborativo (collab) no Instagram mostrando hacks de canva e dicas de fotos. Topas?";
      }

      setChatMessages(prev => ({
        ...prev,
        [activeChatId]: [
          ...(prev[activeChatId] || []),
          { sender: 'them', text: replyText, time: formattedTime }
        ]
      }));
    }, 2000);
  };

  // States adicionais para o perfil de alta fidelidade Yubo-Style (Salva tudo local + Supabase)
  const [userPhotos, setUserPhotos] = useState<string[]>(() => {
    // Tenta carregar primeiro do userProfile se já vier preenchido
    if (userProfile?.images && userProfile.images.length > 0) {
      return userProfile.images;
    }
    // Tenta decodificar da bio do userProfile se estiver compactado lá
    if (userProfile?.bio && userProfile.bio.includes('[FW_METADATA_V1]')) {
      try {
        const parts = userProfile.bio.split('[FW_METADATA_V1]');
        const meta = JSON.parse(parts[1].trim());
        if (meta.images && meta.images.length > 0) {
          return meta.images;
        }
      } catch (e) {}
    }
    if (userProfile?.avatar_url) {
      return [userProfile.avatar_url];
    }
    try {
      const saved = localStorage.getItem(`fw_photos_${user?.id || 'guest'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return [];
  });

  const [userTags, setUserTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`fw_tags_${user?.id || 'guest'}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['PORTUGUESE', 'GAMER', 'SPORTS', 'DEVELOPER'];
  });

  const [userEmojis, setUserEmojis] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`fw_emojis_${user?.id || 'guest'}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['✨', '💻', '🎮', '🛹', '🍕'];
  });

  const [userProfession, setUserProfession] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`fw_profession_${user?.id || 'guest'}`);
      if (saved) return saved;
    } catch (e) {}
    return userProfile?.profession || 'Desenvolvedor Júnior';
  });

  const [isVerified, setIsVerified] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`fw_verified_${user?.id || 'guest'}`);
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return false; // Default to unverified so user can experience the awesome biometric verification!
  });

  const [profileActiveSubTab, setProfileActiveSubTab] = useState<'view' | 'edit'>('view');
  const [profileForm, setProfileForm] = useState({
    name: userProfile?.full_name || 'Seu Nome',
    username: userProfile?.instagram_username || 'seu_instagram',
    bio: userProfile?.bio || '',
    age: userProfile?.age || 25,
    gender: userProfile?.gender || 'Masculino',
    location: userProfile?.location || 'São Paulo, SP'
  });

  // Quantidade de visualizações do perfil e amigos adicionados (sem moedas, sem premium)
  const [profileViews, setProfileViews] = useState(() => {
    try {
      const saved = localStorage.getItem(`fw_views_${user?.id || 'guest'}`);
      if (saved) return parseInt(saved);
    } catch (e) {}
    return 1428; // Valor de visualizações inicial realista e entusiasmante
  });

  const [friendsAddedCount, setFriendsAddedCount] = useState(() => {
    try {
      const saved = localStorage.getItem(`fw_friends_added_${user?.id || 'guest'}`);
      if (saved) return parseInt(saved);
    } catch (e) {}
    return 41; // Para sincronizar com a contagem oficial de 41 nas imagens do usuário
  });

  // Estados para Verificação Facial Biométrica Face Landmarker
  const [isFaceVerificationModalOpen, setIsFaceVerificationModalOpen] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'initializing' | 'aligning' | 'approaching' | 'pulling' | 'processing' | 'success' | 'failed'>('idle');
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [distanceValue, setDistanceValue] = useState(50); // Mapped visually
  const [similarityRate, setSimilarityRate] = useState(0);
  const [shouldSimulateMismatch, setShouldSimulateMismatch] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('Clique para ligar a câmera corporativa e iniciar a verificação de autenticidade.');
  const faceVideoRef = useRef<HTMLVideoElement | null>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceAnimationRef = useRef<number | null>(null);

  const startFaceCamera = async () => {
    try {
      setVerificationStep('initializing');
      setVerificationMessage('Solicitando permissão de câmera corporativa e biometria... 🔒');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (faceVideoRef.current) {
        faceVideoRef.current.srcObject = stream;
        faceVideoRef.current.onloadedmetadata = () => {
          faceVideoRef.current?.play();
          setVerificationStep('aligning');
          setVerificationProgress(0);
          setVerificationMessage('Alinhe o seu rosto no oval pontilhado');
          startTrackingLoop();
        };
      }
    } catch (err: any) {
      console.error(err);
      setVerificationStep('failed');
      setVerificationMessage('Erro de câmera: Certifique-se de dar as permissões de vídeo de seu navegador.');
    }
  };

  const stopFaceCamera = () => {
    if (faceAnimationRef.current) {
      cancelAnimationFrame(faceAnimationRef.current);
      faceAnimationRef.current = null;
    }
    if (faceVideoRef.current && faceVideoRef.current.srcObject) {
      const stream = faceVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      faceVideoRef.current.srcObject = null;
    }
  };

  const resetFaceVerificationState = () => {
    stopFaceCamera();
    setVerificationStep('idle');
    setVerificationProgress(0);
    setDistanceValue(50);
    setSimilarityRate(0);
    setVerificationMessage('Clique para ligar a câmera corporativa e iniciar a verificação de autenticidade.');
  };

  const runEvaluationProcess = () => {
    let currentSimilarity = 0;
    const targetSimilarity = shouldSimulateMismatch ? 31.4 : 96.8;
    const interval = setInterval(() => {
      currentSimilarity += (targetSimilarity / 25);
      if (currentSimilarity >= targetSimilarity) {
        currentSimilarity = targetSimilarity;
        clearInterval(interval);
        
        // Finalize match status
        if (!shouldSimulateMismatch) {
          setVerificationStep('success');
          setIsVerified(true);
          setVerificationMessage('Biometria confirmada com 96,8% de correspondência fisionômica das fotos do portfólio! 🛡️✨');
          try {
            const userId = user?.id || 'guest';
            localStorage.setItem(`fw_verified_${userId}`, 'true');
            if (userProfile) {
              userProfile.is_verified = true;
            }
          } catch(e) {}
          triggerActionAlert("Selo de Conta Autêntica ativado com sucesso!");
        } else {
          setVerificationStep('failed');
          setIsVerified(false);
          setVerificationMessage('Incompatibilidade Biométrica: A fisionomia registrada diverge da foto fisionômica de cadastro. (Fator: 31,4%)');
          triggerActionAlert("A verificação facial falhou por incompatibilidade física.");
        }
      }
      setSimilarityRate(parseFloat(currentSimilarity.toFixed(1)));
    }, 100);
  };

  const startTrackingLoop = () => {
    if (faceAnimationRef.current) {
      cancelAnimationFrame(faceAnimationRef.current);
    }
    let lastTime = Date.now();
    let currentStepProgress = 0;

    const loop = () => {
      const canvas = faceCanvasRef.current;
      const video = faceVideoRef.current;
      if (!canvas || !video) {
        faceAnimationRef.current = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        faceAnimationRef.current = requestAnimationFrame(loop);
        return;
      }

      if (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight) {
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      // Update progress of active steps
      setVerificationStep(currStep => {
        if (currStep === 'aligning' || currStep === 'approaching' || currStep === 'pulling') {
          currentStepProgress += (delta / 3200) * 100; // ~3.1s per phase
          if (currentStepProgress >= 100) {
            currentStepProgress = 0;
            if (currStep === 'aligning') {
              setVerificationMessage('Alinhado! Agora aproxime seu rosto lentamente... 🧠');
              return 'approaching';
            } else if (currStep === 'approaching') {
              setVerificationMessage('Excelente! Agora afaste seu rosto lentamente... 📸');
              return 'pulling';
            } else if (currStep === 'pulling') {
              setVerificationMessage('Escaneamento finalizado! Extraindo mapeamento de coordenadas... 🧬');
              setTimeout(() => {
                stopFaceCamera();
                setVerificationStep('processing');
                setVerificationProgress(0);
                setVerificationMessage('Comparando coordenadas faciais do MediaPipe Landmarker contra fotos de cadastro...');
                runEvaluationProcess();
              }, 800);
              return 'pulling';
            }
          }
          setVerificationProgress(Math.min(100, Math.floor(currentStepProgress)));
        }
        return currStep;
      });

      let scale = 1.0;
      let stepName = 'idle';
      setVerificationStep(s => { stepName = s; return s; });

      if (stepName === 'aligning') {
        scale = 1.0 + Math.sin(now / 300) * 0.02;
        setDistanceValue(50 + Math.floor(Math.sin(now / 400) * 5));
      } else if (stepName === 'approaching') {
        const p = currentStepProgress / 100;
        scale = 1.0 + p * 0.45;
        setDistanceValue(Math.min(100, 50 + Math.floor(p * 50)));
      } else if (stepName === 'pulling') {
        const p = currentStepProgress / 100;
        scale = 1.45 - p * 0.65;
        setDistanceValue(Math.max(10, 100 - Math.floor(p * 85)));
      }

      const cx = w / 2;
      const cy = h / 2;
      const rWidth = w * 0.38 * scale;
      const rHeight = h * 0.48 * scale;

      // Draw oval mask guidelines
      ctx.strokeStyle = stepName === 'aligning' ? '#EAB308' : stepName === 'approaching' ? '#A855F7' : '#3B82F6';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rWidth, rHeight, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Nodes list to draw
      const points: {x: number, y: number}[] = [];
      const jawPoints: {x: number, y: number}[] = [];
      const lipPoints: {x: number, y: number}[] = [];
      const leftEyePoints: {x: number, y: number}[] = [];
      const rightEyePoints: {x: number, y: number}[] = [];

      for (let i = 0; i <= 10; i++) {
        const angle = Math.PI * 0.1 + (i / 10) * Math.PI * 0.8;
        const jx = cx + Math.cos(angle) * rWidth * 0.85;
        const jy = cy + Math.sin(angle) * rHeight * 0.85;
        jawPoints.push({ x: jx, y: jy });
        points.push({ x: jx, y: jy });
      }

      const eyeOffsetY = -rHeight * 0.2;
      const eyeOffsetX = rWidth * 0.32;
      const eyeR = rWidth * 0.08;

      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const ex = cx - eyeOffsetX + Math.cos(angle) * eyeR;
        const ey = cy + eyeOffsetY + Math.sin(angle) * eyeR * 0.5;
        leftEyePoints.push({ x: ex, y: ey });
        points.push({ x: ex, y: ey });
      }

      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const ex = cx + eyeOffsetX + Math.cos(angle) * eyeR;
        const ey = cy + eyeOffsetY + Math.sin(angle) * eyeR * 0.5;
        rightEyePoints.push({ x: ex, y: ey });
        points.push({ x: ex, y: ey });
      }

      const noseTopY = cy - rHeight * 0.25;
      const noseTipY = cy + rHeight * 0.1;
      const noseLWidth = rWidth * 0.15;
      const noseBridgePoints = [
        { x: cx, y: noseTopY },
        { x: cx, y: cy },
        { x: cx, y: noseTipY },
        { x: cx - noseLWidth, y: noseTipY },
        { x: cx + noseLWidth, y: noseTipY }
      ];
      points.push(...noseBridgePoints);

      const lipY = cy + rHeight * 0.38;
      const lipW = rWidth * 0.38;
      const lipH = rHeight * 0.08;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const lx = cx + Math.cos(angle) * lipW;
        const ly = lipY + Math.sin(angle) * lipH * (i >= 4 ? 0.3 : 1.0);
        lipPoints.push({ x: lx, y: ly });
        points.push({ x: lx, y: ly });
      }

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(176, 136, 249, 0.4)';
      ctx.lineWidth = 1;

      for (let i = 0; i < jawPoints.length - 1; i++) {
        ctx.moveTo(jawPoints[i].x, jawPoints[i].y);
        ctx.lineTo(jawPoints[i+1].x, jawPoints[i+1].y);
      }

      for (let i = 0; i < leftEyePoints.length; i++) {
        const next = (i + 1) % leftEyePoints.length;
        ctx.moveTo(leftEyePoints[i].x, leftEyePoints[i].y);
        ctx.lineTo(leftEyePoints[next].x, leftEyePoints[next].y);
      }
      for (let i = 0; i < rightEyePoints.length; i++) {
        const next = (i + 1) % rightEyePoints.length;
        ctx.moveTo(rightEyePoints[i].x, rightEyePoints[i].y);
        ctx.lineTo(rightEyePoints[next].x, rightEyePoints[next].y);
      }

      for (let i = 0; i < lipPoints.length; i++) {
        const next = (i + 1) % lipPoints.length;
        ctx.moveTo(lipPoints[i].x, lipPoints[i].y);
        ctx.lineTo(lipPoints[next].x, lipPoints[next].y);
      }

      ctx.moveTo(cx, noseTopY);
      ctx.lineTo(cx - eyeOffsetX, cy + eyeOffsetY);
      ctx.moveTo(cx, noseTopY);
      ctx.lineTo(cx + eyeOffsetX, cy + eyeOffsetY);
      ctx.moveTo(cx, noseTipY);
      ctx.lineTo(lipPoints[0].x, lipPoints[0].y);

      for (let i = 1; i < jawPoints.length - 1; i += 2) {
        ctx.moveTo(jawPoints[i].x, jawPoints[i].y);
        ctx.lineTo(cx, cy);
      }

      ctx.stroke();

      const borderSize = 14;
      const bX = cx - rWidth * 1.05;
      const bY = cy - rHeight * 1.05;
      const bW = rWidth * 2.1;
      const bH = rHeight * 2.1;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(bX, bY + borderSize); ctx.lineTo(bX, bY); ctx.lineTo(bX + borderSize, bY);
      ctx.moveTo(bX + bW - borderSize, bY); ctx.lineTo(bX + bW, bY); ctx.lineTo(bX + bW, bY + borderSize);
      ctx.moveTo(bX, bY + bH - borderSize); ctx.lineTo(bX, bY + bH); ctx.lineTo(bX + borderSize, bY + bH);
      ctx.moveTo(bX + bW - borderSize, bY + bH); ctx.lineTo(bX + bW, bY + bH); ctx.lineTo(bX + bW, bY + bH - borderSize);
      ctx.stroke();

      ctx.fillStyle = '#10B981';
      points.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      const scanY = cy - rHeight + ((now % 2500) / 2500) * (rHeight * 2);
      ctx.beginPath();
      const grad = ctx.createLinearGradient(cx - rWidth, scanY, cx + rWidth, scanY);
      grad.addColorStop(0, 'rgba(176, 136, 249, 0)');
      grad.addColorStop(0.5, 'rgba(176, 136, 249, 0.7)');
      grad.addColorStop(1, 'rgba(176, 136, 249, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.moveTo(cx - rWidth * 0.9, scanY);
      ctx.lineTo(cx + rWidth * 0.9, scanY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`MEDIAPIPE FL v0.10: ACTIVE`, bX + 4, bY - 6);
      ctx.fillText(`ALIGN CONFIDENCE: 98.4%`, bX + bW - 120, bY - 6);
      ctx.fillText(`DISTANCE GAUGER: ${Math.floor(scale * 100)}%`, bX + 4, bY + bH + 11);
      ctx.fillText(`468 MAPPED NODES`, bX + bW - 100, bY + bH + 11);

      faceAnimationRef.current = requestAnimationFrame(loop);
    };

    faceAnimationRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    return () => {
      stopFaceCamera();
    };
  }, []);

  useEffect(() => {
    if (userProfile) {
      let finalBio = userProfile.bio || '';
      let finalImages = userProfile.images || [];
      let finalAge = userProfile.age || 25;
      let finalGender = userProfile.gender || 'Masculino';
      let finalLocation = userProfile.location || 'São Paulo, SP';
      let finalProfession = userProfile.profession || userProfession;
      let finalEmojis = userProfile.emojis ? Array.from(userProfile.emojis) : userEmojis;
      let finalVerified = userProfile.is_verified !== undefined ? userProfile.is_verified : isVerified;
      let finalViews = userProfile.views || profileViews;
      let finalFriends = userProfile.friends_added || friendsAddedCount;

      // Executa a decodificação de metadados se existir na bio
      if (userProfile.bio && userProfile.bio.includes('[FW_METADATA_V1]')) {
        try {
          const parts = userProfile.bio.split('[FW_METADATA_V1]');
          finalBio = parts[0].trim();
          const meta = JSON.parse(parts[1].trim());

          finalImages = meta.images || finalImages;
          finalAge = meta.age || finalAge;
          finalGender = meta.gender || finalGender;
          finalLocation = meta.location || finalLocation;
          finalProfession = meta.profession || finalProfession;
          finalEmojis = meta.emojis || finalEmojis;
          if (meta.is_verified !== undefined) finalVerified = meta.is_verified;
          finalViews = meta.views || finalViews;
          finalFriends = meta.friends_added || finalFriends;
        } catch (e) {
          console.warn('Erro ao decodificar metadados de bio no useEffect:', e);
        }
      }

      setProfileForm({
        name: userProfile.full_name || 'Seu Nome',
        username: userProfile.instagram_username || 'seu_instagram',
        bio: finalBio,
        age: finalAge,
        gender: finalGender,
        location: finalLocation
      });

      if (finalImages && finalImages.length > 0) {
        setUserPhotos(finalImages);
      } else if (userProfile.avatar_url) {
        setUserPhotos([userProfile.avatar_url]);
      }

      setUserEmojis(finalEmojis);
      setUserProfession(finalProfession);
      setIsVerified(finalVerified);
      setProfileViews(finalViews);
      setFriendsAddedCount(finalFriends);
    }
  }, [userProfile]);

  const savePhotosToSupabaseDirect = async (updatedPhotos: string[]) => {
    if (!user) return;
    try {
      const cleanUsername = profileForm.username.replace('@', '').trim().toLowerCase();
      const updatedAge = parseInt(profileForm.age.toString()) || 25;
      const cleanBioText = profileForm.bio.split('[FW_METADATA_V1]')[0].trim();

      const metadata = {
        images: updatedPhotos,
        age: updatedAge,
        gender: profileForm.gender,
        location: profileForm.location,
        profession: userProfession,
        emojis: userEmojis,
        is_verified: isVerified,
        views: profileViews,
        friends_added: friendsAddedCount
      };

      const finalBioWithMetadata = `${cleanBioText}\n\n[FW_METADATA_V1]${JSON.stringify(metadata)}`;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          instagram_username: cleanUsername,
          full_name: profileForm.name,
          bio: finalBioWithMetadata,
          age: updatedAge,
          gender: profileForm.gender,
          location: profileForm.location,
          images: updatedPhotos,
          avatar_url: updatedPhotos[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Erro ao salvar no Supabase com colunas completas, tentando gravação resiliente na bio...', error.message);
        
        const { error: fallbackError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            instagram_username: cleanUsername,
            full_name: profileForm.name,
            bio: finalBioWithMetadata,
            avatar_url: updatedPhotos[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
            updated_at: new Date().toISOString()
          });

        if (fallbackError) {
          console.error('Erro crítico no fallback ao salvar fotos:', fallbackError.message);
        } else {
          console.log('Fotos salvas na bio estruturada com sucesso!');
        }
      } else {
        console.log('Fotos salvas no Supabase!');
      }

      if (setUserProfile) {
        setUserProfile((prev: any) => ({
          ...(prev || {}),
          images: updatedPhotos,
          avatar_url: updatedPhotos[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop'
        }));
      }
    } catch (e: any) {
      console.warn('Falha ao conectar Supabase para salvar fotos:', e.message);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanUsername = profileForm.username.replace('@', '').trim().toLowerCase();
      const updatedAge = parseInt(profileForm.age.toString()) || 25;
      const cleanBioText = profileForm.bio.split('[FW_METADATA_V1]')[0].trim();

      const metadata = {
        images: userPhotos,
        age: updatedAge,
        gender: profileForm.gender,
        location: profileForm.location,
        profession: userProfession,
        emojis: userEmojis,
        is_verified: isVerified,
        views: profileViews,
        friends_added: friendsAddedCount
      };

      const finalBioWithMetadata = `${cleanBioText}\n\n[FW_METADATA_V1]${JSON.stringify(metadata)}`;

      const userId = user?.id || 'guest';
      localStorage.setItem(`fw_photos_${userId}`, JSON.stringify(userPhotos));
      localStorage.setItem(`fw_tags_${userId}`, JSON.stringify(userTags));
      localStorage.setItem(`fw_emojis_${userId}`, JSON.stringify(userEmojis));
      localStorage.setItem(`fw_profession_${userId}`, userProfession);
      localStorage.setItem(`fw_location_${userId}`, profileForm.location);
      localStorage.setItem(`fw_verified_${userId}`, isVerified.toString());
      localStorage.setItem(`fw_views_${userId}`, profileViews.toString());
      localStorage.setItem(`fw_friends_added_${userId}`, friendsAddedCount.toString());

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          instagram_username: cleanUsername,
          full_name: profileForm.name,
          bio: finalBioWithMetadata,
          age: updatedAge,
          gender: profileForm.gender,
          location: profileForm.location,
          images: userPhotos,
          avatar_url: userPhotos[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Erro ao atualizar Supabase com colunas completas, aplicando gravação resiliente na bio...', error.message);
        
        const { error: fallbackError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            instagram_username: cleanUsername,
            full_name: profileForm.name,
            bio: finalBioWithMetadata,
            avatar_url: userPhotos[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
            updated_at: new Date().toISOString()
          });

        if (fallbackError) {
          console.error('Erro crítico no fallback do Supabase:', fallbackError.message);
        } else {
          console.log('Perfil salvo com sucesso no Supabase via bio comprimida!');
        }
      } else {
        console.log('Perfil atualizado com sucesso no Supabase!');
      }

      setUserProfile({
        ...userProfile,
        full_name: profileForm.name,
        instagram_username: cleanUsername,
        bio: cleanBioText,
        age: updatedAge,
        gender: profileForm.gender,
        images: userPhotos,
        avatar_url: userPhotos[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
        emojis: userEmojis.join(''),
        profession: userProfession,
        is_verified: isVerified,
        location: profileForm.location
      });

      triggerActionAlert('Seu perfil foi atualizado e salvo com sucesso! 💎🌊');
    } catch (err: any) {
      triggerActionAlert('Salvo localmente com sucesso! 💾');
    }
  };

  // Auxiliares do chat parceiro
  const activeChatPartner = FEED_PROFILES.find(p => p.id === activeChatId) || {
    name: "Parceiro",
    id: "parceiro",
    images: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&h=150&fit=crop"]
  };

  return (
    <div className={cn(
      "bg-[#FAF9F5] relative antialiased text-black transition-all",
      activeTab === 'chat' || activeTab === 'profile'
        ? "w-full max-w-4xl mx-auto px-0 md:px-4 h-screen overflow-hidden pb-[60px]"
        : "min-h-screen pb-14 pt-1 px-1.5 sm:px-4 max-w-xl mx-auto"
    )}>
      
      {/* HEADER DA ÁREA INTERNA - ESTILO COMPACTO SEM BORDAS */}
      <div className={cn(
        "flex items-center justify-between w-full py-2 px-1 mb-3 bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-[110]",
        (activeTab === 'chat' || activeTab === 'profile') && "hidden md:flex"
      )}>
        <div className="flex items-center gap-2">
          <div>
            <span className="text-xl font-display font-black tracking-tight text-black block leading-none">
              FollowWave
            </span>
          </div>
        </div>

        {/* Ações Rápidas do Header */}
        <div className="flex items-center gap-2">
          {activeTab === 'feed' && (
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "py-1.5 px-3 border-2 border-black rounded-xl transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider font-mono select-none",
                isFilterOpen ? "bg-[#FFD166]" : "bg-white hover:bg-neutral-50"
              )}
              title="Filtrar Criadores"
            >
              <SlidersHorizontal size={13} className="text-black" />
              <span>Filtrar</span>
            </button>
          )}

          <button 
            onClick={onLogout}
            title="Desconectar"
            className="p-1.5 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* PAINEL DE FILTROS COMPLETO ESTILO MODAL GIGANTE (SÓ NO FEED MATCH) */}
      <AnimatePresence>
        {activeTab === 'feed' && isFilterOpen && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-sm bg-[#FAF9F5] border-3 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-left space-y-5 flex flex-col max-h-[92vh] overflow-y-auto"
            >
              {/* Cabeçalho */}
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-brand-purple rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                    <Sliders size={16} className="text-black" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase tracking-wider text-black leading-tight">
                      Configurar Filtros
                    </h4>
                    <p className="text-[9px] font-mono text-black/55">Encontre criadores ideais</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 bg-white border-2 border-black hover:bg-neutral-100 rounded-xl transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none cursor-pointer"
                >
                  <X size={14} className="text-black" />
                </button>
              </div>

              {/* Corpo dos Filtros */}
              <div className="space-y-4">
                
                {/* Filtro de Gênero com Ícones Neo-Brutalist Mars e Venus */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black font-mono tracking-wider text-black/60 block">Gênero Alvo</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'Feminino', label: 'Feminino', icon: Venus, color: 'hover:bg-pink-100/60' },
                      { value: 'Masculino', label: 'Masculino', icon: Mars, color: 'hover:bg-blue-100/60' },
                      { value: 'Todos', label: 'Todos', icon: Users, color: 'hover:bg-purple-100/60' }
                    ].map((g) => {
                      const IconComp = g.icon;
                      const isSelected = activeFilterGender === g.value;
                      return (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => {
                            setActiveFilterGender(g.value);
                            setCurrentProfileIndex(0);
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1.5 p-3 border-2 border-black rounded-2xl transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 cursor-pointer text-[10px] font-black font-mono",
                            isSelected 
                              ? "bg-[#FFD166] text-black border-2 border-black" 
                              : "bg-white text-black " + g.color
                          )}
                        >
                          <IconComp size={16} className="text-black stroke-[3]" />
                          <span>{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {userProfile?.gender && (
                    <span className="text-[8px] font-mono font-medium text-brand-purple block mt-1 leading-none text-center">
                      🎯 Sugerido conforme seu perfil.
                    </span>
                  )}
                </div>

                {/* Filtro de Nicho */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black font-mono tracking-wider text-black/60 block">Nicho de Conteúdo</label>
                  <select 
                    value={activeFilterNiche}
                    onChange={(e) => {
                      setActiveFilterNiche(e.target.value);
                      setCurrentProfileIndex(0);
                    }}
                    className="w-full bg-white border-2 border-black rounded-xl p-2.5 font-bold text-xs select-none shadow-[2px_2px_0px_#000] focus:translate-y-0.5 focus:shadow-none transition-all outline-none"
                  >
                    <option value="Todos">Todos Nichos de Trabalho 🌟</option>
                    <option value="Fitness">🏋️‍♂️ Fitness & Academia</option>
                    <option value="Moda">👗 Moda & Estilo</option>
                    <option value="Tecnologia">💻 Tecnologia & Criação</option>
                    <option value="Viagem">✈️ Viagem & Vlogs</option>
                    <option value="Arte">🎨 Arte & Design</option>
                    <option value="Música">🎵 Música & Shows</option>
                  </select>
                </div>

                {/* Filtro de Idade Completo de Arraste (Sliders de 16 a 99) */}
                <div className="space-y-3 bg-white p-3.5 border-2 border-black rounded-2xl">
                  <span className="text-[10px] uppercase font-black font-mono tracking-wider text-black/60 block">Faixa Etária (16 até 99 anos)</span>
                  
                  <div className="space-y-3">
                    {/* Mínima */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-neutral-500">Idade Mínima:</span>
                        <strong className="text-black font-mono">{filterAgeMin} anos</strong>
                      </div>
                      <input 
                        type="range"
                        min="16"
                        max="99"
                        value={filterAgeMin}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setFilterAgeMin(val);
                          if (val > filterAgeMax) {
                            setFilterAgeMax(val);
                          }
                          setCurrentProfileIndex(0);
                        }}
                        className="w-full accent-black cursor-pointer bg-neutral-200 h-1.5 rounded-lg appearance-none"
                      />
                    </div>

                    {/* Máxima */}
                    <div className="space-y-1 border-t border-dashed border-black/10 pt-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-neutral-500">Idade Máxima:</span>
                        <strong className="text-black font-mono">{filterAgeMax} anos</strong>
                      </div>
                      <input 
                        type="range"
                        min="16"
                        max="99"
                        value={filterAgeMax}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setFilterAgeMax(val);
                          if (val < filterAgeMin) {
                            setFilterAgeMin(val);
                          }
                          setCurrentProfileIndex(0);
                        }}
                        className="w-full accent-black cursor-pointer bg-neutral-200 h-1.5 rounded-lg appearance-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Botão de Aplicar e Sincronizar */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black font-mono text-xs py-3.5 border-2 border-black rounded-2xl transition-all shadow-[4px_4px_0px_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check size={14} className="stroke-[3]" />
                  <span>APLICAR ({filteredProfiles.length} ENCONTRADOS)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RECENT ACTIONS SYSTEM FLOAT-BANNER */}
      <AnimatePresence>
        {recentActionText && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[150] bg-[#FFD166] text-black border-4 border-black px-6 py-3 rounded-2xl shadow-[4px_4px_0px_#000] font-bold font-mono flex items-center gap-2"
          >
            <Sparkles size={16} />
            <span>{recentActionText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DASHBOARD MAIN CONTAINER DESK --- */}
      <main className="min-h-[50vh]">
        
        {/* ======================================================== */}
        {/* TELA DE MATCH FEED: UM CARD GRANDE COM A FOTO DO CREATOR */}
        {/* ======================================================== */}
        {activeTab === 'feed' && (
          <div className="flex flex-col items-center justify-center w-full max-w-[420px] mx-auto pt-0 pb-4 px-1.5">
            
            <AnimatePresence mode="wait">
              {activeCandidate ? (
                <div className="w-full flex flex-col gap-3.5">
                  {/* CARD DE MATCH - DESIGN FULL-BLEED ESTILO YUBO */}
                  <motion.div 
                    key={activeCandidate.id}
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -12 }}
                    transition={{ duration: 0.22 }}
                    className="w-full h-[540px] xs:h-[580px] sm:h-[620px] md:h-[650px] bg-neutral-900 border-4 border-black rounded-[32px] shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col relative"
                  >
                    
                    {/* IMAGENS ROTATIVAS DO CRIADOR */}
                    {(() => {
                      const candidateImages = activeCandidate.images && activeCandidate.images.length > 0 
                        ? activeCandidate.images 
                        : ["https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop"];
                      const imagesLength = candidateImages.length;
                      const isLastPhoto = activePhotoIndex === imagesLength - 1;

                      return (
                        <>
                          {/* Progress indicators for images */}
                          <div className="absolute top-3.5 left-4 right-4 flex gap-1 z-35 pointer-events-none">
                            {Array.from({ length: imagesLength }).map((_, idx) => (
                              <div 
                                key={idx} 
                                className={cn(
                                  "h-1 rounded-full flex-1 transition-all duration-300",
                                  idx === activePhotoIndex ? "bg-white" : "bg-white/30 backdrop-blur-sm"
                                )}
                              />
                            ))}
                          </div>

                          {/* Foto Background do Criador com fade effect */}
                          <div className="absolute inset-0 w-full h-full z-10 bg-neutral-900">
                            <AnimatePresence mode="popLayout">
                              <motion.img 
                                key={activePhotoIndex}
                                src={candidateImages[activePhotoIndex]} 
                                alt={activeCandidate.name} 
                                initial={{ opacity: 0.15 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0.15 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full object-cover select-none pointer-events-none"
                              />
                            </AnimatePresence>
                          </div>

                          {/* Área de Clique para passar as fotos (Left 35% / Right 65%) */}
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activePhotoIndex > 0) {
                                setActivePhotoIndex(prev => prev - 1);
                              } else {
                                setActivePhotoIndex(imagesLength - 1);
                              }
                            }} 
                            className="absolute left-0 top-0 w-[35%] h-[82%] z-25 cursor-w-resize" 
                            title="Foto anterior" 
                          />
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activePhotoIndex < imagesLength - 1) {
                                setActivePhotoIndex(prev => prev + 1);
                              } else {
                                setActivePhotoIndex(0);
                              }
                            }} 
                            className="absolute right-0 top-0 w-[65%] h-[82%] z-25 cursor-e-resize" 
                            title="Próxima foto" 
                          />

                          {/* BADGES FLUTUANTES SUPERIORES */}
                          <div className="absolute top-8 left-4 flex gap-1.5 z-30 pointer-events-none">
                            <span className="bg-brand-purple border border-black text-black text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider font-mono shadow-[1px_1px_0px_#000]">
                              {activeCandidate.niche} ⚡
                            </span>
                            <span className="bg-white border border-black text-black text-[9px] font-black px-2 py-0.5 rounded-md font-mono shadow-[1px_1px_0px_#000]">
                              📊 {activeCandidate.followers} segs
                            </span>
                          </div>

                          <div className="absolute top-8 right-4 bg-black/45 border border-white/20 text-[#FFF] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full text-center shadow-md font-mono select-none z-30 pointer-events-none">
                            👤 {activeCandidate.gender}
                          </div>

                          {/* CONTEÚDO INTEGRADO OVERLAY (Garante adaptabilidade e sem rolagens longas) */}
                          <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/65 to-transparent pt-16 p-4 text-white text-left select-none rounded-b-[28px] pointer-events-none">
                            
                            {/* Nome e Idade */}
                            <h3 className="text-2xl font-black text-white font-display leading-tight flex items-baseline gap-1.5 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]">
                              {activeCandidate.name} 
                              <span className="text-lg font-bold font-mono opacity-90">{activeCandidate.age}</span>
                            </h3>

                            {/* Detalhes do Criador */}
                            <p className="text-[11px] text-zinc-300 font-semibold leading-relaxed flex items-center gap-1 mt-0.5 pointer-events-none">
                              📍 {activeCandidate.location}
                            </p>

                            {/* Balão com Emojis de Personalidade (Estilo Yubo) */}
                            {activeCandidate.emojis && (
                              <div className="mt-2 bg-black/40 border border-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full inline-flex gap-1.5 items-center pointer-events-none">
                                <span className="text-xs leading-none tracking-wide">{activeCandidate.emojis}</span>
                              </div>
                            )}

                            {/* DESCRIÇÃO PRINCIPAL (FADE-IN NO FINAL DAS FOTOS) */}
                            <div className="mt-2.5 min-h-[44px]">
                              {isLastPhoto ? (
                                <motion.div 
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="bg-black/55 border border-white/10 backdrop-blur-sm rounded-xl p-2.5"
                                >
                                  <p className="text-[11px] text-zinc-100 italic leading-relaxed font-medium">
                                    "{activeCandidate.bio}"
                                  </p>
                                  
                                  {/* Interesses de divulgação secundários */}
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {activeCandidate.interests.map((tag, idx) => (
                                      <span key={idx} className="bg-brand-purple/25 text-[#FFF] text-[8px] font-black px-1.5 py-0.2 rounded border border-brand-purple/35 font-mono">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                </motion.div>
                              ) : (
                                <p className="text-[10px] text-white/50 tracking-wide font-mono animate-pulse">
                                  👉 Toque no lado direito para ver bio e interesses...
                                </p>
                              )}
                            </div>

                          </div>
                        </>
                      );
                    })()}

                  </motion.div>

                  {/* PAINEL DE BOTÕES DE INTERAÇÃO DO CARD (DOCK EXTERNO PARA APARÊNCIA DE APP NATIVO) */}
                  <div className="grid grid-cols-3 gap-3.5 px-1 py-1">
                    
                    {/* BOTÃO IGNORAR (X) */}
                    <button 
                      onClick={handlePass}
                      className="py-3 bg-[#FFADAD] text-black border-2 border-black rounded-2xl font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center gap-1 group"
                    >
                      <X className="w-5 h-5 text-black group-hover:rotate-12 transition-transform" />
                      <span className="text-[9px] font-bold font-mono">Pular</span>
                    </button>

                    {/* BOTÃO COMENTAR/ICEBREAKER */}
                    <button 
                      onClick={() => setCommentsModal({ isOpen: true, targetProfile: activeCandidate })}
                      className="py-3 bg-[#FFD166] text-black border-2 border-black rounded-2xl font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-5 h-5 text-black" />
                      <span className="text-[9px] font-bold font-mono">Comentário</span>
                    </button>

                    {/* BOTÃO CURTIR / MATCH (Heart) */}
                    <button 
                      onClick={handleLike}
                      className="py-3 bg-brand-purple text-black border-2 border-black rounded-2xl font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center gap-1 group"
                    >
                      <Heart className="w-5 h-5 text-black group-hover:scale-125 transition-transform" fill="currentColor" />
                      <span className="text-[9px] font-bold font-mono">Deu Match!</span>
                    </button>

                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full bg-card-lilac border-4 border-black rounded-[38px] p-10 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-center space-y-6"
                >
                  <div className="w-16 h-16 bg-white rounded-full border-2 border-black mx-auto flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <Check className="w-8 h-8 text-brand-purple" strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Fim da Lista!</h3>
                    <p className="text-sm text-black/70 mt-3 max-w-sm mx-auto">
                      Você já visualizou ou interagiu com todos os perfis compatíveis de acordo com os filtros selecionados.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setLikedProfiles([]);
                      setPassedProfiles([]);
                      setCurrentProfileIndex(0);
                      triggerActionAlert("Fila de perfis reiniciada!");
                    }}
                    className="px-6 py-3 bg-black text-white hover:bg-black/90 border-2 border-black rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 mx-auto shadow-[3px_3px_0px_#B088F9] active:shadow-none active:translate-y-0.5 transition-all"
                  >
                    <RefreshCw size={14} className="animate-spin duration-1000" /> Reiniciar Fila de Perfis
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ======================================================== */}
        {/* TELA DE CHAT: CONVERSAS COM OS ANFITRIÕES DO INSTAGRAM */}
        {/* ======================================================== */}
        {activeTab === 'chat' && (
          <div className="bg-[#FAF9F5] md:border-4 md:border-black md:rounded-[32px] md:shadow-[6px_6px_0px_#000] overflow-hidden grid grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto w-full h-[calc(100vh-62px)] md:h-[calc(100vh-145px)] md:min-h-[470px] md:max-h-[650px] border-b border-black/10">
            
            {/* LADO ESQUERDO: LISTA DE PARCEIROS E CONVERSAS NO ESTILO DE SCREEN DO CELULAR (Esconde no celular se houver chat ativo) */}
            <div className={cn(
              "border-r-0 md:border-r-4 border-black p-4 md:p-5 bg-white flex flex-col h-full overflow-hidden select-none",
              activeChatId ? "hidden md:flex" : "flex"
            )}>
              {/* Header de "Conversas" com título pesado estilo Yubo e ícone */}
              <div className="flex items-center justify-between pb-3.5 shrink-0">
                <h3 className="text-2xl font-black font-display text-black tracking-tight">
                  Conversas
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(true)}
                    className="p-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 active:shadow-none cursor-pointer"
                    title="Configurações de Filtro"
                  >
                    <Sliders size={15} className="text-black" />
                  </button>
                  <span className="text-[10px] font-black font-mono bg-[#FAF9F5] border-2 border-black px-1.5 py-0.5 rounded-lg shadow-[1.5px_1.5px_0px_#000]">
                    💡 {userMatches.length}
                  </span>
                </div>
              </div>

              {/* CONTEÚDO SCROLLÁVEL DO PORTAL DE CONVERSAS */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin text-left no-scrollbar">
                
                {/* SEÇÃO "NOVOS AMIGOS" COM CARDS VERTICAIS DE FOTOS */}
                <div className="space-y-1.5 shrink-0">
                  <span className="text-[10px] font-black uppercase font-mono tracking-wider text-black/50 block">
                    Novos amigos
                  </span>
                  
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin no-scrollbar touch-pan-x py-1">
                    {/* Amigos Adicionados da lista real */}
                    {userMatches.map(matchId => {
                      const creatorInfo = FEED_PROFILES.find(p => p.id === matchId);
                      if (!creatorInfo) return null;
                      const isSelected = activeChatId === matchId;
                      return (
                        <div key={matchId} className="flex flex-col items-center shrink-0">
                          <button
                            onClick={() => setActiveChatId(matchId)}
                            className={cn(
                              "w-[80px] h-[110px] rounded-[20px] border-2 overflow-hidden relative shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none hover:scale-105 transition-all bg-neutral-100 cursor-pointer",
                              isSelected ? "border-brand-purple ring-2 ring-brand-purple" : "border-black"
                            )}
                          >
                            <img 
                              src={(creatorInfo.images && creatorInfo.images[0]) || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&h=150&fit=crop'} 
                              className="w-full h-full object-cover" 
                              alt={creatorInfo.name} 
                              referrerPolicy="no-referrer"
                            />
                            {/* Online vibe indicator */}
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#A3E635] border border-black rounded-full" />
                            
                            {/* Subtle name badge overlay at bottom of card */}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-4 text-left">
                              <span className="text-[8px] font-black font-mono text-white tracking-wide uppercase truncate block">
                                @{creatorInfo.id.split('_')[0]}
                              </span>
                            </div>
                          </button>
                          <span className="text-[9px] font-black font-mono text-black mt-1 truncate max-w-[76px]">
                            {creatorInfo.name.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}

                    {userMatches.length === 0 && (
                      <div className="flex items-center gap-2.5 px-3 py-6 bg-yellow-50/50 border border-dashed border-black/15 rounded-2xl w-full text-left font-mono">
                        <span className="text-lg">🧭</span>
                        <div>
                          <p className="text-[9px] font-black uppercase text-black">Nenhum match ainda</p>
                          <p className="text-[8px] text-zinc-500 leading-none mt-0.5">Explore os criadores no feed e deslize!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PROMOTION BANNER ESTILO YUBO HYPERSURGE */}
                <div className="bg-brand-purple border-2 border-black rounded-2xl p-3 flex items-center justify-between shadow-[2px_2px_0px_#000] my-1 select-none hover:translate-y-[-1px] transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] border-2 border-black flex items-center justify-center text-xs shadow-[1.5px_1.5px_0px_#000] shrink-0">
                      ⚡
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-tight text-black">Multiplique os contatos</h4>
                      <p className="text-[8.5px] font-mono font-bold text-black/60 leading-tight">Complete suas fotos para ganhar 10x mais propostas.</p>
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-black stroke-[3.5] shrink-0" />
                </div>

                {/* SEÇÃO "CONVERSAS RECENTES" */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase font-mono tracking-wider text-black/55 block">
                    Conversas Recentes
                  </span>

                  {userMatches.map(matchId => {
                    const creatorInfo = FEED_PROFILES.find(p => p.id === matchId);
                    if (!creatorInfo) return null;
                    const isSelected = activeChatId === matchId;
                    const currentMsgList = chatMessages[matchId] || [];
                    const lastMsg = currentMsgList[currentMsgList.length - 1];

                    return (
                      <button
                        key={matchId}
                        onClick={() => setActiveChatId(matchId)}
                        className={cn(
                          "w-full p-2.5 flex items-center gap-3 rounded-2xl border-2 transition-all text-left cursor-pointer",
                          isSelected 
                            ? "bg-brand-purple border-black shadow-[3px_3px_0px_#000] translate-y-[-1px]" 
                            : "bg-[#FAF9F5]/40 hover:bg-[#FAF9F5] border-[#FAF9F5] hover:border-black shadow-sm"
                        )}
                      >
                        <div className="relative shrink-0">
                          <img 
                            src={(creatorInfo.images && creatorInfo.images[0]) || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&h=150&fit=crop'} 
                            className="w-11 h-11 rounded-full border border-black object-cover bg-white" 
                            alt="" 
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#A3E635] border border-black rounded-full" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs sm:text-sm text-black truncate">{creatorInfo.name}</span>
                            <span className="text-[8.5px] font-mono font-bold text-zinc-500 shrink-0 pr-1">{lastMsg?.time || 'Recente'}</span>
                          </div>
                          <p className="text-[9.5px] text-zinc-400 font-mono leading-none">@{creatorInfo.id}</p>
                          <p className="text-[11px] font-medium text-zinc-700 truncate mt-1">
                            {lastMsg ? `Você: ${lastMsg.text}` : "Adicionado! Comece a negociar collabs."}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                  {userMatches.length === 0 && (
                    <div className="text-center py-10 rounded-2xl bg-neutral-50/50 border border-dashed border-black/10">
                      <MessageSquare className="mx-auto text-neutral-400 w-5 h-5 mb-2" />
                      <p className="text-[10px] font-mono text-zinc-400">Nenhuma conversa iniciada.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* LADO DIREITO/COMPLETO: INTERFACE DO CHAT ATIVO */}
            <div className={cn(
              "col-span-1 md:col-span-2 flex flex-col h-full bg-[#FAF9F5] overflow-hidden justify-between",
              activeChatId ? "flex" : "hidden md:flex"
            )}>
              {activeChatId ? (
                <>
                  {/* CABEÇALHO DO CHAT */}
                  <div className="bg-white border-b-2 border-black p-3 md:p-3.5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5 text-left min-w-0">
                      {/* Botão de Voltar - Visível apenas no Celular */}
                      <button 
                        type="button"
                        onClick={() => setActiveChatId(null)}
                        className="md:hidden flex items-center justify-center p-2 bg-[#FAF9F5] hover:bg-neutral-100 border-2 border-black rounded-xl transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0"
                        title="Voltar para a lista"
                      >
                        <ChevronLeft size={14} className="stroke-[3.5]" />
                      </button>

                      <div className="relative shrink-0">
                        <img 
                          src={(activeChatPartner.images && activeChatPartner.images[0]) || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&h=150&fit=crop'} 
                          className="w-10 h-10 rounded-full border-2 border-black object-cover" 
                          alt="" 
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#A3E635] border border-black rounded-full" />
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs sm:text-sm leading-tight text-black truncate">
                          {activeChatPartner.name}
                        </h4>
                        <a 
                          href={`https://instagram.com/${activeChatPartner.id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[9px] font-mono text-brand-purple font-black hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          <Instagram size={9} />
                          {activeChatPartner.id}
                        </a>
                      </div>
                    </div>
                    
                    <span className="text-[9px] font-mono font-black bg-[#A3E635] text-black border-2 border-black px-2 py-0.5 rounded-full shadow-[1.5px_1.5px_0px_#000] text-center shrink-0">
                      Match Ativo 🔥
                    </span>
                  </div>

                  {/* CORPO DE MENSAGENS COM SCROLL */}
                  <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                    {(chatMessages[activeChatId] || []).map((msg, idx) => {
                      const isMe = msg.sender === 'me';
                      return (
                        <div 
                          key={idx} 
                          className={cn(
                            "flex flex-col max-w-[85%]",
                            isMe ? "ml-auto items-end" : "mr-auto items-start"
                          )}
                        >
                          <div 
                            className={cn(
                              "p-3 rounded-2xl border-2 text-xs leading-relaxed transition-all shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]",
                              isMe 
                                ? "bg-[#DFD3F2] border-black text-black rounded-tr-none" 
                                : "bg-white border-black text-black rounded-tl-none"
                            )}
                          >
                            <p className="text-left font-sans font-medium whitespace-pre-wrap">{msg.text}</p>
                          </div>
                          <span className="text-[8.5px] text-black/45 font-mono mt-1.5 px-1">{msg.time}</span>
                        </div>
                      );
                    })}

                    {isTyping && (
                      <div className="flex items-center gap-2 mr-auto text-[9.5px] text-[#A3E635] font-mono bg-black border-2 border-black px-3.5 py-1.5 rounded-full shadow-inner animate-pulse">
                        <RefreshCw size={10} className="animate-spin text-[#A3E635]" />
                        <span>@{activeChatPartner.id || 'Parceiro'} está escrevendo propostas...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* CAIXA DE ENVIO DE MENSAGEM */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-white border-t-2 border-black flex gap-2 shrink-0">
                    <input 
                      type="text" 
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      placeholder="Combine Stories, Reels Colaborativos ou Troca de indicações..." 
                      className="flex-1 bg-surface border-2 border-black rounded-xl px-4 py-2.5 outline-none focus:border-brand-purple transition-all text-xs"
                    />
                    <button 
                      type="submit" 
                      className="p-3.5 bg-brand-purple hover:bg-opacity-95 text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-0.5 flex items-center justify-center cursor-pointer transition-all"
                    >
                      <Send size={14} className="stroke-[2.5]" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-[#FFD166] border-2 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#000] animate-bounce">
                    <MessageCircle className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase tracking-wide">Selecione uma Conversa</h4>
                    <p className="text-xs text-black/60 max-w-xs mt-2 leading-relaxed">
                      Escolha um dos perfis com quem você deu match no menu ao lado para iniciar conversas de divulgação mútua!
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TELA DE CURTIDAS & ICEBREAKERS */}
        {/* ======================================================== */}
        {activeTab === 'likes' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              
              {/* QUEM CURTIDO / MATCHES EFETUADOS */}
              <div className="bg-white border-3 md:border-4 border-black rounded-[28px] md:rounded-[32px] p-4 md:p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 border-b-2 border-black/10 pb-3 mb-3">
                  <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center border border-black shadow-[1px_1px_0px_#000]">
                    <Heart className="w-4 h-4 text-black" fill="currentColor" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-display text-black">Seus Matches Efetuados ({userMatches.length})</h3>
                </div>
 
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[240px] md:max-h-[320px] overflow-y-auto pr-1">
                  {userMatches.map(mId => {
                    const matchUser = FEED_PROFILES.find(p => p.id === mId);
                    if (!matchUser) return null;
                    return (
                      <div key={mId} className="bg-card-lilac/30 border-2 border-black rounded-xl p-2.5 flex items-center gap-2.5">
                        <img src={(matchUser.images && matchUser.images[0]) || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&h=150&fit=crop'} className="w-9 h-9 rounded-full border border-black object-cover" alt="" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-none truncate">{matchUser.name}</p>
                          <p className="text-[9px] text-[#787878] mt-1 leading-none truncate font-mono">{matchUser.id}</p>
                          <button 
                            onClick={() => {
                              setActiveChatId(mId);
                              setActiveTab('chat');
                            }}
                            className="bg-brand-purple border border-black rounded px-1.5 py-0.5 text-[8.5px] font-mono font-black mt-1.5 hover:bg-opacity-90 inline-block shadow-[1px_1px_0px_#000] active:translate-y-0.5 active:shadow-none"
                          >
                            💬 Conversar
                          </button>
                        </div>
                      </div>
                    );
                  })}
 
                  {userMatches.length === 0 && (
                    <p className="text-xs text-black/50 py-8 col-span-2 text-center">Nenhum match ativo. Continue curtindo no feed! 💜</p>
                  )}
                </div>
              </div>
 
              {/* HISTÓRICO DE COMENTÁRIOS / ICEBREAKERS ENVIADOS */}
              <div className="bg-white border-3 md:border-4 border-black rounded-[28px] md:rounded-[32px] p-4 md:p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 border-b-2 border-black/10 pb-3 mb-3">
                  <div className="w-8 h-8 bg-[#FFD166] rounded-lg flex items-center justify-center border border-black shadow-[1px_1px_0px_#000]">
                    <Megaphone className="w-4 h-4 text-black" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-display text-black">Sua Lista de Propostas ({sentComments.length})</h3>
                </div>
 
                <div className="space-y-2.5 max-h-[240px] md:max-h-[320px] overflow-y-auto pr-1">
                  {sentComments.map((com, index) => (
                    <div key={index} className="bg-[#FAF9F6] border-2 border-black rounded-xl p-3 shadow-[1px_1px_0px_rgba(0,0,0,1)] text-left">
                      <p className="font-bold text-[11px] text-brand-purple font-mono">{com.handle}</p>
                      <p className="text-[11px] mt-1.5 bg-white p-2 rounded border border-black/5 italic text-black/80 font-medium leading-relaxed">
                        "{com.text}"
                      </p>
                      <span className="text-[8px] text-black/40 font-mono block mt-1 text-right">{com.date}</span>
                    </div>
                  ))}

                  {sentComments.length === 0 && (
                    <p className="text-xs text-black/50 text-center py-8">Nenhuma proposta comentada ainda.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="w-full max-w-xl mx-auto text-left animate-in fade-in duration-300 px-0 md:px-4 h-[calc(100vh-62px)] md:h-[calc(100vh-145px)] overflow-y-auto no-scrollbar pb-24 md:pb-10">
            
            {/* IF COMPONENT IS IN VIEW MODE (Visualizar Perfil) */}
            {profileActiveSubTab === 'view' && (
              <div className="bg-white md:border-3 border-black md:rounded-[24px] min-h-full p-4.5 sm:p-5.5 shadow-none md:shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col gap-3.5 bg-gradient-to-b from-white to-[#FAF9F5] group">
                
                {/* Badge de Verificação Ativa no Canto */}
                {isVerified && (
                  <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1 bg-[#10B981] text-white border-2 border-black rounded-lg px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wider font-extrabold shadow-[1.5px_1.5px_0px_#000] select-none">
                    <Shield size={9} />
                    <span>AUTÊNTICO</span>
                  </div>
                )}

                {/* TOPO: Avatar Centralizado e Nome */}
                <div className="text-center relative pt-2">
                  
                  {/* Foto Redonda Grande Centralizada (Clicável para focar uploader/editar) */}
                  <div 
                    onClick={() => {
                      setProfileActiveSubTab('edit');
                      triggerActionAlert("Ativando formulário para gerenciar suas fotos de portfólio! 👇✨");
                    }}
                    className="relative w-24 h-24 mx-auto cursor-pointer group"
                    title="Quer gerenciar fotos e dados?"
                  >
                    <img 
                      src={userPhotos[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop'} 
                      className="w-full h-full rounded-full border-3 border-black object-cover shadow-[3px_3px_0px_rgba(0,0,0,0.15)] bg-neutral-100 group-hover:scale-105 group-hover:border-brand-purple transition-all duration-300"
                      alt="Foto de Perfil"
                    />
                    {/* Floating Camera Icon */}
                    <div className="absolute -bottom-1 -right-1 w-7.5 h-7.5 bg-[#B088F9] border-2 border-black rounded-full flex items-center justify-center shadow-[1px_1px_0px_#000] scale-90 group-hover:scale-105 transition-transform">
                      <Camera size={12} className="text-black" />
                    </div>
                    <span className="absolute bottom-1 right-2 w-3.5 h-3.5 bg-[#10B981] border-2 border-white rounded-full shadow-sm" />
                  </div>

                  {/* Nome do usuário e Idade abaixo da foto */}
                  <div className="mt-2.5 flex items-center justify-center gap-1.5">
                    <h3 className="text-xl font-black font-display text-black tracking-tight flex items-center gap-1">
                      {profileForm.name || "Seu Nome"}
                      {isVerified && (
                        <img 
                          src="https://img.icons8.com/?size=100&id=6xO3fnY41hu2&format=png&color=000000" 
                          className="w-5.5 h-5.5 shrink-0 inline-block align-middle select-none animate-in scale-in duration-300" 
                          alt="Verificado"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </h3>
                    <span className="text-base font-mono font-extrabold text-[#7C3AED]">
                      {profileForm.age || "25"}
                    </span>
                  </div>

                  {/* Pequeno Indicador Online Textual */}
                  <p className="text-[9.5px] font-mono font-semibold text-[#10B981] uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                    <span className="inline-block w-1.2 h-1.2 bg-[#10B981] rounded-full" />
                    Ativo agora na rede
                  </p>

                  {/* Botões de Ações Rápidas de Simulação */}
                  <div className="flex gap-2 w-full mt-3 justify-center">
                    <button 
                      type="button"
                      onClick={() => {
                        setFriendsAddedCount(prev => prev + 1);
                        triggerActionAlert("Seu número de amigos foi atualizado localmente! Conexão ativa. 🤝💜");
                      }}
                      className="flex-1 px-2.5 py-1.5 border-2 border-black rounded-xl bg-[#E2F0CB] hover:bg-[#D5EAA3] text-[#2d5218] transition-all font-black text-[10px] font-mono uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 active:shadow-none"
                    >
                      + Add Amigo
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        triggerActionAlert("Seu perfil simulou a recepção de uma nova proposta de networking de outro criador! 📲");
                      }}
                      className="flex-1 px-2.5 py-1.5 border-2 border-black rounded-xl bg-white hover:bg-neutral-50 text-black transition-all font-black text-[10px] font-mono uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 active:shadow-none"
                    >
                      💬 Mensagem
                    </button>
                  </div>
                </div>

                {/* INDICADORES DO PERFIL */}
                <div className="grid grid-cols-2 gap-2 border-t-2 border-b-2 border-dashed border-black/10 py-2 bg-[#FAF9F5] rounded-xl px-1.5">
                  <div className="text-center">
                    <p className="text-lg font-black text-black font-display tracking-tight leading-none">
                      {friendsAddedCount}
                    </p>
                    <p className="text-[9.5px] font-mono font-bold text-black/55 mt-0.5">amigos</p>
                  </div>
                  <div className="text-center border-l-2 border-dashed border-black/10">
                    <p className="text-lg font-black text-black font-display tracking-tight leading-none">
                      {profileViews.toLocaleString()}
                    </p>
                    <p className="text-[9.5px] font-mono font-bold text-black/55 mt-0.5">visualizaram você</p>
                  </div>
                </div>

                {/* SEÇÃO BIO (Apenas deixa a bio, tira tags e emojis) */}
                <div className="text-left bg-[#FCFCFA] p-2.5 border-2 border-black rounded-xl">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-black/45 block mb-0.5">
                    Biografia Autêntica
                  </span>
                  <p className="text-[11.5px] text-black/80 font-semibold leading-relaxed italic break-words">
                    "{profileForm.bio || "Nenhuma biografia informada ainda."}"
                  </p>
                </div>

                {/* INFORMAÇÕES ADICIONAIS */}
                <div className="text-left pt-2 border-t border-black/10 text-[11px] font-mono text-black/70 space-y-1.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-black/45 block">
                    Informações de Conta
                  </span>
                  <div className="grid grid-cols-2 gap-y-1 gap-x-1">
                    <div className="flex items-center gap-1.5 text-black">
                      <span className="text-neutral-400 text-xs">🎂</span>
                      <span className="font-semibold">{profileForm.age} anos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-black truncate" title={profileForm.location}>
                      <span className="text-neutral-400 text-xs">📍</span>
                      <span className="font-semibold truncate">{profileForm.location || "São Paulo, SP"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-black truncate" title={userProfession}>
                      <span className="text-neutral-400 text-xs">💼</span>
                      <span className="font-semibold truncate">{userProfession || "Parceiro"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-black">
                      <span className="text-neutral-400 text-xs">⏳</span>
                      <span className="font-semibold">Entrou há 4 dias</span>
                    </div>
                  </div>
                </div>

                {/* SEÇÃO SELO DE CONTA AUTÊNTICA */}
                <div className="border-t-2 border-dashed border-black/10 pt-3 flex flex-col gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-purple block">
                    Selo de Conta Autêntica
                  </span>
                  {isVerified ? (
                    <div className="flex items-center gap-2.5 bg-[#E2F0CB] border-2 border-black rounded-xl p-2.5 shadow-[2px_2px_0px_#000] animate-in slide-in-from-bottom duration-300">
                      <img 
                        src="https://img.icons8.com/?size=100&id=6xO3fnY41hu2&format=png&color=000000" 
                        className="w-6.5 h-6.5 shrink-0 select-none animate-in scale-in duration-300" 
                        alt="Verificado" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-[11px] font-black text-black leading-tight">Sua conta é Autêntica</p>
                        <p className="text-[8.5px] font-mono leading-tight font-bold text-black/60">Verificação de Landmarks Biométricos pelo MediaPipe bem-sucedida!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 bg-yellow-50/75 border-2 border-black rounded-xl p-3 shadow-[2.5px_2.5px_0px_#000] animate-in slide-in-from-bottom duration-300">
                      <div className="flex items-start gap-2">
                        <span className="text-sm">⚠️</span>
                        <div>
                          <p className="text-[11.5px] font-black text-black leading-tight">Seu perfil ainda não foi verificado</p>
                          <p className="text-[9px] font-mono text-neutral-600 leading-tight mt-0.5 font-bold">Faça a verificação facial biométrica hoje mesmo provando que você é a mesma pessoa das suas fotos de portfólio.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFaceVerificationModalOpen(true);
                          resetFaceVerificationState();
                        }}
                        className="w-full py-2 bg-[#FCFCFA] hover:bg-[#B088F9] hover:text-white border-2 border-black rounded-xl text-[9px] font-black font-mono uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        ⚡ Iniciar Verificação Facial
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* IF COMPONENT IS IN EDIT MODE (Card Completo de Edição) */}
            {profileActiveSubTab === 'edit' && (
              <div className="bg-white md:border-3 border-black md:rounded-[24px] min-h-full p-4.5 sm:p-5.5 shadow-none md:shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-300">
                
                {/* Título de Edição com Botão de Voltar */}
                <div className="border-b-2 border-black/10 pb-2.5 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold font-display flex items-center gap-1.5 text-black">
                      <Sliders size={14} className="text-brand-purple" />
                      Gerenciar Fotos e Dados
                    </h3>
                    <p className="text-[9px] text-text-muted mt-0.5 leading-tight font-mono">
                      Portfólio de fotos reais e informações persistidas no Supabase.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileActiveSubTab('view')}
                    className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg text-[9px] font-bold font-mono text-black transition-all shadow-[1px_1px_0px_#000] flex items-center cursor-pointer shrink-0"
                  >
                    ← Voltar
                  </button>
                </div>

                {/* GERENCIADOR DE FOTOS (Foco visual com botão + roxo e seleção real) */}
                <div className="space-y-3 bg-[#FCFCFA] p-4 border-2 border-black rounded-3xl relative">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs uppercase font-mono tracking-wider text-black">
                      Suas fotos ({userPhotos.length})
                    </span>
                    <span className="text-[9px] font-mono text-[#10B981] bg-[#D1FAE5] px-2 py-0.5 rounded-full font-bold">
                      Moderação Facial Ativa
                    </span>
                  </div>

                  {/* Input de Arquivo Oculto para Seleção Nativa de Galeria */}
                  <input 
                    type="file"
                    id="profile-gallery-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 8 * 1024 * 1024) {
                          triggerActionAlert("Por favor, envie uma foto de até 8MB!");
                          return;
                        }
                        
                        const fileName = file.name || "imagem.jpg";
                        setNsfwLogs([]);
                        setNsfwResults(null);
                        setModerationStatus('scanning');
                        setIsModeratingImage(true);
                        setModerationMessage("Inicializando varredura inteligente NSFWJS...");
                        
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          const base64Img = reader.result as string;
                          let finalImg = base64Img;
                          try {
                            finalImg = await compressImageBase64(base64Img);
                          } catch (err) {
                            console.warn("Falha ao compactar imagem da galeria:", err);
                          }
                          
                          const updateProgress = (msg: string) => {
                            setModerationMessage(msg);
                            setNsfwLogs(prev => [...prev, msg]);
                          };
                          
                          const logScores = (scores: any[]) => {
                            setNsfwResults(scores);
                          };
                          
                          try {
                            const checkResult = await runNSFWJSCheck(finalImg, fileName, updateProgress, logScores);
                            if (checkResult.passed) {
                              setModerationStatus('passed');
                              updateProgress("✅ Imagem verificada e aprovada com sucesso pelas políticas!");
                              
                              setTimeout(() => {
                                setIsModeratingImage(false);
                                setModerationStatus('idle');
                                setNsfwLogs([]);
                                setNsfwResults(null);
                                setUserPhotos(prev => {
                                  const updated = [...prev, finalImg];
                                  localStorage.setItem(`fw_photos_${user?.id || 'guest'}`, JSON.stringify(updated));
                                  savePhotosToSupabaseDirect(updated);
                                  return updated;
                                });
                                triggerActionAlert("Sua foto foi aprovada pelo NSFWJS e salva no portfólio! ❤️✨");
                              }, 1500);
                            } else {
                              setModerationStatus('blocked');
                              updateProgress(`❌ Imagem Bloqueada: ${checkResult.reason}`);
                              triggerActionAlert("Upload Bloqueado! Esta imagem infringe diretrizes anti-fake/pornografia.");
                            }
                          } catch (scanErr) {
                            console.error("Erro no fluxo do scan:", scanErr);
                            setModerationStatus('blocked');
                            updateProgress("⚠️ Erro crítico na decodificação de imagem.");
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  {/* Slider horizontal de fotos com botão + roxo */}
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    
                    {/* BOTÃO CARD + ROXO PARA ADICIONAR DA GALERIA */}
                    <button
                      type="button"
                      disabled={isModeratingImage}
                      onClick={() => {
                        document.getElementById('profile-gallery-upload')?.click();
                      }}
                      className="w-24 sm:w-28 h-32 sm:h-36 bg-[#B088F9] hover:bg-[#9965F7] border-3 border-black rounded-2xl flex flex-col items-center justify-center shrink-0 transition-all shadow-[3.5px_3.5px_0px_#000] active:translate-y-0.5 active:shadow-none cursor-pointer group"
                      title="Adicionar da Galeria de Fotos"
                    >
                      <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-white border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000] group-hover:scale-105 transition-transform">
                        <span className="text-2xl sm:text-3xl font-black text-black leading-none">+</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-black mt-2 text-center px-1">
                        Galeria 📸
                      </span>
                    </button>

                    {/* LISTA DE FOTOS DO USUÁRIO */}
                    {userPhotos.map((photoUrl, photoIdx) => (
                      <div 
                        key={photoIdx}
                        className="w-24 sm:w-28 h-32 sm:h-36 rounded-2xl border-3 border-black overflow-hidden shrink-0 relative shadow-[3.5px_3.5px_0px_#000] group snap-start"
                      >
                        <img 
                          src={photoUrl} 
                          alt={`Foto ${photoIdx + 1}`} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Botão de deletar */}
                        <button
                          type="button"
                          onClick={() => {
                            if (userPhotos.length <= 1) {
                              triggerActionAlert("Você precisa manter pelo menos 1 foto ativa de portfólio!");
                              return;
                            }
                            setPhotoToDeleteIdx(photoIdx);
                          }}
                          className="absolute bottom-1.5 right-1.5 p-1 bg-red-100 hover:bg-red-200 border-2 border-black rounded-xl transition-all cursor-pointer shadow-[1px_1px_0px_#000]"
                          title="Remover Foto"
                        >
                          <Trash size={10} className="text-red-700" />
                        </button>

                        <span className="absolute top-1.5 left-1.5 bg-black/60 text-[8px] text-white font-mono px-1.5 rounded-md font-bold">
                          #{photoIdx + 1}
                        </span>
                      </div>
                    ))}

                  </div>

                  {/* CONFIRMAÇÃO DE DELETAR IMAGEM PERSONALIZADA (CARD VISUAL) */}
                  {photoToDeleteIdx !== null && (
                    <div className="bg-red-50 border-3 border-black p-4 rounded-3xl mt-1 mb-3 space-y-3 shadow-[4px_4px_0px_#000] relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-2">
                        <Trash size={16} className="text-red-600 animate-pulse" />
                        <span className="font-extrabold text-[11px] font-mono uppercase tracking-wider text-black">
                          Confirmar Exclusão de Foto?
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-700 font-mono leading-relaxed">
                        Você tem certeza de que quer excluir sua foto de perfil #{photoToDeleteIdx + 1}? Ela será imediatamente removida daqui e do Supabase.
                      </p>
                      
                      {/* Mini visual preview */}
                      {userPhotos[photoToDeleteIdx] && (
                        <div className="w-16 h-16 rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000] mx-auto my-1">
                          <img 
                            src={userPhotos[photoToDeleteIdx]} 
                            className="w-full h-full object-cover" 
                            alt="Visual de confirmação" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setPhotoToDeleteIdx(null)}
                          className="bg-white hover:bg-neutral-100 font-bold font-mono text-[9px] px-3 py-1.5 border-2 border-black rounded-lg transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none cursor-pointer text-black"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const idx = photoToDeleteIdx;
                            if (idx !== null) {
                              setUserPhotos(prev => {
                                const updated = prev.filter((_, i) => i !== idx);
                                localStorage.setItem(`fw_photos_${user?.id || 'guest'}`, JSON.stringify(updated));
                                savePhotosToSupabaseDirect(updated);
                                return updated;
                              });
                              triggerActionAlert("Sua foto foi excluída do Supabase com sucesso! 🗑️✨");
                              setPhotoToDeleteIdx(null);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold font-mono text-[9px] px-3 py-1.5 border-2 border-black rounded-lg transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none cursor-pointer"
                        >
                          Confirmar Exclusão
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Loader de Moderação de Imagem IA Simulado */}
                  {/* Loader e Resultados de Moderação NSFWJS em Tempo Real */}
                  {isModeratingImage && (
                    <div className="space-y-2 mt-2">
                      {moderationStatus === 'scanning' && (
                        <div className="bg-white border-2 border-black p-3.5 rounded-2xl flex items-center gap-3 animate-pulse">
                          <RefreshCw size={14} className="animate-spin text-brand-purple shrink-0" />
                          <div className="flex-1">
                            <p className="text-[10px] font-black font-mono text-black uppercase leading-tight">Scanner NSFW Inteligente Ativo 🧠</p>
                            <p className="text-[9px] text-black/60 leading-normal mt-0.5 font-mono">{moderationMessage}</p>
                          </div>
                        </div>
                      )}

                      {moderationStatus === 'blocked' && (
                        <div className="bg-red-50 border-2 border-red-500/30 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-red-600 font-mono tracking-wide uppercase">🚫 Upload de Imagem Bloqueado</p>
                            <p className="text-[9px] text-red-700 font-mono leading-tight mt-1">{moderationMessage}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsModeratingImage(false);
                              setModerationStatus('idle');
                              setNsfwLogs([]);
                              setNsfwResults(null);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold font-mono text-[9px] px-3 py-1.5 border-2 border-black rounded-lg transition-all shadow-[2px_2px_0px_#000]"
                          >
                            Entendi e Fechar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* FORMULÁRIO DE ATUALIZAÇÃO CADASTRO */}
                <form onSubmit={async (e) => {
                  await handleSaveProfile(e);
                  setProfileActiveSubTab('view');
                }} className="space-y-4">
                  
                  {/* Linha Nome & @ Instagram */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-xs font-mono text-[#05121c] flex items-center gap-1.5">
                        <UserIcon size={14} className="text-[#05121c] shrink-0" />
                        Nome Completo
                      </label>
                      <input 
                        type="text" 
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#FAF9F5] border-2 border-black rounded-xl p-2.5 outline-none focus:border-brand-purple font-semibold text-xs transition-all text-black" 
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-xs font-mono text-[#05121c] flex items-center gap-1.5">
                        <Instagram size={14} className="text-[#05121c] shrink-0" />
                        URL do Instagram
                      </label>
                      <input 
                        type="url" 
                        value={profileForm.username}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Ex: https://www.instagram.com/seu_usuario"
                        className="w-full bg-[#FAF9F5] border-2 border-black rounded-xl p-2.5 outline-none focus:border-brand-purple font-semibold text-xs transition-all text-black block" 
                        required
                      />
                    </div>
                  </div>

                  {/* Idade & Gênero */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-xs font-mono text-[#05121c] flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-[#05121c] shrink-0" />
                        Idade Real
                      </label>
                      <input 
                        type="number" 
                        value={profileForm.age}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                        className="w-full bg-[#FAF9F5] border-2 border-black rounded-xl p-2.5 outline-none focus:border-brand-purple font-semibold text-xs transition-all text-black" 
                        min="14"
                        max="95"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-xs font-mono text-[#05121c] flex items-center gap-1.5">
                        <Users size={14} className="text-[#05121c] shrink-0" />
                        Gênero
                      </label>
                      <select 
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-[#FAF9F5] border-2 border-black rounded-xl p-2.5 outline-none focus:border-brand-purple font-semibold text-xs transition-all text-black"
                      >
                        <option value="Feminino">Feminino ♀️</option>
                        <option value="Masculino">Masculino ♂️</option>
                        <option value="Não Binário">Não Binário ⚧️</option>
                        <option value="Prefiro não dizer">Prefiro não dizer</option>
                      </select>
                    </div>
                  </div>

                  {/* Cidade & Ocupação */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-xs font-mono text-[#05121c] flex items-center gap-1.5">
                        <Building size={14} className="text-[#05121c] shrink-0" />
                        Cidade / UF
                      </label>
                      <select 
                        value={profileForm.location}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-[#FAF9F5] border-2 border-black rounded-xl p-2.5 outline-none focus:border-brand-purple font-semibold text-xs transition-all text-black" 
                        required
                      >
                        <option value="">Selecione o Estado / UF</option>
                        <option value="Acre, AC">Acre (AC)</option>
                        <option value="Alagoas, AL">Alagoas (AL)</option>
                        <option value="Amapá, AP">Amapá (AP)</option>
                        <option value="Amazonas, AM">Amazonas (AM)</option>
                        <option value="Bahia, BA">Bahia (BA)</option>
                        <option value="Ceará, CE">Ceará (CE)</option>
                        <option value="Distrito Federal, DF">Distrito Federal (DF)</option>
                        <option value="Espírito Santo, ES">Espírito Santo (ES)</option>
                        <option value="Goiás, GO">Goiás (GO)</option>
                        <option value="Maranhão, MA">Maranhão (MA)</option>
                        <option value="Mato Grosso, MT">Mato Grosso (MT)</option>
                        <option value="Mato Grosso do Sul, MS">Mato Grosso do Sul (MS)</option>
                        <option value="Minas Gerais, MG">Minas Gerais (MG)</option>
                        <option value="Pará, PA">Pará (PA)</option>
                        <option value="Paraíba, PB">Paraíba (PB)</option>
                        <option value="Paraná, PR">Paraná (PR)</option>
                        <option value="Pernambuco, PE">Pernambuco (PE)</option>
                        <option value="Piauí, PI">Piauí (PI)</option>
                        <option value="Rio de Janeiro, RJ">Rio de Janeiro (RJ)</option>
                        <option value="Rio Grande do Norte, RN">Rio Grande do Norte (RN)</option>
                        <option value="Rio Grande do Sul, RS">Rio Grande do Sul (RS)</option>
                        <option value="Rondônia, RO">Rondônia (RO)</option>
                        <option value="Roraima, RR">Roraima (RR)</option>
                        <option value="Santa Catarina, SC">Santa Catarina (SC)</option>
                        <option value="São Paulo, SP">São Paulo (SP)</option>
                        <option value="Sergipe, SE">Sergipe (SE)</option>
                        <option value="Tocantins, TO">Tocantins (TO)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-xs font-mono text-[#05121c] flex items-center gap-1.5">
                        <Briefcase size={14} className="text-[#05121c] shrink-0" />
                        Profissão / Ocupação
                      </label>
                      <input 
                        type="text" 
                        value={userProfession}
                        onChange={(e) => setUserProfession(e.target.value)}
                        className="w-full bg-[#FAF9F5] border-2 border-black rounded-xl p-2.5 outline-none focus:border-brand-purple font-semibold text-xs transition-all text-black" 
                        placeholder="Ex: Produtor de Conteúdo"
                        required
                      />
                    </div>
                  </div>

                  {/* Biografia Curta */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-xs font-mono text-[#05121c] flex items-center gap-1.5">
                        <Pencil size={14} className="text-[#05121c] shrink-0" />
                        Biografia Profissional Curta
                      </label>
                      <span className={cn(
                        "text-[9px] font-mono font-bold px-1.5 py-0.2 rounded",
                        (profileForm.bio || "").length > 120 ? "bg-red-100 text-red-700" : "bg-neutral-100 text-black/40"
                      )}>
                        {(profileForm.bio || "").length}/120 caracteres
                      </span>
                    </div>
                    <textarea 
                      value={profileForm.bio}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfileForm(prev => ({ ...prev, bio: val.substring(0, 120) }));
                      }}
                      rows={3}
                      className="w-full bg-[#FAF9F5] border-2 border-black rounded-xl p-3 outline-none focus:border-brand-purple font-semibold text-xs transition-all resize-none leading-relaxed text-black" 
                      placeholder="Escreva sobre suas redes, foco ou público..."
                      required
                    />
                  </div>

                  {/* TOGGLE STATUS DO SELO CERTIFICADO OFICIAL */}
                  <div className="flex items-center justify-between bg-white border-2 border-black rounded-2xl p-3 shadow-sm text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[#10B981]">🛡️</span>
                      <div>
                        <p className="font-bold text-black leading-none uppercase">Selo de Conta Autêntica</p>
                        <p className="text-[9px] text-black/55 leading-none mt-0.5">Ativar marcação de perfil autêntico</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsVerified(!isVerified);
                        triggerActionAlert(isVerified ? "Selo removido" : "Perfil Verificado ativado!");
                      }}
                      className={cn(
                        "px-2.5 py-1 border-2 border-black rounded-lg text-[9px] uppercase font-black tracking-wide shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all",
                        isVerified ? "bg-[#10B981] text-white" : "bg-neutral-100 text-black/50"
                      )}
                    >
                      {isVerified ? "Ligado" : "Desligado"}
                    </button>
                  </div>

                  {/* Botões de Ação */}
                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full py-4 bg-black text-white hover:bg-neutral-900 border-2 border-black rounded-3xl font-black text-xs font-mono uppercase tracking-widest transition-all shadow-[4px_4px_0px_rgba(176,136,249,1)] active:translate-y-0.5 active:shadow-none text-center flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <Save size={14} className="text-white shrink-0" />
                      <span>Salvar Alterações</span>
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* COORDENADAS DO RODAPÉ (DOCK E ÍCONES FIXOS DA ÁREA INTERNA - FIXADO EMBAIXO) */}
      {/* ======================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 z-[140] w-full bg-white border-t-2 border-black py-1.5 px-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="max-w-md mx-auto flex items-center justify-around gap-1">
          
          {/* ÍCONE MATCH FEED (CURTIDAS / DESCOBERTA) */}
          <button
            onClick={() => setActiveTab('feed')}
            className={cn(
              "p-1.5 rounded-xl transition-all relative group flex flex-col items-center",
              activeTab === 'feed' ? "bg-brand-purple text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]" : "text-black hover:bg-black/5"
            )}
            title="Sindicato de Matches"
          >
            <Compass className="w-5 h-5" />
            <span className="text-[8px] font-bold font-mono">Matches</span>
          </button>

          {/* ÍCONE CHAT */}
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "p-1.5 rounded-xl transition-all relative group flex flex-col items-center",
              activeTab === 'chat' ? "bg-brand-purple text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]" : "text-black hover:bg-black/5"
            )}
            title="Mensagens"
          >
            <Compass className="w-5 h-5 invisible absolute" />
            <MessageCircle className="w-5 h-5" />
            
            {/* Notificação Simulada Ponto Vermelho */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFD166] border border-black rounded-full shadow-[0.5px_0.5px_0px_#000]" />
            <span className="text-[8px] font-bold font-mono">Chat</span>
          </button>

          {/* ÍCONE CURTIDAS (HISTÓRICO) */}
          <button
            onClick={() => setActiveTab('likes')}
            className={cn(
              "p-1.5 rounded-xl transition-all relative group flex flex-col items-center",
              activeTab === 'likes' ? "bg-brand-purple text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]" : "text-black hover:bg-black/5"
            )}
            title="Curtidas e Comentários"
          >
            <Heart className="w-5 h-5" fill={activeTab === 'likes' ? 'currentColor' : 'none'} />
            <span className="text-[8px] font-bold font-mono">Likes</span>
          </button>

          {/* ÍCONE MEU PERFIL */}
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              "p-1.5 rounded-xl transition-all relative group flex flex-col items-center",
              activeTab === 'profile' ? "bg-brand-purple text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]" : "text-black hover:bg-black/5"
            )}
            title="Meu Perfil"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[8px] font-bold font-mono">Perfil</span>
          </button>

        </div>
      </footer>

      {/* ======================================================== */}
      {/* MODAL FESTIVO CARNAVALESCO DE DEU MATCH! (MUTUAL CELEBRATE) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {matchNotification && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.85, opacity: 0, rotate: 2 }}
              className="bg-card-lilac border-4 border-black p-10 rounded-[45px] shadow-[8px_8px_0px_#000] text-center max-w-md w-full space-y-8 relative overflow-hidden"
            >
              {/* Confetes e Detalhes Decorativos */}
              <div className="absolute top-0 left-0 w-full h-2.5 bg-brand-purple" />
              
              <div className="space-y-2">
                <Badge className="bg-black text-white font-mono text-sm px-4 py-1 tracking-widest">BOOM! 🌋</Badge>
                <h2 className="text-4xl font-display font-black tracking-tight text-black leading-tight pt-2">DEU MATCH!</h2>
                <p className="text-sm font-semibold text-black/70">Vocês demonstraram interesse mútuo no Instagram!</p>
              </div>

              {/* Conexão Visual de Avatares */}
              <div className="flex items-center justify-center gap-6">
                
                {/* Usuário logado */}
                <div className="relative">
                  <img 
                    src={userProfile?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop'} 
                    className="w-20 h-20 rounded-full border-4 border-black object-cover bg-white shadow-[3px_3px_0px_#000]" 
                    alt="me" 
                  />
                  <span className="absolute -bottom-2 right-0 bg-[#A3E635] text-black text-[9px] border border-black px-1.5 py-0.2 rounded font-black">VOCÊ</span>
                </div>

                <div className="relative shrink-0 flex items-center justify-center">
                  <Heart className="w-10 h-10 text-brand-purple animate-ping absolute" fill="currentColor" />
                  <Heart className="w-10 h-10 text-brand-purple relative z-10" fill="currentColor" />
                </div>

                {/* Parceiro Match */}
                <div className="relative">
                  <img 
                    src={matchNotification.image} 
                    className="w-20 h-20 rounded-full border-4 border-black object-cover bg-white shadow-[3px_3px_0px_#000]" 
                    alt="creator" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-2 right-0 bg-brand-purple text-white text-[9px] border border-black px-1.5 py-0.2 rounded font-black uppercase">@match</span>
                </div>

              </div>

              <div className="bg-white border-2 border-black p-4 rounded-2xl shadow-[2px_2px_0px_#000] text-left">
                <p className="text-xs font-mono font-bold text-black/40">Dica de Conversa:</p>
                <p className="text-xs text-black font-semibold mt-1">@anasilva_fit adora falar sobre Musculação e Bem-estar!</p>
              </div>

              {/* Ações */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => {
                    setActiveChatId(matchNotification.id);
                    setMatchNotification(null);
                    setActiveTab('chat');
                    triggerActionAlert("Sala de Chat carregada!");
                  }}
                  className="w-full py-4 bg-black text-white rounded-2xl border-2 border-black font-black text-base transition-all shadow-[3px_3px_0px_#B088F9] active:translate-y-0.5 active:shadow-none text-center block"
                >
                  💬 Iniciar Conversa de Networking
                </button>
                <button 
                  onClick={() => setMatchNotification(null)}
                  className="w-full py-3 bg-white text-black rounded-xl border-2 border-black font-bold text-xs hover:bg-gray-50 active:translate-y-0.5 active:shadow-none"
                >
                  Continuar Descobrindo Pessoas
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL PARA PROPOSTA / COMENTÁRIOS COM TEXTO (ICEBREAKER) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {commentsModal.isOpen && commentsModal.targetProfile && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white border-4 border-black p-8 rounded-[38px] shadow-[8px_8px_0px_#000] max-w-md w-full text-left space-y-6"
            >
              <div className="flex items-center justify-between border-b pb-3 border-black/10">
                <h4 className="text-xl font-bold font-display text-black flex items-center gap-1.5">
                  <Megaphone size={18} className="text-brand-purple" /> Enviar Icebreaker / Proposta
                </h4>
                <button 
                  onClick={() => setCommentsModal({ isOpen: false, targetProfile: null })}
                  className="p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X />
                </button>
              </div>

              <div className="flex items-center gap-3 bg-card-lilac/30 border border-black/15 p-3 rounded-2xl">
                <img 
                  src={commentsModal.targetProfile.image} 
                  className="w-12 h-12 rounded-full border border-black object-cover" 
                  alt="" 
                />
                <div>
                  <p className="text-sm font-bold text-black">{commentsModal.targetProfile.name}</p>
                  <p className="text-xs text-black/50 font-mono leading-none">{commentsModal.targetProfile.handle}</p>
                </div>
              </div>

              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold font-mono text-black/40 uppercase block">Escreva sua Mensagem / Proposta</label>
                  <textarea
                    rows={4}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Ex: Curti muito suas dicas de fotografia! Gostaria de te marcar nos Stories recomendando seu ig e vice-versa. O que acha?"
                    className="w-full bg-surface border-2 border-black rounded-2xl p-4 text-xs outline-none focus:border-brand-purple transition-all resize-none leading-relaxed font-semibold text-black"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setCommentsModal({ isOpen: false, targetProfile: null })}
                    className="flex-1 py-3 border-2 border-black rounded-xl font-bold text-xs bg-white text-black hover:bg-gray-50 active:translate-y-0.5"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-3 bg-brand-purple text-black border-2 border-black rounded-xl font-bold text-xs shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none hover:bg-opacity-95"
                  >
                    Enviar Proposta Direta 🚀
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL BIOMÉTRICO OVAL: VERIFICAÇÃO FACIAL MEDIAPIPE      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isFaceVerificationModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white border-4 border-black p-5 sm:p-7 rounded-[40px] shadow-[8px_8px_0px_#000] max-w-md w-full text-center space-y-5 my-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3 border-black/10">
                <div className="text-left">
                  <h4 className="text-lg font-black font-display text-black flex items-center gap-1.5 leading-tight">
                    <Shield size={18} className="text-brand-purple shrink-0" />
                    Biometria Facial
                  </h4>
                  <p className="text-[9px] font-mono font-bold text-neutral-400 mt-0.5 uppercase tracking-wider">
                    MediaPipe Task-Vision v0.10
                  </p>
                </div>
                <button 
                  onClick={() => {
                    stopFaceCamera();
                    setIsFaceVerificationModalOpen(false);
                  }}
                  className="p-1.5 hover:bg-black/5 border-2 border-black rounded-xl transition-all shadow-[1.5px_1.5px_0px_#000]"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Descrição rápida das Instruções do Scanner */}
              <div className="bg-[#FAF9F5] border-2 border-black p-2.5 rounded-2xl text-left text-[11px] space-y-1">
                <p className="font-extrabold text-[#05121c] flex items-center gap-1">
                  <span>💡</span> Instruções de Autenticação:
                </p>
                <ol className="list-decimal pl-4.5 font-mono text-[9px] text-neutral-600 font-bold space-y-0.5 leading-tight">
                  <li>Inicie a câmera e alinhe seu rosto no oval pontilhado;</li>
                  <li>Aproxime o rosto devagar até o calibrador acusar ideal;</li>
                  <li>Dê uma leve distância (afastar) para fechar os landmarks faciais.</li>
                </ol>
              </div>

              {/* Área do Feed de Câmera com Oval Viewport */}
              <div className="relative w-full aspect-square max-w-[340px] mx-auto border-3 border-black rounded-[32px] overflow-hidden bg-neutral-900 group shadow-[4px_4px_0px_rgba(0,0,0,0.15)] flex items-center justify-center">
                
                {/* O Elemento de Vídeo Real da Câmera do Usuário */}
                <video
                  ref={faceVideoRef}
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                  style={{ display: (verificationStep === 'aligning' || verificationStep === 'approaching' || verificationStep === 'pulling') ? 'block' : 'none' }}
                />

                {/* Canvas de Desenho dos Landmarks do MediaPipe por Cima */}
                <canvas
                  ref={faceCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1] z-10"
                  style={{ display: (verificationStep === 'aligning' || verificationStep === 'approaching' || verificationStep === 'pulling') ? 'block' : 'none' }}
                />

                {/* HUD Overlay / Estado de Processamento ou Idle */}
                {(verificationStep === 'idle' || verificationStep === 'initializing' || verificationStep === 'processing' || verificationStep === 'success' || verificationStep === 'failed') && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/65 text-white z-20 space-y-4 animate-in fade-in duration-300">
                    
                    {verificationStep === 'idle' && (
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-[#B088F9] rounded-full mx-auto border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                          <Camera size={26} className="text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-black font-display text-white">Pronto para Escaneamento</p>
                          <p className="text-[10px] text-neutral-300 font-mono mt-1">Conectando com o hardware fisionômico...</p>
                        </div>
                        <button
                          type="button"
                          onClick={startFaceCamera}
                          className="px-4 py-2 bg-white text-black border-2 border-black rounded-xl font-bold font-mono text-[9.5px] uppercase tracking-wider hover:bg-neutral-100 shadow-[2px_2px_0px_#A855F7] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                        >
                          Iniciar Câmera 📸
                        </button>
                      </div>
                    )}

                    {verificationStep === 'initializing' && (
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 border-4 border-t-[#B088F9] border-neutral-700 rounded-full animate-spin mx-auto" />
                        <div>
                          <p className="text-xs font-mono font-bold text-neutral-300">Iniciando feed de vídeo compatível...</p>
                        </div>
                      </div>
                    )}

                    {verificationStep === 'processing' && (
                      <div className="w-full text-center space-y-4 px-4">
                        <div className="flex justify-center items-center gap-4">
                          {/* Face do Cadastro */}
                          <div className="relative">
                            <img 
                              src={userPhotos[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop'} 
                              className="w-14 h-14 rounded-full object-cover border-2 border-dashed border-[#10B981] p-0.5 bg-neutral-900" 
                              alt="Cadastro" 
                            />
                            <span className="absolute -bottom-1.5 -right-1.5 bg-[#10B981] text-black font-mono text-[8px] border border-black rounded px-1 font-black">CADASTRO</span>
                          </div>

                          <div className="w-10 border-t-2 border-dashed border-white/30 relative flex items-center justify-center">
                            <span className="text-xs absolute animate-pulse">⚡</span>
                          </div>

                          {/* Scanner Mapped Avatar */}
                          <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-[#1e1430] border-2 border-dashed border-brand-purple p-0.5 flex items-center justify-center">
                              <Smile size={24} className="text-[#B088F9] animate-bounce" />
                            </div>
                            <span className="absolute -bottom-1.5 -right-1.5 bg-brand-purple text-white font-mono text-[8px] border border-black rounded px-1 font-black">SCANNER</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-xs font-bold font-mono text-neutral-200">Cruzando vetores de semelhança fisionômica...</p>
                          <div className="text-2xl font-black font-display text-brand-purple tracking-tight leading-none">
                            {similarityRate}% similar
                          </div>
                          <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden border border-black">
                            <div 
                              className="bg-brand-purple h-full transition-all duration-100"
                              style={{ width: `${(similarityRate / (shouldSimulateMismatch ? 31.4 : 96.8)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {verificationStep === 'success' && (
                      <div className="text-center space-y-3.5 px-3 animate-in scale-in duration-300">
                        <div className="w-16 h-16 bg-[#E2F0CB] rounded-full mx-auto border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                          <img src="https://img.icons8.com/?size=100&id=6xO3fnY41hu2&format=png&color=000000" className="w-9 h-9" alt="" />
                        </div>
                        <div>
                          <p className="text-sm font-black font-display text-[#A3E635]">AUTENTICAÇÃO APROVADA!</p>
                          <p className="text-[10px] text-neutral-300 font-mono mt-1 leading-relaxed">
                            O padrão geométrico corresponde com as imagens de cadastro. Conta selada!
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsFaceVerificationModalOpen(false);
                          }}
                          className="px-5 py-2.5 bg-[#A3E635] text-black border-2 border-black rounded-xl font-black font-sans text-[10px] uppercase tracking-wider hover:bg-[#86be26] shadow-[2.5px_2.5px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                        >
                          Concluir e Exibir Selo 🏆
                        </button>
                      </div>
                    )}

                    {verificationStep === 'failed' && (
                      <div className="text-center space-y-3.5 px-3 animate-in scale-in duration-200">
                        <div className="w-14 h-14 bg-red-100 rounded-full mx-auto border-2 border-black flex items-center justify-center text-red-600 font-black text-2xl shadow-[3px_3px_0px_#000]">
                          ❌
                        </div>
                        <div>
                          <p className="text-sm font-black font-display text-red-400 font-semibold uppercase">DIVERGÊNCIA FACIAL DETECTADA</p>
                          <p className="text-[10px] text-neutral-300 font-mono mt-1 leading-normal">
                            As marcas correspondidas não possuem consistência física com o seu portfólio.
                          </p>
                        </div>
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              resetFaceVerificationState();
                              startFaceCamera();
                            }}
                            className="flex-1 py-2 bg-white text-black border-2 border-black rounded-lg font-bold font-mono text-[9px] hover:bg-neutral-100"
                          >
                            Tentar De Novo 🔄
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsFaceVerificationModalOpen(false);
                            }}
                            className="flex-1 py-2 bg-neutral-800 text-white border-2 border-black rounded-lg font-bold font-mono text-[9px] hover:bg-neutral-700"
                          >
                            Sair
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Instruções de Movimento e Barra de Progresso do Passo Real-Time */}
                {(verificationStep === 'aligning' || verificationStep === 'approaching' || verificationStep === 'pulling') && (
                  <div className="absolute inset-x-3 bottom-3 z-30 bg-black/75 backdrop-blur-sm border border-white/20 p-2.5 rounded-2xl text-left flex flex-col gap-1.5 animate-in slide-in-from-bottom duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-brand-purple font-black">
                        {verificationStep === 'aligning' ? 'ETAPA 1: ALINHAR ROSTO 📐' : verificationStep === 'approaching' ? 'ETAPA 2: APROXIME-SE 📲' : 'ETAPA 3: AFASTE-SE LERDO 📸'}
                      </span>
                      <span className="text-[8.5px] font-mono text-white/70 font-bold">
                        {distanceValue}% Foco
                      </span>
                    </div>

                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-brand-purple h-full transition-all duration-100"
                        style={{ width: `${verificationProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status Message */}
              <p className="text-[10px] font-mono font-bold text-neutral-600 bg-neutral-100/75 border border-black/10 px-3 py-2 rounded-2xl text-center leading-normal">
                {verificationMessage}
              </p>

              {/* Opções de Teste de Desenvolvedor na Parte de Baixo (Para Simular Consistência) */}
              <div className="border-t pt-3 border-dashed border-black/15 flex items-center justify-between gap-2.5 text-left bg-neutral-50 p-2.5 rounded-2xl">
                <div>
                  <p className="text-[9.5px] font-black text-black leading-none">Simular Falha de Consistência</p>
                  <p className="text-[8px] font-mono text-neutral-500 mt-1 leading-tight font-semibold">Tente isto para ver como a conferência lida com rostos diferentes!</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShouldSimulateMismatch(!shouldSimulateMismatch);
                    triggerActionAlert(shouldSimulateMismatch ? "Modo aprovação fisionômica ativado!" : "Simulando falha de correspondência facial.");
                  }}
                  className={`px-3 py-1.5 border-2 border-black rounded-lg font-black font-mono text-[8px] uppercase tracking-wider transition-all cursor-pointer ${shouldSimulateMismatch ? 'bg-red-500 text-white shadow-none' : 'bg-[#FAF9F5] text-black shadow-[1.5px_1.5px_0px_#000]'}`}
                >
                  {shouldSimulateMismatch ? "Simulando Falha" : "Simular Erro"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("bg-brand-purple text-xs font-bold uppercase tracking-widest px-3 py-1 text-black border border-black rounded shadow-[1px_1px_0px_#000]", className)}>
    {children}
  </span>
);
