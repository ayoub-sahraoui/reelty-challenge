"use client";

import React from "react";
import { observer } from "mobx-react-lite";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Upload, Video as VideoIcon, X, Play } from "lucide-react";
import { useEditorStore } from "@/lib/video-editor/hooks/use-editor-store";
import Draggable from "./ui/draggable";
import { ClipType } from "@/lib/video-editor/types";

const MyVideos = observer(() => {
  const store = useEditorStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const source = e.target?.result as string;
        if (source) {
          const { Media, ClipType } = require("@/lib/video-editor/types");
          const media = new Media(ClipType.Video, file.name, source);
          store.uploadMedia(media);
        }
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-sm font-semibold">My Videos</h1>
        <Button size="sm" variant="outline" onClick={handleUpload}>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
      <CardContent className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-200 flex-1 overflow-y-auto p-0 pt-4">
        {store.myVideos.length === 0 ? (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-4">
            <VideoIcon className="h-12 w-12 opacity-20" />
            <div className="text-center">
              <p className="text-sm font-medium">No videos yet</p>
              <p className="text-xs">Upload your first video to get started</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {store.myVideos.map((video) => (
              <Draggable key={video.id} type={ClipType.Video} data={video}>
                <div className="group bg-card hover:border-primary relative flex flex-col gap-2 rounded-lg border p-3 transition-all hover:shadow-md">
                  <div className="bg-muted relative flex h-20 items-center justify-center overflow-hidden rounded-md">
                    <video src={video.source} className="h-full w-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-6 w-6 text-white" fill="white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="truncate text-xs font-medium" title={video.name}>
                      {video.name}
                    </p>
                    <p className="text-muted-foreground text-[10px]">Video</p>
                  </div>
                  <button
                    onClick={() => store.deleteMedia(video)}
                    className="bg-destructive/10 hover:bg-destructive/20 absolute top-2 right-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    title="Delete video"
                  >
                    <X className="text-destructive h-3 w-3" />
                  </button>
                </div>
              </Draggable>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default MyVideos;
