import { useState, useEffect, useRef, FormEvent, ChangeEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./lib/firebase";
import { 
  Crown, 
  Phone, 
  Download, 
  Share2, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  Instagram, 
  Linkedin, 
  Mail, 
  Globe,
  QrCode,
  X,
  Copy,
  Sparkles,
  Building,
  Home,
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2,
  Plus,
  Lock,
  Unlock,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  MessageSquare,
  MapPin
} from "lucide-react";

// ============================================================================
// DEFAULT SEED DATA (Saves broker from staring at a blank screen initially)
// ============================================================================
const DEFAULT_PROPERTIES = [
  {
    id: "prop-1",
    title: "Mansão Haras Residence",
    price: "R$ 4.500.000",
    type: "casa",
    location: "Vitória da Conquista - BA",
    description: "Residência cinematográfica com 4 suítes master, pé-direito duplo de 7 metros, área gourmet integrada com piscina aquecida de borda infinita e automação completa.",
    photos: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"
    ]
  }
];

export default function App() {
  // Global & General States
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("casa");
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [propertyIdToDelete, setPropertyIdToDelete] = useState<string | null>(null);

  // Carousel Navigation States (Tracks active photo index for each property)
  const [carouselIndices, setCarouselIndices] = useState<{ [key: string]: number }>({});

  // Hidden Admin/Broker Portal States
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [verifiedClickCount, setVerifiedClickCount] = useState<number>(0);

  // Property Form States (For adding new listings in the Admin Panel)
  const [formTitle, setFormTitle] = useState<string>("");
  const [formPrice, setFormPrice] = useState<string>("");
  const [formType, setFormType] = useState<string>("casa");
  const [formLocation, setFormLocation] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load properties from Firestore with onSnapshot for real-time, cross-device sync
  useEffect(() => {
    const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
    
    // Initial loading state timer for premium UX feel
    const timer = setTimeout(() => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          // Seed DEFAULT_PROPERTIES into Firestore if collection is empty
          DEFAULT_PROPERTIES.forEach(async (prop, index) => {
            await setDoc(doc(db, "properties", prop.id), {
              ...prop,
              createdAt: new Date(Date.now() - index * 1000).toISOString()
            });
          });
        } else {
          const list: any[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data());
          });
          setProperties(list);
          localStorage.setItem("leonardo_properties", JSON.stringify(list));
        }
        setLoading(false);
      }, (error) => {
        console.error("Error with Firestore snapshot:", error);
        // Fallback to local storage
        const stored = localStorage.getItem("leonardo_properties");
        if (stored) {
          setProperties(JSON.parse(stored));
        } else {
          setProperties(DEFAULT_PROPERTIES);
        }
        setLoading(false);
      });

      return unsubscribe;
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Toast automatic dismiss
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Handle secret click triggers (5 clicks on the Verified Badge to open Login)
  const handleVerifiedBadgeClick = () => {
    const current = verifiedClickCount + 1;
    setVerifiedClickCount(current);
    if (current >= 5) {
      setShowLoginModal(true);
      setVerifiedClickCount(0);
    }
  };

  // Login Authentication
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput === "1234") {
      setIsAdminMode(true);
      setShowLoginModal(false);
      setPasswordInput("");
      setLoginError("");
      setToastMessage("Painel Administrativo do Corretor Ativado!");
      setShowToast(true);
    } else {
      setLoginError("Senha inválida. Entre em contato com o suporte.");
    }
  };

  // ============================================================================
  // AUTOMATIC IMAGE OPTIMIZER PIPELINE (HTML5 Canvas Resizer & Compressor)
  // ============================================================================
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const filesArray = Array.from(files) as File[];
    const optimizedPhotos: string[] = [];

    let processedCount = 0;

    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Setup HTML5 Canvas for optimal scaling
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Define ideal resolution parameters for luxury cards (Proportional Max 900px width)
          const MAX_WIDTH = 900;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          if (ctx) {
            // Draw & apply crisp resampling
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to optimized high-performance JPEG (0.75 quality reduces size by 85% with premium quality!)
            const optimizedBase64 = canvas.toDataURL("image/jpeg", 0.75);
            optimizedPhotos.push(optimizedBase64);
          }

          processedCount++;
          if (processedCount === filesArray.length) {
            setFormPhotos((prev) => [...prev, ...optimizedPhotos].slice(0, 10)); // Max 10 photos
            setIsUploading(false);
            setToastMessage(`${filesArray.length} fotos importadas e otimizadas automaticamente!`);
            setShowToast(true);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Add new property to Firestore
  const handleAddProperty = (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice || !formLocation || !formDescription) {
      setToastMessage("Preencha todos os campos do imóvel.");
      setShowToast(true);
      return;
    }

    if (formPhotos.length === 0) {
      setToastMessage("Selecione ou envie pelo menos 1 foto.");
      setShowToast(true);
      return;
    }

    const newProperty = {
      id: `prop-${Date.now()}`,
      title: formTitle,
      price: formPrice,
      type: formType,
      location: formLocation,
      description: formDescription,
      photos: formPhotos,
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, "properties", newProperty.id), newProperty)
      .then(() => {
        // Clear form inputs
        setFormTitle("");
        setFormPrice("");
        setFormLocation("");
        setFormDescription("");
        setFormPhotos([]);
        
        setToastMessage("Imóvel cadastrado com sucesso no catálogo!");
        setShowToast(true);
      })
      .catch((error) => {
        console.error("Error adding property to Firestore:", error);
        setToastMessage("Erro ao salvar imóvel no Firestore.");
        setShowToast(true);
      });
  };

  // Delete property from database (shows custom modal)
  const handleDeleteProperty = (id: string) => {
    setPropertyIdToDelete(id);
  };

  // Perform actual deletion when custom modal is confirmed
  const confirmDeleteProperty = () => {
    if (!propertyIdToDelete) return;
    deleteDoc(doc(db, "properties", propertyIdToDelete))
      .then(() => {
        setPropertyIdToDelete(null);
        setToastMessage("Imóvel excluído.");
        setShowToast(true);
      })
      .catch((error) => {
        console.error("Error deleting property from Firestore:", error);
        setToastMessage("Erro ao excluir imóvel no Firestore.");
        setShowToast(true);
      });
  };

  // Carousel navigation logic (Prev/Next photo)
  const handlePrevPhoto = (propertyId: string, maxPhotos: number, e: MouseEvent) => {
    e.stopPropagation();
    setCarouselIndices((prev) => {
      const current = prev[propertyId] || 0;
      const nextIndex = current === 0 ? maxPhotos - 1 : current - 1;
      return { ...prev, [propertyId]: nextIndex };
    });
  };

  const handleNextPhoto = (propertyId: string, maxPhotos: number, e: MouseEvent) => {
    e.stopPropagation();
    setCarouselIndices((prev) => {
      const current = prev[propertyId] || 0;
      const nextIndex = current === maxPhotos - 1 ? 0 : current + 1;
      return { ...prev, [propertyId]: nextIndex };
    });
  };

  // Direct contact action
  const triggerWhatsApp = (message: string) => {
    const url = `https://wa.me/5577999939223?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Copy card link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastMessage("Link do Cartão copiado com sucesso!");
    setShowToast(true);
  };

  // Download VCard contact
  const handleSaveContact = () => {
    try {
      const vcard = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Henrique;Leonardo;;Contec Imobiliária;",
        "FN:Leonardo Henrique - Contec",
        "ORG:Contec Imobiliária",
        "TEL;TYPE=CELL;TYPE=PREF;TYPE=VOICE:+5577999939223",
        "TEL;TYPE=CELL;TYPE=VOICE:+5577999996584",
        "TEL;TYPE=WORK;TYPE=VOICE:+557740095815",
        "EMAIL;TYPE=PREF;TYPE=INTERNET:contecimobiliaria@gmail.com",
        "URL;TYPE=WORK:https://www.contecimobiliaria.com.br",
        "NOTE:Contec Imobiliária - Rua Leonídio de Oliveira, 620, Recreio - Vitória da Conquista - BA. Atendimento personalizado.",
        "END:VCARD"
      ].join("\r\n");

      const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Leonardo_Henrique_Contec.vcf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setToastMessage("Contato pronto para salvar na sua agenda!");
      setShowToast(true);
    } catch (e) {
      setToastMessage("Erro ao gerar contato.");
      setShowToast(true);
    }
  };

  // Filter properties category
  const filteredProperties = properties.filter((p) => {
    if (selectedCategory === "todos") return true;
    return p.type === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-[#001226] flex justify-center items-start py-6 md:py-12 px-4 relative selection:bg-classic-gold selection:text-white overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#001b38]/40 via-transparent to-transparent pointer-events-none" />
      <div className="fixed -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-[#001b38]/30 blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#F58220]/5 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[440px] z-10 relative flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          {!isAdminMode ? (
            /* CLIENT IMMERSIVE CARD */
            <motion.div
              key="client-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col"
            >
              {/* Header Navigation */}
              <div className="flex justify-between items-center mb-6">
                <div 
                  onClick={handleVerifiedBadgeClick}
                  className="flex items-center gap-1.5 bg-[#0c2442]/80 border border-classic-gold/25 py-1 px-3 rounded-full backdrop-blur-md cursor-pointer select-none"
                  title="Badge Verificado"
                >
                  <Crown className="w-3.5 h-3.5 text-classic-gold animate-pulse" />
                  <span className="font-mono text-[9px] tracking-[0.2em] text-classic-gold font-medium uppercase">
                    Premium Partner
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowQrModal(true)}
                    className="p-2 rounded-full bg-[#0c2442]/80 border border-classic-gold/15 hover:border-classic-gold/60 text-classic-gold transition-all cursor-pointer active:scale-95"
                    title="Mostrar QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={handleShare}
                    className="p-2 rounded-full bg-[#0c2442]/80 border border-classic-gold/15 hover:border-classic-gold/60 text-classic-gold transition-all cursor-pointer active:scale-95"
                    title="Compartilhar Cartão"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* BROKER PROFILE */}
              <div className="flex flex-col items-center text-center mb-7">
                <div className="relative w-28 h-28 mb-4">
                  <img 
                    src="https://res.cloudinary.com/dfbsag282/image/upload/v1783951973/kinho_perfil_rbtgni.png" 
                    alt="Leonardo Henrique" 
                    className="w-full h-full object-cover rounded-[2.2rem] border-2 border-classic-gold shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-classic-gold p-1.5 rounded-full text-white shadow-md">
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                <h1 className="font-serif text-2xl font-bold tracking-tight mb-1 uppercase text-white">
                  LEONARDO HENRIQUE
                </h1>
                
                <p className="text-classic-gold text-[10px] font-semibold tracking-[0.2em] mb-4 uppercase">
                  CONTEC IMOBILIÁRIA
                </p>

                <p className="text-gray-300 text-[12px] leading-relaxed italic px-4 font-light">
                  Especialista em negócios de alto padrão, loteamentos exclusivos e administração de imóveis em Vitória da Conquista. Transparência jurídica e excelência operacional.
                </p>
              </div>

              {/* INSTANT CONTACT CALL-TO-ACTION */}
              <div className="mb-8">
                <button 
                  onClick={() => triggerWhatsApp("Olá Leonardo, vim através do seu Cartão Digital e gostaria de falar sobre os imóveis da Contec Imobiliária.")}
                  className="pulse-gold w-full bg-classic-gold text-white rounded-2xl py-4 flex flex-col items-center justify-center transition-all hover:brightness-110 cursor-pointer active:scale-98 shadow-lg shadow-classic-gold/20"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 fill-current stroke-none animate-bounce" />
                    <span className="font-serif font-bold text-lg leading-tight uppercase">
                      FALE COM LEONARDO
                    </span>
                  </div>
                  <span className="text-[10px] opacity-90 uppercase tracking-wider font-semibold mt-0.5">
                    Iniciar atendimento via WhatsApp
                  </span>
                </button>
              </div>

              {/* CATÁLOGO DE IMÓVEIS DINÂMICO E CARROSSEL */}
              <div className="mb-8">
                <div className="flex justify-between items-center px-1 mb-4">
                  <span className="font-mono text-[9px] tracking-widest text-classic-gold uppercase font-semibold">
                    Vitória da Conquista Portfolio
                  </span>
                  <span className="text-gray-400 text-[8px] uppercase tracking-wider">Múltiplas Fotos</span>
                </div>

                {/* Filtro de Categoria */}
                <div className="flex gap-1.5 overflow-x-auto pb-2.5 mb-4 scrollbar-thin scrollbar-track-transparent">
                  {[
                    { id: "casa", label: "Casa" },
                    { id: "apartamento", label: "Apartamentos" },
                    { id: "terrenos", label: "Terrenos" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`py-1.5 px-3 rounded-full text-[11px] font-medium tracking-wide transition-all shrink-0 cursor-pointer ${
                        selectedCategory === cat.id
                          ? "bg-classic-gold text-white"
                          : "bg-[#0c2442]/60 border border-classic-gold/10 text-gray-300 hover:border-classic-gold/30 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* SKELETON LOADER (Addressing processes/skeletons concept) */}
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2].map((sk) => (
                      <div 
                        key={sk} 
                        className="bg-[#0c2442]/30 border border-classic-gold/5 rounded-3xl p-4 space-y-3 relative overflow-hidden"
                      >
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-classic-gold/5 to-transparent animate-[shimmer_1.6s_infinite]" />
                        
                        <div className="w-full aspect-[16/10] rounded-2xl bg-[#0c2442]/60" />
                        <div className="h-4 bg-[#0c2442]/60 rounded w-2/3" />
                        <div className="h-3 bg-[#0c2442]/40 rounded w-1/3" />
                        <div className="h-2.5 bg-[#0c2442]/30 rounded w-5/6" />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* LISTA DE IMÓVEIS COM SEUS CARROSSEIS EXCLUSIVOS */
                  <div className="space-y-6">
                    {filteredProperties.length === 0 ? (
                      <div className="text-center py-10 bg-[#0c2442]/30 border border-classic-gold/10 rounded-3xl">
                        <Home className="w-8 h-8 text-classic-gold/40 mx-auto mb-2" />
                        <p className="text-gray-400 text-xs">Nenhum imóvel disponível para esta categoria.</p>
                      </div>
                    ) : (
                      filteredProperties.map((property) => {
                        const activePhotoIndex = carouselIndices[property.id] || 0;
                        const totalPhotos = property.photos.length;

                        return (
                          <motion.div
                            key={property.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0c2442]/40 border border-classic-gold/15 rounded-3xl p-4 backdrop-blur-md overflow-hidden relative"
                          >
                            {/* EXCLUSIVO CARROSSEL DE ATÉ 10 FOTOS */}
                            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-classic-gold/10 bg-[#001226] mb-4 group">
                              <img
                                src={property.photos[activePhotoIndex]}
                                alt={`${property.title} - Foto ${activePhotoIndex + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                              />

                              {/* Navigation arrows (shows on hover / touch) */}
                              {totalPhotos > 1 && (
                                <>
                                  <button
                                    onClick={(e) => handlePrevPhoto(property.id, totalPhotos, e)}
                                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#001226]/60 border border-classic-gold/10 hover:bg-classic-gold/80 text-white cursor-pointer active:scale-90 transition-all"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => handleNextPhoto(property.id, totalPhotos, e)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#001226]/60 border border-classic-gold/10 hover:bg-classic-gold/80 text-white cursor-pointer active:scale-90 transition-all"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {/* Dot Indicators */}
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-[#001226]/60 px-2.5 py-1.5 rounded-full border border-white/5">
                                {property.photos.map((_: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                      idx === activePhotoIndex ? "bg-classic-gold scale-125" : "bg-white/40"
                                    }`}
                                  />
                                ))}
                              </div>

                              {/* Photo counter badge */}
                              <div className="absolute top-3 right-3 bg-[#001226]/75 border border-classic-gold/20 px-2.5 py-1 rounded-full text-[9px] font-mono font-medium text-classic-gold">
                                {activePhotoIndex + 1} / {totalPhotos}
                              </div>
                            </div>

                            {/* Informações da propriedade */}
                            <div className="px-1">
                              <div className="flex justify-between items-start gap-2 mb-1.5">
                                <span className="font-mono text-[8px] uppercase tracking-wider text-classic-gold bg-classic-gold/10 px-2 py-0.5 rounded-md font-semibold">
                                  {property.type}
                                </span>
                                <span className="font-serif font-bold text-classic-gold text-sm">
                                  {property.price}
                                </span>
                              </div>

                              <h3 className="font-serif text-base font-bold text-white mb-1">
                                {property.title}
                              </h3>

                              <p className="text-[10px] text-gray-400 mb-2.5 font-sans">
                                {property.location}
                              </p>

                              <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                                {property.description}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })
                    )}

                    {/* CANAIS DE ATENDIMENTO DIRETO */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0c2442]/40 border border-classic-gold/15 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-classic-gold/5 rounded-full blur-xl pointer-events-none" />
                      
                      <h3 className="font-serif text-base font-bold text-white mb-1 uppercase tracking-wider text-center">
                        Canais de Atendimento
                      </h3>
                      <p className="text-classic-gold text-[9px] uppercase tracking-[0.2em] mb-5 text-center font-semibold">
                        Contato Direto &amp; Exclusivo
                      </p>

                      <div className="space-y-3">
                        {/* WhatsApp Button */}
                        <a
                          href="https://wa.me/5577999939223?text=Olá%20Leonardo,%20gostaria%20de%20conversar%20sobre%20imóveis%20na%20Contec%20Imobiliária."
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-3 px-4 rounded-xl bg-emerald-600/10 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-600/20 text-emerald-400 font-sans text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-between group cursor-pointer active:scale-98"
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-all">
                              <MessageSquare className="w-4 h-4 fill-emerald-400" />
                            </span>
                            <span className="text-left">
                              <span className="block text-[11px] font-bold text-emerald-300">WhatsApp principal</span>
                              <span className="block text-[9px] text-gray-400 font-mono normal-case tracking-normal mt-0.5">(77) 99993-9223</span>
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                        </a>

                        {/* Celular Button */}
                        <a
                          href="tel:+5577999996584"
                          className="w-full py-3 px-4 rounded-xl bg-classic-gold/10 border border-classic-gold/30 hover:border-classic-gold hover:bg-classic-gold/20 text-classic-gold font-sans text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-between group cursor-pointer active:scale-98"
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 rounded-lg bg-classic-gold/20 text-classic-gold group-hover:scale-110 transition-all">
                              <Phone className="w-4 h-4" />
                            </span>
                            <span className="text-left">
                              <span className="block text-[11px] font-bold text-amber-200">Telefone Celular</span>
                              <span className="block text-[9px] text-gray-400 font-mono normal-case tracking-normal mt-0.5">(77) 99999-6584</span>
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-classic-gold group-hover:translate-x-1 transition-transform" />
                        </a>

                        {/* Telefone Fixo Button */}
                        <a
                          href="tel:+557740095815"
                          className="w-full py-3 px-4 rounded-xl bg-[#0c2442]/80 border border-classic-gold/15 hover:border-classic-gold hover:bg-classic-gold/5 text-gray-300 font-sans text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-between group cursor-pointer active:scale-98"
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 rounded-lg bg-classic-gold/10 text-classic-gold/80 group-hover:scale-110 transition-all">
                              <Building className="w-4 h-4" />
                            </span>
                            <span className="text-left">
                              <span className="block text-[11px] font-bold text-gray-200">Telefone Fixo</span>
                              <span className="block text-[9px] text-gray-400 font-mono normal-case tracking-normal mt-0.5">(77) 4009-5815</span>
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* SAVE TO CONTACTS BLOCK */}
              <div id="save-contact-block" className="bg-[#0c2442]/60 border border-classic-gold/20 rounded-3xl p-5 mb-6 text-center backdrop-blur-md">
                <h3 className="font-serif text-base font-bold text-white mb-1">
                  Facilite o nosso contato
                </h3>
                <p className="text-gray-300 text-[10px] mb-4">
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

              {/* SOCIAL LINKS */}
              <div className="mb-6">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: Instagram, label: "Instagram", href: "https://instagram.com/contecimobiliaria" },
                    { icon: MapPin, label: "Localização", href: "https://maps.google.com/?q=Rua%20Leonidio%20de%20Oliveira,%20620,%20Recreio,%20Vitoria%20da%20Conquista%20-%20BA" },
                    { icon: Mail, label: "E-mail", href: "mailto:contecimobiliaria@gmail.com" },
                    { icon: Globe, label: "Website", href: "https://www.contecimobiliaria.com.br" }
                  ].map((social, idx) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={idx}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-[#0c2442]/40 border border-classic-gold/10 hover:border-classic-gold/40 text-gray-300 hover:text-white transition-all group hover:bg-[#0c2442]/70"
                      >
                        <Icon className="w-4 h-4 mb-1 text-classic-gold/80 group-hover:text-classic-gold transition-colors" />
                        <span className="font-sans text-[8px] font-medium opacity-85">{social.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Spacing padding at bottom since footer link is removed */}
              <div className="pb-6" />
            </motion.div>
          ) : (
            /* PRIVATE BROKER DASHBOARD / MANAGER PANEL */
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-classic-gold/15">
                <div className="flex items-center gap-2">
                  <Unlock className="w-5 h-5 text-classic-gold" />
                  <div>
                    <h2 className="font-serif text-sm font-bold text-white uppercase tracking-wider leading-tight">
                      Administração
                    </h2>
                    <p className="text-[9px] font-mono tracking-widest text-classic-gold uppercase">
                      Vitória da Conquista
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAdminMode(false)}
                  className="py-1 px-3 rounded-lg bg-[#0c2442] text-[10px] text-gray-300 hover:text-white border border-classic-gold/15 hover:border-classic-gold/50 cursor-pointer transition-all active:scale-95"
                >
                  Fechar Painel
                </button>
              </div>

              {/* FORMULÁRIO DE CADASTRO COM OTIMIZADOR DE IMAGENS */}
              <form onSubmit={handleAddProperty} className="bg-[#0c2442]/40 border border-classic-gold/15 rounded-3xl p-5 space-y-4">
                <h3 className="font-serif text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-classic-gold" />
                  <span>Cadastrar Novo Imóvel</span>
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-classic-gold uppercase tracking-wider mb-1">
                      Título do Imóvel
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ex: Mansão Residencial Alphaville"
                      className="w-full p-2.5 bg-[#001226] border border-classic-gold/15 focus:border-classic-gold focus:outline-none rounded-xl text-white text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-classic-gold uppercase tracking-wider mb-1">
                        Preço
                      </label>
                      <input
                        type="text"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="Ex: R$ 3.800.000"
                        className="w-full p-2.5 bg-[#001226] border border-classic-gold/15 focus:border-classic-gold focus:outline-none rounded-xl text-white text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-classic-gold uppercase tracking-wider mb-1">
                        Categoria
                      </label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                        className="w-full p-2.5 bg-[#001226] border border-classic-gold/15 focus:border-classic-gold focus:outline-none rounded-xl text-white text-xs cursor-pointer"
                      >
                        <option value="casa">Casa</option>
                        <option value="apartamento">Apartamentos</option>
                        <option value="terrenos">Terrenos</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-classic-gold uppercase tracking-wider mb-1">
                      Localização
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="Ex: Candeias, Vitória da Conquista - BA"
                      className="w-full p-2.5 bg-[#001226] border border-classic-gold/15 focus:border-classic-gold focus:outline-none rounded-xl text-white text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-classic-gold uppercase tracking-wider mb-1">
                      Descrição Resumida
                    </label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Características, quartos, suítes, infraestrutura..."
                      className="w-full h-16 p-2.5 bg-[#001226]/80 border border-classic-gold/15 focus:border-classic-gold focus:outline-none rounded-xl text-white text-xs resize-none"
                      required
                    />
                  </div>

                  {/* UPLOADER DE FOTOS COM PIPELINE DE COMPRESSÃO E REDIMENSIONAMENTO */}
                  <div className="bg-[#001226]/60 p-3.5 rounded-xl border border-classic-gold/10">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="block text-[10px] font-semibold text-classic-gold uppercase tracking-wider">
                          Otimizador de Fotos Inteligente
                        </span>
                        <span className="text-[9px] text-gray-400 block mt-0.5">
                          Até 10 fotos. Elas serão compactadas e redimensionadas automaticamente!
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="py-1 px-3 rounded-lg bg-classic-gold text-white text-[10px] font-bold flex items-center gap-1 hover:brightness-110 transition-all cursor-pointer"
                      >
                        {isUploading ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        <span>Selecionar Fotos</span>
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Exibição prévia das fotos otimizadas */}
                    {formPhotos.length > 0 ? (
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {formPhotos.map((photo, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-classic-gold/20">
                            <img src={photo} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setFormPhotos((prev) => prev.filter((_, i) => i !== index))}
                              className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white cursor-pointer hover:bg-red-500 transition-all"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 border border-dashed border-classic-gold/15 rounded-lg flex flex-col items-center justify-center gap-1.5">
                        <ImageIcon className="w-6 h-6 text-classic-gold/20" />
                        <span className="text-[10px]">Nenhuma foto carregada ainda</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-1 rounded-xl bg-classic-gold text-white font-serif text-xs font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 hover:brightness-110"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publicar no Cartão</span>
                  </button>
                </div>
              </form>

              {/* LISTA E GERENCIAMENTO DOS IMÓVEIS CADASTRADOS */}
              <div className="bg-[#0c2442]/40 border border-classic-gold/15 rounded-3xl p-5">
                <h3 className="font-serif text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-classic-gold" />
                  <span>Imóveis Cadastrados ({properties.length})</span>
                </h3>

                <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                  {properties.map((p) => (
                    <div 
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#001226]/50 border border-classic-gold/5 gap-3"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-classic-gold/10 shrink-0">
                        <img src={p.photos[0]} className="w-full h-full object-cover" alt="" />
                        <div className="absolute bottom-0 right-0 bg-[#001226]/80 text-[8px] font-mono px-1 rounded-tl">
                          {p.photos.length}F
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold text-white truncate">{p.title}</h4>
                        <p className="text-[9px] text-classic-gold font-mono truncate uppercase">{p.type} • {p.price}</p>
                        <p className="text-[9px] text-gray-400 truncate">{p.location}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteProperty(p.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                        title="Deletar Imóvel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RODAPÉ DO CARTÃO / FOOTER */}
        <footer className="w-full text-center mt-3 mb-2 flex flex-col items-center justify-center gap-0.5 text-gray-400 font-sans text-[10px] tracking-wide select-none">
          <p className="opacity-75">
            Projeto desenvolvido por <span className="font-semibold text-white">Adriano Jorge</span>
          </p>
          <a
            href="https://instagram.com/solucoes_premium"
            target="_blank"
            rel="noreferrer"
            className="text-[#F58220] hover:text-[#ff9c43] font-semibold transition-colors duration-200"
          >
            @solucoes_premium
          </a>
        </footer>

      </div>

      {/* SISTEMA DE NOTIFICAÇÃO TOAST */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-6 z-50 w-full max-w-[400px] px-6"
          >
            <div className="bg-[#0c2442]/95 border border-classic-gold rounded-2xl p-4 shadow-[0_16px_32px_rgba(0,0,0,0.6)] backdrop-blur-lg flex items-center gap-3">
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

      {/* MODAL DO QR CODE */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
              className="absolute inset-0 bg-[#000a14]/85 backdrop-blur-md cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-[360px] bg-[#0c2442] border border-classic-gold/30 rounded-[2rem] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.8)] overflow-hidden z-10 text-center"
            >
              <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-classic-gold/10 blur-xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-classic-gold/10 blur-xl pointer-events-none" />

              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-[#001226]/50 border border-classic-gold/10 text-gray-300 hover:text-white transition-all cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center mt-2">
                <div className="p-2.5 rounded-full bg-classic-gold/10 text-classic-gold mb-3.5">
                  <QrCode className="w-6 h-6" />
                </div>

                <h3 className="font-serif text-xl font-bold text-white mb-1 tracking-wide uppercase">
                  Compartilhar Cartão
                </h3>
                <p className="text-gray-300 text-[11px] leading-relaxed mb-6 max-w-[240px] mx-auto">
                  Aponte a câmera do seu celular para este QR Code para abrir o cartão digital instantaneamente.
                </p>

                {/* Container de QR Code */}
                <div className="relative p-4 bg-white rounded-2xl border-4 border-classic-gold shadow-md mb-6 w-[200px] h-[200px] flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=0c2442&data=${encodeURIComponent(window.location.href)}`}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <button
                  onClick={() => {
                    handleShare();
                    setShowQrModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl border border-classic-gold/30 hover:border-classic-gold text-white font-sans text-[11px] font-semibold tracking-wider uppercase bg-[#001226]/40 hover:bg-classic-gold/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-classic-gold" />
                  <span>Copiar Link do Cartão</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE LOGIN ADMINISTRATIVO (Broker Gateway) */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowLoginModal(false);
                setLoginError("");
                setPasswordInput("");
              }}
              className="absolute inset-0 bg-[#000a14]/85 backdrop-blur-md cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-[340px] bg-[#0c2442] border border-classic-gold/30 rounded-[2rem] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.8)] overflow-hidden z-10 text-center"
            >
              <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-classic-gold/10 blur-xl pointer-events-none" />

              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError("");
                  setPasswordInput("");
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-[#001226]/50 border border-classic-gold/10 text-gray-300 hover:text-white transition-all cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center mt-2">
                <div className="p-2.5 rounded-full bg-classic-gold/10 text-classic-gold mb-3.5">
                  <Lock className="w-5 h-5" />
                </div>

                <h3 className="font-serif text-lg font-bold text-white mb-1 tracking-wide uppercase">
                  Acesso Exclusivo
                </h3>
                <p className="text-gray-300 text-[11px] leading-relaxed mb-5 max-w-[220px] mx-auto">
                  Insira sua senha de corretor para gerenciar o portfólio de imóveis e carregar fotos.
                </p>

                <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Senha de Acesso"
                    className="w-full p-3 bg-[#001226] border border-classic-gold/20 focus:border-classic-gold focus:outline-none rounded-xl text-center text-white text-sm font-bold tracking-widest placeholder:font-sans placeholder:font-light"
                    autoFocus
                    required
                  />

                  {loginError && (
                    <p className="text-red-400 text-[10px] font-semibold">{loginError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-classic-gold hover:brightness-110 text-white font-serif text-[11px] font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer"
                  >
                    CONECTAR PAINEL
                  </button>
                </form>

                <p className="text-[9px] text-gray-500 mt-4">
                  Dica de acesso padrão: <code className="text-classic-gold">1234</code>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE IMÓVEL */}
      <AnimatePresence>
        {propertyIdToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPropertyIdToDelete(null)}
              className="absolute inset-0 bg-[#000a14]/85 backdrop-blur-md cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-[340px] bg-[#0c2442] border border-red-500/30 rounded-[2rem] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.8)] overflow-hidden z-10 text-center"
            >
              <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-red-500/10 blur-xl pointer-events-none" />

              <button
                onClick={() => setPropertyIdToDelete(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-[#001226]/50 border border-classic-gold/10 text-gray-300 hover:text-white transition-all cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center mt-2">
                <div className="p-2.5 rounded-full bg-red-500/10 text-red-400 mb-3.5">
                  <Trash2 className="w-5 h-5" />
                </div>

                <h3 className="font-serif text-base font-bold text-white mb-1 tracking-wide uppercase">
                  Excluir Imóvel?
                </h3>
                <p className="text-gray-300 text-[11px] leading-relaxed mb-6 max-w-[220px] mx-auto">
                  Deseja mesmo excluir permanentemente este imóvel do seu catálogo? Esta ação não poderá ser desfeita.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setPropertyIdToDelete(null)}
                    className="flex-1 py-2.5 rounded-xl border border-classic-gold/15 hover:border-classic-gold/40 text-gray-300 font-sans text-[11px] font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer hover:bg-white/5 active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteProperty}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-serif text-[11px] font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer active:scale-95"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
