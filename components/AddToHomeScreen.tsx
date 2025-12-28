'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './AddToHomeScreen.module.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

const Step = ({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) => (
  <div className={styles.step}>
    <div className={styles.stepNumber}>{number}</div>
    <div className={styles.stepText}>{children}</div>
  </div>
);

const Chip = ({
  icon,
  label,
}: {
  icon?: React.ReactNode;
  label: string;
}) => (
  <span className={styles.chip}>
    {icon}
    {label}
  </span>
);


export default function AddToHomeScreen() {
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstallNatively, setCanInstallNatively] = useState(false);

  // Detect platform and standalone mode
  useEffect(() => {
    const detectPlatform = (): Platform => {
      const ua = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /android/.test(ua);

      if (isIOS) return 'ios';
      if (isAndroid) return 'android';
      return 'desktop';
    };

    const checkStandalone = (): boolean => {
      // Check if running as installed PWA
      if (window.matchMedia('(display-mode: standalone)').matches) return true;
      if (window.matchMedia('(display-mode: fullscreen)').matches) return true;
      if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) return true;
      return false;
    };

    setPlatform(detectPlatform());
    setIsStandalone(checkStandalone());
  }, []);

  // Listen for beforeinstallprompt event (Android/Chrome)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstallNatively(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleClick = useCallback(async () => {
    // If already installed, do nothing
    if (isStandalone) return;

    // Try native install prompt (Android/Chrome)
    if (canInstallNatively && deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setCanInstallNatively(false);
        }
        return;
      } catch {
        // Fall through to show modal
      }
    }

    // Show instruction modal for iOS or when native prompt isn't available
    setShowModal(true);
  }, [isStandalone, canInstallNatively, deferredPrompt]);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {platform !== 'desktop' && (
        <button className={styles.ctaButton} onClick={handleClick}>
          <svg
            className={styles.ctaIcon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7-7 7 7" />
            <rect x="3" y="19" width="18" height="2" rx="1" />
          </svg>
          Add to Home Screen
        </button>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.appIconWrapper}>
                <img src="/app-icon.png" alt="App Icon" className={styles.appIcon} />
              </div>
              {/* <h3 className={styles.modalTitle}>Ooredoo Calendar</h3> */}
              <p className={styles.modalSubtitle}>Add to your home screen for quick access</p>
            </div>

            {platform === 'ios' && (
              <div className={styles.instructions}>

                <Step number={1}>
                  Tap <Chip label="⋯" /> in the toolbar.
                </Step>

                <Step number={2}>
                  Tap{' '}
                  <Chip
                    icon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 3v12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8 7l4-4 4 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <rect
                          x="5"
                          y="11"
                          width="14"
                          height="10"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    }
                    label="Share"
                  />{' '}
                  in the menu.
                </Step>

                <Step number={3}>
                  Tap <Chip icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
                    </svg>

                  } label="More" />.
                </Step>

                <Step number={4}>
                  Select <Chip icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 8v8M8 12h8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  } label="Add to Home Screen" /> from the menu.
                </Step>

                <p className={styles.helperText}>
                  An icon will be added to your home screen so you can quickly access this
                  website.
                </p>
              </div>
            )}

            {platform === 'android' && (
              <div className={styles.instructions}>

                <Step number={1}>
                  Tap <Chip label="⋮" /> in Chrome.
                </Step>

                <Step number={2}>
                  Tap <Chip icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  } label="Add to Home screen" />.
                </Step>

                <Step number={3}>
                  Tap <Chip label="Add" /> to confirm.
                </Step>

                <p className={styles.helperText}>
                  The app will appear on your home screen.
                </p>
              </div>
            )}

            {platform === 'desktop' && (
              <div className={styles.instructions}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <p>Look for the <strong>Install</strong> icon in the address bar</p>
                    <div className={styles.iconDemo}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span className={styles.iconLabel}>Install icon (right side of address bar)</span>
                    </div>
                  </div>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <p>Or click the <strong>menu button</strong> (⋮) and select <strong>&quot;Install app&quot;</strong></p>
                  </div>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <p>Click <strong>&quot;Install&quot;</strong> to confirm</p>
                  </div>
                </div>
              </div>
            )}

            {/* <div className={styles.modalFooter}>
              <button className={styles.gotItButton} onClick={closeModal}>
                Got it!
              </button>
            </div> */}
          </div>
        </div>
      )}
    </>
  );
}

