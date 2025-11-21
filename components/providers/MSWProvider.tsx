'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    async function initMSW() {
      if (process.env.NODE_ENV === 'development') {
        const { worker } = await import('@/mocks/browser');
        await worker.start({
          onUnhandledRequest: 'warn', // Warn about unhandled requests for debugging
        });
        console.log('[MSW] Mocking enabled.');
        console.log('[MSW] Registered handlers:', worker.listHandlers());
        setMswReady(true);
      } else {
        setMswReady(true);
      }
    }

    initMSW();
  }, []);

  if (!mswReady) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
