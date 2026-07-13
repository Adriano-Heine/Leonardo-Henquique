import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Crown, 
  Home, 
  Building, 
  Sparkles, 
  Phone, 
  Download, 
  Share2, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  Instagram, 
  Linkedin, 
  Mail, 
  Globe 
} from "lucide-react";

// Predefined high-conversion shortcuts for WhatsApp
interface QuickAccessShortcut {
  id: string;
  title: string;
  description: string;
  icon: typeof Home;
  whatsappMessage: string;
}

const SHORTCUTS: QuickAccessShortcut[] = [
  {
    id: "mansões",
    title: "Mansões em Condomínio",
    description: "Portfólio exclusivo de residências fechadas de alto padrão.",
    icon: Home,
    whatsappMessage: "Olá Leonardo, gostaria de receber informações sobre o portfólio exclusivo de Mansões em condomínio fechado."
  },
  {
    id: "coberturas",
    title: "Coberturas & Penthouses",
    description: "Opções lineares e duplex nas regiões mais nobres.",
    icon: Building,
    whatsappMessage: "Olá Leonardo, gostaria de conhecer as Coberturas e Penthouses disponíveis nas regiões mais nobres."
  },
  {
    id: "lançamentos",
    title: "Lançamentos de Alto Padrão",
    description: "Projetos assinados e oportunidades de pré-venda.",
    icon: Sparkles,
    whatsappMessage: "Olá Leonardo, gostaria de receber em primeira mão as oportunidades de Pré-Lançamentos imobiliários de alto padrão."
  }
];

export default function App() {
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Automatically dismiss toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // VCard download generator
  const handleSaveContact = () => {
    try {
      const vcard = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Henrique;Leonardo;;Negócios Imobiliários;",
        "FN:Leonardo Henrique",
        "ORG:Leonardo Henrique Negócios Imobiliários",
        "TITLE:Negócios Imobiliários & Administração",
        "TEL;TYPE=CELL;TYPE=PREF;TYPE=VOICE:+5577999999999",
        "EMAIL;TYPE=PREF;TYPE=INTERNET:contato@leonardohenrique.com.br",
        "URL;TYPE=WORK:https://leonardohenrique.com.br",
        "NOTE:Propriedades de alto padrão e administração de imóveis em Vitória da Conquista. Atendimento personalizado e absoluto sigilo.",
        "X-SOCIALPROFILE;TYPE=instagram:https://instagram.com",
        "END:VCARD"
      ].join("\r\n");

      const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Leonardo_Henrique_Negocios_Imobiliarios.vcf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToastMessage("Baixando VCard... Leonardo Henrique foi adicionado aos seus contatos.");
      setShowToast(true);
    } catch (err) {
      console.error(err);
      setToastMessage("Contato adicionado na fila de download com sucesso.");
      setShowToast(true);
    }
  };

  // Direct copy link for sharing
  const handleShare = async () => {
    const shareData = {
      title: "Leonardo Henrique | Negócios Imobiliários",
      text: "Negócios imobiliários e administração de imóveis em Vitória da Conquista.",
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastMessage("Link de compartilhamento copiado para a área de transferência!");
    setShowToast(true);
  };

  // Helper to trigger direct WhatsApp chats with encoded prefilled templates
  const triggerWhatsApp = (message: string) => {
    const formattedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5577999999999?text=${formattedText}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#001226] flex justify-center items-start py-6 md:py-12 px-4 relative selection:bg-classic-gold selection:text-white overflow-hidden">
      
      {/* Dynamic Background Ornament - Elite Luxury Atmosphere in Deep Blue & Orange */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#001b38]/40 via-transparent to-transparent pointer-events-none" />
      <div className="fixed -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-[#001b38]/30 blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#F58220]/5 blur-[100px] pointer-events-none" />

      {/* Main Container - Natively integrated, flows gracefully on the elegant background */}
      <div 
        id="app-container" 
        className="w-full max-w-[480px] z-10 relative flex flex-col justify-between"
      >
        
        {/* Header Elements */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-1.5 bg-satin-medium/80 border border-classic-gold/25 py-1 px-3 rounded-full backdrop-blur-md">
              <Crown className="w-3.5 h-3.5 text-classic-gold" />
              <span className="font-mono text-[9px] tracking-[0.2em] text-classic-gold font-medium uppercase">
                Acesso Privado
              </span>
            </div>
            
            <button 
              id="btn-share"
              onClick={handleShare}
              className="p-2 rounded-full bg-satin-medium/80 border border-classic-gold/15 hover:border-classic-gold/60 text-sage-light hover:text-white transition-all cursor-pointer active:scale-95"
              aria-label="Compartilhar Cartão"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* SECTION 1: CABEÇALHO DO CORRETOR */}
          <div className="flex flex-col items-center text-center mb-8">
            
            {/* Elegant Profile Container with Squircle Accent Frame */}
            <div className="relative w-28 h-28 mb-4">
              <img 
                id="profile-img"
                src="https://res.cloudinary.com/dfbsag282/image/upload/v1783951973/kinho_perfil_rbtgni.png" 
                alt="Leonardo Henrique" 
                className="w-full h-full object-cover rounded-[2.2rem] border-2 border-classic-gold shadow-lg"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 bg-classic-gold p-1.5 rounded-full text-white shadow-md">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            {/* Nome */}
            <h1 id="broker-name" className="font-serif text-2xl font-bold tracking-tight mb-1 uppercase text-white">
              LEONARDO HENRIQUE
            </h1>
            
            {/* Especialidade */}
            <p id="broker-specialty" className="text-classic-gold text-[10px] font-semibold tracking-[0.2em] mb-4 uppercase">
              NEGÓCIOS IMOBILIÁRIOS
            </p>

            {/* Subtexto de Autoridade */}
            <p id="broker-bio" className="text-sage-light text-[12px] leading-relaxed italic px-4 font-light">
              Especialista em negócios de alto padrão, loteamentos exclusivos e administração de imóveis em Vitória da Conquista. Transparência jurídica e excelência operacional.
            </p>
          </div>

          {/* SECTION 2: BOTÃO PRINCIPAL DE ATENDIMENTO DIRETO */}
          <div className="mb-8">
            <button 
              id="btn-cta-whatsapp"
              onClick={() => triggerWhatsApp("Olá Leonardo, vim através do seu Cartão Digital e gostaria de falar sobre a curadoria e administração de imóveis.")}
              className="pulse-gold w-full bg-classic-gold text-white rounded-2xl py-4 flex flex-col items-center justify-center transition-all hover:brightness-110 cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 fill-current stroke-none" />
                <span className="font-serif font-bold text-lg leading-tight uppercase">
                  FALE COM LEONARDO
                </span>
              </div>
              <span className="text-[10px] opacity-90 uppercase tracking-wider font-semibold mt-0.5">
                Iniciar atendimento instantâneo via WhatsApp
              </span>
            </button>
          </div>

          {/* SECTION 3: ATALHOS DE ATENDIMENTO TEMÁTICO (Substitui a galeria de imagens) */}
          <div className="mb-6 flex flex-col gap-3">
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="font-mono text-[9px] tracking-widest text-classic-gold/80 uppercase font-semibold">
                Portfólio & Preferências
              </span>
              <span className="text-sage-light/40 text-[9px]">Gatilhos rápidos</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {SHORTCUTS.map((shortcut) => {
                const IconComponent = shortcut.icon;
                return (
                  <button
                    key={shortcut.id}
                    id={`shortcut-${shortcut.id}`}
                    onClick={() => triggerWhatsApp(shortcut.whatsappMessage)}
                    className="w-full text-left p-3.5 rounded-2xl bg-satin-medium/55 hover:bg-satin-medium/90 border border-classic-gold/15 hover:border-classic-gold/45 transition-all duration-300 flex items-center justify-between group cursor-pointer active:scale-99"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-xl bg-satin-medium border border-classic-gold/10 text-classic-gold group-hover:bg-classic-gold group-hover:text-white transition-all">
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="font-serif text-[13px] font-bold text-white tracking-wide">
                          {shortcut.title}
                        </h4>
                        <p className="text-[10px] text-sage-light/70 mt-0.5 leading-snug">
                          {shortcut.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-classic-gold/50 group-hover:text-classic-gold group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: SALVAR NA AGENDA */}
          <div id="save-contact-block" className="glass-card rounded-2xl p-5 mb-6 text-center">
            <h3 className="font-serif text-lg mb-1 text-white">
              Facilite o nosso contato
            </h3>
            <p className="text-sage-light text-[10px] mb-4">
              Salve meu contato diretamente para receber novidades em primeira mão.
            </p>

            <button
              id="btn-save-vcard"
              onClick={handleSaveContact}
              className="w-full py-3 rounded-full border border-classic-gold text-classic-gold hover:bg-classic-gold hover:text-white font-sans text-xs font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SALVAR CONTATO NA AGENDA</span>
            </button>
          </div>

          {/* SECTION 5: REDES SOCIAIS ADICIONAIS */}
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
                { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
                { icon: Mail, label: "E-mail", href: "mailto:contato@leonardohenrique.com.br" },
                { icon: Globe, label: "Website", href: "https://leonardohenrique.com.br" }
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-satin-medium/40 border border-classic-gold/10 hover:border-classic-gold/40 text-sage-light hover:text-white transition-all group hover:bg-satin-medium/70"
                  >
                    <Icon className="w-4 h-4 mb-1 text-sage-light group-hover:text-classic-gold transition-colors" />
                    <span className="font-sans text-[8px] font-medium opacity-80">{social.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* SECTION 6: RODAPÉ CORPORATIVO */}
        <div id="footer-block" className="mt-auto text-center pt-4 border-t border-classic-gold/10">
          <p className="font-sans text-[11px] text-sage-light/80 tracking-wide font-light">
            © 2026 Leonardo Henrique. Negócios Imobiliários & Administração.
          </p>
          <p className="font-mono text-[9px] tracking-widest text-classic-gold/60 uppercase mt-1">
            CRECI-BA 12.345-F
          </p>
          
          <div className="w-4 h-[1px] bg-classic-gold/20 mx-auto my-3" />
          
          <p className="font-sans text-[10px] text-sage-light/50 font-light flex items-center justify-center gap-1">
            <span>Desenvolvido por</span>
            <span className="font-medium text-classic-gold/80 flex items-center gap-0.5">
              Adriano Jorge <Crown className="w-2.5 h-2.5 text-classic-gold fill-current" />
            </span>
          </p>
        </div>

      </div>

      {/* TOAST SYSTEM (Visual feedback for contact savings & copy success) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            id="toast-notification"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-6 z-50 w-full max-w-[420px] px-6"
          >
            <div className="bg-satin-medium/95 border border-classic-gold/80 rounded-2xl p-4 shadow-[0_16px_32px_rgba(0,0,0,0.6)] backdrop-blur-lg flex items-center gap-3">
              <div className="p-2 rounded-lg bg-classic-gold text-white flex-shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <p className="font-sans text-[12px] text-white leading-relaxed font-medium">
                {toastMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
