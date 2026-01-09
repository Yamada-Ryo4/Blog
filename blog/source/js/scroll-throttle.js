/* Scroll Handler Optimization - Throttle rapid updates */

(function() {
  // Save original scroll handler if it exists
  const scrollHandlers = [];
  let lastScrollTime = 0;
  const SCROLL_THROTTLE_MS = 16; // ~60fps

  // Throttle scroll events to reduce DOM thrashing
  const throttledScrollListener = function() {
    const now = Date.now();
    if (now - lastScrollTime >= SCROLL_THROTTLE_MS) {
      lastScrollTime = now;
      
      // Trigger all scroll handlers
      scrollHandlers.forEach(handler => {
        try {
          handler();
        } catch (e) {
          console.error('Scroll handler error:', e);
        }
      });
    }
  };

  // Intercept window scroll listener to apply throttling
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    if (type === 'scroll') {
      scrollHandlers.push(listener);
      // Only add throttled listener once
      if (scrollHandlers.length === 1) {
        return originalAddEventListener.call(this, type, throttledScrollListener, { passive: true, ...options });
      }
      return;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  // Also hook document scroll listeners
  const originalDocumentAddEventListener = document.addEventListener;
  document.addEventListener = function(type, listener, options) {
    if (type === 'scroll') {
      scrollHandlers.push(listener);
      if (scrollHandlers.length === 1) {
        return originalDocumentAddEventListener.call(this, type, throttledScrollListener, { passive: true, ...options });
      }
      return;
    }
    return originalDocumentAddEventListener.call(this, type, listener, options);
  };
})();
