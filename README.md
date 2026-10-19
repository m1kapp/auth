# @m1kapp/auth

Sign-in for the m1k apps, which share one Clerk instance (clerk.m1k.app): 카카오 / Google / GitHub buttons straight to the provider, a "최근 사용" badge on the way this browser used last, and account linking for 설정 · 계정.

The logic only; each app draws its own screen. Pass the app's own Clerk objects, from whichever Clerk package it uses.

```tsx
import { useClerk, useUser } from '@clerk/nextjs';
import { SignInButton, useSocialSignIn, useLinkWays } from '@m1kapp/auth';

const signIn = useSocialSignIn(useClerk(), { redirectUrl: '/sso-callback', redirectUrlComplete: '/' });
<SignInButton way="kakao" signIn={signIn} className="..." />

const ways = useLinkWays(useUser().user); // [{ way, name, linked, taken, going, busy, link }]
```

`redirectUrl` is a page rendering Clerk's `<AuthenticateWithRedirectCallback />`.
