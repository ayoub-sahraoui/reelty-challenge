import React from "react";
import LayerClip from "./layer-clip";
import { observer } from "mobx-react";
import { useEditorStore } from "@/lib/video-editor/hooks/use-editor-store";
import { Layer } from "@/lib/video-editor/models/layer";

const TimelineLayer = observer(({ layer }: { layer: Layer }) => {
  const editorStore = useEditorStore();
  const video = editorStore.video;
  if (!video) return null;
  const handleLayerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    editorStore.setCurrentLayer(layer);
  };

  const isSelected = editorStore.currentLayer?.id === layer.id;

  return (
    <div
      onClick={handleLayerClick}
      className={`relative flex min-h-20 w-full overflow-visible border-b py-2 transition-colors ${
        isSelected ? "border-blue-200 bg-blue-100" : "border-gray-200 bg-gray-100"
      }`}
    >
      {layer.clips.map((clip) => (
        <LayerClip key={clip.id} clip={clip} />
      ))}
      {/* layer name */}
      <div className="pointer-events-none absolute top-1 left-1 z-10 flex items-center justify-center gap-2 font-semibold">
        <span className={`text-xs ${isSelected ? "text-blue-600" : "text-gray-500"}`}>
          {layer.name}
        </span>
      </div>
    </div>
  );
});

export default TimelineLayer;
