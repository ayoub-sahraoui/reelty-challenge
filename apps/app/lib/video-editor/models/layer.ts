import { v4 as uuidv4 } from "uuid";
import { BaseClip } from "./clip/base-clip";
import { makeAutoObservable } from "mobx";

export class Layer {
  id: string;
  name: string;
  index: number;
  Visibility: boolean;
  clips: BaseClip[];
  constructor(name: string, index: number, visibility: boolean) {
    this.id = uuidv4();
    this.name = name;
    this.index = index;
    this.clips = [];
    this.Visibility = visibility;
    makeAutoObservable(this);
  }

  setName(name: string) {
    this.name = name;
  }

  setIndex(index: number) {
    this.index = index;
  }

  setVisibility(visibility: boolean) {
    this.Visibility = visibility;
  }

  addClip(clip: BaseClip) {
    this.clips.push(clip);
  }

  removeClip(clip: BaseClip) {
    this.clips = this.clips.filter((c) => c.id !== clip.id);
  }
}
