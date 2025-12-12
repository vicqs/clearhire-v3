/**
 * Hook for haptic feedback on mobile devices
 * Provides tactile feedback for user interactions
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHapticFeedback() {
  const triggerHaptic = (style: HapticStyle = 'light') => {
    // Check if running in a mobile environment with haptic support
    if ('vibrate' in navigator) {
      switch (style) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(30);
          break;
        case 'success':
          navigator.vibrate([10, 50, 10]);
          break;
        case 'warning':
          navigator.vibrate([20, 100, 20]);
          break;
        case 'error':
          navigator.vibrate([30, 100, 30, 100, 30]);
          break;
      }
    }

    // For iOS devices with Haptic Engine (via Capacitor or similar)
    if ('HapticFeedback' in window) {
      try {
        const haptic = (window as any).HapticFeedback;
        switch (style) {
          case 'light':
            haptic.impact({ style: 'light' });
            break;
          case 'medium':
            haptic.impact({ style: 'medium' });
            break;
          case 'heavy':
            haptic.impact({ style: 'heavy' });
            break;
          case 'success':
            haptic.notification({ type: 'success' });
            break;
          case 'warning':
            haptic.notification({ type: 'warning' });
            break;
          case 'error':
            haptic.notification({ type: 'error' });
            break;
        }
      } catch (e) {
        // Silently fail if haptic is not available
      }
    }
  };

  return { triggerHaptic };
}
