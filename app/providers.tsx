"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

const loadedFlag = posthog as typeof posthog & { __loaded?: boolean };

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || !host) return;
    if (loadedFlag.__loaded) return;
    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      autocapture: true
    });
    loadedFlag.__loaded = true;
  }, []);

  return <>{children}</>;
}
