import express from "express";
import cors from "cors";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { RenderProps } from "../types/render-props";
import path from "path";
import fs from "fs";

const PORT = Number(process.env.PORT) || 3001;
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" })); // For data URLs

// Ensure renders directory exists
const RENDERS_DIR = path.join(process.cwd(), "renders");
if (!fs.existsSync(RENDERS_DIR)) {
  fs.mkdirSync(RENDERS_DIR, { recursive: true });
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "render-server" });
});

app.post("/api/render", async (req, res) => {
  try {
    const { props } = req.body as { props: RenderProps };

    if (!props || !props.video) {
      return res.status(400).json({ error: "Invalid render props" });
    }

    console.log("🎬 Starting render for:", props.video.name);
    console.log("📊 Video specs:", {
      fps: props.video.fps,
      resolution: `${props.video.width}x${props.video.height}`,
      duration: `${props.video.durationInFrames} frames`,
      layers: props.layers.length,
      totalClips: props.layers.reduce((sum, l) => sum + l.clips.length, 0),
    });

    console.log("📦 Bundling Remotion project...");
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), "remotion", "index.ts"),
      webpackOverride: (config) => config,
    });
    console.log("✅ Bundle complete:", bundleLocation);

    console.log("🎯 Selecting composition...");
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "VideoEditor",
      inputProps: { props }, // Wrap props here too!
    });
    console.log("✅ Composition selected:", composition.id);

    const outputFileName = `render-${Date.now()}.mp4`;
    const outputPath = path.join(RENDERS_DIR, outputFileName);

    console.log("🎥 Rendering video...");
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: { props },
      onProgress: ({ progress, renderedFrames, encodedFrames }) => {
        const percent = (progress * 100).toFixed(1);
        console.log(
          `⏳ Progress: ${percent}% (${renderedFrames}/${composition.durationInFrames} frames rendered, ${encodedFrames} encoded)`
        );
      },
    });

    console.log("✅ Render complete!");
    console.log("📁 Output:", outputPath);

    res.json({
      success: true,
      outputPath,
      fileName: outputFileName,
      specs: {
        fps: composition.fps,
        width: composition.width,
        height: composition.height,
        durationInFrames: composition.durationInFrames,
      },
    });
  } catch (error) {
    console.error("❌ Render error:", error);
    res.status(500).json({
      error: "Render failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.use("/renders", express.static(RENDERS_DIR));

app.listen(PORT, () => {
  console.info(`🚀 Render server running on port ${PORT}`);
  console.info(`📁 Renders directory: ${RENDERS_DIR}`);
});
