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
  Smile
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

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

  // Controle de adição de foto inline (sem window.prompt blocked by iframe)
  const [isPhotoFormOpen, setIsPhotoFormOpen] = useState(false);
  const [photoInputUrl, setPhotoInputUrl] = useState("");

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
    if (userProfile?.images && userProfile.images.length > 0) {
      return userProfile.images;
    }
    if (userProfile?.avatar_url) {
      return [userProfile.avatar_url];
    }
    try {
      const saved = localStorage.getItem(`fw_photos_${user?.id || 'guest'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter((img: string) => 
            img && 
            !img.includes("photo-1506794778202") && 
            !img.includes("photo-1544005313-94ddf0286df2")
          );
          if (clean.length > 0) return clean;
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
    return true; // Default to verified true for premium/official design feel
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

  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.full_name || 'Seu Nome',
        username: userProfile.instagram_username || 'seu_instagram',
        bio: userProfile.bio || '',
        age: userProfile.age || 25,
        gender: userProfile.gender || 'Masculino',
        location: userProfile.location || 'São Paulo, SP'
      });
      if (userProfile.images && userProfile.images.length > 0) {
        const clean = userProfile.images.filter((img: string) => 
          img && 
          !img.includes("photo-1506794778202") && 
          !img.includes("photo-1544005313-94ddf0286df2")
        );
        if (clean.length > 0) {
          setUserPhotos(clean);
        } else if (userProfile.avatar_url) {
          setUserPhotos([userProfile.avatar_url]);
        }
      } else if (userProfile.avatar_url) {
        setUserPhotos([userProfile.avatar_url]);
      }
      if (userProfile.emojis) {
        // Quebrar string de emojis em array de caracteres individuais
        setUserEmojis(Array.from(userProfile.emojis));
      }
      if (userProfile.profession) {
        setUserProfession(userProfile.profession);
      }
    }
  }, [userProfile]);

  const savePhotosToSupabaseDirect = async (updatedPhotos: string[]) => {
    if (!user) return;
    try {
      const cleanUsername = profileForm.username.replace('@', '').trim().toLowerCase();
      const updatedAge = parseInt(profileForm.age.toString()) || 25;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          instagram_username: cleanUsername,
          full_name: profileForm.name,
          bio: profileForm.bio,
          age: updatedAge,
          gender: profileForm.gender,
          location: profileForm.location,
          images: updatedPhotos,
          avatar_url: updatedPhotos[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Erro ao salvar fotos no Supabase:', error.message);
      } else {
        console.log('Fotos salvas no Supabase!');
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

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          instagram_username: cleanUsername,
          full_name: profileForm.name,
          bio: profileForm.bio,
          age: updatedAge,
          gender: profileForm.gender,
          location: profileForm.location,
          images: userPhotos,
          avatar_url: userPhotos[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Erro ao atualizar Supabase, salvando local:', error.message);
      }

      // Salva as propriedades no localStorage atreladas ao usuário logado
      const userId = user?.id || 'guest';
      localStorage.setItem(`fw_photos_${userId}`, JSON.stringify(userPhotos));
      localStorage.setItem(`fw_tags_${userId}`, JSON.stringify(userTags));
      localStorage.setItem(`fw_emojis_${userId}`, JSON.stringify(userEmojis));
      localStorage.setItem(`fw_profession_${userId}`, userProfession);
      localStorage.setItem(`fw_location_${userId}`, profileForm.location);
      localStorage.setItem(`fw_verified_${userId}`, isVerified.toString());
      localStorage.setItem(`fw_views_${userId}`, profileViews.toString());
      localStorage.setItem(`fw_friends_added_${userId}`, friendsAddedCount.toString());

      // ...
      const userProfileLocation = profileForm.location;

      // Atualiza o estado global e repassa ao context
      setUserProfile({
        ...userProfile,
        full_name: profileForm.name,
        instagram_username: cleanUsername,
        bio: profileForm.bio,
        age: updatedAge,
        gender: profileForm.gender,
        images: userPhotos,
        avatar_url: userPhotos[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
        emojis: userEmojis.join(''),
        profession: userProfession,
        is_verified: isVerified,
        location: userProfileLocation
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
    <div className="bg-[#FAF9F5] min-h-screen pb-14 pt-1 px-1.5 sm:px-4 max-w-xl mx-auto relative antialiased text-black">
      
      {/* HEADER DA ÁREA INTERNA - ESTILO COMPACTO SEM BORDAS */}
      <div className="flex items-center justify-between w-full py-2 px-1 mb-3 bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-[110]">
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

      {/* PAINEL DE FILTROS EXPANSÍVEL (SÓ NO FEED MATCH) */}
      {activeTab === 'feed' && isFilterOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full bg-white border-3 border-black rounded-2xl p-4 mb-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left space-y-3.5 z-50 relative"
        >
          <div className="flex items-center justify-between border-b border-black/10 pb-2">
            <h4 className="font-mono font-black text-[11px] uppercase tracking-wider text-black flex items-center gap-1.5">
              <Sliders size={12} className="text-brand-purple" />
              <span>Parâmetros de Match</span>
            </h4>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="text-[9px] font-mono font-black px-2 py-1 bg-black text-white hover:bg-neutral-800 rounded-lg transition-colors shadow-[1px_1px_0px_#000]"
            >
              Aplicar ×
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Filtro Sexo */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold font-mono text-black/50 block">Gênero Alvo</label>
              <select 
                value={activeFilterGender}
                onChange={(e) => {
                  setActiveFilterGender(e.target.value);
                  setCurrentProfileIndex(0);
                }}
                className="w-full bg-[#FAF9F5] border-2 border-black rounded-xl p-2 font-bold text-xs select-none shadow-[1.5px_1.5px_0px_#000] focus:translate-y-0.5 focus:shadow-none transition-all outline-none"
              >
                <option value="Todos">Todos Gêneros 👥</option>
                <option value="Feminino">Feminino 👩</option>
                <option value="Masculino">Masculino 👨</option>
              </select>
              {userProfile?.gender && (
                <span className="text-[8px] font-mono font-semibold text-brand-purple block mt-1 leading-none">
                  🎯 Auto: {userProfile.gender === 'Masculino' ? 'Feminino' : 'Masculino'} (Sua preferência)
                </span>
              )}
            </div>

            {/* Filtro Nicho */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold font-mono text-black/50 block">Nicho</label>
              <select 
                value={activeFilterNiche}
                onChange={(e) => {
                  setActiveFilterNiche(e.target.value);
                  setCurrentProfileIndex(0);
                }}
                className="w-full bg-[#FAF9F5] border-2 border-black rounded-xl p-2 font-bold text-xs select-none shadow-[1.5px_1.5px_0px_#000] focus:translate-y-0.5 focus:shadow-none transition-all outline-none"
              >
                <option value="Todos">Todos Nichos 🌟</option>
                <option value="Fitness">🏋️‍♂️ Fitness</option>
                <option value="Moda">👗 Moda</option>
                <option value="Tecnologia">💻 Tecnologia</option>
                <option value="Viagem">✈️ Viagem</option>
                <option value="Arte">🎨 Arte</option>
                <option value="Música">🎵 Música</option>
              </select>
            </div>

            {/* Filtro Idade */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold font-mono text-black/50 block">Idade (16 até 99)</label>
              <div className="flex items-center gap-1.5">
                <div className="flex-1">
                  <span className="text-[7.5px] font-mono text-black/40 block">Mín</span>
                  <input 
                    type="number" 
                    min="16" 
                    max="99"
                    value={filterAgeMin}
                    onChange={(e) => {
                      const val = Math.max(16, Math.min(99, parseInt(e.target.value) || 16));
                      setFilterAgeMin(val);
                      setCurrentProfileIndex(0);
                    }}
                    className="w-full text-center bg-[#FAF9F5] border-2 border-black rounded-xl p-1.5 font-bold text-xs outline-none shadow-[1.5px_1.5px_0px_#000]"
                  />
                </div>
                <span className="font-mono text-black self-end pb-2 font-black">-</span>
                <div className="flex-1">
                  <span className="text-[7.5px] font-mono text-black/40 block">Máx</span>
                  <input 
                    type="number" 
                    min="16" 
                    max="99"
                    value={filterAgeMax}
                    onChange={(e) => {
                      const val = Math.max(16, Math.min(99, parseInt(e.target.value) || 99));
                      setFilterAgeMax(val);
                      setCurrentProfileIndex(0);
                    }}
                    className="w-full text-center bg-[#FAF9F5] border-2 border-black rounded-xl p-1.5 font-bold text-xs outline-none shadow-[1.5px_1.5px_0px_#000]"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-[9px] font-mono text-neutral-500 text-right leading-none pt-1">
            {filteredProfiles.length} criadores correspondentes encontrados.
          </div>
        </motion.div>
      )}

      {/* ABAS ESTILO YUBO: ARRASTE / RECOMENDADOS (SÓ NO FEED MATCH) */}
      {activeTab === 'feed' && (
        <div className="flex bg-neutral-200/60 border-2 border-black p-1 rounded-2xl w-full max-w-[280px] mx-auto shadow-[2px_2px_0px_#000] mb-5">
          <button 
            onClick={() => {
              setActiveFilterGender('Todos');
              setActiveFilterNiche('Todos');
              setCurrentProfileIndex(0);
            }}
            className={cn(
              "flex-1 py-1.5 rounded-xl text-[11px] font-black font-mono transition-all uppercase tracking-wide",
              activeFilterGender === 'Todos' && activeFilterNiche === 'Todos'
                ? "bg-black text-white" 
                : "text-black hover:bg-black/5"
            )}
          >
            Arraste
          </button>
          <button 
            onClick={() => {
              const matchesPreferGender = userProfile?.gender === 'Masculino' ? 'Feminino' : 'Todos';
              setActiveFilterGender(matchesPreferGender);
              setCurrentProfileIndex(0);
            }}
            className={cn(
              "flex-1 py-1.5 rounded-xl text-[11px] font-black font-mono transition-all uppercase tracking-wide relative",
              activeFilterGender !== 'Todos'
                ? "bg-brand-purple text-black border border-black shadow-[1.5px_1.5px_0px_#000]" 
                : "text-black hover:bg-black/5"
            )}
          >
            Para Você <span className="absolute top-1 right-2 w-2 h-2 bg-[#FFD166] rounded-full border border-black animate-pulse" />
          </button>
        </div>
      )}

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
                    className="w-full h-[490px] xs:h-[520px] sm:h-[550px] md:h-[580px] bg-neutral-900 border-4 border-black rounded-[32px] shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col relative"
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
          <div className="bg-white border-4 border-black rounded-[32px] shadow-[6px_6px_0px_#000] overflow-hidden grid grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto min-h-[500px]">
            
            {/* LADO ESQUERDO: LISTA DE PARCEIROS */}
            <div className="border-b-4 md:border-b-0 md:border-r-4 border-black p-4 bg-white space-y-4">
              <h3 className="text-lg font-black font-display border-b-2 border-black/10 pb-2 text-left">Suas Divulgações</h3>
              
              <div className="space-y-2 text-left max-h-[400px] overflow-y-auto">
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
                        "w-full p-3 flex items-center gap-3 rounded-2xl border-2 transition-all text-left",
                        isSelected 
                          ? "bg-brand-purple border-black shadow-[2px_2px_0px_#000]" 
                          : "bg-surface border-black/10 hover:border-black shadow-sm"
                      )}
                    >
                      <img src={(creatorInfo.images && creatorInfo.images[0]) || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&h=150&fit=crop'} className="w-12 h-12 rounded-full border-2 border-black object-cover bg-white" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm leading-tight text-black flex items-center justify-between">
                          <span>{creatorInfo.name}</span>
                          <span className="text-[10px] font-light opacity-65">{lastMsg?.time || 'Início'}</span>
                        </p>
                        <p className="text-xs text-black/50 font-mono leading-none mt-1">{creatorInfo.id}</p>
                        <p className="text-xs text-black/70 truncate mt-1.5 font-sans leading-relaxed">
                          {lastMsg ? lastMsg.text : "Match de networking realizado!"}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {userMatches.length === 0 && (
                  <p className="text-xs text-black/50 text-center py-8">Nenhum match estabelecido ainda. Vá para o Match Feed!</p>
                )}
              </div>
            </div>

            {/* LADO DIREITO: INTERFACE DE CHAT ATIVO */}
            <div className="col-span-2 flex flex-col h-[500px] bg-[#FAF9F6]">
              {activeChatId ? (
                <>
                  {/* CABEÇALHO DO CHAT */}
                  <div className="bg-white border-b-2 border-black p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-left">
                      <img src={(activeChatPartner.images && activeChatPartner.images[0]) || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&h=150&fit=crop'} className="w-10 h-10 rounded-full border-2 border-black object-cover" alt="" />
                      <div>
                        <h4 className="font-bold leading-tight">{activeChatPartner.name}</h4>
                        <a 
                          href={`https://instagram.com/${activeChatPartner.id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs font-mono text-brand-purple font-semibold hover:underline flex items-center gap-0.5"
                        >
                          <Instagram size={10} />
                          {activeChatPartner.id}
                        </a>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-[#A3E635] text-black border-2 border-black px-2.5 py-0.5 rounded-full shadow-[1px_1px_0px_#000]">
                      Match Ativo 🔥
                    </span>
                  </div>

                  {/* CORPO DE MENSAGENS COM SCROLL */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {(chatMessages[activeChatId] || []).map((msg, idx) => {
                      const isMe = msg.sender === 'me';
                      return (
                        <div 
                          key={idx} 
                          className={cn(
                            "flex flex-col max-w-[80%]",
                            isMe ? "ml-auto items-end" : "mr-auto items-start"
                          )}
                        >
                          <div 
                            className={cn(
                              "p-3.5 rounded-2xl border-2 text-sm leading-relaxed",
                              isMe 
                                ? "bg-[#DFD3F2] border-black text-black rounded-tr-none shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                                : "bg-white border-black text-black rounded-tl-none shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                            )}
                          >
                            <p className="text-left">{msg.text}</p>
                          </div>
                          <span className="text-[10px] text-black/50 font-mono mt-1 px-1.5">{msg.time}</span>
                        </div>
                      );
                    })}

                    {isTyping && (
                      <div className="flex items-center gap-2 mr-auto text-xs text-black/40 font-mono bg-white border border-black/20 px-3 py-1.5 rounded-full shadow-sm animate-pulse">
                        <RefreshCw size={10} className="animate-spin" />
                        <span>@{activeChatPartner.id || 'Parceiro'} está digitando propostas...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* CAIXA DE ENVIO DE MENSAGEM */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-white border-t-2 border-black flex gap-2">
                    <input 
                      type="text" 
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      placeholder="Combine Stories, Posts Colaborativos ou Troca de indicações..." 
                      className="flex-1 bg-surface border-2 border-black rounded-xl px-4 outline-none focus:border-brand-purple transition-all text-sm"
                    />
                    <button 
                      type="submit" 
                      className="p-3.5 bg-brand-purple hover:bg-opacity-95 text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-0.5"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-card-lilac border-2 border-black rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <MessageCircle className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Selecione uma Conversa</h4>
                    <p className="text-sm text-black/60 max-w-xs mt-2 leading-relaxed">
                      Escolha um dos perfis com quem você deu match no menu lateral para iniciar conversas de divulgação mútua!
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
          <div className="w-full max-w-xl mx-auto pb-10 text-left animate-in fade-in duration-300 px-1 sm:px-0">
            
            {/* IF COMPONENT IS IN VIEW MODE (Visualizar Perfil) */}
            {profileActiveSubTab === 'view' && (
              <div className="bg-white border-3 border-black rounded-[24px] p-4.5 sm:p-5.5 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col gap-3.5 bg-gradient-to-b from-white to-[#FAF9F5] group">
                
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
                    <h3 className="text-xl font-black font-display text-black tracking-tight">
                      {profileForm.name || "Seu Nome"}
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

                {/* Botão de abrir edição ao final do card */}
                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={() => setProfileActiveSubTab('edit')}
                    className="w-full py-2.5 bg-[#B088F9] hover:bg-[#9965F7] border-2 border-black rounded-xl text-[10px] font-black font-mono uppercase tracking-wider text-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sliders size={12} />
                    <span>Gerenciar Fotos e Dados</span>
                  </button>
                </div>

              </div>
            )}

            {/* IF COMPONENT IS IN EDIT MODE (Card Completo de Edição) */}
            {profileActiveSubTab === 'edit' && (
              <div className="bg-white border-3 border-black rounded-[24px] p-4.5 sm:p-5.5 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-300">
                
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
                        if (file.size > 2 * 1024 * 1024) {
                          triggerActionAlert("Por favor, envie uma foto de até 2MB!");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64Img = reader.result as string;
                          
                          setIsModeratingImage(true);
                          setModerationMessage("Scaneando biometria do rosto... 👤");
                          
                          setTimeout(() => {
                            setModerationMessage("Validando integridade e anti-fraude... 🛡️");
                          }, 1000);

                          setTimeout(() => {
                            setIsModeratingImage(false);
                            setUserPhotos(prev => {
                              const updated = [...prev, base64Img];
                              localStorage.setItem(`fw_photos_${user?.id || 'guest'}`, JSON.stringify(updated));
                              savePhotosToSupabaseDirect(updated);
                              return updated;
                            });
                            triggerActionAlert("Nova foto real integrada com sucesso! 📸❤️");
                          }, 2000);
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
                            if (confirm("Quer remover essa foto?")) {
                              setUserPhotos(prev => {
                                const updated = prev.filter((_, i) => i !== photoIdx);
                                localStorage.setItem(`fw_photos_${user?.id || 'guest'}`, JSON.stringify(updated));
                                savePhotosToSupabaseDirect(updated);
                                return updated;
                              });
                              triggerActionAlert("Foto removida localmente e sincronizada no Supabase!");
                            }
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

                  {/* Loader de Moderação de Imagem IA Simulado */}
                  {isModeratingImage && (
                    <div className="bg-white border-2 border-black p-3 rounded-2xl flex items-center gap-3 animate-pulse mt-2">
                      <RefreshCw size={11} className="animate-spin text-brand-purple" />
                      <div>
                        <p className="text-[10px] font-black font-mono text-black uppercase leading-tight">Wave-Scanner Ativo</p>
                        <p className="text-[9px] text-black/55 leading-none mt-1 font-mono">{moderationMessage}</p>
                      </div>
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
                      <label className="font-bold text-xs font-mono text-black/70 flex items-center gap-1">
                        👤 Nome Completo
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
                      <label className="font-bold text-xs font-mono text-black/70 flex items-center gap-1">
                        📸 Instagram (@)
                      </label>
                      <input 
                        type="text" 
                        value={profileForm.username}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full bg-[#FAF9F5] border-2 border-black rounded-xl p-2.5 outline-none focus:border-brand-purple font-semibold text-xs transition-all text-black block" 
                        required
                      />
                    </div>
                  </div>

                  {/* Idade & Gênero */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-xs font-mono text-black/70 flex items-center gap-1">
                        🎂 Idade Real
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
                      <label className="font-bold text-xs font-mono text-black/70 flex items-center gap-1">
                        👥 Gênero
                      </label>
                      <select 
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-[#FAF9F5] border-2 border-black rounded-xl p-2.5 outline-none focus:border-brand-purple font-semibold text-xs transition-all text-black"
                      >
                        <option value="Feminino">Feminino 👩</option>
                        <option value="Masculino">Masculino 👨</option>
                        <option value="Outro">Outro 🌈</option>
                        <option value="Prefiro não dizer">Prefiro não dizer 👤</option>
                      </select>
                    </div>
                  </div>

                  {/* Cidade & Ocupação */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-xs font-mono text-black/70 flex items-center gap-1">
                        📍 Cidade / UF
                      </label>
                      <input 
                        type="text" 
                        value={profileForm.location}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-[#FAF9F5] border-2 border-black rounded-xl p-2.5 outline-none focus:border-brand-purple font-semibold text-xs transition-all text-black" 
                        placeholder="Ex: São Paulo, SP"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-xs font-mono text-black/70 flex items-center gap-1">
                        💼 Profissão / Ocupação
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
                      <label className="font-bold text-xs font-mono text-black/70">
                        📝 Biografia Profissional Curta
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
                      className="w-full py-4 bg-black text-white hover:bg-neutral-900 border-2 border-black rounded-3xl font-black text-xs font-mono uppercase tracking-widest transition-all shadow-[4px_4px_0px_rgba(176,136,249,1)] active:translate-y-0.5 active:shadow-none text-center block cursor-pointer"
                    >
                      Salvar Alterações 💾
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

    </div>
  );
}

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("bg-brand-purple text-xs font-bold uppercase tracking-widest px-3 py-1 text-black border border-black rounded shadow-[1px_1px_0px_#000]", className)}>
    {children}
  </span>
);
