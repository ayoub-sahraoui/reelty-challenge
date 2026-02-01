"use client";

import { getClipWidth, GAP_BETWEEN_CLIPS, getConstrainedHeight } from "@/data/constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import StaticTextOverlay from "./static-text-overlay";
import { SAMPLE_VIDEOS } from "@/data/sample-videos";
import VideoClipCard from "./video-clip-card";
import { twMerge } from "tailwind-merge";
import { Button } from "./ui/button";
import Magnifier from "./magnifier";
import { Plus } from "lucide-react";
import TextDock from "./text-dock";
import { useEditorStore } from "@/lib/video-editor/hooks/use-editor-store";
import { trpc } from "@/api/client";
import VideoPreview from "./video-preview";

export default function tchVideoEditor() {
  const ratio: "portrait" | "landscape" = "portrait";
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const clipsScrollContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [textInput, setTextInput] = useState("");
  const [appliedText, setAppliedText] = useState("");
  const [selectedTextAnimation, setSelectedTextAnimation] = useState<string | null>(null);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [isTextActive, setIsTextActive] = useState(false);
  const [textStartPosition, setTextStartPosition] = useState(1);
  const [textClipCount, setTextClipCount] = useState(2);

  const [activeClips, setActiveClips] = useState(SAMPLE_VIDEOS);
  const [removedClips, setRemovedClips] = useState<typeof SAMPLE_VIDEOS>([]);

  const handleZoomChange = useCallback((newZoom: number) => setZoomLevel(newZoom), []);
  const { setZoom: setPinchZoom } = usePinchZoom({
    minZoom: 0.33,
    maxZoom: 2.22,
    sensitivity: 0.08,
    onZoomChange: handleZoomChange,
    containerRef,
  });

  useEffect(() => {
    setPinchZoom(zoomLevel);
  }, [zoomLevel, setPinchZoom]);

  const clipWidth = getClipWidth(ratio, zoomLevel);
  const constrainedHeight = getConstrainedHeight(ratio, zoomLevel);

  const handleApplyText = () => {
    if (textInput && selectedTextAnimation) {
      setAppliedText(textInput);
      setIsTextActive(true);
      setIsTextOpen(false);
    }
  };

  const handleResetText = () => {
    setTextInput("");
    setAppliedText("");
    setSelectedTextAnimation(null);
    setIsTextActive(false);
    setTextStartPosition(1);
    setTextClipCount(2);
  };

  const handleTextClick = () => setIsTextOpen(true);

  const handleRemoveClip = (id: string) => {
    const clip = activeClips.find((c) => c.id === id);
    if (clip) {
      setActiveClips(activeClips.filter((c) => c.id !== id));
      setRemovedClips([...removedClips, clip]);
    }
  };

  const handleAddClip = (id: string) => {
    const clip = removedClips.find((c) => c.id === id);
    if (clip) {
      setRemovedClips(removedClips.filter((c) => c.id !== id));
      setActiveClips([...activeClips, clip]);
    }
  };

  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden">
      <div className="shrink-0 p-6 md:px-8 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <p className="text-lg font-medium">Edit</p>
            </div>
            <div className="size-1.5 rounded-full bg-[#D9D9D9]" />
            <div className="flex items-center space-x-1">
              <p className="line-clamp-1">Squircle Studio</p>
            </div>
          </div>
          <div className="hidden md:flex">
            <Magnifier
              onZoomChange={handleZoomChange}
              initialZoom={zoomLevel}
              ratio={ratio}
              isLoading={false}
              externalZoom={zoomLevel}
            />
          </div>
        </div>
      </div>

      <TextDock
        isOpen={isTextOpen}
        setIsOpen={setIsTextOpen}
        textInput={textInput}
        setTextInput={setTextInput}
        selectedTextAnimation={selectedTextAnimation}
        setSelectedTextAnimation={setSelectedTextAnimation}
        onApplyText={handleApplyText}
        onReset={handleResetText}
        hasAppliedText={appliedText.trim().length > 0}
      />

      <div
        ref={containerRef}
        className="scrollbar scrollbar-w-1.5 scrollbar-thumb-[#E9E9E9] scrollbar-thumb-rounded-full scrollbar-hover:scrollbar-thumb-black relative flex flex-1 flex-col justify-center overflow-hidden overflow-y-auto rounded-3xl border border-[#F6F6F6] bg-white md:flex"
      >
        <StaticTextOverlay
          textContent={appliedText}
          startPosition={textStartPosition}
          duration={textClipCount}
          isActive={isTextActive}
          totalClips={activeClips.length}
          clipWidth={clipWidth}
          gap={GAP_BETWEEN_CLIPS}
          onClick={handleTextClick}
        />

        <div
          ref={clipsScrollContainerRef}
          className={twMerge(
            "scrollbar scrollbar-h-1.5 scrollbar-thumb-[#E9E9E9] scrollbar-thumb-rounded-full scrollbar-hover:scrollbar-thumb-black mx-6 mb-2.5 overflow-x-auto pt-10 pb-6",
            isTextOpen && "opacity-10"
          )}
        >
          <div className="flex w-full items-center gap-4">
            {activeClips.map((video, index) => (
              <VideoClipCard
                key={video.id}
                id={video.id}
                videoUrl={video.url}
                ratio={ratio}
                height={constrainedHeight}
                index={index}
                isRemoved={false}
                onRemove={handleRemoveClip}
                onAdd={handleAddClip}
              />
            ))}
            {removedClips.length > 0 && (
              <div className="mx-4">
                <div
                  className={twMerge(
                    "flex size-11 items-center justify-center rounded-lg border",
                    "border-[#EDEDED] bg-[#FBFBFB] shadow-md"
                  )}
                >
                  <Plus size={24} className="text-[#A3A3A3] duration-300" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 p-6 md:px-8 md:py-4">
        <div className="flex items-center justify-end gap-2">
          <VideoPreview />
          <RenderButton />
        </div>
      </div>
    </div>
  );
}

function RenderButton() {
  const store = useEditorStore();
  const renderMutation = trpc.render.renderVideo.useMutation();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleRender = async () => {
    if (!store.video) {
      console.error("No video to render");
      return;
    }

    try {
      console.log("🎬 Starting render...");
      const renderProps = store.video.toRenderProps();

      const result = await renderMutation.mutateAsync({ props: renderProps });

      console.log("✅ Render complete!", result);

      // Construct download URL
      const RENDER_SERVER_URL =
        process.env.NEXT_PUBLIC_RENDER_SERVER_URL || "http://localhost:3001";
      const url = `${RENDER_SERVER_URL}/renders/${result.fileName}`;
      setDownloadUrl(url);
    } catch (error) {
      console.error("❌ Render failed:", error);
    }
  };

  const isRendering = renderMutation.isPending;
  const hasError = renderMutation.isError;
  const isSuccess = renderMutation.isSuccess;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {downloadUrl && isSuccess && (
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
          disabled={isRendering || !store.video}
          className="min-w-[120px]"
          variant={hasError ? "destructive" : "default"}
        >
          {isRendering ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Rendering...
            </span>
          ) : hasError ? (
            "Render Failed"
          ) : isSuccess ? (
            "Render Again"
          ) : (
            "Render Video"
          )}
        </Button>
      </div>
      {hasError && (
        <p className="text-destructive text-xs">
          {renderMutation.error?.message || "Render failed. Please try again."}
        </p>
      )}
      {isSuccess && <p className="text-xs text-green-600">✅ Video rendered successfully!</p>}
    </div>
  );
}
