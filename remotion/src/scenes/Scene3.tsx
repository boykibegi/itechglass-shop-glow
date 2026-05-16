import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

const GOLD = '#D4AF37';

const TYPES = [
  'Silicone Covers',
  'Transparent Covers',
  'Shockproof Covers',
  'Luxury Covers',
  'Magnetic Covers',
];

export default function Scene3() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(frame, [78, 90], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bgIn = interpolate(frame, [0, 20], [0, 0.35], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: 1 }}>
      <AbsoluteFill style={{ opacity: bgIn }}>
        <Img
          src={staticFile('images/cover2.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px)' }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'rgba(0,0,0,0.7)' }} />
      <AbsoluteFill style={{ padding: '120px 80px', justifyContent: 'flex-start' }}>
        <div
          style={{
            fontFamily: 'Inter',
            color: GOLD,
            fontSize: 22,
            letterSpacing: 10,
            fontWeight: 700,
            marginBottom: 16,
            opacity: spring({ frame, fps, config: { damping: 22 } }),
          }}
        >
          AINA ZILIZOPO
        </div>
        <div
          style={{
            fontFamily: 'Playfair Display',
            color: '#fff',
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1,
            opacity: spring({ frame: frame - 5, fps, config: { damping: 22 } }),
          }}
        >
          Chagua <span style={{ color: GOLD, fontStyle: 'italic' }}>style</span><br />yako
        </div>

        <div style={{ marginTop: 70, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {TYPES.map((t, i) => {
            const delay = 18 + i * 8;
            const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 110 } });
            return (
              <div
                key={t}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    background: GOLD,
                    transform: 'rotate(45deg)',
                    boxShadow: `0 0 20px ${GOLD}`,
                  }}
                />
                <div style={{ fontFamily: 'Inter', color: '#fff', fontSize: 44, fontWeight: 500, letterSpacing: 1 }}>
                  {t}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
