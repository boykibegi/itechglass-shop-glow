import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_MS = 2 * 60 * 1000;  // Show warning 2 min before timeout

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;

export function useSessionTimeout() {
  const { user, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const warningRef = useRef<ReturnType<typeof setTimeout>>();
  const countdownRef = useRef<ReturnType<typeof setInterval>>();
  const deadlineRef = useRef<number>(0);

  const clearAllTimers = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const handleLogout = useCallback(async () => {
    clearAllTimers();
    setShowWarning(false);
    await signOut();
  }, [signOut, clearAllTimers]);

  const resetTimers = useCallback(() => {
    if (!user) return;
    clearAllTimers();
    setShowWarning(false);

    const now = Date.now();
    deadlineRef.current = now + TIMEOUT_MS;

    // Warning fires 2 min before deadline
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(Math.ceil(WARNING_MS / 1000));
      countdownRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
        setSecondsLeft(remaining);
        if (remaining <= 0) clearInterval(countdownRef.current);
      }, 1000);
    }, TIMEOUT_MS - WARNING_MS);

    // Actual logout
    timeoutRef.current = setTimeout(handleLogout, TIMEOUT_MS);
  }, [user, clearAllTimers, handleLogout]);

  const stayLoggedIn = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    if (!user) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    resetTimers();

    const onActivity = () => {
      if (!showWarning) resetTimers();
    };

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => {
      clearAllTimers();
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [user, showWarning, resetTimers, clearAllTimers]);

  return { showWarning, secondsLeft, stayLoggedIn, handleLogout };
}
