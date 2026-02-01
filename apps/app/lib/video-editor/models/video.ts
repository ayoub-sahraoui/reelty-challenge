import { v4 as uuidv4 } from "uuid";
import { Layer } from "./layer";
import { makeAutoObservable } from "mobx";
import { RenderProps } from "../types/render-props";
import { VideoClip } from "./clip/video-clip";
import { TextClip } from "./clip/text-clip";
import { ImageClip } from "./clip/image-clip";
import { AudioClip } from "./clip/audio-clip";

export class Video {
  id: string;
  name: string;
  fps: number;
  resolution: { width: number; height: number };
  durationInFrames: number;
  layers: Layer[];
  constructor(name: string, durationInFrames: number, fps: number, width: number, height: number) {
    this.id = uuidv4();
    this.name = name;
    this.fps = fps;
    this.resolution = { width, height };
    this.durationInFrames = durationInFrames;
    this.layers = [];
    this.addLayer();
    makeAutoObservable(this);
  }

  setName(name: string) {
    this.name = name;
  }

  setFps(fps: number) {
    this.fps = fps;
  }

  setResolution(resolution: { width: number; height: number }) {
    this.resolution = resolution;
  }

  setDurationInFrames(durationInFrames: number) {
    this.durationInFrames = durationInFrames;
  }

  addLayer() {
    const layerIndex = this.layers.length;
    const layer = new Layer(`Layer ${layerIndex}`, layerIndex, true);
    this.layers.push(layer);
  }

  removeLayer(layer: Layer) {
    this.layers = this.layers.filter((l) => l.id !== layer.id);
  }

  reorderLayer(fromIndex: number, toIndex: number) {
    // 1. Sort current layers by index to ensure we have the correct order
    const sortedLayers = [...this.layers].sort((a, b) => a.index - b.index);

    // 2. Validate indices
    if (
      fromIndex < 0 ||
      fromIndex >= sortedLayers.length ||
      toIndex < 0 ||
      toIndex >= sortedLayers.length
    ) {
      console.warn("Invalid layer reorder indices");
      return;
    }

    const [movedLayer] = sortedLayers.splice(fromIndex, 1);
    sortedLayers.splice(toIndex, 0, movedLayer);

    sortedLayers.forEach((layer, index) => {
      layer.index = index;
    });

    this.layers = sortedLayers;
  }

  toRenderProps(): RenderProps {
    return {
      video: {
        name: this.name,
        fps: this.fps,
        width: this.resolution.width,
        height: this.resolution.height,
        durationInFrames: this.durationInFrames,
      },
      layers: this.layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        index: layer.index,
        clips: layer.clips.map((clip) => {
          const baseClip = {
            id: clip.id,
            type: clip.getType() as "video" | "audio" | "image" | "text",
            start: clip.start,
            end: clip.end,
            source: clip.source?.content || "",
          };

          // Add type-specific properties
          if (clip instanceof VideoClip) {
            return {
              ...baseClip,
              volume: clip.volume,
              opacity: clip.opacity,
              speed: clip.speed,
              isMuted: clip.isMuted,
            };
          } else if (clip instanceof TextClip) {
            return {
              ...baseClip,
              text: clip.text,
              animationKey: clip.animationKey,
              animationData: clip.content,
            };
          } else if (clip instanceof ImageClip) {
            return {
              ...baseClip,
              opacity: clip.opacity,
            };
          } else if (clip instanceof AudioClip) {
            return {
              ...baseClip,
              volume: clip.volume,
            };
          }

          return baseClip;
        }),
      })),
    };
  }
}
