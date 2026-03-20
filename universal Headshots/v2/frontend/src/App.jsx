import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ChevronRight, 
  Upload, 
  Camera, 
  Star, 
  Download, 
  Lock,
  Globe,
  Trophy,
  Users,
  CheckCircle2,
  Share2,
  Home,
  Grid,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// --- STYLES ---
const STYLES = {
  MALE: {
    GLOBAL: [
      { id: 'm_ceo', name: 'Elite CEO', preview: 'https://images.unsplash.com/photo-1560250097-0b93528c311a' },
      { id: 'm_tech', name: 'Tech Visionary', preview: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' }
    ],
    USA: [
      { id: 'm_wall_st', name: 'Wall Street', preview: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c' },
      { id: 'm_casual_pro', name: 'Silicon Valley', preview: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919' }
    ],
    BRAZIL: [
      { id: 'm_brazil_exec', name: 'São Paulo Elite', preview: 'https://images.unsplash.com/photo-1594751439417-df7a62722f46' }
    ],
    JAPAN: [
      { id: 'm_japan_pro', name: 'Tokyo Pro', preview: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c' }
    ],
    FRANCE: [
      { id: 'm_france_chic', name: 'Parisian Chic', preview: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36' }
    ],
    UK: [
      { id: 'm_london_fin', name: 'London Finance', preview: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919' }
    ],
    INDIA: [
      { id: 'm_kurta', name: 'Royal Kurta Pro', preview: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115' }
    ],
    UAE: [
      { id: 'm_thobe', name: 'Dubai Elite', preview: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c' }
    ]
  },
  FEMALE: {
    GLOBAL: [
      { id: 'f_boardroom', name: 'Boardroom Chic', preview: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2' },
      { id: 'f_creative', name: 'Artistic Lead', preview: 'https://images.unsplash.com/photo-1580489944761-15a19d654956' }
    ],
    USA: [
      { id: 'f_ny_exec', name: 'Manhattan Pro', preview: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2' }
    ],
    BRAZIL: [
      { id: 'f_rio_pro', name: 'Ipanema Chic', preview: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a' }
    ],
    JAPAN: [
      { id: 'f_osaka_led', name: 'Kyoto Grace', preview: 'https://images.unsplash.com/photo-1567532939604-b6b5b0ad2f01' }
    ],
    FRANCE: [
      { id: 'f_parisian', name: 'Paris Modern', preview: 'https://images.unsplash.com/photo-1580489944761-15a19d654956' }
    ],
    UK: [
      { id: 'f_london_media', name: 'London Media', preview: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a' }
    ],
    INDIA: [
      { id: 'f_saree', name: 'Imperial Saree', preview: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df' }
    ],
    UAE: [
      { id: 'f_abaya', name: 'Abaya Elegance', preview: 'https://images.unsplash.com/photo-1567532939604-b6b5b0ad2f01' }
    ]
  },
  NON_BINARY: {
    GLOBAL: [
      { id: 'nb_pro', name: 'Modern Neutral', preview: 'https://images.unsplash.com/photo-1580489944761-15a19d654956' }
    ],
    USA: [
      { id: 'nb_sf_creative', name: 'SF Creative', preview: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' }
    ],
    LATAM: [
      { id: 'nb_mexico_city', name: 'Condesa Modern', preview: 'https://images.unsplash.com/photo-1594751439417-df7a62722f46' }
    ],
    EUROPE: [
      { id: 'nb_berlin', name: 'Berlin Creative', preview: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' }
    ]
  }
};

export default function App() {
  const [view, setView] = useState('landing'); // landing, auth, upload, processing, gallery
  const [gender, setGender] = useState('MALE');
  const [country, setCountry] = useState('GLOBAL');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [batchId, setBatchId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [refineCredits, setRefineCredits] = useState(0); // Fetch from user doc in prod
  const [refinePrompt, setRefinePrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = () => setView('auth');
  const handleLoginSuccess = () => setView('upload');

  // Polling for progress if in processing view
  useEffect(() => {
    if (view === 'processing' && batchId) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/batch-status/${batchId}`);
          const status = await res.json();
          if (status.progress !== undefined) setProgress(status.progress);
          if (status.status === 'COMPLETED') {
            clearInterval(interval);
            setView('gallery');
          }
        } catch (e) {
          console.error('Status Polling Error:', e);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [view, batchId]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] aspect-square bg-violet-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] aspect-square bg-indigo-600/20 rounded-full blur-[120px]" />

      <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
            {/* Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-violet-600 rounded-xl items-center justify-center flex shadow-lg shadow-violet-500/20">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-white font-black italic text-xl tracking-tighter uppercase leading-none">Universal</h1>
                <h1 className="text-violet-500 font-black italic text-xl tracking-tighter uppercase leading-none">Headshots</h1>
              </div>
            </div>
        <button 
          onClick={() => setView('auth')}
          className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-xs font-bold hover:bg-white/10 transition-all"
        >
          MEMBER LOGIN
        </button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <LandingView key="landing" onStart={handleStart} />
          )}
          {view === 'auth' && (
            <AuthView key="auth" onNext={handleLoginSuccess} />
          )}
          {view === 'upload' && (
            <UploadView 
              key="upload" 
              gender={gender} 
              setGender={setGender} 
              images={images} 
              setImages={setImages} 
              onNext={() => setView('processing')} 
            />
          )}
          {view === 'processing' && (
            <ProcessingView 
              key="processing" 
              progress={progress}
              onComplete={() => setView('gallery')} 
            />
          )}
          {view === 'gallery' && (
            <GalleryView 
              key="gallery" 
              batchId={batchId}
              images={images}
              setImages={setImages}
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              refineCredits={refineCredits}
              setRefineCredits={setRefineCredits}
              refinePrompt={refinePrompt}
              setRefinePrompt={setRefinePrompt}
            />
          )}
          {view === 'support' && (
            <SupportView key="support" onBack={() => setView('landing')} />
          )}
          {view === 'privacy' && (
            <PrivacyView key="privacy" onBack={() => setView('landing')} />
          )}
          {view === 'terms' && (
            <TermsView key="terms" onBack={() => setView('landing')} />
          )}
          {view === 'pricing' && (
            <PricingView key="pricing" onBack={() => setView('landing')} onSubscribe={() => setView('auth')} />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {(view === 'upload' || view === 'gallery') && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4 bg-[#0A0A0F]/80 backdrop-blur-xl border-t border-white/10 flex justify-around items-center md:hidden">
          <button onClick={() => setView('upload')} className={`flex flex-col items-center space-y-1 ${view === 'upload' ? 'text-violet-500' : 'text-gray-500'}`}>
            <Home size={20} />
            <span className="text-[10px] font-bold">GENERATE</span>
          </button>
          <button onClick={() => setView('gallery')} className={`flex flex-col items-center space-y-1 ${view === 'gallery' ? 'text-violet-500' : 'text-gray-500'}`}>
            <Grid size={20} />
            <span className="text-[10px] font-bold">GALLERY</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-500">
            <User size={20} />
            <span className="text-[10px] font-bold">ACCOUNT</span>
          </button>
        </nav>
      )}

      {/* Footer (Simplified for Mobile-First) */}
      <footer className="relative z-10 text-center py-20 px-6">
        <div className="flex justify-center space-x-6 mb-4">
          <button onClick={() => setView('support')} className="text-gray-500 hover:text-white transition-all text-[10px] font-black tracking-widest uppercase">Support</button>
          <button onClick={() => setView('privacy')} className="text-gray-500 hover:text-white transition-all text-[10px] font-black tracking-widest uppercase">Privacy</button>
          <button onClick={() => setView('terms')} className="text-gray-500 hover:text-white transition-all text-[10px] font-black tracking-widest uppercase">Terms</button>
        </div>
        <p className="text-gray-600 text-[10px] font-black tracking-[0.2em] uppercase">
          © 2026 UNIVERSAL HEADSHOTS • POWERED BY NEURAL STUDIO V2
        </p>
      </footer>
    </div>
  );
}

// --- LANDING VIEW ---
function LandingView({ onStart }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="inline-flex items-center space-x-2 bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full mb-8">
        <Sparkles size={14} className="text-violet-400" />
        <span className="text-violet-400 text-[10px] font-black tracking-widest uppercase">New: Neural Studio Ultra</span>
      </div>

      <h1 className="text-white text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.9] mb-8">
        YOUR STUDIO-QUALITY<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
          GLOBAL IDENTITY
        </span>
      </h1>

      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
        Instant result using our proprietary Neural Studio engine.
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <button 
          onClick={onStart}
          className="premium-button btn-primary w-full md:w-auto h-20 text-2xl !rounded-[32px]"
        >
          GET STARTED <ChevronRight className="ml-2" size={24} />
        </button>
        <button onClick={() => setView('pricing')} className="premium-button btn-gradient w-full md:w-auto h-20 !rounded-[32px]">
          VIEW PRICING
        </button>
      </div>

      {/* Hero Mockup Grid */}
      <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto opacity-40">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="aspect-[4/5] glass-card overflow-hidden">
            <img 
              src={`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80&w=400`} 
              className="w-full h-full object-cover grayscale opacity-50"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// --- AUTH VIEW ---
function AuthView({ onNext }) {
  const [email, setEmail] = useState('');
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="max-w-md mx-auto py-20"
    >
      <div className="glass-card p-10 text-center">
        <h2 className="text-white text-3xl font-black italic mb-2 uppercase tracking-tighter">Member Access</h2>
        <p className="text-gray-500 mb-10 text-sm">Secure login to your Universal Headshots Studio</p>
        
        <div className="space-y-4">
          <button 
            onClick={onNext}
            className="w-full h-14 bg-white text-black rounded-full font-bold flex items-center justify-center space-x-3 hover:bg-gray-100 transition-all"
          >
            <Globe size={20} />
            <span>CONTINUE WITH GOOGLE</span>
          </button>
          
          <button 
            onClick={onNext}
            className="w-full h-14 bg-[#24292e] text-white rounded-full font-bold flex items-center justify-center space-x-3 hover:bg-[#2b3137] transition-all"
          >
            <Users size={20} />
            <span>CONTINUE WITH GITHUB</span>
          </button>
          
          <div className="py-6 flex items-center space-x-4">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-gray-600 text-[10px] font-bold">OR EMAIL</span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>
          
          <input 
            type="email" 
            placeholder="name@company.com" 
            className="w-full h-14 bg-white/5 border border-white/10 rounded-full px-6 text-white focus:outline-none focus:border-violet-500 transition-all font-medium"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <button 
            onClick={onNext}
            className="w-full h-14 bg-violet-600 text-white rounded-full font-black italic tracking-tighter transition-all hover:bg-violet-500 shadow-lg shadow-violet-500/20"
          >
            SEND MAGIC LINK
          </button>
        </div>
        
        <p className="mt-10 text-[10px] text-gray-600 font-bold leading-relaxed px-6">
          BY CONTINUING, YOU AGREE TO OUR <button onClick={() => setView('terms')} className="text-gray-400 hover:text-white">TERMS OF SERVICE</button> AND <button onClick={() => setView('privacy')} className="text-gray-400 hover:text-white">PRIVACY POLICY</button>.
        </p>
      </div>
    </motion.div>
  );
}

// --- UPLOAD VIEW ---
function UploadView({ gender, setGender, country, setCountry, selectedStyle, setSelectedStyle, images, setImages, onNext }) {
  const genderStyles = STYLES[gender] || STYLES.MALE;
  const availableCountries = Object.keys(genderStyles);
  const styles = genderStyles[country] || genderStyles.GLOBAL || [];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-white text-4xl font-black italic tracking-tighter uppercase leading-none mb-4">
            Create Your<br />Portfolio
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Step 1: Reference Photos & Style</p>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="bg-white/5 border border-white/10 p-1 rounded-full flex">
            {['MALE', 'FEMALE', 'NON_BINARY'].map(g => (
              <button 
                key={g}
                onClick={() => {
                  setGender(g);
                  // Reset country if not available in new gender
                  if (!STYLES[g][country]) setCountry('GLOBAL');
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${gender === g ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-gray-500 hover:text-gray-300'}`}
              >{g.replace('_', ' ')}</button>
            ))}
          </div>

          <div className="flex overflow-x-auto pb-2 scrollbar-hide max-w-[300px] md:max-w-md gap-2">
            {availableCountries.map(c => (
              <button
                key={c}
                onClick={() => setCountry(c)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${country === c ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-gray-500 hover:border-white/10'}`}
              >
                {c === 'GLOBAL' ? <Globe size={10} className="inline mr-1" /> : null}
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Dropzone */}
        <div className="glass-card p-8 border-dashed border-white/20 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mb-6">
            <Upload className="text-violet-500" size={32} />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">Import Face Photos</h3>
          <p className="text-gray-500 text-center text-sm mb-8 px-12">Upload 4-8 clear selfies or portraits for the best AI reference.</p>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            style={{ display: 'none' }}
            id="photo-upload"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              if (files.length < 4) {
                alert('Minimum 4 photos required for neural training.');
                return;
              }
              if (files.length > 8) {
                alert('Maximum 8 photos allowed per batch.');
                return;
              }
              setImages(files);
            }}
          />
          <button 
            className="premium-button btn-primary w-full"
            onClick={() => document.getElementById('photo-upload').click()}
          >
            {images.length > 0 ? `${images.length} PHOTOS SELECTED` : 'SELECT PHOTOS'}
          </button>
        </div>

        {/* Styles */}
        <div className="space-y-6">
          <h3 className="text-white font-bold flex items-center space-x-2">
            <Star size={18} className="text-fuchsia-400" />
            <span>SELECT STYLE THEMES</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {styles.map(s => (
              <div 
                key={s.id} 
                onClick={() => setSelectedStyle(s.id)}
                className={`glass-card aspect-square overflow-hidden group cursor-pointer relative border-2 transition-all ${selectedStyle === s.id ? 'border-violet-500 scale-[0.98]' : 'border-transparent'}`}
              >
                <img src={s.preview} className={`w-full h-full object-cover transition-all ${selectedStyle === s.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-white font-black italic text-[10px] tracking-tighter uppercase">{s.name}</span>
                  {selectedStyle === s.id && (
                    <div className="absolute top-3 right-3 bg-violet-500 rounded-full p-1 shadow-lg shadow-violet-500/50">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <button 
          onClick={async () => {
            setLoading(true);
            try {
              const formData = new FormData();
              formData.append('userId', 'USER_WEB_DEV');
              formData.append('gender', gender);
              formData.append('country', country);
              formData.append('tier', 'PRO');
              
              images.forEach((file, i) => formData.append('photos', file));

              const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/generate`, {
                method: 'POST',
                body: formData
              });
              const data = await res.json();
              setBatchId(data.batchId);
              onNext();
            } catch (err) {
              console.error(err);
              setBatchId(`BATCH_${Date.now()}`); // Fallback for dev
              onNext();
            } finally {
              setLoading(false);
            }
          }}
          className="premium-button btn-gradient w-64 h-20 text-xl"
        >
          GENERATE NOW
        </button>
      </div>
    </motion.div>
  );
}

// --- PROCESSING VIEW ---
function ProcessingView({ onComplete, progress }) {
  const [localProg, setLocalProg] = useState(0);

  // Fallback local animation if no backend progress
  useEffect(() => {
    if (progress === 0) {
      const timer = setInterval(() => {
        setLocalProg(p => (p >= 99 ? 99 : p + 1));
      }, 500);
      return () => clearInterval(timer);
    }
  }, [progress]);

  const displayProg = progress > 0 ? progress : localProg;

  useEffect(() => {
    if (displayProg >= 100) onComplete();
  }, [displayProg]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-xl mx-auto text-center py-20"
    >
      <div className="relative w-48 h-48 mx-auto mb-12">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" strokeWidth="8" 
            strokeDasharray={283} strokeDashoffset={283 - (283 * displayProg) / 100}
            strokeLinecap="round" className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-4xl font-black italic tracking-tighter">{displayProg}%</span>
        </div>
      </div>
      
      <h2 className="text-white text-3xl font-black italic mb-4 uppercase tracking-tighter">Neural Studio Engine</h2>
      <p className="text-gray-500 text-lg px-20">Our proprietary AI is generating 100+ professional variations based on your identity.</p>
      
      <div className="mt-12 inline-flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Tracking Progress</span>
      </div>
    </motion.div>
  );
}

// --- GALLERY VIEW ---
function GalleryView({ 
  batchId, images, setImages, selectedImages, setSelectedImages, 
  refineCredits, setRefineCredits, refinePrompt, setRefinePrompt 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [refineModal, setRefineModal] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeRefinements, setActiveRefinements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#d946ef', '#ffffff']
    });
    // Simulate image loading
    setTimeout(() => setIsLoaded(true), 1500);
  }, []);

  const toggleSelect = (id) => {
    if (selectedImages.includes(id)) {
      setSelectedImages(selectedImages.filter(i => i !== id));
    } else {
      setSelectedImages([...selectedImages, id]);
    }
  };
  // Poll for active refinements
  useEffect(() => {
    if (activeRefinements.length === 0) return;

    const interval = setInterval(async () => {
      for (const refineId of activeRefinements) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/refinement-status/${refineId}`);
          const data = await res.json();
          
          if (data.status === 'COMPLETED') {
            // Add new variations to gallery
            setImages(prev => [...prev, ...data.outputUrls]);
            // Remove from active tracking
            setActiveRefinements(prev => prev.filter(id => id !== refineId));
          }
        } catch (e) {
          console.error('Polling Error:', e);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeRefinements]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My AI Headshots',
          text: `Check out my new AI-generated headshots from Universal Headshots!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share Error:', err);
      }
    } else {
      alert('Sharing is not supported on this browser. Try on mobile!');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-white/5 pb-8">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <h2 className="text-white text-5xl font-black italic tracking-tighter uppercase mb-2">Success!</h2>
          <div className="flex items-center space-x-3 justify-center md:justify-start">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Your Professional Portfolio is Ready</p>
            {refineCredits > 0 && (
              <div className="bg-violet-500/20 border border-violet-500/30 px-3 py-1 rounded-full flex items-center space-x-2">
                <Zap size={10} className="text-violet-400" />
                <span className="text-violet-400 text-[10px] font-black italic tracking-tighter">{refineCredits} REFINE CREDITS</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {refineCredits === 0 && isLoaded && (
            <button 
              onClick={() => setShowPaywall(true)}
              className="premium-button btn-gradient space-x-2 px-8 border-none ring-2 ring-violet-500/50 shadow-xl shadow-violet-500/20 animate-bounce-slow"
            >
              <Sparkles size={18} />
              <span>GET REFINE PACK</span>
            </button>
          )}
          {selectedImages.length > 0 && (
            <button 
              onClick={handleShare}
              className="premium-button btn-gradient space-x-2 px-8"
            >
              <Share2 size={18} />
              <span>SHARE ({selectedImages.length})</span>
            </button>
          )}
          <a 
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/download-zip?userId=USER_123&batchId=${batchId}`}
            className="premium-button btn-primary space-x-2 px-10"
          >
            <Download size={20} />
            <span>DOWNLOAD ZIP</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(15)].map((_, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => toggleSelect(i)}
            className={`glass-card aspect-[3/4] group relative overflow-hidden cursor-pointer transition-all ${
              selectedImages.includes(i) ? 'ring-4 ring-violet-500 scale-[0.98]' : ''
            }`}
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
            
            {/* Selection Badge */}
            <div className={`absolute top-4 right-4 z-30 w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center transition-all ${
              selectedImages.includes(i) ? 'bg-violet-500 border-violet-500' : 'bg-black/20'
            }`}>
              {selectedImages.includes(i) && <CheckCircle2 size={14} color="white" />}
            </div>

            {/* Refinement Shortcut (Visible after load) */}
            {isLoaded && (
              <div className="absolute bottom-4 left-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setRefineModal(i);
                  }}
                  className="w-full h-10 bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-[10px] font-black italic tracking-tighter text-white hover:bg-white/30"
                >
                  REFINE ($5)
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Refinement Modal */}
      <AnimatePresence>
        {refineModal !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRefineModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-10 bg-[#0A0A0F]"
            >
              <h3 className="text-white text-3xl font-black italic uppercase mb-2">Image Refine</h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Generates 4 New Variations</p>
              
              <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-2xl mb-6">
                <p className="text-violet-400 text-[10px] font-bold tracking-widest uppercase mb-2">Includes:</p>
                <div className="space-y-1">
                  <p className="text-white text-xs flex items-center"><CheckCircle2 size={12} className="mr-2 text-green-500" /> 2x Custom Prompt Refinements</p>
                  <p className="text-white text-xs flex items-center"><CheckCircle2 size={12} className="mr-2 text-green-500" /> 2x AI Suggested Enhancements</p>
                </div>
              </div>

              <textarea 
                placeholder="What should we change? (e.g., 'Make my hair tidier', 'Office background')"
                className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 mb-6 font-medium text-sm"
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
              />
              
              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/refine`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        userId: 'USER_123', 
                        imagePath: `IMG_${refineModal}`, 
                        prompt: refinePrompt 
                      })
                    });
                    const data = await res.json();
                    if (data.error && data.requiresUpgrade) {
                      setRefineModal(null);
                      setShowPaywall(true);
                    } else {
                      setRefineCredits(c => c - 1);
                      setRefineModal(null);
                      setRefinePrompt('');
                      if (data.refinementId) {
                        setActiveRefinements(prev => [...prev, data.refinementId]);
                      }
                      alert('Refinement Started: 4 variations will appear shortly.');
                    }
                  } catch (e) {
                    console.error('Refinement Trigger Error:', e);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="premium-button btn-gradient w-full h-16 text-lg"
              >
                {loading ? 'PROCESSING...' : 'START REFINEMENT (1 Credit)'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Refinement Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaywall(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 50 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card p-8 md:p-12"
            >
              <div className="text-center mb-10">
                <h2 className="text-white text-5xl font-black italic uppercase tracking-tighter mb-4">Refinement Packs</h2>
                <p className="text-gray-400 max-w-xl mx-auto">Take your headshots to the next level. Each credit generates 4 premium variations of your chosen photo.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { price: '$5', name: 'BONUS BASIC', desc: '2 Refinements', sub: '8 New Images Total', credits: 2, icon: Zap },
                  { price: '$12', name: 'BONUS STARTER', desc: '5 Refinements', sub: '20 New Images Total', credits: 5, icon: Star, best: true },
                  { price: '$18', name: 'BONUS PRO', desc: '10 Refinements', sub: '40 New Images Total', credits: 10, icon: Trophy },
                ].map((pack, i) => (
                  <div key={i} className={`glass-card p-8 flex flex-col items-center text-center relative ${pack.best ? 'ring-2 ring-violet-500 bg-violet-500/5' : ''}`}>
                    {pack.best && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-600 px-4 py-1 rounded-full text-[10px] font-black italic tracking-widest text-white">BEST VALUE</div>
                    )}
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                      <pack.icon className="text-violet-400" size={24} />
                    </div>
                    <span className="text-white text-5xl font-black italic mb-2 tracking-tighter">{pack.price}</span>
                    <h3 className="text-violet-400 font-black italic tracking-widest text-xs mb-4">{pack.name} PACK</h3>
                    <div className="space-y-1 mb-8">
                      <p className="text-white font-bold">{pack.desc}</p>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{pack.sub}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setRefineCredits(pack.credits);
                        setShowPaywall(false);
                      }}
                      className={`w-full h-12 rounded-xl font-black italic tracking-tighter transition-all ${pack.best ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/30' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                    >
                      PURCHASE
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowPaywall(false)}
                className="mt-10 text-gray-600 text-[10px] font-black tracking-widest uppercase hover:text-gray-400 transition-all mx-auto block"
              >
                NO THANKS, I'M HAPPY WITH THESE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- SUPPORT VIEW ---
function SupportView({ onBack }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        alert(data.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Support Error:', err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto py-12"
    >
      <div className="glass-card p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <button onClick={onBack} className="text-gray-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">CLOSE</button>
        </div>
        
        {sent ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h2 className="text-white text-3xl font-black italic uppercase mb-4 tracking-tighter">Message Sent</h2>
            <p className="text-gray-400 mb-8">Our support team will get back to you at {formData.email} as soon as possible.</p>
            <button onClick={onBack} className="premium-button btn-primary px-12">BACK TO HOME</button>
          </div>
        ) : (
          <>
            <h2 className="text-white text-4xl font-black italic uppercase mb-2 tracking-tighter">Help Center</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-8">Direct support for our premium members</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" required placeholder="Your Name" 
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-violet-500"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  type="email" required placeholder="Email Address" 
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-violet-500"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <input 
                type="text" placeholder="Subject (Optional)" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-violet-500"
                value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
              />
              <textarea 
                required placeholder="How can we help you?" 
                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-violet-500"
                value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
              />
              <button 
                type="submit" disabled={loading}
                className="premium-button btn-gradient w-full h-16 text-xl"
              >
                {loading ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}

// --- LEGAL VIEWS ---
function PrivacyView({ onBack }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto py-20 text-gray-400 prose prose-invert">
       <button onClick={onBack} className="mb-12 text-xs font-bold uppercase tracking-widest text-violet-500">← BACK</button>
       <h1 className="text-white font-black italic text-5xl tracking-tighter uppercase mb-12">Privacy Policy</h1>
       <p className="font-bold text-white mb-8">Effective Date: March 18, 2026</p>
       <div className="space-y-8 text-sm leading-relaxed">
         <section>
           <h2 className="text-white font-black uppercase text-xl tracking-wide mb-4">1. Information We Collect</h2>
           <p>We collect face photos you upload for the sole purpose of generating AI headshots using our proprietary Neural Studio engine. We also collect authentication data (Google/Github) and payment transaction metadata.</p>
         </section>
         <section>
           <h2 className="text-white font-black uppercase text-xl tracking-wide mb-4">2. Data Security</h2>
           <p>Your photos are processed in secure Google Cloud environments and are automatically purged from our temporary processing storage within 24 hours of successful generation.</p>
         </section>
          <section>
            <h2 className="text-white font-black uppercase text-xl tracking-wide mb-4">3. Third Party Services</h2>
            <p>We use Firebase for authentication, Neural Studio for image generation, and RevenueCat for payment management. These partners maintain their own strict privacy standards.</p>
          </section>
          <section>
            <h2 className="text-white font-black uppercase text-xl tracking-wide mb-4">4. Your Data Rights</h2>
            <p>Under GDPR and CCPA, you have the right to access, correct, or delete your personal data. You can request account and data deletion at any time through the support portal or by emailing support@universalheadshots.com.</p>
          </section>
          <section>
            <h2 className="text-white font-black uppercase text-xl tracking-wide mb-4">5. Children's Privacy</h2>
            <p>We do not knowingly collect or solicit personal information from anyone under the age of 13. If you are under 13, please do not use this service.</p>
          </section>
        </div>
    </motion.div>
  );
}

function TermsView({ onBack }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto py-20 text-gray-400 prose prose-invert">
       <button onClick={onBack} className="mb-12 text-xs font-bold uppercase tracking-widest text-violet-500">← BACK</button>
       <h1 className="text-white font-black italic text-5xl tracking-tighter uppercase mb-12">Terms of Service</h1>
       <p className="font-bold text-white mb-8">Effective Date: March 18, 2026</p>
       <div className="space-y-8 text-sm leading-relaxed">
         <section>
           <h2 className="text-white font-black uppercase text-xl tracking-wide mb-4">1. Use of Service</h2>
           <p>Universal Headshots provides AI-generated image services. You must have the legal right to all photos uploaded for processing. Use of the service for deepfakes or non-consensual imagery is strictly prohibited.</p>
         </section>
          <section>
            <h2 className="text-white font-black uppercase text-xl tracking-wide mb-4">2. Payments & Credits</h2>
            <p>All sales are final. Refinement credits have no cash value and are tied to your user account. We reserve the right to modify pricing tiers with prior notice.</p>
          </section>
          <section>
            <h2 className="text-white font-black uppercase text-xl tracking-wide mb-4">3. Prohibited Conduct</h2>
            <p>Users may not use the Service to generate deepfakes, adult content, or imagery that violates the rights of any individual. Violation of these terms will result in immediate account termination without refund.</p>
          </section>
          <section>
            <h2 className="text-white font-black uppercase text-xl tracking-wide mb-4">4. Limitation of Liability</h2>
            <p>Universal Headshots and its parent Neural Studio V2 shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service.</p>
          </section>
        </div>
    </motion.div>
  );
}

// --- PRICING VIEW ---
function PricingView({ onBack, onSubscribe }) {
  const plans = [
    {
      name: 'FREE',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out the service',
      features: [
        '2 AI Headshots',
        'Standard quality (fast)',
        '1 Style',
        'Watermark on images',
        '24-hour gallery access'
      ],
      cta: 'GET STARTED',
      popular: false
    },
    {
      name: 'STARTER',
      price: '$9.99',
      period: 'per batch',
      description: 'Great for LinkedIn & resumes',
      features: [
        '20 AI Headshots',
        'Ultra quality (4K)',
        '5 Styles',
        'No watermark',
        'Unlimited gallery access',
        'Priority processing'
      ],
      cta: 'GET STARTER',
      popular: false
    },
    {
      name: 'PRO',
      price: '$19.99',
      period: 'per batch',
      description: 'Best for professionals',
      features: [
        '50 AI Headshots',
        'Ultra quality (4K)',
        'Unlimited Styles',
        'No watermark',
        'Unlimited gallery access',
        'Fastest processing',
        'Bonus pack upsell after generation'
      ],
      cta: 'GO PRO',
      popular: true
    }
  ];

  const bonusPacks = [
    {
      name: 'SMALL',
      price: '$7',
      description: 'Edit 2 images → Get 8 headshots',
      features: ['2 Original edits', '8 AI-generated variants', 'Perfect for trying edits']
    },
    {
      name: 'MEDIUM',
      price: '$12',
      description: 'Edit 5 images → Get 20 headshots',
      features: ['5 Original edits', '20 AI-generated variants', 'Great value']
    },
    {
      name: 'LARGE',
      price: '$18',
      description: 'Edit 10 images → Get 40 headshots',
      features: ['10 Original edits', '40 AI-generated variants', 'Maximum variety']
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto py-20">
      <button onClick={onBack} className="mb-12 text-xs font-bold uppercase tracking-widest text-violet-500">← BACK</button>
      
      <div className="text-center mb-16">
        <h1 className="text-white text-5xl md:text-6xl font-black italic tracking-tighter mb-6">
          CHOOSE YOUR <span className="text-violet-500">PLAN</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Transform your professional identity with AI-generated headshots. 
          Start free or go pro for unlimited access.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div 
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative glass-card p-8 ${plan.popular ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-white/10'}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs font-black px-4 py-1 rounded-full">
                MOST POPULAR
              </div>
            )}
            
            <div className="text-center mb-8">
              <h3 className="text-white font-black text-2xl uppercase tracking-wider mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-white font-black text-5xl italic">{plan.price}</span>
                <span className="text-gray-500 text-sm">/{plan.period}</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                  <CheckCircle2 size={18} className="text-violet-500 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={onSubscribe}
              className={`w-full h-14 rounded-full font-black tracking-wider transition-all ${
                plan.popular 
                  ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20' 
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
              }`}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Bonus Packs Section - Show after generation for Starter/Pro users */}
      <div className="mt-24">
        <div className="text-center mb-12">
          <h2 className="text-white text-3xl font-black italic tracking-tighter mb-4">
            🎁 <span className="text-violet-500">BONUS PACKS</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Love your headshots? Upgrade with bonus packs to edit your favorites and generate more variations!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {bonusPacks.map((pack, index) => (
            <motion.div 
              key={pack.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass-card p-6 border-violet-500/30"
            >
              <div className="text-center mb-4">
                <h3 className="text-violet-400 font-black text-lg uppercase">{pack.name} PACK</h3>
                <div className="flex items-baseline justify-center gap-1 mt-2">
                  <span className="text-white font-black text-4xl italic">{pack.price}</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">{pack.description}</p>
              </div>
              <ul className="space-y-2 mb-6">
                {pack.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-xs">
                    <Sparkles size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full h-12 bg-violet-600/20 border border-violet-500/50 text-violet-400 rounded-full font-bold text-sm hover:bg-violet-600/30 transition-all">
                ADD TO ORDER
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-center mt-16">
        <p className="text-gray-500 text-sm">
          All plans include our satisfaction guarantee. Questions? <button className="text-violet-500 hover:underline">Contact support</button>
        </p>
      </div>
    </motion.div>
  );
}
