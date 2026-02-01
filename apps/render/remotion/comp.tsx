import React from "react";
import {
  AbsoluteFill,
  Composition,
  Sequence,
  Video,
  Audio,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { RenderProps } from "../types/render-props";
import Lottie from "lottie-react";

function replaceAnimationPlaceholder(animationData: any, text: string) {
  const jsonString = JSON.stringify(animationData);
  if (!jsonString.includes("{{content}}")) return animationData;
  const cloned = structuredClone
    ? structuredClone(animationData)
    : JSON.parse(JSON.stringify(animationData));
  const replaceInObject = (obj: any): any => {
    if (typeof obj === "string") return obj.replace(/\{\{content\}\}/g, text);
    if (Array.isArray(obj)) return obj.map(replaceInObject);
    if (obj && typeof obj === "object") {
      const result: any = {};
      for (const key in obj) result[key] = replaceInObject(obj[key]);
      return result;
    }
    return obj;
  };
  return replaceInObject(cloned);
}

const VideoClipComponent: React.FC<{
  source: string;
  volume?: number;
  opacity?: number;
  speed?: number;
  isMuted?: boolean;
}> = ({ source, volume = 1, opacity = 1, speed = 1, isMuted = false }) => {
  return (
    <AbsoluteFill style={{ opacity }}>
      <Video
        src={source}
        volume={isMuted ? 0 : volume}
        playbackRate={speed}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

const ImageClipComponent: React.FC<{
  source: string;
  opacity?: number;
}> = ({ source, opacity = 1 }) => {
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img src={source} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

const TextClipComponent: React.FC<{
  text: string;
  animationKey?: string;
  animationData?: any;
  durationInFrames?: number;
}> = ({ text, animationKey, animationData, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lottieRef = React.useRef<any>(null);

  if (animationData && animationKey) {
    const processedAnimation = replaceAnimationPlaceholder(animationData, text);

    const totalFrames = durationInFrames || fps * 3;
    const progress = Math.min(frame / totalFrames, 1);

    React.useEffect(() => {
      if (lottieRef.current) {
        const totalAnimationFrames = processedAnimation.op || 100;
        const currentAnimationFrame = progress * totalAnimationFrames;
        lottieRef.current.goToAndStop(currentAnimationFrame, true);
      }
    }, [progress, processedAnimation.op]);

    return (
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%", height: "100%", transform: "scale(1.3)" }}>
          <Lottie
            animationData={processedAnimation}
            loop={false}
            autoplay={false}
            lottieRef={lottieRef}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </AbsoluteFill>
    );
  }

  const opacity = interpolate(frame, [0, fps * 0.3, fps * 0.7, fps], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <h1
        style={{
          fontSize: 80,
          fontWeight: "bold",
          color: "white",
          textAlign: "center",
          textShadow: "0 4px 8px rgba(0,0,0,0.5)",
          padding: "0 40px",
        }}
      >
        {text}
      </h1>
    </AbsoluteFill>
  );
};

const AudioClipComponent: React.FC<{
  source: string;
  volume?: number;
}> = ({ source, volume = 1 }) => {
  return <Audio src={source} volume={volume} />;
};

const VideoEditorComposition: React.FC<{ props: RenderProps }> = ({ props }) => {
  console.log("🎬 Remotion: Rendering composition");

  if (!props) {
    console.error("❌ No props received in VideoEditorComposition!");
    return (
      <AbsoluteFill style={{ backgroundColor: "red" }}>
        <h1 style={{ color: "white" }}>ERROR: No Props</h1>
      </AbsoluteFill>
    );
  }

  console.log("📊 Props received:", props);
  console.log("📊 Layers:", props?.layers?.length);
  props.layers.forEach((layer, i) => {
    console.log(`  Layer ${i}:`, layer.name, `(${layer.clips.length} clips)`);
    layer.clips.forEach((clip, j) => {
      console.log(
        `    Clip ${j}:`,
        clip.type,
        `from ${clip.start} to ${clip.end}`,
        clip.text || clip.source?.substring(0, 50)
      );
    });
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {props.layers
        .sort((a, b) => a.index - b.index)
        .map((layer) => (
          <React.Fragment key={layer.id}>
            {layer.clips.map((clip) => (
              <Sequence key={clip.id} from={clip.start} durationInFrames={clip.end - clip.start}>
                {clip.type === "video" && (
                  <VideoClipComponent
                    source={clip.source}
                    volume={clip.volume}
                    opacity={clip.opacity}
                    speed={clip.speed}
                    isMuted={clip.isMuted}
                  />
                )}
                {clip.type === "image" && (
                  <ImageClipComponent source={clip.source} opacity={clip.opacity} />
                )}
                {clip.type === "text" && (
                  <TextClipComponent
                    text={clip.text || ""}
                    animationKey={clip.animationKey}
                    animationData={clip.animationData}
                    durationInFrames={clip.end - clip.start}
                  />
                )}
                {clip.type === "audio" && (
                  <AudioClipComponent source={clip.source} volume={clip.volume} />
                )}
              </Sequence>
            ))}
          </React.Fragment>
        ))}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VideoEditor"
      component={VideoEditorComposition}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        props: {
          video: {
            name: "Default",
            fps: 30,
            width: 1080,
            height: 1920,
            durationInFrames: 300,
          },
          layers: [],
        },
      }}
      calculateMetadata={({ props: inputProps }) => {
        const renderProps = inputProps?.props;
        if (!renderProps || !renderProps.video) {
          console.warn("⚠️ No render props found in calculateMetadata, using defaults");
          return {
            durationInFrames: 300,
            fps: 30,
            width: 1080,
            height: 1920,
          };
        }
        return {
          durationInFrames: renderProps.video.durationInFrames,
          fps: renderProps.video.fps,
          width: renderProps.video.width,
          height: renderProps.video.height,
        };
      }}
    />
  );
};
