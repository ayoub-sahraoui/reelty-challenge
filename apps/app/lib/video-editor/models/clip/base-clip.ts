import { ClipType } from "../../types";
import { Source } from "../source";
import { Adjustable } from "./adjustable";

export interface BaseClip extends Adjustable {
  id: string;
  name: string;
  start: number;
  end: number;
  durationInFrames: number;
  source?: Source;

  getType(): ClipType;
}
