'use client';

import { useState, useEffect } from 'react';

export default function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker and listen for updates
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('[App] ServiceWorker registered');

        // Check for waiting worker on initial load
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdate(true);
        }

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[App] New service worker installing...');

          newWorker?.addEventListener('statechange', () => {
            // When new worker is installed and waiting
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[App] New version available!');
              setWaitingWorker(newWorker);
              setShowUpdate(true);
            }
          });
        });
      });

      // Listen for controller change (when new SW takes over)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      // Check for updates every 5 minutes
      const interval = setInterval(() => {
        navigator.serviceWorker.getRegistration().then((registration) => {
          registration?.update();
        });
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell waiting worker to skip waiting and become active
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-semibold">Update Tersedia!</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Versi baru Nutrify tersedia dengan fitur dan perbaikan terbaru. 
            Update sekarang untuk pengalaman terbaik!
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Update Sekarang
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Nanti
            </button>
          </div>
        </div>

        {/* Decorative element */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
      </div>
    </div>
  );
}
