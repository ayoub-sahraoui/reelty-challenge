import { Source } from "../source";
import { makeAutoObservable } from "mobx";
import { ClipType } from "../../types";
import { v4 as uuidv4 } from "uuid";
import { BaseClip } from "./base-clip";

export class ImageClip implements BaseClip {
  id: string;
  name: string;
  start: number;
  end: number;
  durationInFrames: number;
  source?: Source;
  opacity: number;
  constructor(name: string, start: number, durationInFrames: number, source: Source) {
    this.id = uuidv4();
    this.name = name;
    this.start = start;
    this.durationInFrames = durationInFrames;
    this.end = start + durationInFrames;
    this.source = source;
    this.opacity = 1;
    makeAutoObservable(this);
  }

  setOpacity(opacity: number) {
    this.opacity = opacity;
  }

  getType() {
    return ClipType.Image;
  }

  adjust(start: number, end: number) {
    this.start = start;
    this.end = end;
    this.durationInFrames = end - start;
  }

  moveTo(startFrame: number) {
    const duration = this.durationInFrames;
    this.start = startFrame;
    this.end = startFrame + duration;
  }

  trimStart(newStartFrame: number) {
    if (newStartFrame < this.end) {
      this.start = newStartFrame;
      this.durationInFrames = this.end - this.start;
    }
  }

  trimEnd(newEndFrame: number) {
    if (newEndFrame > this.start) {
      this.end = newEndFrame;
      this.durationInFrames = this.end - this.start;
    }
  }
}
