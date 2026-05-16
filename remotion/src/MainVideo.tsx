import { AbsoluteFill, Series, useCurrentFrame, interpolate } from 'remotion';
import { loadFont as loadHeading } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadBody } from '@remotion/google-fonts/Inter';
import Scene1 from './scenes/Scene1';
import Scene2 from './scenes/Scene2';
import Scene3 from './scenes/Scene3';
import Scene4 from './scenes/Scene4';
import Scene5 from './scenes/Scene5';

loadHeading('normal', { weights: ['700', '900'], subsets: ['latin'] });
loadBody('normal', { weights: ['400', '500', '700'], subsets: ['latin'] });

const GoldGrain = () => {
  const frame = useCurrentFrame();
  const shift = interpolate(frame, [0, 450], [0, 60]);
  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.18), transparent 55%), radial-gradient(ellipse at 70% 90%, rgba(212,175,55,0.10), transparent 60%), #000',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0 2px, transparent 2px 6px)',
          transform: `translate(${shift}px, ${-shift}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const MainVideo = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <GoldGrain />
      <Series>
        <Series.Sequence durationInFrames={75}>
          <Scene1 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <Scene2 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <Scene3 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <Scene4 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={105}>
          <Scene5 />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
