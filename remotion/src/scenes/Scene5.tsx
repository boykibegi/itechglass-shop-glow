import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

const GOLD = '#D4AF37';

export default function Scene5() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = 1 + Math.sin(frame / 8) * 0.02;

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 80 }}>
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
        KARIBU SANA
      </div>
      <div
        style={{
          fontFamily: 'Playfair Display',
          color: '#fff',
          fontSize: 120,
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: 0.95,
          marginTop: 20,
          opacity: spring({ frame: frame - 4, fps, config: { damping: 22 } }),
          transform: `scale(${pulse})`,
        }}
      >
        Usikose<br />
        <span style={{ color: GOLD, fontStyle: 'italic' }}>Hii!</span>
      </div>

      <div style={{ width: 200, height: 2, background: GOLD, marginTop: 50, opacity: spring({ frame: frame - 12, fps }) }} />

      <Row delay={20} frame={frame} fps={fps} label="LOCATION" value="Tabata Magengeni" />
      <Row delay={28} frame={frame} fps={fps} label="SIMU & WHATSAPP" value="+255 746 582 989" big />
      <Row delay={36} frame={frame} fps={fps} label="DELIVERY" value="Tunatuma mikoani kote" />

      <div
        style={{
          marginTop: 50,
          fontFamily: 'Inter',
          color: 'rgba(255,255,255,0.55)',
          fontSize: 24,
          textAlign: 'center',
          letterSpacing: 2,
          opacity: spring({ frame: frame - 44, fps, config: { damping: 22 } }),
        }}
      >
        Jumla • Rejareja
      </div>

      <div
        style={{
          marginTop: 30,
          padding: '20px 50px',
          border: `2px solid ${GOLD}`,
          background: 'rgba(212,175,55,0.08)',
          fontFamily: 'Inter',
          color: '#fff',
          fontSize: 30,
          letterSpacing: 4,
          fontWeight: 700,
          opacity: spring({ frame: frame - 52, fps, config: { damping: 18 } }),
          transform: `scale(${1 + Math.sin(frame / 6) * 0.03})`,
          boxShadow: `0 0 40px ${GOLD}55`,
        }}
      >
        PIGA SIMU SASA
      </div>
    </AbsoluteFill>
  );
}

function Row({ delay, frame, fps, label, value, big }: any) {
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 120 } });
  return (
    <div
      style={{
        marginTop: 32,
        textAlign: 'center',
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
      }}
    >
      <div style={{ fontFamily: 'Inter', color: GOLD, fontSize: 16, letterSpacing: 6, fontWeight: 700 }}>{label}</div>
      <div
        style={{
          fontFamily: big ? 'Playfair Display' : 'Inter',
          color: '#fff',
          fontSize: big ? 60 : 36,
          fontWeight: big ? 900 : 500,
          marginTop: 6,
        }}
      >
        {value}
      </div>
    </div>
  );
}
