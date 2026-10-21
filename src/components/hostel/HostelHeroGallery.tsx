import { useState, type SyntheticEvent } from 'react';
import { ChevronLeft, ChevronRight, Heart, ImageOff } from 'lucide-react';

export interface HeroPhoto {
  src: string;
  alt: string;
  label?: string;
}

interface Props {
  photos: HeroPhoto[];
  name: string;
  categoryLabel: string;
  saved?: boolean;
  onSave?: () => void;
  showSave?: boolean;
}

const fallbackSrc = '/images/hostel-exterior.webp';

export function HostelHeroGallery({ photos, name, categoryLabel, saved, onSave, showSave }: Props) {
  const list = photos.length > 0 ? photos : [{ src: fallbackSrc, alt: `${name} photo` }];
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const active = index % list.length;
  const current = list[active];

  const go = (dir: number) => {
    if (list.length < 2) return;
    setIndex(value => (value + dir + list.length) % list.length);
  };

  const onError = (event: SyntheticEvent<HTMLImageElement>, i: number) => {
    setFailed(prev => ({ ...prev, [i]: true }));
    if (!event.currentTarget.src.endsWith(fallbackSrc)) {
      event.currentTarget.src = fallbackSrc;
    }
  };

  return (
    <div className="hero-gallery">
      <div className="hero-gallery__stage">
        {failed[active] && !current.src ? (
          <div className="hero-gallery__fallback" role="img" aria-label="Photo unavailable">
            <ImageOff size={32} />
            <span>Photo unavailable</span>
          </div>
        ) : (
          <img
            key={current.src + active}
            src={current.src}
            alt={current.alt}
            className="hero-gallery__main"
            fetchPriority="high"
            decoding="async"
            onError={event => onError(event, active)}
          />
        )}

        <span className="hero-gallery__badge">{categoryLabel}</span>

        {showSave && onSave && (
          <button
            type="button"
            className={'hero-gallery__fav' + (saved ? ' is-saved' : '')}
            onClick={onSave}
            aria-pressed={saved}
            aria-label={saved ? 'Remove from saved' : 'Save hostel'}
          >
            <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
          </button>
        )}

        {list.length > 1 && (
          <>
            <button type="button" className="hero-gallery__nav hero-gallery__nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
              <ChevronLeft size={20} />
            </button>
            <button type="button" className="hero-gallery__nav hero-gallery__nav--next" onClick={() => go(1)} aria-label="Next photo">
              <ChevronRight size={20} />
            </button>
            <span className="hero-gallery__counter" aria-live="polite">
              {active + 1} / {list.length}
            </span>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="hero-gallery__thumbs" role="list">
          {list.slice(0, 6).map((photo, i) => (
            <button
              key={photo.src + i}
              type="button"
              role="listitem"
              className={'hero-gallery__thumb' + (i === active ? ' is-active' : '')}
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
            >
              <img src={photo.src} alt="" loading="lazy" decoding="async" onError={event => onError(event, i)} />
              {i === 5 && list.length > 6 && <span className="hero-gallery__more">+{list.length - 5}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
