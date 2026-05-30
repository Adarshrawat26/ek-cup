import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adarsh Kumar Rawat — Links',
  description: 'Creator, builder, chai enthusiast. Find all my links here.',
};

// ─── Edit these to customise the page ────────────────────────────────────────
const PROFILE = {
  name: 'Adarsh Kumar Rawat',
  handle: '@adarshrawat',
  bio: 'Building things on the internet ✦ Creator & developer from India 🇮🇳',
  avatar: '/avatars/adarsh.jpg',   // swap with your real avatar path or URL
  chaiBtnUrl: '/creator',          // your Ek Cup page
};

const LINKS = [
  {
    id: 1,
    label: 'Support me on Ek Cup ☕',
    sub: 'Buy me a chai',
    href: '/creator',
    accent: true,                  // highlighted CTA
    icon: '☕',
  },
  {
    id: 2,
    label: 'Instagram',
    sub: '@adarshrawat',
    href: 'https://instagram.com',
    icon: '📸',
  },
  {
    id: 3,
    label: 'Portfolio',
    sub: 'See my work',
    href: '#',
    icon: '🧑‍💻',
  },
  {
    id: 4,
    label: 'Twitter / X',
    sub: '@adarshrawat',
    href: 'https://twitter.com',
    icon: '🐦',
  },
  {
    id: 5,
    label: 'YouTube',
    sub: 'Videos & tutorials',
    href: 'https://youtube.com',
    icon: '🎬',
  },
  {
    id: 6,
    label: 'LinkedIn',
    sub: 'Connect professionally',
    href: 'https://linkedin.com',
    icon: '💼',
  },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function LinksPage() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(193,123,60,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(193,123,60,0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .avatar-ring { animation: pulse-ring 2.8s ease infinite; }
        .link-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }
        .link-card:hover {
          transform: translateY(-2px) scale(1.015);
          box-shadow: 0 8px 32px -8px rgba(193,123,60,0.22);
        }
        .link-card:active { transform: scale(0.98); }
      `}</style>

      <main
        style={{
          minHeight: '100svh',
          background: 'linear-gradient(160deg, #fdf6ee 0%, #fff8f2 40%, #fef3e8 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '3rem 1rem 4rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* ── Avatar ─────────────────────────────────────────────────────── */}
        <div
          className="fade-up avatar-ring"
          style={{
            animationDelay: '0s',
            width: 96, height: 96,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #c17b3c',
            marginBottom: '1rem',
            background: '#f3e0c8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            flexShrink: 0,
          }}
        >
          ☕
        </div>

        {/* ── Name & handle ──────────────────────────────────────────────── */}
        <div className="fade-up" style={{ animationDelay: '0.08s', textAlign: 'center', marginBottom: '0.4rem' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1a1008', margin: 0, letterSpacing: '-0.02em' }}>
            {PROFILE.name}
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#c17b3c', fontWeight: 500, margin: '0.2rem 0 0' }}>
            {PROFILE.handle}
          </p>
        </div>

        {/* ── Bio ────────────────────────────────────────────────────────── */}
        <p
          className="fade-up"
          style={{
            animationDelay: '0.14s',
            fontSize: '0.875rem',
            color: '#6b5740',
            textAlign: 'center',
            maxWidth: 280,
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          {PROFILE.bio}
        </p>

        {/* ── Link cards ─────────────────────────────────────────────────── */}
        <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {LINKS.map((link, i) => (
            <a
              key={link.id}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="fade-up link-card"
              style={{
                animationDelay: `${0.18 + i * 0.07}s`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.9rem 1.1rem',
                borderRadius: '1.25rem',
                border: link.accent ? '1.5px solid #c17b3c' : '1.5px solid rgba(193,123,60,0.18)',
                background: link.accent ? '#c17b3c' : 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
                textDecoration: 'none',
                boxShadow: link.accent
                  ? '0 4px 24px -6px rgba(193,123,60,0.45)'
                  : '0 2px 12px -4px rgba(193,123,60,0.1)',
                cursor: 'pointer',
              }}
            >
              {/* Icon */}
              <span style={{
                fontSize: '1.35rem',
                width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '0.75rem',
                background: link.accent ? 'rgba(255,255,255,0.2)' : 'rgba(193,123,60,0.08)',
                flexShrink: 0,
              }}>
                {link.icon}
              </span>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  color: link.accent ? '#fff' : '#1a1008',
                  lineHeight: 1.2,
                }}>
                  {link.label}
                </div>
                {link.sub && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: link.accent ? 'rgba(255,255,255,0.75)' : '#9b7c5a',
                    marginTop: '0.15rem',
                  }}>
                    {link.sub}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke={link.accent ? '#fff' : '#c17b3c'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ))}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <p
          className="fade-up"
          style={{
            animationDelay: '0.8s',
            marginTop: '2.5rem',
            fontSize: '0.72rem',
            color: '#c8a882',
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          Made with ☕ on <span style={{ fontWeight: 600 }}>Ek Cup</span>
        </p>
      </main>
    </>
  );
}
