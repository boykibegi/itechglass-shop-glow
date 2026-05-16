import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

const GOLD = '#D4AF37';
const MODELS = ['11', '11 Pro', '11 Pro Max', '12', '12 Pro', '12 Pro Max', '13', '13 Pro', '13 Pro Max', '14', '14 Pro', '14 Pro Max'];

export default function Scene4() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(frame, [78, 90], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: 1 }}>
      <AbsoluteFill style={{ opacity: 0.25 }}>
        <Img src={staticFile('images/cover3.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0.95))' }} />

      <AbsoluteFill style={{ padding: '140px 80px' }}>
        <div
          style={{
            fontFamily: 'Inter',
            color: GOLD,
            fontSize: 22,
            letterSpacing: 10,
            fontWeight: 700,
            opacity: spring({ frame, fps, config: { damping: 22 } }),
          }}
        >
          ZINAPATIKANA KWA
        </div>
        <div
          style={{
            fontFamily: 'Playfair Display',
            color: '#fff',
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1,
            marginTop: 14,
            opacity: spring({ frame: frame - 4, fps, config: { damping: 22 } }),
          }}
        >
          iPhone <span style={{ color: GOLD, fontStyle: 'italic' }}>11 – 14</span>
        </div>
        <div
          style={{
            fontFamily: 'Inter',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 26,
            marginTop: 18,
            opacity: spring({ frame: frame - 10, fps, config: { damping: 22 } }),
          }}
        >
          Pro • Pro Max — zote zinapatikana
        </div>

        <div
          style={{
            marginTop: 70,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 18,
          }}
        >
          {MODELS.map((m, i) => {
            const s = spring({ frame: frame - (18 + i * 3), fps, config: { damping: 20, stiffness: 140 } });
            return (
              <div
                key={m}
                style={{
                  border: `1px solid ${GOLD}55`,
                  background: 'rgba(212,175,55,0.06)',
                  padding: '24px 12px',
                  textAlign: 'center',
                  fontFamily: 'Inter',
                  color: '#fff',
                  fontSize: 26,
                  fontWeight: 500,
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0,1], [30,0])}px)`,
                }}
              >
                <div style={{ color: GOLD, fontSize: 14, letterSpacing: 2, marginBottom: 4 }}>iPhone</div>
                {m}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
