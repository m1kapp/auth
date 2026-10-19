"use client";

// src/index.tsx
import { useState, useSyncExternalStore } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var kakaoIcon = /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", "aria-hidden": true, children: /* @__PURE__ */ jsx(
  "path",
  {
    fill: "currentColor",
    d: "M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.8c-.1.3.3.6.6.4l4.4-2.9c.4 0 .9.1 1.3.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"
  }
) });
var googleIcon = /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", "aria-hidden": true, children: [
  /* @__PURE__ */ jsx(
    "path",
    {
      d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z",
      fill: "#4285F4"
    }
  ),
  /* @__PURE__ */ jsx(
    "path",
    {
      d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",
      fill: "#34A853"
    }
  ),
  /* @__PURE__ */ jsx(
    "path",
    {
      d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z",
      fill: "#FBBC05"
    }
  ),
  /* @__PURE__ */ jsx(
    "path",
    {
      d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",
      fill: "#EA4335"
    }
  )
] });
var githubIcon = /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" }) });
var ways = {
  kakao: { strategy: "oauth_custom_kakao", provider: "custom_kakao", name: "\uCE74\uCE74\uC624", icon: kakaoIcon },
  google: { strategy: "oauth_google", provider: "google", name: "Google", icon: googleIcon },
  github: { strategy: "oauth_github", provider: "github", name: "GitHub", icon: githubIcon }
};
var lastKey = "m1k:way";
var noSubscribe = () => () => {
};
function readLast() {
  try {
    return localStorage.getItem(lastKey);
  } catch {
    return null;
  }
}
async function loaded(clerk) {
  for (let waited = 0; !clerk.loaded && waited < 5e3; waited += 200)
    await new Promise((resolve) => setTimeout(resolve, 200));
  return !!clerk.client;
}
function useSocialSignIn(clerk, {
  redirectUrl = "/sso-callback",
  redirectUrlComplete = "/",
  fallbackUrl,
  onStart
} = {}) {
  const [going, setGoing] = useState(null);
  const stored = useSyncExternalStore(noSubscribe, readLast, () => null);
  const last = stored ?? Object.keys(ways).find((way) => ways[way].strategy === clerk.client?.lastAuthenticationStrategy);
  async function start(way) {
    if (way === "google" && /KAKAOTALK/i.test(navigator.userAgent))
      return location.assign(`kakaotalk://web/openExternal?url=${encodeURIComponent(location.href)}`);
    setGoing(way);
    if (!await loaded(clerk)) {
      setGoing(null);
      return fallbackUrl ? location.assign(fallbackUrl) : void window.open(location.href, "_blank");
    }
    try {
      localStorage.setItem(lastKey, way);
    } catch {
    }
    onStart?.(way);
    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: ways[way].strategy,
        redirectUrl,
        redirectUrlComplete
      });
    } catch {
      setGoing(null);
      if (fallbackUrl) location.assign(fallbackUrl);
    }
  }
  return { start, going, last };
}
var recentStyle = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  borderRadius: 999,
  background: "rgba(127,127,127,.3)",
  // readable on light and dark buttons
  padding: "2px 8px",
  fontSize: 10,
  fontWeight: 700,
  lineHeight: "16px"
};
function SignInButton({
  way,
  signIn,
  className,
  label = `${ways[way].name}\uB85C \uC2DC\uC791\uD558\uAE30`,
  recentClassName
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      className,
      style: { position: "relative" },
      disabled: !!signIn.going,
      onClick: () => void signIn.start(way),
      children: [
        ways[way].icon,
        /* @__PURE__ */ jsx("span", { children: signIn.going === way ? `${ways[way].name}\uB85C \uC774\uB3D9 \uC911\u2026` : label }),
        signIn.last === way && /* @__PURE__ */ jsx("span", { className: recentClassName, style: recentClassName ? void 0 : recentStyle, children: "\uCD5C\uADFC \uC0AC\uC6A9" })
      ]
    }
  );
}
function useLinkWays(user, list = ["kakao", "google"]) {
  const [going, setGoing] = useState(null);
  return list.map((way) => {
    const account = user?.externalAccounts.find((item) => item.provider === ways[way].provider);
    return {
      way,
      ...ways[way],
      linked: account?.verification?.status === "verified",
      taken: account?.verification?.error?.code === "external_account_exists",
      going: going === way,
      busy: !!going,
      async link() {
        if (!user) return;
        setGoing(way);
        try {
          const account2 = await user.createExternalAccount({
            strategy: ways[way].strategy,
            redirectUrl: location.href
          });
          const to = account2.verification?.externalVerificationRedirectURL;
          if (to) location.assign(to.href);
          else setGoing(null);
        } catch {
          setGoing(null);
        }
      }
    };
  });
}
export {
  SignInButton,
  useLinkWays,
  useSocialSignIn,
  ways
};
