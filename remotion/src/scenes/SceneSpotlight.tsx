import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { Cover } from '../covers';

const GOLD = '#D4AF37';

export default function SceneSpotlight({ cover, index }: { cover: Cover; index: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgIn = spring({ frame, fps, config: { damping: 22, stiffness: 90 } });
  const zoom = interpolate(frame, [0, 75], [1.0, 1.12]);
  const txtIn = spring({ frame: frame - 15, fps, config: { damping: 22 } });
  const out = interpolate(frame, [63, 75], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: out, background: '#000' }}>
      <AbsoluteFill style={{ opacity: imgIn }}>
        <Img
          src={staticFile(cover.file)}
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
              'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.95) 100%)',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ padding: 70, justifyContent: 'flex-start' }}>
        <div
          style={{
            fontFamily: 'Inter',
            color: GOLD,
            letterSpacing: 8,
            fontSize: 22,
            fontWeight: 700,
            opacity: imgIn,
          }}
        >
          {String(index).padStart(2, '0')} / FEATURED
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ padding: 70, justifyContent: 'flex-end' }}>
        <div style={{ opacity: txtIn, transform: `translateY(${interpolate(txtIn, [0, 1], [40, 0])}px)` }}>
          <div
            style={{
              fontFamily: 'Playfair Display',
              color: '#fff',
              fontSize: 70,
              fontWeight: 900,
              lineHeight: 1.05,
              maxWidth: '90%',
            }}
          >
            {cover.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 24 }}>
            <div style={{ width: 60, height: 2, background: GOLD }} />
            <div style={{ fontFamily: 'Inter', color: GOLD, fontSize: 22, letterSpacing: 4, fontWeight: 700 }}>BEI</div>
          </div>
          <div
            style={{
              fontFamily: 'Playfair Display',
              color: GOLD,
              fontSize: 72,
              fontWeight: 900,
              fontStyle: 'italic',
              marginTop: 6,
            }}
          >
            TSh {cover.price.toLocaleString()}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
