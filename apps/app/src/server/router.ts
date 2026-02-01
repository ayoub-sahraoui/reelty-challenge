import { createRouter } from "./trpc";
import { textTemplatesRouter } from "./routers/text-templates";
import { videoRouter } from "./routers/video";
import { renderRouter } from "./routers/render";

export const router = createRouter({
  textTemplates: textTemplatesRouter,
  video: videoRouter,
  render: renderRouter,
});

export type Router = typeof router;
