import { createContext, useContext, useState } from "react";
import { VideoEditorStore } from "../stores/video-editor-store";

const VideoEditorContext = createContext<VideoEditorStore | null>(null);

export const VideoEditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [store] = useState(() => new VideoEditorStore());
  return <VideoEditorContext.Provider value={store}>{children}</VideoEditorContext.Provider>;
};

export function useEditorStore() {
  const context = useContext(VideoEditorContext);
  if (!context) {
    throw new Error("useEditorStore must be used within a VideoEditorProvider");
  }
  return context;
}
