export interface Adjustable {
  adjust(startFrame: number, endFrame: number): void;
  moveTo?(startFrame: number): void;
  trimStart?(newStartFrame: number): void;
  trimEnd?(newEndFrame: number): void;
}
