import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { Cover } from '../covers';

const GOLD = '#D4AF37';

export default function SceneCatalog({ covers }: { covers: Cover[] }) {
  const COVERS = covers.slice(0, 12);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(frame, [108, 120], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const headerS = spring({ frame, fps, config: { damping: 22 } });

  return (
    <AbsoluteFill style={{ opacity: 1, padding: '120px 60px' }}>
      <div
        style={{
          fontFamily: 'Inter',
          color: GOLD,
          fontSize: 22,
          letterSpacing: 10,
          fontWeight: 700,
          opacity: headerS,
        }}
      >
        COLLECTION YETU
      </div>
      <div
        style={{
          fontFamily: 'Playfair Display',
          color: '#fff',
          fontSize: 90,
          fontWeight: 900,
          lineHeight: 1,
          marginTop: 14,
          opacity: headerS,
          transform: `translateY(${interpolate(headerS, [0, 1], [20, 0])}px)`,
        }}
      >
        12+ <span style={{ color: GOLD, fontStyle: 'italic' }}>Mitindo</span>
      </div>
      <div style={{ fontFamily: 'Inter', color: 'rgba(255,255,255,0.6)', fontSize: 26, marginTop: 12, opacity: headerS }}>
        Chagua inayokuvutia
      </div>

      <div
        style={{
          marginTop: 60,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18,
        }}
      >
        {COVERS.map((c, i) => {
          const s = spring({ frame: frame - (18 + i * 5), fps, config: { damping: 18, stiffness: 120 } });
          return (
            <div
              key={i}
              style={{
                aspectRatio: '3 / 4',
                borderRadius: 14,
                overflow: 'hidden',
                border: `1px solid ${GOLD}55`,
                background: '#111',
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
                boxShadow: `0 8px 30px rgba(0,0,0,0.5)`,
              }}
            >
              <Img src={staticFile(c.file)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
