import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useEditorStore } from "@/lib/video-editor/hooks/use-editor-store";
import { observer } from "mobx-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClipType } from "@/lib/video-editor/types";
import { VideoClip } from "@/lib/video-editor/models/clip/video-clip";
import { TextClip } from "@/lib/video-editor/models/clip/text-clip";
import { AudioClip } from "@/lib/video-editor/models/clip/audio-clip";

const Properties = observer(() => {
  const editorStore = useEditorStore();
  const clip = editorStore.currentClip;

  if (!clip) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full flex-1 flex-col gap-2 p-4">
          <h1 className="text-sm font-semibold">Properties</h1>
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Select a clip to view properties
          </div>
        </CardContent>
      </Card>
    );
  }

  const clipType = clip.getType();

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-1 flex-col gap-4 overflow-y-auto p-4">
        <h1 className="text-sm font-semibold">Properties</h1>

        {/* Common Properties */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="clip-name" className="text-xs">
              Name
            </Label>
            <Input
              id="clip-name"
              value={clip.name}
              onChange={(e) => {
                clip.name = e.target.value;
              }}
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="clip-start" className="text-xs">
                Start Frame
              </Label>
              <Input
                id="clip-start"
                type="number"
                value={clip.start}
                readOnly
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clip-end" className="text-xs">
                End Frame
              </Label>
              <Input
                id="clip-end"
                type="number"
                value={clip.end}
                readOnly
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clip-duration" className="text-xs">
              Duration (frames)
            </Label>
            <Input
              id="clip-duration"
              type="number"
              value={clip.durationInFrames}
              readOnly
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Video Clip Properties */}
        {clipType === ClipType.Video && clip instanceof VideoClip && (
          <div className="space-y-3 border-t pt-3">
            <h2 className="text-xs font-semibold">Video Properties</h2>

            <div className="space-y-1.5">
              <Label htmlFor="clip-volume" className="text-xs">
                Volume
              </Label>
              <Input
                id="clip-volume"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={clip.volume}
                onChange={(e) => clip.setVolume(parseFloat(e.target.value))}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clip-opacity" className="text-xs">
                Opacity
              </Label>
              <Input
                id="clip-opacity"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={clip.opacity}
                onChange={(e) => clip.setOpacity(parseFloat(e.target.value))}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clip-speed" className="text-xs">
                Speed
              </Label>
              <Input
                id="clip-speed"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={clip.speed}
                onChange={(e) => clip.setSpeed(parseFloat(e.target.value))}
                className="h-8 text-xs"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="clip-muted"
                type="checkbox"
                checked={clip.isMuted}
                onChange={(e) => clip.setIsMuted(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="clip-muted" className="text-xs">
                Muted
              </Label>
            </div>
          </div>
        )}

        {/* Audio Clip Properties */}
        {clipType === ClipType.Audio && clip instanceof AudioClip && (
          <div className="space-y-3 border-t pt-3">
            <h2 className="text-xs font-semibold">Audio Properties</h2>

            <div className="space-y-1.5">
              <Label htmlFor="clip-volume" className="text-xs">
                Volume
              </Label>
              <Input
                id="clip-volume"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={clip.volume}
                onChange={(e) => clip.setVolume(parseFloat(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>
        )}

        {/* Text Clip Properties */}
        {clipType === ClipType.Text && clip instanceof TextClip && (
          <div className="space-y-3 border-t pt-3">
            <h2 className="text-xs font-semibold">Text Properties</h2>

            <div className="space-y-1.5">
              <Label htmlFor="clip-text" className="text-xs">
                Text Content
              </Label>
              <Input
                id="clip-text"
                value={clip.text}
                onChange={(e) => clip.setText(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            {clip.animationKey && (
              <div className="space-y-1.5">
                <Label className="text-xs">Animation</Label>
                <div className="rounded border bg-muted px-2 py-1 text-xs">
                  {clip.animationKey}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default Properties;
