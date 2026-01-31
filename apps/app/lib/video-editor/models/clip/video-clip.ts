import { BaseClip } from "./base-clip";
import { Source } from "../source";
import { makeAutoObservable } from "mobx";
import { ClipType } from "../../types";
import { v4 as uuidv4 } from "uuid";

export class VideoClip implements BaseClip {
  id: string;
  name: string;
  start: number;
  end: number;
  durationInFrames: number;
  source?: Source;
  volume: number;
  opacity: number;
  speed: number;
  isMuted: boolean;
  constructor(name: string, start: number, durationInFrames: number, source: Source) {
    this.id = uuidv4();
    this.name = name;
    this.start = start;
    this.durationInFrames = durationInFrames;
    this.end = start + durationInFrames;
    this.source = source;
    this.volume = 1;
    this.opacity = 1;
    this.speed = 1;
    this.isMuted = false;
    makeAutoObservable(this);
  }

  setVolume(volume: number) {
    this.volume = volume;
  }

  setOpacity(opacity: number) {
    this.opacity = opacity;
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  setIsMuted(isMuted: boolean) {
    this.isMuted = isMuted;
  }

  getType() {
    return ClipType.Video;
  }
}
