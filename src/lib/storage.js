/**
 * Storage Durability and Persistence Helper
 * 
 * Manages navigator.storage.persist(), iOS Safari standalone detection,
 * and backup validity checking.
 */

/**
 * Requests persistent storage from the browser.
 * Safe for all environments; handles denied or unsupported silently.
 */
export async function requestStoragePersistence() {
  if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.persist === 'function') {
    try {
      const isAlreadyPersisted = navigator.storage.persisted
        ? await navigator.storage.persisted()
        : false;

      if (isAlreadyPersisted) {
        console.log('[Storage Persistence] Storage is already persisted.');
        return true;
      }

      const granted = await navigator.storage.persist();
      console.log(`[Storage Persistence] navigator.storage.persist() result: ${granted ? 'GRANTED' : 'DENIED'}`);
      return granted;
    } catch (err) {
      console.log('[Storage Persistence] Error requesting storage persistence:', err?.message || err);
      return false;
    }
  }

  console.log('[Storage Persistence] navigator.storage.persist is unsupported in this environment.');
  return false;
}

/**
 * Detects whether the user is on iOS Safari in non-standalone (browser tab) mode.
 */
export function isIOSSafariNonStandalone() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) return false;

  const ua = window.navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isWebKit = /WebKit/i.test(ua);
  const isOtherIOSBrowser = /CriOS|FxiOS|OPiOS|mercury|EdgiOS/i.test(ua);

  return isIOS && isWebKit && !isOtherIOSBrowser;
}
