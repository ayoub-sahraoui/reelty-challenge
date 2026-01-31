import { v4 as uuidv4 } from "uuid";
import { Layer } from "./layer";
import { makeAutoObservable } from "mobx";

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

  changeLayerIndex(layer: Layer, index: number) {
    this.layers = this.layers.map((l) => {
      if (l.id === layer.id) {
        l.index = index;
      }
      return l;
    });
  }
}
