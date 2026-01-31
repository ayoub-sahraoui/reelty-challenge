"use client";
import Sidebar from "@/components/sidebar";
import MediaLibrary from "@/components/media-library";
import Preview from "@/components/preview";
import Properties from "@/components/properties";
import Timeline from "@/components/timeline";
import ToolBar from "@/components/tool-bar";
import { Clapperboard } from "lucide-react";
import { VideoEditorProvider, useEditorStore } from "@/lib/video-editor/hooks/use-editor-store";
import { observer } from "mobx-react";
import CreateVideoDialog from "@/components/create-video-dialog";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const VideoEditor = observer(() => {
  const editorStore = useEditorStore();
  const { video } = editorStore;

  if (!video) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
        <Clapperboard size={120} />
        <h1 className="text-2xl font-bold">Create your first video</h1>
        <p>Start by adding media files to your library or creating a new project.</p>
        <div className="mt-4">
          <CreateVideoDialog />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar - spans full width of the content area */}
      <div className="bg-card p-1">
        <ToolBar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Media Library Panel */}
        <div className="bg-card w-80 p-1">
          <MediaLibrary />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Upper Workspace */}
          <div className="flex flex-1 overflow-hidden">
            {/* Center Stage: Preview */}
            <div className="bg-muted/10 flex flex-1 items-center justify-center overflow-hidden p-1">
              <Preview />
            </div>

            {/* Properties Panel */}
            <div className="bg-card w-80 p-1">
              <Properties />
            </div>
          </div>

          {/* Timeline Panel */}
          <div className="bg-card h-80 p-1">
            <Timeline />
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Home() {
  return (
    <DndProvider backend={HTML5Backend}>
      <VideoEditorProvider>
        <div className="bg-background text-foreground flex h-screen w-full overflow-hidden p-1">
          {/* Left Sidebar */}
          <div className="bg-card p-1">
            <Sidebar />
          </div>
          {/* Video Editor */}
          <VideoEditor />
        </div>
      </VideoEditorProvider>
    </DndProvider>
  );
}
