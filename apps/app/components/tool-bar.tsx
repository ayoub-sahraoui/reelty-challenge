"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Hand, MousePointer2, Redo, Undo, Play, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";
import { useEditorStore } from "@/lib/video-editor/hooks/use-editor-store";
import { observer } from "mobx-react-lite";
import { trpc } from "@/api/client";

const ToolBar = observer(() => {
  const store = useEditorStore();
  const renderMutation = trpc.render.renderVideo.useMutation();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleRender = async () => {
    if (!store.video) {
      alert("Please create a video project first!");
      return;
    }

    // Check if there are any clips
    const totalClips = store.video.layers.reduce((sum, layer) => sum + layer.clips.length, 0);
    if (totalClips === 0) {
      alert("Please add at least one clip to your timeline before rendering!");
      return;
    }

    try {
      console.log("🎬 Starting render...");
      const renderProps = store.video.toRenderProps();

      // Detailed logging
      console.log("📊 Render props:", renderProps);
      console.log("📊 Layers:", renderProps.layers.length);
      renderProps.layers.forEach((layer, i) => {
        console.log(`  Layer ${i}:`, layer.name, `(${layer.clips.length} clips)`);
        layer.clips.forEach((clip, j) => {
          console.log(`    Clip ${j}:`, {
            type: clip.type,
            start: clip.start,
            end: clip.end,
            duration: clip.end - clip.start,
            source: clip.source?.substring(0, 100) + "...",
            text: clip.text,
          });
        });
      });

      const result = await renderMutation.mutateAsync({ props: renderProps });

      console.log("✅ Render complete!", result);

      // Construct download URL
      const RENDER_SERVER_URL =
        process.env.NEXT_PUBLIC_RENDER_SERVER_URL || "http://localhost:3001";
      const url = `${RENDER_SERVER_URL}/renders/${result.fileName}`;
      setDownloadUrl(url);

      // Auto-download
      const a = document.createElement("a");
      a.href = url;
      a.download = result.fileName;
      a.click();
    } catch (error) {
      console.error("❌ Render failed:", error);
      alert(`Render failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const isRendering = renderMutation.isPending;
  const hasVideo = !!store.video;

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-1 justify-between gap-4 p-2">
        <div className="flex items-center gap-2">
          {store.video && (
            <div className="text-sm">
              <span className="font-semibold">{store.video.name}</span>
              <span className="text-muted-foreground ml-2">
                {store.video.layers.length} layers •{" "}
                {store.video.layers.reduce((sum, l) => sum + l.clips.length, 0)} clips
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button size={"icon"} variant={"default"}>
            <MousePointer2 />
          </Button>
          <Button size={"icon"} variant={"outline"}>
            <Hand />
          </Button>
          <Separator orientation="vertical" />
          <Button size={"icon"} variant={"outline"}>
            <Undo />
          </Button>
          <Button size={"icon"} variant={"outline"}>
            <Redo />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {downloadUrl && renderMutation.isSuccess && (
            <a
              href={downloadUrl}
              download
              className="text-primary text-sm hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Video
            </a>
          )}
          <Button
            onClick={handleRender}
            disabled={isRendering || !hasVideo}
            variant={renderMutation.isError ? "destructive" : "default"}
          >
            <div className="flex items-center gap-2">
              {isRendering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Rendering...</span>
                </>
              ) : (
                <>
                  <Download />
                  <span>Export</span>
                </>
              )}
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ToolBar.displayName = "ToolBar";

export default ToolBar;
