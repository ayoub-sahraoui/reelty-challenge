/**
 * Frame-based utility functions for video editing
 * All durations and positions should be stored as frames for precision
 */

import { PIXELS_PER_FRAME } from "./constants";

/**
 * Convert frames to seconds
 */
export function framesToSeconds(frames: number, fps: number): number {
  return frames / fps;
}

/**
 * Convert seconds to frames (rounded to nearest frame)
 */
export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}

/**
 * Convert frames to pixels for timeline rendering
 */
export function framesToPixels(frames: number): number {
  return frames * PIXELS_PER_FRAME;
}

/**
 * Convert pixels to frames for timeline interaction
 */
export function pixelsToFrames(pixels: number): number {
  return Math.round(pixels / PIXELS_PER_FRAME);
}

/**
 * Format frames as MM:SS time display
 */
export function formatFramesAsTime(frames: number, fps: number): string {
  const totalSeconds = framesToSeconds(frames, fps);
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format frames as HH:MM:SS:FF (hours:minutes:seconds:frames)
 */
export function formatFramesAsTimecode(frames: number, fps: number): string {
  const totalSeconds = Math.floor(frames / fps);
  const remainingFrames = frames % fps;
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${Math.floor(remainingFrames).toString().padStart(2, "0")}`;
}

/**
 * Clamp a frame value to valid range
 */
export function clampFrame(frame: number, minFrame: number, maxFrame: number): number {
  return Math.max(minFrame, Math.min(maxFrame, Math.round(frame)));
}

/**
 * Check if a frame is within a clip's range
 */
export function isFrameInRange(frame: number, startFrame: number, endFrame: number): boolean {
  return frame >= startFrame && frame < endFrame;
}

/**
 * Calculate the overlap between two frame ranges
 * Returns null if there's no overlap
 */
export function getFrameRangeOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): { start: number; end: number; duration: number } | null {
  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);

  if (overlapStart >= overlapEnd) {
    return null;
  }

  return {
    start: overlapStart,
    end: overlapEnd,
    duration: overlapEnd - overlapStart,
  };
}
