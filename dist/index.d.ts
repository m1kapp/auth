import * as react from 'react';
import { ReactNode, CSSProperties } from 'react';

type SignInScreenProps = {
    /** The app's brand color, behind the icon and wordmark. */
    color: string;
    /** The app's icon, e.g. `/icon-512.webp`. */
    icon: string;
    /** The wordmark, e.g. `monthgram`. */
    name: ReactNode;
    /** Under the wordmark, e.g. `같은 달, 나란히`. */
    slogan?: ReactNode;
    /** The card's headline, e.g. `월마다, 나란히.` */
    title?: ReactNode;
    /** Under the headline, e.g. `한 달에 한 장씩 기록해 두세요.` */
    text?: ReactNode;
    /** In order, 카카오 first by default. */
    ways?: Way[];
    signIn: ReturnType<typeof useSocialSignIn>;
    /** Under the buttons, e.g. a demo link. */
    children?: ReactNode;
    /** The wordmark's font, e.g. `Georgia, serif`. */
    nameStyle?: CSSProperties;
    className?: string;
};
declare function SignInScreen({ color, icon, name, slogan, title, text, ways, signIn, children, nameStyle, className, }: SignInScreenProps): react.JSX.Element;

type Way = 'kakao' | 'google' | 'github';
/** Each way on clerk.m1k.app: 카카오 is its custom OIDC connection (key `kakao`). */
declare const ways: Record<Way, {
    strategy: string;
    provider: string;
    name: string;
    icon: ReactNode;
}>;
/** The part of Clerk's `useClerk()` this needs, so any Clerk package (nextjs, react, clerk-react) fits. */
type SignInClerk = {
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
/**
 * Straight to the provider from the app's own button, no Clerk sign-in screen in between. Clerk comes back through
 * `redirectUrl` (a page with `<AuthenticateWithRedirectCallback />`, which finishes a new account as a sign-up) and
 * lands on `redirectUrlComplete`. `last` is the way this browser signed in with before, to mark on its button:
 * taking the other one makes a second, empty account.
 */
declare function useSocialSignIn(clerk: SignInClerk, { redirectUrl, redirectUrlComplete, fallbackUrl, onStart, }?: {
    redirectUrl?: string;
    redirectUrlComplete?: string;
    /** Where to go when Clerk can't start. */
    fallbackUrl?: string;
    /** Just before leaving for the provider, e.g. to remember the invite it started from. */
    onStart?: (way: Way) => void;
}): {
    start: (way: Way) => Promise<void>;
    going: Way | null;
    last: Way | undefined;
};
/**
 * One way's button: icon, "카카오로 시작하기", "최근 사용" on the last one. The look is the app's (`className`);
 * it only needs `position: relative` for the badge, which it sets.
 */
declare function SignInButton({ way, signIn, className, label, recentClassName, style, }: {
    way: Way;
    signIn: ReturnType<typeof useSocialSignIn>;
    className?: string;
    style?: CSSProperties;
    label?: ReactNode;
    /** Replaces the badge's default look. */
    recentClassName?: string;
}): react.JSX.Element;
/** The part of Clerk's `useUser().user` linking needs. */
type LinkUser = {
    externalAccounts: {
        provider: string;
        verification: {
            status?: string | null;
            error?: {
                code?: string;
            } | null;
        } | null;
    }[];
    createExternalAccount(params: {
        strategy: never;
        redirectUrl: string;
    }): Promise<{
        verification: {
            externalVerificationRedirectURL?: URL | null;
        } | null;
    }>;
};
/**
 * 설정 · 계정: each way as linked or not, and `link` to add it to this account (the provider's consent, then back
 * here). `taken`: that 카카오/Google already signs in another account, which only a person can merge (Clerk lets an
 * external account belong to one user).
 */
declare function useLinkWays(user: LinkUser | null | undefined, list?: Way[]): {
    linked: boolean;
    taken: boolean;
    going: boolean;
    busy: boolean;
    link(): Promise<void>;
    strategy: string;
    provider: string;
    name: string;
    icon: ReactNode;
    way: Way;
}[];

export { type LinkUser, SignInButton, type SignInClerk, SignInScreen, type SignInScreenProps, type Way, useLinkWays, useSocialSignIn, ways };
