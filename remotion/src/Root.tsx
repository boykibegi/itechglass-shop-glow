import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';
import type { Cover } from './covers';

// Scene timings (frames @ 30fps)
const SCENE1 = 75;
const CATALOG = 120;
const SPOTLIGHT = 75;
const SCENE3 = 90;
const SCENE4 = 90;
const SCENE5 = 120;

const SPOTLIGHT_COUNT = 4;

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={SCENE1 + CATALOG + SPOTLIGHT * SPOTLIGHT_COUNT + SCENE3 + SCENE4 + SCENE5}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{ covers: [] as Cover[] }}
    calculateMetadata={({ props }) => {
      const spotlights = Math.min(SPOTLIGHT_COUNT, Math.max(1, props.covers.length));
      return {
        durationInFrames:
          SCENE1 + CATALOG + SPOTLIGHT * spotlights + SCENE3 + SCENE4 + SCENE5,
        props,
      };
    }}
  />
);
