/**
 * Opening the right app on the user's device.
 *
 * Design constraint, stated plainly: custom URL schemes (bookmyshow://, …)
 * cannot be verified from this build environment, and a scheme that is wrong
 * or belongs to an app the user has not installed fails *silently* — the
 * browser simply does nothing, which looks like a broken button.
 *
 * So no navigation is ever committed to a scheme alone. Every attempt is a
 * race: fire the scheme, and if the page is still visible shortly after, fall
 * back to the https URL. On a device with the app installed the browser
 * backgrounds the page and the fallback is cancelled. On every other device
 * the user lands on the website. Either way something opens.
 *
 * https URLs are the only thing promised. The scheme is an optimisation.
 */

export type DevicePlatform = "ios" | "android" | "desktop";

export function detectPlatform(): DevicePlatform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

export function isMobile(): boolean {
  return detectPlatform() !== "desktop";
}

interface AppTarget {
  /** Human name of the app. */
  app: string;
  /** Custom scheme base, if the app publishes one. Unverified — see module note. */
  scheme?: string;
  /** Android package id, used to build an intent:// URL. */
  androidPackage?: string;
  /** Store pages, for the "don't have the app" case. */
  iosStore?: string;
  androidStore?: string;
}

/**
 * Known Indian ticketing apps. Schemes are best-effort; the fallback is what
 * actually guarantees the button works.
 */
const APP_TARGETS: Record<string, AppTarget> = {
  bookmyshow: {
    app: "BookMyShow",
    scheme: "bookmyshow://",
    androidPackage: "com.bt.bms",
    iosStore: "https://apps.apple.com/in/app/bookmyshow/id699493809",
    androidStore: "https://play.google.com/store/apps/details?id=com.bt.bms",
  },
  district: {
    app: "District",
    scheme: "district://",
    androidPackage: "com.district.consumer",
    iosStore: "https://apps.apple.com/in/app/district-by-zomato/id6578931896",
    androidStore: "https://play.google.com/store/apps/details?id=com.district.consumer",
  },
  insider: {
    app: "Paytm Insider",
    androidPackage: "in.insider",
    androidStore: "https://play.google.com/store/apps/details?id=in.insider",
  },
  meetup: {
    app: "Meetup",
    scheme: "meetup://",
    androidPackage: "com.meetup",
    iosStore: "https://apps.apple.com/app/meetup/id375990038",
    androidStore: "https://play.google.com/store/apps/details?id=com.meetup",
  },
  eventbrite: {
    app: "Eventbrite",
    androidPackage: "com.eventbrite.attendee",
    androidStore: "https://play.google.com/store/apps/details?id=com.eventbrite.attendee",
  },
};

/** Identify which app, if any, corresponds to a destination URL or platform name. */
export function appTargetFor(hint: string): { key: string; target: AppTarget } | null {
  const h = hint.toLowerCase();
  for (const [key, target] of Object.entries(APP_TARGETS)) {
    if (h.includes(key) || h.includes(target.app.toLowerCase())) {
      return { key, target };
    }
  }
  return null;
}

/** The store page for an app on the current device, if known. */
export function storeUrlFor(hint: string): string | null {
  const found = appTargetFor(hint);
  if (!found) return null;
  const platform = detectPlatform();
  if (platform === "ios") return found.target.iosStore ?? null;
  if (platform === "android") return found.target.androidStore ?? null;
  return null;
}

/**
 * Open `webUrl`, preferring the native app when one is plausibly installed.
 *
 * Returns the name of the app we attempted, or null if we went straight to the
 * web — useful for telling the user what just happened.
 */
export function openBestTarget(webUrl: string, hint = ""): string | null {
  if (typeof window === "undefined") return null;

  const platform = detectPlatform();
  const found = appTargetFor(`${hint} ${webUrl}`);

  // Desktop browsers have no app to hand off to.
  if (platform === "desktop" || !found) {
    window.open(webUrl, "_blank", "noopener,noreferrer");
    return null;
  }

  const { target } = found;

  // On Android an intent:// URL carries its own fallback, so the OS handles
  // the "app not installed" case for us. That is strictly more reliable than
  // racing a timer, so prefer it when we know the package id.
  if (platform === "android" && target.androidPackage) {
    const intent = buildAndroidIntent(webUrl, target.androidPackage);
    if (intent) {
      window.location.href = intent;
      return target.app;
    }
  }

  if (!target.scheme) {
    window.open(webUrl, "_blank", "noopener,noreferrer");
    return null;
  }

  raceSchemeAgainstWeb(target.scheme, webUrl);
  return target.app;
}

/**
 * Build an Android intent:// URL whose S.browser_fallback_url sends the user to
 * the website when the app is absent. Returns null for non-http(s) input.
 */
function buildAndroidIntent(webUrl: string, pkg: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(webUrl);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

  const withoutScheme = `${parsed.host}${parsed.pathname}${parsed.search}`;
  return (
    `intent://${withoutScheme}#Intent;scheme=${parsed.protocol.replace(":", "")};` +
    `package=${pkg};S.browser_fallback_url=${encodeURIComponent(webUrl)};end`
  );
}

/**
 * Try the custom scheme; if the page never goes hidden, assume the app is not
 * installed and open the website instead.
 */
function raceSchemeAgainstWeb(scheme: string, webUrl: string): void {
  let settled = false;

  const cancel = () => {
    // The page being hidden means the OS switched to the app: stop the fallback.
    if (document.visibilityState === "hidden") settled = true;
  };

  document.addEventListener("visibilitychange", cancel);
  window.addEventListener("pagehide", cancel);

  // Navigating the top window to an unhandled scheme can surface a browser
  // error on some platforms, so the attempt goes through a hidden iframe.
  const frame = document.createElement("iframe");
  frame.style.display = "none";
  frame.src = scheme;
  document.body.appendChild(frame);

  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", cancel);
    window.removeEventListener("pagehide", cancel);
    frame.remove();
    if (!settled && document.visibilityState === "visible") {
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }
  }, 1200);
}
