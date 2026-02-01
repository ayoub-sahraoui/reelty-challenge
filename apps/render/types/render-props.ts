export interface RenderProps {
  video: {
    name: string;
    fps: number;
    width: number;
    height: number;
    durationInFrames: number;
  };
  layers: Array<{
    id: string;
    name: string;
    index: number;
    clips: Array<{
      id: string;
      type: "video" | "audio" | "image" | "text";
      start: number;
      end: number;
      source: string;
      text?: string;
      animationKey?: string;
      animationData?: any;
      volume?: number;
      opacity?: number;
      speed?: number;
      isMuted?: boolean;
    }>;
  }>;
}
