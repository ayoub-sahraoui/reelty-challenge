import { Source } from "../source";
import { makeAutoObservable } from "mobx";
import { ClipType } from "../../types";
import { v4 as uuidv4 } from "uuid";
import { BaseClip } from "./base-clip";

export class TextClip implements BaseClip {
  id: string;
  name: string;
  start: number;
  end: number;
  durationInFrames: number;
  source?: Source;
  text: string;
  constructor(name: string, start: number, durationInFrames: number, source: Source, text: string) {
    this.id = uuidv4();
    this.name = name;
    this.start = start;
    this.durationInFrames = durationInFrames;
    this.end = start + durationInFrames;
    this.source = source;
    this.text = text;
    makeAutoObservable(this);
  }

  setText(text: string) {
    this.text = text;
  }

  getType() {
    return ClipType.Text;
  }
}
