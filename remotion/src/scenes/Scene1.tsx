import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

const GOLD = '#D4AF37';

export default function Scene1() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const subY = spring({ frame: frame - 15, fps, config: { damping: 22, stiffness: 120 } });
  const lineW = spring({ frame: frame - 8, fps, config: { damping: 20 } });
  const out = interpolate(frame, [60, 75], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 }}>
      <div
        style={{
          fontFamily: 'Inter',
          color: GOLD,
          letterSpacing: 12,
          fontSize: 26,
          fontWeight: 500,
          opacity: titleOpacity,
          transform: `translateY(${interpolate(titleY, [0, 1], [40, 0])}px)`,
          marginBottom: 24,
        }}
      >
        ITECH GLASS PRESENTS
      </div>
      <div
        style={{
          fontFamily: 'Playfair Display',
          color: '#fff',
          fontSize: 150,
          fontWeight: 900,
          lineHeight: 1,
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `translateY(${interpolate(titleY, [0, 1], [60, 0])}px) scale(${interpolate(titleY, [0,1],[0.85,1])})`,
        }}
      >
        ITECH<br />
        <span style={{ color: GOLD, fontStyle: 'italic' }}>Covers</span>
      </div>
      <div
        style={{
          width: `${interpolate(lineW, [0, 1], [0, 400])}px`,
          height: 2,
          background: GOLD,
          marginTop: 40,
        }}
      />
      <div
        style={{
          fontFamily: 'Inter',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 28,
          letterSpacing: 4,
          marginTop: 30,
          transform: `translateY(${interpolate(subY, [0, 1], [30, 0])}px)`,
          opacity: subY,
        }}
      >
        Kali • Kisasa • Bei Nafuu
      </div>
    </AbsoluteFill>
  );
}
