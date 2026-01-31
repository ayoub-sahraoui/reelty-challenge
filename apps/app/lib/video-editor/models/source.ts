import { v4 as uuidv4 } from "uuid";

export class Source {
  id: string;
  name: string;
  content: string;
  constructor(name: string, content: string) {
    this.id = uuidv4();
    this.name = name;
    this.content = content;
  }
}
