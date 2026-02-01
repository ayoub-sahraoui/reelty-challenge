"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Play, Pause, SkipBack, SkipForward, Square } from "lucide-react";
import { useEditorStore } from "@/lib/video-editor/hooks/use-editor-store";
import { observer } from "mobx-react-lite";
import { VideoClip } from "@/lib/video-editor/models/clip/video-clip";
import { ImageClip } from "@/lib/video-editor/models/clip/image-clip";
import { TextClip } from "@/lib/video-editor/models/clip/text-clip";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

function replaceAnimationPlaceholder(animationData: any, text: string) {
  const jsonString = JSON.stringify(animationData);
  if (!jsonString.includes("{{content}}")) return animationData;
  const cloned = JSON.parse(jsonString);
  const replaceInObject = (obj: any): any => {
    if (typeof obj === "string") return obj.replace(/\{\{content\}\}/g, text);
    if (Array.isArray(obj)) return obj.map(replaceInObject);
    if (obj && typeof obj === "object") {
      const result: any = {};
      for (const key in obj) result[key] = replaceInObject(obj[key]);
      return result;
    }
    return obj;
  };
  return replaceInObject(cloned);
}

const LottieClipPlayer = observer(
  ({ clip, currentFrame, fps }: { clip: TextClip; currentFrame: number; fps: number }) => {
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    const frameInClip = currentFrame - clip.start;
    const isVisible = currentFrame >= clip.start && currentFrame < clip.end;

    const animationData = useMemo(() => {
      if (!clip.content) return null;
      return replaceAnimationPlaceholder(clip.content, clip.text || "Text");
    }, [clip.content, clip.text]);

    useEffect(() => {
      if (lottieRef.current && isVisible) {
        lottieRef.current.goToAndStop(frameInClip, true);
      }
    }, [frameInClip, isVisible]);

    if (!isVisible || !animationData) return null;

    return (
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 10 + clip.start }}
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={false}
          autoplay={false}
          className="h-full w-full"
          rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
        />
      </div>
    );
  }
);

const Preview = observer(() => {
  const store = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const mediaCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [scale, setScale] = useState(1);

  // Auto-fit stage to container
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !store.video) return;
      const { width: vidW, height: vidH } = store.video.resolution;
      const { clientWidth: contW, clientHeight: contH } = containerRef.current;

      const scaleW = contW / vidW;
      const scaleH = contH / vidH;
      const newScale = Math.min(scaleW, scaleH) * 0.95; // 95% to leave some padding
      setScale(newScale);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [store.video?.resolution]);

  // Draw current frame (Canvas for Video/Image only)
  const drawFrame = React.useCallback(() => {
    if (!canvasRef.current || !store.video) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = store.video.resolution;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    const currentFrame = store.currentFrame;

    const layers = [...store.video.layers].sort((a, b) => a.index - b.index);

    layers.forEach((layer) => {
      layer.clips.forEach((clip) => {
        if (currentFrame < clip.start || currentFrame >= clip.end) return;

        if (clip instanceof ImageClip) {
          renderImageClip(ctx, clip, width, height);
        } else if (clip instanceof VideoClip) {
          renderVideoClip(ctx, clip, width, height);
        }
      });
    });
  }, [store.video, store.currentFrame]);

  // Render image clip
  const renderImageClip = (
    ctx: CanvasRenderingContext2D,
    clip: ImageClip,
    width: number,
    height: number
  ) => {
    const imageUrl = clip.source?.content;
    if (!imageUrl) return;

    let img = mediaCache.current.get(imageUrl);

    if (!img) {
      img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      mediaCache.current.set(imageUrl, img);
      img.onload = () => drawFrame();
    }

    if (img.complete && img.naturalWidth > 0) {
      ctx.save();
      if (typeof clip.opacity === "number") {
        ctx.globalAlpha = clip.opacity;
      }
      drawImageToCanvas(ctx, img, width, height);
      ctx.restore();
    }
  };

  const drawImageToCanvas = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const imgAspect = img.width / img.height;
    const canvasAspect = canvasWidth / canvasHeight;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgAspect > canvasAspect) {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgAspect;
      offsetY = 0;
      offsetX = (canvasWidth - drawWidth) / 2;
    } else {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgAspect;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    }
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Render video clip
  const renderVideoClip = (
    ctx: CanvasRenderingContext2D,
    clip: VideoClip,
    width: number,
    height: number
  ) => {
    // Placeholder for video
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(`Video: ${clip.name}`, width / 2, height / 2);
  };

  // Playback loop
  useEffect(() => {
    if (!isPlaying || !store.video) return;

    const fps = store.video.fps;
    const frameInterval = 1000 / fps;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - lastTime;

      if (elapsed >= frameInterval) {
        lastTime = now - (elapsed % frameInterval);

        if (store.currentFrame < store.video!.durationInFrames - 1) {
          store.setCurrentFrame(store.currentFrame + 1);
        } else {
          setIsPlaying(false);
          store.setCurrentFrame(0);
        }
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, store]);

  // Redraw when frame changes
  useEffect(() => {
    drawFrame();
  }, [store.currentFrame, store.video?.layers, drawFrame]);

  // Handlers
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleStop = () => {
    setIsPlaying(false);
    store.setCurrentFrame(0);
  };
  const handleSkipBack = () => store.setCurrentFrame(Math.max(0, store.currentFrame - 10));
  const handleSkipForward = () =>
    store.video &&
    store.setCurrentFrame(Math.min(store.video.durationInFrames - 1, store.currentFrame + 10));

  if (!store.video) {
    return (
      <Card className="h-full w-full">
        <CardContent className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-4">
          <div className="text-muted-foreground text-center">
            <p className="text-lg">No video project</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full w-full flex-col">
      <CardContent className="relative flex flex-1 flex-col gap-2 overflow-hidden p-2">
        {/* Stage Container - centering wrapper */}
        <div
          ref={containerRef}
          className="relative flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-zinc-950"
        >
          {/* The Scaled Stage */}
          <div
            style={{
              width: store.video.resolution.width,
              height: store.video.resolution.height,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              position: "relative",
              backgroundColor: "#000",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
            }}
          >
            {/* 1. Base Canvas Layer */}
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0"
              style={{ width: "100%", height: "100%" }}
            />

            {/* 2. Text/Overlay Layer */}
            {store.video.layers.map((layer) =>
              layer.clips.map((clip) => {
                if (clip instanceof TextClip) {
                  return (
                    <LottieClipPlayer
                      key={clip.id}
                      clip={clip}
                      currentFrame={store.currentFrame}
                      fps={store.video?.fps || 30}
                    />
                  );
                }
                return null;
              })
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex shrink-0 flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs">
              {store.currentFrame} / {store.video.durationInFrames}
            </span>
            <input
              type="range"
              min="0"
              max={store.video.durationInFrames - 1}
              value={store.currentFrame}
              onChange={(e) => store.setCurrentFrame(parseInt(e.target.value))}
              className="flex-1"
            />
          </div>
          <div className="flex justify-center gap-2">
            <Button size="icon" variant="ghost" onClick={handleStop}>
              <Square className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleSkipBack}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={handleSkipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

Preview.displayName = "Preview";
export default Preview;
