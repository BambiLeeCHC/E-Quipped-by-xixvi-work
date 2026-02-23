import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Opens the Manus OAuth flow in a centered popup window.
 * Polls `trpc.auth.me` every 800ms while the popup is open.
 * When the session appears (login succeeded) or the popup closes,
 * the polling stops and `onSuccess` fires if the user is now authenticated.
 */
export function useLoginPopup(onSuccess?: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const utils = trpc.useUtils();

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setIsOpen(false);
  }, []);

  const openPopup = useCallback(() => {
    const url = getLoginUrl();
    const width = 520;
    const height = 640;
    const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

    const popup = window.open(
      url,
      "e-quipped-login",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    if (!popup) {
      // Popup blocked — fall back to same-tab navigation
      window.location.href = url;
      return;
    }

    popupRef.current = popup;
    setIsOpen(true);

    // Poll every 800ms: check if popup closed or session appeared
    pollRef.current = setInterval(async () => {
      const closed = !popupRef.current || popupRef.current.closed;

      if (closed) {
        stopPolling();
        // Refresh auth state after popup closes
        await utils.auth.me.invalidate();
        const me = await utils.auth.me.fetch();
        if (me) onSuccess?.();
        return;
      }

      // Also check session proactively while popup is still open
      try {
        const me = await utils.auth.me.fetch();
        if (me) {
          popupRef.current?.close();
          stopPolling();
          onSuccess?.();
        }
      } catch {
        // Not authenticated yet — keep polling
      }
    }, 800);
  }, [onSuccess, stopPolling, utils.auth.me]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return { openPopup, isOpen };
}
