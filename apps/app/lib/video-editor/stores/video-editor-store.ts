import { makeAutoObservable } from "mobx";
import { Video } from "../models/video";
import { Layer } from "../models/layer";
import { BaseClip } from "../models/clip/base-clip";
import { ClipType, Media } from "../types";

export class VideoEditorStore {
  video?: Video | null = null;
  currentFrame = 0;
  currentLayer?: Layer | null = null;
  currentClip?: BaseClip | null = null;

  myAudios: Media[] = [];
  myVideos: Media[] = [];
  myImages: Media[] = [];

  textLibrary: Media[] = [];
  audioLibrary: Media[] = [];
  musicLibrary: Media[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  uploadMedia(media: Media) {
    switch (media.type) {
      case ClipType.Video:
        this.myVideos.push(media);
        break;
      case ClipType.Audio:
        this.myAudios.push(media);
        break;
      case ClipType.Image:
        this.myImages.push(media);
        break;
      case ClipType.Text:
        this.textLibrary.push(media);
        break;
    }
  }

  deleteMedia(media: Media) {
    switch (media.type) {
      case ClipType.Video:
        this.myVideos = this.myVideos.filter((m) => m.id !== media.id);
        break;
      case ClipType.Audio:
        this.myAudios = this.myAudios.filter((m) => m.id !== media.id);
        break;
      case ClipType.Image:
        this.myImages = this.myImages.filter((m) => m.id !== media.id);
        break;
      case ClipType.Text:
        this.textLibrary = this.textLibrary.filter((m) => m.id !== media.id);
        break;
    }
  }

  get fps() {
    return this.video?.fps || 30;
  }

  get durationInFrames() {
    return this.video?.durationInFrames || 300;
  }

  setCurrentFrame(frame: number) {
    this.currentFrame = Math.max(0, Math.min(this.durationInFrames, Math.round(frame)));
  }

  setCurrentLayer(layer: Layer | null) {
    this.currentLayer = layer;
    if (layer) {
      this.currentClip = null; // Deselect clip when layer is selected
    }
  }

  setCurrentClip(clip: BaseClip | null) {
    this.currentClip = clip;
    if (clip) {
      this.currentLayer =
        this.video?.layers.find((l) => l.clips.some((c) => c.id === clip.id)) || null;
    }
  }

  framesToSeconds(frames: number): number {
    return frames / this.fps;
  }

  secondsToFrames(seconds: number): number {
    return Math.round(seconds * this.fps);
  }

  get currentTimeInSeconds(): number {
    return this.framesToSeconds(this.currentFrame);
  }

  get durationInSeconds(): number {
    return this.framesToSeconds(this.durationInFrames);
  }

  createEmptyVideo() {
    console.log("Creating video...");
    this.video = new Video("Video 1", 300, 30, 1920, 1080);
    console.log(this.video);
    this.currentFrame = 0;
  }

  createVideo(name: string, durationInFrames: number, fps: number, width: number, height: number) {
    console.log("Creating video...");
    this.video = new Video(name, durationInFrames, fps, width, height);
    console.log(this.video);
    this.currentFrame = 0;
  }

  removeVideo() {
    console.log("Removing video...");
    this.video = undefined;
    this.currentFrame = 0;
  }

  renderVideo() {
    console.log("Rendering video...");
    if (!this.video) return;
  }
}
