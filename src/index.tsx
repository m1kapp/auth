import { useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';

// Sign-in for the m1k apps, which all share one Clerk instance (clerk.m1k.app). The app passes its own Clerk
// (`useClerk()` / `useUser()` from whichever Clerk package it uses) and draws its own screen; this holds the logic.

export type Way = 'kakao' | 'google' | 'github';

const kakaoIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="currentColor"
      d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.8c-.1.3.3.6.6.4l4.4-2.9c.4 0 .9.1 1.3.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"
    />
  </svg>
);
const googleIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);
const githubIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

/** Each way on clerk.m1k.app: 카카오 is its custom OIDC connection (key `kakao`). */
export const ways: Record<Way, { strategy: string; provider: string; name: string; icon: ReactNode }> = {
  kakao: { strategy: 'oauth_custom_kakao', provider: 'custom_kakao', name: '카카오', icon: kakaoIcon },
  google: { strategy: 'oauth_google', provider: 'google', name: 'Google', icon: googleIcon },
  github: { strategy: 'oauth_github', provider: 'github', name: 'GitHub', icon: githubIcon },
};

/** The part of Clerk's `useClerk()` this needs, so any Clerk package (nextjs, react, clerk-react) fits. */
export type SignInClerk = {
  loaded?: boolean;
  client?: {
    lastAuthenticationStrategy?: string | null;
    signIn: {
      authenticateWithRedirect(params: {
        strategy: never;
        redirectUrl: string;
        redirectUrlComplete: string;
      }): Promise<unknown>;
    };
  } | null;
};

const lastKey = 'm1k:way';
const noSubscribe = () => () => {};
function readLast() {
  try {
    return localStorage.getItem(lastKey) as Way | null;
  } catch {
    return null;
  }
}
// Clerk loads late in a PWA or on a slow line: wait for it a little before giving up.
async function loaded(clerk: SignInClerk) {
  for (let waited = 0; !clerk.loaded && waited < 5000; waited += 200)
    await new Promise((resolve) => setTimeout(resolve, 200));
  return !!clerk.client;
}

/**
 * Straight to the provider from the app's own button, no Clerk sign-in screen in between. Clerk comes back through
 * `redirectUrl` (a page with `<AuthenticateWithRedirectCallback />`, which finishes a new account as a sign-up) and
 * lands on `redirectUrlComplete`. `last` is the way this browser signed in with before, to mark on its button:
 * taking the other one makes a second, empty account.
 */
export function useSocialSignIn(
  clerk: SignInClerk,
  {
    redirectUrl = '/sso-callback',
    redirectUrlComplete = '/',
    fallbackUrl,
    onStart,
  }: {
    redirectUrl?: string;
    redirectUrlComplete?: string;
    /** Where to go when Clerk can't start. */
    fallbackUrl?: string;
    /** Just before leaving for the provider, e.g. to remember the invite it started from. */
    onStart?: (way: Way) => void;
  } = {},
) {
  const [going, setGoing] = useState<Way | null>(null);
  const stored = useSyncExternalStore(noSubscribe, readLast, () => null);
  const last =
    stored ?? (Object.keys(ways) as Way[]).find((way) => ways[way].strategy === clerk.client?.lastAuthenticationStrategy);
  async function start(way: Way) {
    // Google refuses KakaoTalk's in-app browser: reopen this page in the phone's own.
    if (way === 'google' && /KAKAOTALK/i.test(navigator.userAgent))
      return location.assign(`kakaotalk://web/openExternal?url=${encodeURIComponent(location.href)}`);
    setGoing(way);
    if (!(await loaded(clerk))) {
      setGoing(null);
      return fallbackUrl ? location.assign(fallbackUrl) : void window.open(location.href, '_blank');
    }
    try {
      localStorage.setItem(lastKey, way);
    } catch {}
    onStart?.(way);
    try {
      await clerk.client!.signIn.authenticateWithRedirect({
        strategy: ways[way].strategy as never,
        redirectUrl,
        redirectUrlComplete,
      });
    } catch {
      setGoing(null);
      if (fallbackUrl) location.assign(fallbackUrl);
    }
  }
  return { start, going, last };
}

const recentStyle: CSSProperties = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  borderRadius: 999,
  background: 'rgba(127,127,127,.3)', // readable on light and dark buttons
  padding: '2px 8px',
  fontSize: 10,
  fontWeight: 700,
  lineHeight: '16px',
};

/**
 * One way's button: icon, "카카오로 시작하기", "최근 사용" on the last one. The look is the app's (`className`);
 * it only needs `position: relative` for the badge, which it sets.
 */
export function SignInButton({
  way,
  signIn,
  className,
  label = `${ways[way].name}로 시작하기`,
  recentClassName,
  style,
}: {
  way: Way;
  signIn: ReturnType<typeof useSocialSignIn>;
  className?: string;
  style?: CSSProperties;
  label?: ReactNode;
  /** Replaces the badge's default look. */
  recentClassName?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      style={{ ...style, position: 'relative', opacity: signIn.going ? 0.6 : undefined }}
      disabled={!!signIn.going}
      onClick={() => void signIn.start(way)}
    >
      {ways[way].icon}
      <span>{signIn.going === way ? `${ways[way].name}로 이동 중…` : label}</span>
      {signIn.last === way && (
        <span className={recentClassName} style={recentClassName ? undefined : recentStyle}>
          최근 사용
        </span>
      )}
    </button>
  );
}

/** The part of Clerk's `useUser().user` linking needs. */
export type LinkUser = {
  externalAccounts: { provider: string; verification: { status?: string | null; error?: { code?: string } | null } | null }[];
  createExternalAccount(params: { strategy: never; redirectUrl: string }): Promise<{
    verification: { externalVerificationRedirectURL?: URL | null } | null;
  }>;
};

/**
 * 설정 · 계정: each way as linked or not, and `link` to add it to this account (the provider's consent, then back
 * here). `taken`: that 카카오/Google already signs in another account, which only a person can merge (Clerk lets an
 * external account belong to one user).
 */
export function useLinkWays(user: LinkUser | null | undefined, list: Way[] = ['kakao', 'google']) {
  const [going, setGoing] = useState<Way | null>(null);
  return list.map((way) => {
    const account = user?.externalAccounts.find((item) => item.provider === ways[way].provider);
    return {
      way,
      ...ways[way],
      linked: account?.verification?.status === 'verified',
      taken: account?.verification?.error?.code === 'external_account_exists',
      going: going === way,
      busy: !!going,
      async link() {
        if (!user) return;
        setGoing(way);
        try {
          const account = await user.createExternalAccount({
            strategy: ways[way].strategy as never,
            redirectUrl: location.href,
          });
          const to = account.verification?.externalVerificationRedirectURL;
          if (to) location.assign(to.href);
          else setGoing(null);
        } catch {
          setGoing(null);
        }
      },
    };
  });
}

export { SignInScreen, type SignInScreenProps } from './screen';
