import Turnstile from 'react-turnstile';

const TURNSTILE_SITE_KEY = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string) || '';

export function isTurnstileEnabled(): boolean {
  return TURNSTILE_SITE_KEY.trim().length > 0;
}

type TurnstileFieldProps = {
  token: string;
  onTokenChange: (token: string) => void;
  resetKey?: number;
  className?: string;
  theme?: 'auto' | 'light' | 'dark';
};

export default function TurnstileField({
  token,
  onTokenChange,
  resetKey = 0,
  className,
  theme = 'auto',
}: TurnstileFieldProps) {
  if (!isTurnstileEnabled()) {
    return null;
  }

  return (
    <div className={className}>
      <Turnstile
        key={resetKey}
        sitekey={TURNSTILE_SITE_KEY}
        theme={theme}
        refreshExpired="auto"
        onVerify={(nextToken) => onTokenChange(nextToken || '')}
        onExpire={() => onTokenChange('')}
        onError={() => onTokenChange('')}
      />
      <input type="hidden" name="turnstileToken" value={token} readOnly />
      <p className="mt-2 text-xs text-navy/60">Security check provided by Cloudflare Turnstile.</p>
    </div>
  );
}