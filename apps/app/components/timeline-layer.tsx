import React from "react";
import LayerClip from "./layer-clip";
import { observer } from "mobx-react";
import { useEditorStore } from "@/lib/video-editor/hooks/use-editor-store";
import { Layer } from "@/lib/video-editor/models/layer";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

const TimelineLayer = observer(({ layer }: { layer: Layer }) => {
  const editorStore = useEditorStore();
  const video = editorStore.video;
  if (!video) return null;
  return (
    <div className="relative flex min-h-20 w-full rounded-lg bg-gray-200">
      {layer.clips.map((clip) => (
        <LayerClip key={clip.id} type={clip.getType()} duration={clip.durationInFrames} />
      ))}
      {/* layer name */}
      <div className="absolute top-1 left-1 flex items-center justify-center gap-2">
        <span className="text-xs text-gray-500">{layer.name}</span>
      </div>
      {/* delete layer */}
      <div className="absolute bottom-1 left-1 flex items-center justify-center">
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={() => editorStore.video?.removeLayer(layer)}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
});

export default TimelineLayer;
