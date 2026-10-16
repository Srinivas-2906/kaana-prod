import { Link } from 'react-router-dom';

type BotIqLogoProps = {
  to?: string;
  variant?: 'wordmark' | 'icon';
  className?: string;
};

export function BotIqLogo({ to = '/', variant = 'wordmark', className = '' }: BotIqLogoProps) {
  const src = variant === 'icon' ? '/botiq-icon.png' : '/botiq-wordmark.png';
  const alt = 'Bot IQ by Kaana';
  const img = (
    <img
      src={src}
      alt={alt}
      className={`botiq-logo botiq-logo--${variant} ${className}`.trim()}
      width={variant === 'icon' ? 32 : 132}
      height={variant === 'icon' ? 32 : 28}
      decoding="async"
    />
  );

  if (to) {
    return (
      <Link to={to} className="botiq-logo-link" aria-label={alt}>
        {img}
      </Link>
    );
  }

  return img;
}
