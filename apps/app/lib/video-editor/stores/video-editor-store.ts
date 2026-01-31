import { makeAutoObservable } from "mobx";
import { Video } from "../models/video";

export class VideoEditorStore {
  video?: Video | null = null;
  currentFrame = 0;

  constructor() {
    makeAutoObservable(this);
  }

  get fps() {
    return this.video?.fps || 30;
  }

  get durationInSeconds() {
    if (!this.video) return 60;
    return this.video.durationInFrames / this.video.fps;
  }

  get currentTimeInSeconds() {
    return this.currentFrame / this.fps;
  }

  setCurrentTime(timeInSeconds: number) {
    const fps = this.video?.fps ?? 30;
    this.currentFrame = Math.max(0, Math.round(timeInSeconds * fps));
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
