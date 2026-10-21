'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, Smartphone, Share2, PlusSquare, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('PWA Service Worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.warn('PWA Service Worker registration failed:', err);
        });
    }

    // 2. Check if already running in standalone mode (installed app)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };
    checkStandalone();

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // 4. Check if previously dismissed in this session
    const dismissed = sessionStorage.getItem('kb_pwa_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    // 5. Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome / Edge / Android native prompt
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS doesn't support beforeinstallprompt, show guided steps
      setShowIOSGuide(true);
    } else {
      // Fallback hint for other browsers
      alert('Untuk menginstall, klik ikon install (⊕) di bilah alamat browser Anda.');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('kb_pwa_dismissed', 'true');
  };

  // Do not show if already installed as standalone app or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      <div className="relative z-30 w-full bg-gradient-to-r from-red-950/80 via-[#15151e] to-[#0f0f15] border-b border-red-500/25 px-3 sm:px-6 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Left: App icon & description */}
          <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
            <div className="relative w-8 h-8 rounded-lg bg-[#1a1a24] border border-red-500/30 p-0.5 flex-shrink-0 shadow">
              <Image
                src="/logo-ax.png"
                alt="Logo Kas Badminton"
                width={32}
                height={32}
                className="w-full h-full object-contain rounded"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-white truncate">
                  Install Aplikasi Kas Badminton
                </span>
                <span className="hidden xs:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                  <Sparkles className="w-2.5 h-2.5 text-red-400" />
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 truncate">
                Pasang di layar utama HP / Laptop untuk akses cepat & lancar!
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold transition-all shadow-md shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Install Sekarang</span>
            </button>

            <button
              onClick={handleDismiss}
              title="Tutup informasi install"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Modal Petunjuk Install Khusus iOS Safari */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#121217] border border-[#2a2a38] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Cara Pasang di iPhone/iPad</h4>
                  <p className="text-[11px] text-zinc-400">Gunakan browser Safari</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0a0a0f] border border-zinc-800">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[10px] shrink-0">
                  1
                </span>
                <p>
                  Ketuk tombol <strong className="text-white">Share</strong> (
                  <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" />
                  ) di bilah bawah Safari Anda.
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0a0a0f] border border-zinc-800">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[10px] shrink-0">
                  2
                </span>
                <p>
                  Gulir ke bawah dan pilih menu <strong className="text-white">"Tambah ke Layar Utama"</strong> (
                  <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-400" />
                  Add to Home Screen).
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0a0a0f] border border-zinc-800">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[10px] shrink-0">
                  3
                </span>
                <p>
                  Ketuk <strong className="text-white">"Tambah"</strong> di pojok kanan atas. Ikon aplikasi akan langsung muncul di menu HP Anda! 🏸
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
