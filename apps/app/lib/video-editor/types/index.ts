import { v4 as uuidv4 } from "uuid";

export enum ClipType {
  Video = "video",
  Audio = "audio",
  Image = "image",
  Text = "text",
}

export class Media {
  id: string;
  type: ClipType;
  name: string;
  source: string;

  constructor(type: ClipType, name: string, source: string, id?: string) {
    this.id = id || uuidv4();
    this.type = type;
    this.name = name;
    this.source = source;
  }
}
