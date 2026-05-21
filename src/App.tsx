import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  ArrowUpRight, 
  Instagram, 
  Users, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  Star,
  CheckCircle2,
  TrendingUp,
  Globe,
  ArrowRight,
  Target,
  BarChart3,
  Search,
  Mail,
  MousePointer2,
  Lock,
  X,
  LogOut,
  User as UserIcon,
  Loader2,
  Upload,
  Calendar,
  Heart,
  MessageCircle,
  MessageSquare,
  Sparkles,
  Send,
  Sliders,
  Bookmark,
  Compass,
  Check,
  CheckCheck,
  Filter,
  RefreshCw,
  Activity,
  MapPin,
  Megaphone
} from 'lucide-react';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';
import { InternalDashboard } from './components/InternalDashboard';

// --- DATA ---

const creatorProfiles = [
  { name: "Ana Silva", handle: "@anasilva_fit", followers: "12.4k", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { name: "Lucas Melo", handle: "@lucasmelo_art", followers: "8.2k", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
  { name: "Bia Santos", handle: "@biasantos_travel", followers: "25.1k", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
  { name: "Marcos Viana", handle: "@marcos_viana", followers: "15.7k", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
  { name: "Julia Lopes", handle: "@julialopes_style", followers: "30.4k", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" },
  { name: "Pedro Rocha", handle: "@pedrorocha_tech", followers: "5.1k", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" },
];

const FEED_PROFILES = [
  {
    id: "anasilva_fit",
    name: "Ana Silva",
    handle: "@anasilva_fit",
    followers: "12.4K",
    age: 24,
    gender: "Feminino",
    niche: "Fitness",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
    bio: "Compartilhando minha rotina saudável, treinos funcionais e receitas fit 🏋️‍♀️. Foco em motivar pessoas reais todos os dias!",
    interests: ["Musculação", "Bem-estar", "Receitas Fit", "Suplementos"]
  },
  {
    id: "biasantos_travel",
    name: "Bia Santos",
    handle: "@biasantos_travel",
    followers: "25.1K",
    age: 26,
    gender: "Feminino",
    niche: "Viagem",
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop",
    bio: "Viajando pelo mundo com pouca grana e muitas histórias 🗺️. Dicas de mochilão, hospedagens baratas e roteiros fora da rota tradicional.",
    interests: ["Fotografia", "Mochilão", "Natureza", "Culinária Local"]
  },
  {
    id: "lucasmelo_art",
    name: "Lucas Melo",
    handle: "@lucasmelo_art",
    followers: "8.2K",
    age: 28,
    gender: "Masculino",
    niche: "Arte",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
    bio: "Artista digital & Designer Brutalista 🎨. Ilustro conceitos urbanos e crio identidades visuais de impacto para marcas modernas.",
    interests: ["Ilustração", "NFTs", "Brutalist Design", "Cultura Urbana"]
  },
  {
    id: "julialopes_style",
    name: "Julia Lopes",
    handle: "@julialopes_style",
    followers: "30.4K",
    age: 22,
    gender: "Feminino",
    niche: "Moda",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
    bio: "Moda consciente e garimpos em brechós no centro de SP 👗. Inspirando você a encontrar sua própria voz através do estilo urbano.",
    interests: ["Streetwear", "Sustentabilidade", "Fotografia", "Brechós"]
  },
  {
    id: "pedrorocha_tech",
    name: "Pedro Rocha",
    handle: "@pedrorocha_tech",
    followers: "5.1K",
    age: 30,
    gender: "Masculino",
    niche: "Tecnologia",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
    bio: "Desenvolvedor Fullstack e criador de conteúdo tech no YouTube 💻. Review de setups minimalistas e insights de carreira tech.",
    interests: ["Teclados Mecânicos", "TypeScript", "Home Office", "Setup Minimalista"]
  },
  {
    id: "marcos_viana",
    name: "Marcos Viana",
    handle: "@marcos_viana",
    followers: "15.7K",
    age: 27,
    gender: "Masculino",
    niche: "Fitness",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
    bio: "Consultor de emagrecimento e hipertrofia progressiva 💪. Co-desenvolvedor de treinos voltados para quem tem a rotina corrida de trabalho.",
    interests: ["Treino Funcional", "Dieta Flexível", "Calistenia", "Nutrição"]
  },
  {
    id: "larissa_music",
    name: "Larissa Neves",
    handle: "@larissa_music",
    followers: "19.3K",
    age: 25,
    gender: "Feminino",
    niche: "Música",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop",
    bio: "Cantora & Compositora independente 🎵. Sessões de voz e violão ao vivo às terças. Curador de playlists indie no Spotify.",
    interests: ["Vocalist", "Acoustic", "Composição", "Indie Rock"]
  }
];

const processes = [
  { 
    id: "01", 
    title: "Criação de Perfil", 
    content: "Preencha suas informações reais do Instagram, selecione seus interesses e seu nicho. Deixe sua bio autêntica e pronta." 
  },
  { 
    id: "02", 
    title: "Descoberta Ativa", 
    content: "Navegue pela nossa comunidade de criadores de conteúdo e perfis reais. Filtre por gênero, idade, nicho de atuação e interesses." 
  },
  { 
    id: "03", 
    title: "Match de Networking", 
    content: "Dê o seu voto de interesse. Quando o interesse for mútuo, o match acontece e os perfis ganham visibilidade direta de forma gratuita." 
  },
  { 
    id: "04", 
    title: "Divulgação Mútua", 
    content: "Com o match estabelecido, vocês se conectam no Instagram, trocam experiências, e ajudam um ao outro a crescer e ganhar novos amigos." 
  },
  { 
    id: "05", 
    title: "Networking de Sucesso", 
    content: "Acompanhe e gerencie seus novos amigos, mantendo sua rede engajada, aumentando seu alcance de forma totalmente orgânica." 
  }
];

const services = [
  {
    title: "Conexões Reais",
    tag: "Networking",
    bgColor: "bg-card-lilac",
    tagColor: "bg-brand-purple",
    icon: <Users className="w-16 h-16 text-black/20" />,
    link: "Saiba mais"
  },
  {
    title: "Sistema de Match",
    tag: "Aproximação",
    bgColor: "bg-brand-purple",
    tagColor: "bg-white",
    icon: <Target className="w-16 h-16 text-black/20" />,
    link: "Saiba mais"
  },
  {
    title: "Filtro por Interesses",
    tag: "Segmentação",
    bgColor: "bg-card-dark",
    tagColor: "bg-white",
    icon: <Search className="w-16 h-16 text-white/10" />,
    link: "Saiba mais",
    textWhite: true
  },
  {
    title: "Divulgação Organizada",
    tag: "Visibilidade",
    bgColor: "bg-card-lilac",
    tagColor: "bg-brand-purple",
    icon: <Globe className="w-16 h-16 text-black/20" />,
    link: "Saiba mais"
  },
  {
    title: "Proteção & Autenticidade",
    tag: "Segurança",
    bgColor: "bg-brand-purple",
    tagColor: "bg-white",
    icon: <ShieldCheck className="w-16 h-16 text-black/20" />,
    link: "Saiba mais"
  },
  {
    title: "Apoio à Comunidade",
    tag: "Parcerias",
    bgColor: "bg-card-dark",
    tagColor: "bg-brand-purple",
    icon: <Mail className="w-16 h-16 text-white/10" />,
    link: "Saiba mais",
    textWhite: true
  }
];

// --- COMPONENTS ---

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("bg-brand-purple badge-tag", className)}>
    {children}
  </span>
);

const SectionHeading = ({ badge, title, subtitle }: { badge: string, title?: string, subtitle?: string }) => (
  <div className="flex flex-col md:flex-row items-center gap-8 mb-20 px-6 lg:px-0">
    <Badge className="text-xl px-4 py-2 shrink-0">{badge}</Badge>
    {subtitle && (
      <p className="max-w-2xl text-text-muted text-lg leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

interface ProcessItem {
  id: string;
  title: string;
  content: string;
}

interface AccordionItemProps {
  item: ProcessItem;
  isOpen: boolean;
  onClick: () => void;
  key?: string | number;
}

const AccordionItem = ({ item, isOpen, onClick }: AccordionItemProps) => {
  return (
    <div 
      className={cn(
        "positivus-card mb-8 transition-all duration-500 overflow-hidden cursor-pointer",
        isOpen ? "bg-brand-purple" : "bg-card-lilac"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-4xl font-display font-medium opacity-50">{item.id}</span>
          <h3 className="text-2xl md:text-3xl font-display font-medium">
            {item.title}
          </h3>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-full border-2 border-black flex items-center justify-center transition-transform bg-white",
          isOpen ? "rotate-0 shadow-none" : "rotate-90 shadow-[0px_2px_0px_#000]"
        )}>
          {isOpen ? <Minus className="text-black" /> : <Plus className="text-black" />}
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-10 border-t border-black/10 mt-8">
              <p className="text-black text-xl leading-relaxed">
                {item.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface NavbarProps {
  onAuthOpen: (mode: 'login' | 'signup') => void;
  user: any;
  onLogout: () => void;
}

const Navbar = ({ onAuthOpen, user, onLogout }: NavbarProps) => {
  return (
    <nav className="flex items-center justify-between py-10 px-6 lg:px-20 max-w-7xl mx-auto bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-brand-purple rounded-full" />
        </div>
        <span className="text-2xl font-display font-bold tracking-tight text-black">FollowWave</span>
      </div>
      
      <div className="hidden lg:flex items-center gap-10">
        {["Sobre nós", "Serviços", "Como Funciona", "Precificação"].map(link => (
          <a key={link} href={`#${link}`} className="text-lg text-black hover:text-brand-purple transition-colors">{link}</a>
        ))}
        {user ? (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-card-lilac px-4 py-2 rounded-xl border-2 border-black">
              <UserIcon size={20} />
              <span className="font-bold">{user.email?.split('@')[0]}</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-3 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all shadow-[0px_2px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onAuthOpen('login')}
              className="text-lg font-bold text-black hover:text-brand-purple transition-colors"
            >
              Entrar
            </button>
            <button 
              onClick={() => onAuthOpen('signup')}
              className="px-8 py-4 border-2 border-black rounded-xl font-bold text-lg hover:bg-black hover:text-white transition-all shadow-[0px_4px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
            >
              Criar Conta
            </button>
          </div>
        )}
      </div>
      
      <div className="lg:hidden border-2 border-black p-2 rounded-lg">
        <Plus className="w-6 h-6 text-black" />
      </div>
    </nav>
  );
};

const AuthModal = ({ isOpen, mode, onClose, onSwitch }: { isOpen: boolean, mode: 'login' | 'signup', onClose: () => void, onSwitch: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Confirme seu email para completar o cadastro!');
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-card-lilac rounded-[40px] p-10 md:p-14 positivus-border"
          >
            <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-black/5 rounded-full transition-colors">
              <X />
            </button>
            <div className="mb-10">
              <Badge className="mb-4">{mode === 'signup' ? 'Registro' : 'Login'}</Badge>
              <h2 className="text-3xl font-display font-medium text-black">
                {mode === 'signup' ? 'Crie sua conta na FollowWave' : 'Bem-vindo de volta'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-bold">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                  required
                  className="w-full bg-white border border-black rounded-2xl p-4 outline-none focus:border-brand-purple transition-all shadow-[0px_2px_0px_rgba(0,0,0,1)]" 
                />
              </div>
              <div className="space-y-2">
                <label className="font-bold">Senha</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full bg-white border border-black rounded-2xl p-4 outline-none focus:border-brand-purple transition-all shadow-[0px_2px_0px_rgba(0,0,0,1)]" 
                />
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-black text-white rounded-2xl font-bold text-xl hover:bg-black/90 transition-all shadow-[0px_4px_0px_#B088F9] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : (mode === 'signup' ? 'Criar Conta' : 'Entrar')}
              </button>
            </form>

            <p className="mt-8 text-center text-text-muted">
              {mode === 'signup' ? 'Já tem conta?' : 'Não tem conta?'} {' '}
              <button onClick={onSwitch} className="text-black font-bold underline underline-offset-4 decoration-brand-purple">
                {mode === 'signup' ? 'Entrar agora' : 'Cadastrar agora'}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ProfileModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [step, setStep] = useState<'search' | 'confirm'>('search');

  // Formulário Manual
  const [manualForm, setManualForm] = useState({
    fullName: '',
    username: '',
    age: '',
    gender: 'Prefiro não dizer',
    bio: '',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
  });

  // Imagens predefinidas para escolha rápida
  const presetAvatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', // Feminino 1
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', // Masculino 1
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', // Feminino 2
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', // Masculino 2
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', // Feminino 3
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', // Masculino 3
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Por favor, envie uma foto de até 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualForm(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.fullName || !manualForm.username) {
      alert('Por favor, preencha o Nome Completo e o @ do Instagram!');
      return;
    }

    const formattedUsername = manualForm.username.replace('@', '').toLowerCase().trim();

    setProfile({
      username: formattedUsername,
      fullName: manualForm.fullName,
      followers: '0',
      following: '0',
      posts: '0',
      bio: manualForm.bio,
      avatar: manualForm.avatar,
      age: manualForm.age,
      gender: manualForm.gender,
      isManual: true
    });

    setStep('confirm');
  };

  const handleConnect = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Não autenticado');

      // Tentativa de upsert completo (com idade e sexo/gênero se cadastrado manualmente)
      const payload: any = {
        id: session.user.id,
        instagram_username: profile.username,
        full_name: profile.fullName,
        avatar_url: profile.avatar,
        followers_count: profile.followers,
        bio: profile.bio || '',
        updated_at: new Date().toISOString()
      };

      if (profile.age) {
        payload.age = parseInt(profile.age) || profile.age;
      }
      if (profile.gender) {
        payload.gender = profile.gender;
      }

      console.log('[FollowWave] Tentando salvar perfil no Supabase:', payload);

      const { error } = await supabase
        .from('profiles')
        .upsert(payload);

      if (error) {
        console.warn('Upsert completo falhou (provavelmente colunas ausentes no banco). Tentando fallback resiliente...', error.message);
        
        // Em caso de erro de coluna inexistente, fundimos Idade e Sexo na própria bio para manter salvamento limpo!
        let safeBio = profile.bio || '';
        let infoString = '';
        if (profile.age) infoString += `Idade: ${profile.age} anos`;
        if (profile.gender && profile.gender !== 'Prefiro não dizer') {
          infoString += (infoString ? ' | ' : '') + `Gênero: ${profile.gender}`;
        }
        
        if (infoString) {
          safeBio = `[${infoString}] ${safeBio}`;
        }

        const fallbackPayload = {
          id: session.user.id,
          instagram_username: profile.username,
          full_name: profile.fullName,
          avatar_url: profile.avatar,
          followers_count: profile.followers,
          bio: safeBio,
          updated_at: new Date().toISOString()
        };

        const { error: fallbackError } = await supabase
          .from('profiles')
          .upsert(fallbackPayload);

        if (fallbackError) throw fallbackError;
      }

      alert('Perfil conectado e salvo com sucesso! Bem-vindo à rede.');
      onClose();
      window.location.reload();
    } catch (err: any) {
      alert('Erro ao conectar perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotate: 1 }}
            className="relative w-full max-w-2xl bg-white rounded-[45px] p-8 md:p-14 positivus-border my-8 z-10 max-h-[90vh] overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-black/5 rounded-full transition-colors">
              <X />
            </button>

            <div className="text-center mb-8">
               <Badge className="mb-4">Perfis Reais</Badge>
               <h2 className="text-3xl md:text-4xl font-display font-medium text-black">
                 {step === 'search' ? 'Conecte seu Instagram' : 'Este é você?'}
               </h2>
               <p className="text-text-muted mt-3 text-base md:text-lg">
                 {step === 'search' 
                  ? 'Preencha suas informações reais do Instagram para receber interações orgânicas.' 
                  : 'Valide se as informações do seu perfil estão certas para começar.'}
               </p>
            </div>

            {step === 'search' ? (
              <div className="space-y-6">
                <form onSubmit={handleManualSubmit} className="space-y-6">
                  {/* Linha 1: Nome Completo & @ do Instagram */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <label className="font-bold text-sm text-black flex items-center gap-1">📋 Nome Completo</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input 
                          type="text" 
                          value={manualForm.fullName}
                          onChange={(e) => setManualForm(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Ex: Amanda Silva" 
                          required
                          className="w-full bg-card-lilac border-2 border-black rounded-xl p-4 pl-12 outline-none focus:border-brand-purple transition-all text-black" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="font-bold text-sm text-black flex items-center gap-1">📸 @ do Instagram</label>
                      <div className="relative">
                        <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input 
                          type="text" 
                          value={manualForm.username}
                          onChange={(e) => setManualForm(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Ex: @amandas_fit" 
                          required
                          className="w-full bg-card-lilac border-2 border-black rounded-xl p-4 pl-12 outline-none focus:border-brand-purple transition-all text-black" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Linha 2: Idade & Gênero */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 text-left">
                      <label className="font-bold text-sm text-black flex items-center gap-1">🎂 Idade</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input 
                          type="number" 
                          min="1"
                          max="120"
                          value={manualForm.age}
                          onChange={(e) => setManualForm(prev => ({ ...prev, age: e.target.value }))}
                          placeholder="Ex: 25" 
                          required
                          className="w-full bg-card-lilac border-2 border-black rounded-xl p-4 pl-12 outline-none focus:border-brand-purple transition-all text-black" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-left md:col-span-2">
                      <label className="font-bold text-sm text-black flex items-center gap-1">🏳️‍🌈 Sexo / Gênero</label>
                      <div className="flex flex-wrap gap-2">
                        {['Feminino', 'Masculino', 'Outro', 'Prefiro não dizer'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setManualForm(prev => ({ ...prev, gender: g }))}
                            className={cn(
                              "px-3 py-2.5 text-xs md:text-sm border-2 border-black rounded-xl font-bold transition-all shadow-[0px_2px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5",
                              manualForm.gender === g ? "bg-brand-purple text-black" : "bg-white text-black"
                            )}
                          >
                            {g === 'Feminino' && '👩'}
                            {g === 'Masculino' && '👨'}
                            {g === 'Outro' && '🌈'}
                            {g === 'Prefiro não dizer' && '👤'}
                            <span className="ml-1">{g}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Linha 3: Foto de Perfil */}
                  <div className="space-y-2 text-left">
                    <label className="font-bold text-sm text-black flex items-center gap-1">🌟 Foto de Perfil</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-card-lilac border-2 border-black rounded-2xl p-4">
                      <div className="shrink-0">
                        <img 
                          src={manualForm.avatar} 
                          alt="avatar" 
                          className="w-16 h-16 rounded-full border-2 border-black object-cover bg-white" 
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <span className="text-xs text-black font-semibold block">Escolha uma prévia ou envie do seu aparelho:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {presetAvatars.map((avUrl, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setManualForm(prev => ({ ...prev, avatar: avUrl }))}
                              className={cn(
                                "w-8 h-8 rounded-full border-2 overflow-hidden hover:scale-105 active:scale-95 transition-transform",
                                manualForm.avatar === avUrl ? "border-brand-purple z-10 scale-110" : "border-black/30"
                              )}
                            >
                              <img src={avUrl} className="w-full h-full object-cover" alt="" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="w-[1px] h-10 bg-black/10 hidden sm:block" />

                      <label className="cursor-pointer bg-white px-3.5 py-2 border-2 border-black rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-black hover:text-white transition-all shadow-[0px_2px_0px_#000] active:translate-y-0.5 active:shadow-none shrink-0 self-stretch sm:self-auto justify-center">
                        <Upload size={14} />
                        Enviar Foto
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Linha 4: Biografia */}
                  <div className="space-y-2 text-left">
                    <label className="font-bold text-sm text-black flex items-center gap-1">📝 Biografia (Bio)</label>
                    <textarea 
                      value={manualForm.bio}
                      onChange={(e) => setManualForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Escreva um breve resumo do que você fala ou de seu nicho no Instagram (Ex: Fitness, Moda, Rotina...)" 
                      rows={3}
                      required
                      className="w-full bg-card-lilac border-2 border-black rounded-xl p-4 outline-none focus:border-brand-purple transition-all text-black resize-none" 
                    />
                  </div>

                  {/* Botão de Próximo Passo */}
                  <button 
                    type="submit" 
                    className="w-full py-5 bg-black text-white rounded-[20px] font-bold text-xl hover:bg-black/95 transition-all shadow-[0px_5px_0px_#B088F9] flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} /> Avançar Para Confirmar
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Card de Visualização Estilo Positivus */}
                <div className="bg-card-lilac rounded-[35px] p-6 md:p-8 border-2 border-black shadow-[0px_4px_0px_#000] relative overflow-hidden">
                   <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                      <img src={profile.avatar} className="w-28 h-28 rounded-full border-4 border-white positivus-border object-cover bg-white shadow-[0px_3px_0px_#000]" alt="" referrerPolicy="no-referrer" />
                      <div className="text-center md:text-left flex-1">
                         <h4 className="text-2xl md:text-3xl font-display font-bold text-black flex items-center justify-center md:justify-start gap-2">
                           @{profile.username}
                           {profile.isManual && <span className="bg-black/10 text-black text-xs px-2.5 py-0.5 rounded-full border border-black/20">Manual</span>}
                         </h4>
                         
                         {/* Informações Auxiliares (Idade e Gênero) */}
                         {(profile.age || (profile.gender && profile.gender !== 'Prefiro não dizer')) && (
                           <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start text-xs font-bold text-black/70">
                             {profile.age && <span className="bg-white/60 px-2 py-1 rounded-md border border-black/10">🎂 {profile.age} anos</span>}
                             {profile.gender && profile.gender !== 'Prefiro não dizer' && (
                               <span className="bg-white/60 px-2 py-1 rounded-md border border-black/10">
                                 {profile.gender === 'Feminino' ? '👩 Feminino' : profile.gender === 'Masculino' ? '👨 Masculino' : `🌈 ${profile.gender}`}
                               </span>
                             )}
                           </div>
                         )}

                         <p className="mt-4 text-black/70 text-sm italic max-w-md bg-white/45 p-3 rounded-lg border border-black/5 leading-relaxed">{profile.bio}</p>
                      </div>
                   </div>
                   <Instagram className="absolute top-1/2 right-10 -translate-y-1/2 w-32 h-32 opacity-5 -rotate-12 pointer-events-none" />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => {
                      setStep('search');
                      setProfile(null);
                    }}
                    className="flex-1 py-4 bg-white border-2 border-black rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-[0px_3px_0px_#000] active:translate-y-0.5 active:shadow-none"
                  >
                    ⬅️ Voltar e Ajustar
                  </button>
                  <button 
                    onClick={handleConnect}
                    disabled={loading}
                    className="flex-[2] py-4 bg-brand-purple text-black border-2 border-black rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-[0px_4px_0px_#000] flex items-center justify-center gap-3 disabled:opacity-50 active:translate-y-0.5 active:shadow-none"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                    Confirmar e Conectar Perfil
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-center">
               <div className="flex items-center gap-2 text-text-muted text-xs italic">
                  <Lock size={12} /> Seus dados pessoais estão protegidos conforme a LGPD brasileira.
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [openProcess, setOpenProcess] = useState<string | null>("01");
  const [authModal, setAuthModal] = useState<{isOpen: boolean, mode: 'login' | 'signup'}>({ isOpen: false, mode: 'signup' });
  const [profileModal, setProfileModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  // States para a Área Logada (Interna)
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'likes' | 'profile'>('feed');
  const [activeFilterNiche, setActiveFilterNiche] = useState<string>('Todos');
  const [activeFilterGender, setActiveFilterGender] = useState<string>('Todos');
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [matchNotification, setMatchNotification] = useState<any>(null);
  const [commentsModal, setCommentsModal] = useState<{ isOpen: boolean, targetProfile: any }>({ isOpen: false, targetProfile: null });
  const [newCommentText, setNewCommentText] = useState('');
  const [recentActionText, setRecentActionText] = useState<string | null>(null);

  // Histórico de interações do usuário
  const [likedProfiles, setLikedProfiles] = useState<string[]>(['julialopes_style']);
  const [passedProfiles, setPassedProfiles] = useState<string[]>([]);
  const [userMatches, setUserMatches] = useState<string[]>(['anasilva_fit', 'biasantos_travel']);
  const [sentComments, setSentComments] = useState<Array<{ handle: string, text: string, date: string }>>([
    { handle: '@anasilva_fit', text: 'Adorei a sua bio sobre receitas! Posta mais no carrossel.', date: 'Hoje' },
    { handle: '@biasantos_travel', text: 'Bora fazer colaboração sobre viagens!', date: 'Ontem' }
  ]);

  // Mensagens do Chat
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, Array<{sender: 'me' | 'them', text: string, time: string}>>>({
    'anasilva_fit': [
      { sender: 'them', text: 'Olá! Adorei o seu perfil do Instagram. Seu conteúdo tem muito a ver com o meu!', time: '10:42' },
      { sender: 'me', text: 'Muito obrigado! Também curti muito suas postagens de treino de calistenia.', time: '10:45' },
      { sender: 'them', text: 'Pensou em fazer alguma parceria ou divulgação mútua nos Stories? Acho que nossos públicos iriam adorar e cresceríamos juntos.', time: '11:02' }
    ],
    'biasantos_travel': [
      { sender: 'them', text: 'Oie, tudo bem? Vi seu match por aqui! Que legal encontrar novos criadores de conteúdo do Instagram por perto.', time: 'Ontem' }
    ]
  });
  const [typedMessage, setTypedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Função para buscar perfil do Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setUserProfile(data);
      } else {
        // Fallback robusto se a linha no banco ainda não foi criada
        setUserProfile({
          id: userId,
          instagram_username: 'usuario_followwave',
          full_name: 'Novo Criador',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&h=150&fit=crop',
          followers_count: '1.2k',
          bio: 'Criador de conteúdo focado em conexões reais. Vamos crescer juntos! 🚀',
          age: 25,
          gender: 'Masculino'
        });
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil do banco, usando perfil padrão simulado:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id);
        checkUserProfile(currentUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id);
        if (event === 'SIGNED_IN') {
          checkUserProfile(currentUser.id);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('instagram_username')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      setProfileModal(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-surface">
      {user ? (
        <>
          <InternalDashboard 
            user={user}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onLogout={handleLogout}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeFilterNiche={activeFilterNiche}
            setActiveFilterNiche={setActiveFilterNiche}
            activeFilterGender={activeFilterGender}
            setActiveFilterGender={setActiveFilterGender}
            currentProfileIndex={currentProfileIndex}
            setCurrentProfileIndex={setCurrentProfileIndex}
            matchNotification={matchNotification}
            setMatchNotification={setMatchNotification}
            commentsModal={commentsModal}
            setCommentsModal={setCommentsModal}
            newCommentText={newCommentText}
            setNewCommentText={setNewCommentText}
            recentActionText={recentActionText}
            setRecentActionText={setRecentActionText}
            likedProfiles={likedProfiles}
            setLikedProfiles={setLikedProfiles}
            passedProfiles={passedProfiles}
            setPassedProfiles={setPassedProfiles}
            userMatches={userMatches}
            setUserMatches={setUserMatches}
            sentComments={sentComments}
            setSentComments={setSentComments}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            typedMessage={typedMessage}
            setTypedMessage={setTypedMessage}
            isTyping={isTyping}
            setIsTyping={setIsTyping}
            onOpenProfileEdit={() => setProfileModal(true)}
          />

          <ProfileModal 
            isOpen={profileModal}
            onClose={() => setProfileModal(false)}
          />
        </>
      ) : (
        <>
          <Navbar 
            user={user} 
            onLogout={handleLogout}
            onAuthOpen={(mode) => setAuthModal({ isOpen: true, mode })} 
          />

          <AuthModal 
            isOpen={authModal.isOpen}
            mode={authModal.mode}
            onClose={() => setAuthModal({ ...authModal, isOpen: false })}
            onSwitch={() => setAuthModal({ ...authModal, mode: authModal.mode === 'signup' ? 'login' : 'signup' })}
          />

          <ProfileModal 
            isOpen={profileModal}
            onClose={() => setProfileModal(false)}
          />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-24 px-6 lg:px-20 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-[75px] leading-[1.05] font-display font-medium mb-10 text-black">
              Conecte seu <br />
              <span className="bg-brand-purple px-2 py-1 rounded-sm">Instagram</span> e faça novos amigos.
            </h1>
            <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-lg leading-relaxed">
              Divulgue seu perfil, encontre pessoas com interesses em comum, envie matches de networking e crie amizades autênticas para crescerem juntos.
            </p>
            <button 
              onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
              className="px-10 py-5 bg-black text-white rounded-2xl font-bold text-xl hover:bg-black/90 transition-all shadow-[0px_5px_0px_#B088F9] active:shadow-none active:translate-y-1"
            >
              Começar Agora Grátis
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block relative"
          >
             {/* POSITIVUS STYLE ILLUSTRATION */}
             <div className="relative aspect-square w-full max-w-[550px] ml-auto">
                <svg viewBox="0 0 500 500" className="w-full h-full">
                    {/* Abstract circular elements like in Positivus */}
                    <circle cx="250" cy="250" r="180" fill="none" stroke="black" strokeWidth="1" strokeDasharray="8 8" className="opacity-20" />
                    <motion.circle 
                      cx="250" cy="250" r="150" fill="none" stroke="black" strokeWidth="2" 
                      animate={{ strokeDashoffset: [0, 40] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      strokeDasharray="20 20"
                    />
                    
                    {/* Main UI Badge */}
                    <foreignObject x="180" y="180" width="140" height="140">
                       <div className="w-full h-full bg-brand-purple rounded-[40px] positivus-border flex items-center justify-center animate-float">
                          <Instagram className="w-16 h-16 text-black" />
                       </div>
                    </foreignObject>

                    {/* Smaller Floating Icons */}
                    <foreignObject x="40" y="220" width="80" height="80">
                       <div className="w-full h-full bg-white rounded-full positivus-border flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                          <Users className="w-8 h-8 text-black" />
                       </div>
                    </foreignObject>

                    {/* Smaller Floating Icons (Star replaced with Zap / Like) */}
                    <foreignObject x="380" y="180" width="80" height="80">
                       <div className="w-full h-full bg-brand-lilac rounded-full positivus-border flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
                          <Star className="w-8 h-8 text-black" />
                       </div>
                    </foreignObject>

                    <foreignObject x="150" y="380" width="80" height="80">
                       <div className="w-full h-full bg-black rounded-full positivus-border flex items-center justify-center animate-float" style={{ animationDelay: '1.5s' }}>
                          <Zap className="w-8 h-8 text-brand-purple" />
                       </div>
                    </foreignObject>
                    <path d="M450 100 L470 140 L510 160 L470 180 L450 220 L430 180 L390 160 L430 140 Z" fill="#B088F9" className="animate-pulse" />
                </svg>
             </div>
          </motion.div>
        </div>

        {/* LOGO MARQUEE */}
        <div className="mt-32 overflow-hidden py-8 bg-transparent">
           <div className="flex animate-marquee gap-24 whitespace-nowrap items-center">
              {[1, 2, 3, 4, 5].map((loopIdx) => (
                <div key={loopIdx} className="flex items-center gap-24 shrink-0">
                  {/* React */}
                  <div className="flex items-center gap-4 text-3xl font-display font-medium text-black">
                    <i className="fa-brands fa-react text-[#00D8FF] text-4xl animate-[spin_12s_linear_infinite]"></i>
                    <span className="font-semibold select-none">React</span>
                  </div>

                  {/* TypeScript */}
                  <div className="flex items-center gap-4 text-3xl font-display font-medium text-black">
                    <div className="w-10 h-10 rounded bg-[#3178C6] text-white flex items-center justify-center font-bold text-base shadow-sm font-sans select-none">TS</div>
                    <span className="font-semibold select-none">TypeScript</span>
                  </div>

                  {/* Tailwind CSS (No text, just icon as requested) */}
                  <div className="flex items-center text-3xl font-display font-medium text-black">
                    <i className="fa-brands fa-tailwind-css text-[#38B2AC] text-4xl"></i>
                  </div>

                  {/* Node.js */}
                  <div className="flex items-center gap-4 text-3xl font-display font-medium text-black pr-12 border-r border-black/5">
                    <i className="fa-brands fa-node text-[#339933] text-4xl"></i>
                    <span className="font-semibold select-none">Node.js</span>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- SERVICES SECTION --- */}
      <section className="py-24 px-6 lg:px-20 max-w-7xl mx-auto" id="Servicos">
        <SectionHeading 
          badge="Nossos Recursos" 
          subtitle="Na nossa plataforma, oferecemos recursos completos para divulgar seu Instagram, encontrar pessoas compatíveis e fazer networking de verdade:"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {services.map((s, i) => (
            <div key={i} className={cn("positivus-card flex items-center justify-between", s.bgColor)}>
              <div className="flex flex-col h-full justify-between gap-12">
                 <div className="space-y-2">
                    <span className={cn("px-2 py-1 rounded-md text-3xl font-display font-medium text-black", s.tagColor)}>
                      {s.title.split(' ')[0]}
                    </span>
                    <br />
                    <span className={cn("px-2 py-1 rounded-md text-3xl font-display font-medium text-black inline-block mt-2", s.tagColor)}>
                      {s.title.split(' ').slice(1).join(' ')}
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-4 cursor-pointer group">
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:rotate-45",
                        s.textWhite ? "bg-white text-black" : "bg-black text-brand-purple"
                    )}>
                       <ArrowUpRight size={24} />
                    </div>
                    <span className={cn("text-xl font-medium", s.textWhite ? "text-white" : "text-black")}>
                        {s.link}
                    </span>
                 </div>
              </div>
              <div className="hidden lg:block shrink-0">
                 {s.icon}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="py-20 px-6 lg:px-20 max-w-7xl mx-auto">
         <div className="bg-card-lilac rounded-[45px] p-12 md:p-20 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden positivus-border">
            <div className="flex-1 space-y-8 z-10">
               <h2 className="text-4xl md:text-5xl font-display font-medium text-black leading-tight">
                 Conecte-se com pessoas reais
               </h2>
               <p className="text-xl text-text-muted max-w-md">
                 Crie sua conta grátis agora mesmo, descubra criadores compatíveis, consiga novos amigos e expanda sua rede de contatos organicamente.
               </p>
               <button 
                onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                className="px-10 py-5 bg-black text-white rounded-2xl font-bold text-xl hover:bg-black/90 transition-all shadow-[0px_4px_0px_#B088F9]"
               >
                 Criar conta gratuita
               </button>
            </div>
            <div className="flex-1 relative hidden md:block">
                <svg viewBox="0 0 200 200" className="w-full max-w-[300px] ml-auto">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="black" strokeWidth="1" strokeDasharray="4 4" />
                    <motion.path 
                       d="M100 20 L100 180 M20 100 L180 100" stroke="black" strokeWidth="0.5" 
                       animate={{ rotate: 180 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    <rect x="75" y="75" width="50" height="50" fill="black" rx="10" />
                    <path d="M100 85 L110 110 L90 110 Z" fill="#B088F9" />
                </svg>
            </div>
         </div>
      </section>

      {/* --- WORKING PROCESS --- */}
      <section className="py-40 px-6 lg:px-20 max-w-7xl mx-auto" id="Como Funciona">
        <SectionHeading 
          badge="Guia de Uso" 
          subtitle="Um processo simples de match e networking para encontrar novos amigos do Instagram e crescer juntos."
        />

        <div className="max-w-7xl mx-auto">
          {processes.map((p) => (
            <AccordionItem 
              key={p.id} 
              item={p} 
              isOpen={openProcess === p.id} 
              onClick={() => setOpenProcess(openProcess === p.id ? null : p.id)}
            />
          ))}
        </div>
      </section>

      {/* --- TEAM SECTION --- */}
      <section className="py-40 px-6 lg:px-20 max-w-7xl mx-auto" id="Sobre nos">
        <SectionHeading 
            badge="Time & Creators" 
            subtitle="Conheça alguns dos criadores em destaque e novos membros da nossa comunidade."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {creatorProfiles.map((p, i) => (
             <div key={i} className="positivus-card flex flex-col gap-8 bg-white hover:bg-brand-lilac/20">
                <div className="flex items-start justify-between border-b border-black pb-8">
                   <div className="flex items-center gap-6">
                      <div className="relative">
                         <img src={p.image} className="w-24 h-24 rounded-full border-2 border-black object-cover" alt="" />
                         <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-purple rounded-full border-2 border-black flex items-center justify-center">
                            <Instagram size={20} />
                         </div>
                      </div>
                      <div>
                         <h4 className="text-xl font-bold">{p.name}</h4>
                         <p className="text-text-muted">{p.handle}</p>
                      </div>
                   </div>
                   <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center cursor-pointer">
                      <ArrowUpRight className="text-brand-purple" size={18} />
                   </div>
                </div>
                <div className="space-y-4">
                   <p className="text-lg">
                      Conectou-se com dezenas de novos criadores e expandiu sua rede de amigos no Instagram.
                   </p>
                   <div className="flex items-center justify-between">
                      <div className="text-2xl font-display font-bold">{p.followers}</div>
                      <div className="text-sm font-black uppercase text-brand-purple tracking-widest">Connect</div>
                   </div>
                </div>
             </div>
          ))}
        </div>
        <div className="mt-16 flex justify-end">
           <button className="px-12 py-5 bg-black text-white rounded-2xl font-bold text-xl hover:bg-black/80 transition-all shadow-[0px_4px_0px_#B088F9]">
              Ver todo o time
           </button>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-40 px-3 md:px-20 max-w-7xl mx-auto" id="Depoimentos">
        <div className="bg-card-dark rounded-[45px] p-10 md:p-20 overflow-hidden relative">
           <SectionHeading 
              badge="Depoimentos" 
              subtitle="Veja o que dizem os membros da nossa comunidade sobre expandir o networking com nossa plataforma."
           />
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {[
                { name: "Juliana Mendes", text: "Achei sensacional a proposta de matches de networking! Consegui conectar com vários perfis do mesmo nicho de moda, trocando ideias e experiências reais." },
                { name: "Paulo Azevedo", text: "Finalmente uma ferramenta limpa de verdade, livre de fakes e robôs. Conheci ótimos criadores para fazer parcerias de qualidade." }
              ].map((t, i) => (
                <div key={i} className="relative pt-10">
                   <div className="border border-brand-purple rounded-[40px] p-10 relative">
                      <p className="text-white text-xl md:text-2xl font-light leading-relaxed italic">
                        "{t.text}"
                      </p>
                      {/* Speech bubble arrow pointer */}
                      <div className="absolute -bottom-4 left-16 w-8 h-8 bg-card-dark border-r border-b border-brand-purple rotate-45" />
                   </div>
                   <div className="mt-12 ml-16">
                      <h4 className="text-brand-purple text-2xl font-bold">{t.name}</h4>
                      <p className="text-white/40 uppercase tracking-widest font-black text-xs">Content Creator</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- CONTACT --- */}
      <section className="py-40 px-6 lg:px-20 max-w-7xl mx-auto">
         <SectionHeading 
            badge="Contato" 
            subtitle="Conecte-se conosco: vamos discutir suas necessidades de marketing digital social."
         />

         <div className="bg-card-lilac rounded-[45px] p-10 md:p-20 flex flex-col lg:flex-row gap-16 relative overflow-hidden positivus-border">
            <div className="flex-1 z-10 space-y-12">
               <div className="flex items-center gap-12">
                  <label className="flex items-center gap-4 cursor-pointer">
                    <input type="radio" name="type" className="w-8 h-8 accent-brand-purple" defaultChecked />
                    <span className="text-2xl">Entrar em Contato</span>
                  </label>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-lg font-bold">Nome</label>
                     <input type="text" placeholder="Seu nome" className="w-full bg-white border border-black rounded-2xl p-6 outline-none focus:border-brand-purple transition-all shadow-[0px_2px_0px_rgba(0,0,0,1)]" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-lg font-bold">Email*</label>
                     <input type="email" placeholder="seu@email.com" className="w-full bg-white border border-black rounded-2xl p-6 outline-none focus:border-brand-purple transition-all shadow-[0px_2px_0px_rgba(0,0,0,1)]" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-lg font-bold">Mensagem*</label>
                     <textarea placeholder="Como podemos ajudar?" rows={6} className="w-full bg-white border border-black rounded-2xl p-6 outline-none focus:border-brand-purple transition-all shadow-[0px_2px_0px_rgba(0,0,0,1)] resize-none" />
                  </div>
                  <button className="w-full py-6 bg-black text-white rounded-2xl font-bold text-2xl hover:bg-black/90 transition-all shadow-[0px_4px_0px_#B088F9]">
                     Enviar Mensagem
                  </button>
               </div>
            </div>
            
            <div className="flex-1 hidden lg:flex items-center justify-center relative">
                {/* Abstract shape from Positivus contact section */}
                <svg viewBox="0 0 500 500" className="w-full max-w-[400px]">
                   <motion.circle 
                      cx="250" cy="250" r="180" fill="none" stroke="black" strokeWidth="0.5" strokeDasharray="10 10" 
                      animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                   />
                   <path d="M200 100 L300 250 L200 400 L250 250 Z" fill="black" opacity="0.05" />
                   <path d="M250 200 L400 250 L250 300 L100 250 Z" fill="#B088F9" opacity="0.2" className="animate-pulse" />
                   <Instagram className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 text-black/10" />
                </svg>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-surface pt-10 px-6 lg:px-20 max-w-7xl mx-auto">
        <div className="bg-card-dark rounded-t-[45px] p-12 md:p-20">
          <div className="flex flex-col lg:flex-row justify-between items-start md:items-center gap-12 mb-16 pb-16 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 bg-brand-purple rounded-full" />
              </div>
              <span className="text-3xl font-display font-bold tracking-tight text-white">FollowWave</span>
            </div>
            
            <div className="flex flex-wrap gap-10">
               {["Sobre nos", "Servicos", "Cases", "Precos", "Blog"].map(link => (
                  <a key={link} href="#" className="text-lg text-white hover:text-brand-purple transition-colors underline underline-offset-4 decoration-white/20">{link}</a>
               ))}
            </div>

            <div className="flex gap-6">
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-purple transition-colors">
                  <Globe size={20} />
               </div>
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-purple transition-colors">
                  <Instagram size={20} />
               </div>
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-purple transition-colors">
                  <Target size={20} />
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
             <div className="space-y-10">
                <Badge className="bg-brand-purple text-black">Contato:</Badge>
                <div className="space-y-4 text-white/80 text-xl leading-relaxed">
                   <p>Email: contato@followwave.com.br</p>
                   <p>Phone: 11 99999-9999</p>
                   <p>Rua dos Criadores, 1234 <br />São Paulo, Brasil 01234-567</p>
                </div>
             </div>
             
             <div className="bg-[#292a32] p-10 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
                <input 
                  type="email" 
                  placeholder="Seu email" 
                  className="w-full bg-transparent border border-white/20 rounded-xl p-4 text-white outline-none focus:border-brand-purple transition-all"
                />
                <button className="w-full md:w-auto px-8 py-4 bg-brand-purple text-black rounded-xl font-bold text-lg hover:opacity-90 transition-opacity">
                  Assinar News
                </button>
             </div>
          </div>

          <div className="mt-24 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/40 text-lg">© 2026 FollowWave. All rights reserved.</p>
            <div className="flex gap-8">
               <a href="#" className="text-white/40 hover:text-white underline underline-offset-4 decoration-white/20">Política de Privacidade</a>
               <a href="#" className="text-white/40 hover:text-white underline underline-offset-4 decoration-white/20">Termos de Serviço</a>
            </div>
          </div>
        </div>
      </footer>
      </>
      )}
    </div>
  );
}
