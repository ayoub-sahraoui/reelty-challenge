import { BaseClip } from "./base-clip";
import { Source } from "../source";
import { makeAutoObservable } from "mobx";
import { ClipType } from "../../types";
import { v4 as uuidv4 } from "uuid";

export class AudioClip implements BaseClip {
  id: string;
  name: string;
  start: number;
  end: number;
  durationInFrames: number;
  source?: Source;
  volume: number;
  constructor(name: string, start: number, durationInFrames: number, source: Source) {
    this.id = uuidv4();
    this.name = name;
    this.start = start;
    this.durationInFrames = durationInFrames;
    this.end = start + durationInFrames;
    this.source = source;
    this.volume = 1;
    makeAutoObservable(this);
  }

  setVolume(volume: number) {
    this.volume = volume;
  }

  getType() {
    return ClipType.Audio;
  }
}
