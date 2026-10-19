import type { CSSProperties, ReactNode } from 'react';
import { SignInButton, useSocialSignIn, type Way } from './index';

// The m1k sign-in screen: the app's color on top with its icon, wordmark and slogan (like its launch screen), the
// page's own words and the sign-in buttons on a white card that rises from the bottom. Each app passes its brand;
// the buttons and the badge are the same everywhere, so a person who knows one m1k app knows them all.

const card: CSSProperties = {
  borderRadius: '28px 28px 0 0',
  background: '#fff',
  padding: '28px 24px 32px',
};
const button: CSSProperties = {
  display: 'flex',
  minHeight: 48,
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  borderRadius: 12,
  padding: 13,
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: '-.025em',
  border: 0,
  cursor: 'pointer',
};
const looks: Record<Way, CSSProperties> = {
  kakao: { ...button, background: '#FEE500', color: '#191919' },
  google: { ...button, marginTop: 8, background: '#fff', color: '#262626', border: '1px solid #dbdbdb', fontWeight: 700 },
  github: { ...button, marginTop: 8, background: '#24292f', color: '#fff', fontWeight: 700 },
};

export type SignInScreenProps = {
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

export function SignInScreen({
  color,
  icon,
  name,
  slogan,
  title,
  text,
  ways = ['kakao', 'google'],
  signIn,
  children,
  nameStyle,
  className,
}: SignInScreenProps) {
  return (
    <main className={className} style={{ display: 'flex', minHeight: '100%', flexDirection: 'column', background: color }}>
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px 32px',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <img
          src={icon}
          alt=""
          width={112}
          height={112}
          style={{ borderRadius: 26, boxShadow: '0 10px 28px rgba(0,0,0,.25)' }}
        />
        <span
          style={{
            marginTop: 20,
            fontSize: 40,
            lineHeight: 1,
            letterSpacing: '-.06em',
            fontWeight: 800,
            ...nameStyle,
          }}
        >
          {name}
        </span>
        {slogan && <span style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>{slogan}</span>}
      </div>
      <div style={card}>
        {title && (
          <h1 style={{ margin: '0 0 8px', fontSize: 28, lineHeight: 1.25, letterSpacing: '-.05em', color: '#111' }}>
            {title}
          </h1>
        )}
        {text && <p style={{ margin: '0 0 24px', fontSize: 14, lineHeight: 1.6, color: '#757575' }}>{text}</p>}
        {ways.map((way) => (
          <SignInButton key={way} way={way} signIn={signIn} style={looks[way]} />
        ))}
        {children}
      </div>
    </main>
  );
}
