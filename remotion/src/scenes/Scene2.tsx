import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

const GOLD = '#D4AF37';

export default function Scene2() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgIn = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const zoom = interpolate(frame, [0, 90], [1.05, 1.18]);
  const labelIn = spring({ frame: frame - 18, fps, config: { damping: 22 } });
  const out = interpolate(frame, [78, 90], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: 1 }}>
      <AbsoluteFill style={{ opacity: imgIn }}>
        <Img
          src={staticFile('images/cover1.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${zoom})`,
          }}
        />
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.9) 100%)',
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ padding: 80, justifyContent: 'flex-start' }}>
        <div
          style={{
            fontFamily: 'Inter',
            color: GOLD,
            letterSpacing: 8,
            fontSize: 22,
            fontWeight: 700,
            opacity: imgIn,
            transform: `translateY(${interpolate(imgIn, [0,1], [-20,0])}px)`,
          }}
        >
          ★ PREMIUM COLLECTION ★
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ padding: 80, justifyContent: 'flex-end' }}>
        <div
          style={{
            opacity: labelIn,
            transform: `translateY(${interpolate(labelIn, [0,1], [40, 0])}px)`,
          }}
        >
          <div style={{ fontFamily: 'Playfair Display', color: '#fff', fontSize: 110, fontWeight: 900, lineHeight: 0.95 }}>
            Luxury
          </div>
          <div style={{ fontFamily: 'Playfair Display', color: GOLD, fontSize: 110, fontWeight: 900, fontStyle: 'italic', lineHeight: 0.95 }}>
            Covers
          </div>
          <div style={{ fontFamily: 'Inter', color: 'rgba(255,255,255,0.75)', fontSize: 30, marginTop: 20, letterSpacing: 2 }}>
            kwa iPhone yako
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
