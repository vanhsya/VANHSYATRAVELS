import React, { useState } from 'react';

interface CinemagraphImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Slow the drift for calmer scenes. */
  speed?: 'normal' | 'slow';
  /** Reverse the drift direction. */
  reverse?: boolean;
  /** Show a graceful gradient fallback while the asset loads. */
  loading?: 'lazy' | 'eager';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

/**
 * Renders a still photograph with a continuous, subtle "living" motion
 * (slow Ken-Burns drift + a passing light sweep + breathing vignette)
 * so static imagery reads as a high-quality cinemagraph.
 *
 * Motion is fully disabled via the prefers-reduced-motion media query
 * defined in index.html.
 */
const CinemagraphImage: React.FC<CinemagraphImageProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  speed = 'normal',
  reverse = false,
  loading = 'lazy',
  referrerPolicy = 'no-referrer',
}) => {
  const [loaded, setLoaded] = useState(false);

  const speedClass = speed === 'slow' ? 'cinemagraph--slow' : '';
  const reverseClass = reverse ? 'cinemagraph--reverse' : '';

  return (
    <div className={`cinemagraph ${speedClass} ${reverseClass} ${className}`}>
      {!loaded && (
        <div
          className="absolute inset-0 z-0 animate-pulse"
          style={{
            background:
              'linear-gradient(135deg, rgba(138,43,226,0.18), rgba(0,242,254,0.12))',
          }}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        referrerPolicy={referrerPolicy}
        onLoad={() => setLoaded(true)}
        className={imgClassName}
        style={{ opacity: loaded ? undefined : 0 }}
      />
    </div>
  );
};

export default CinemagraphImage;