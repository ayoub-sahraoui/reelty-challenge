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
}
