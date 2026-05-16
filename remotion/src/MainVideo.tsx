import { AbsoluteFill, Series, useCurrentFrame, interpolate } from 'remotion';
import { loadFont as loadHeading } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadBody } from '@remotion/google-fonts/Inter';
import Scene1 from './scenes/Scene1';
import SceneCatalog from './scenes/SceneCatalog';
import SceneSpotlight from './scenes/SceneSpotlight';
import Scene3 from './scenes/Scene3';
import Scene4 from './scenes/Scene4';
import Scene5 from './scenes/Scene5';
import { COVERS } from './covers';

loadHeading('normal', { weights: ['700', '900'], subsets: ['latin'] });
loadBody('normal', { weights: ['400', '500', '700'], subsets: ['latin'] });

const GoldGrain = () => {
  const frame = useCurrentFrame();
  const shift = interpolate(frame, [0, 900], [0, 80]);
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

// Pick a few standout covers for spotlights
const spotlights = [COVERS[6], COVERS[8], COVERS[0], COVERS[11]];

export const MainVideo = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <GoldGrain />
      <Series>
        <Series.Sequence durationInFrames={75}>
          <Scene1 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <SceneCatalog />
        </Series.Sequence>
        {spotlights.map((c, i) => (
          <Series.Sequence key={i} durationInFrames={75}>
            <SceneSpotlight cover={c} index={i + 1} />
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={90}>
          <Scene3 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <Scene4 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <Scene5 />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
