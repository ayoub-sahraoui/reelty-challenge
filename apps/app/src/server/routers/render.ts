import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";

const RENDER_SERVER_URL = process.env.RENDER_SERVER_URL || "http://localhost:3001";

export const renderRouter = createRouter({
  renderVideo: publicProcedure
    .input(
      z.object({
        props: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${RENDER_SERVER_URL}/api/render`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ props: input.props }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Render failed");
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("Render error:", error);
        throw error;
      }
    }),

  checkHealth: publicProcedure.query(async () => {
    try {
      const response = await fetch(`${RENDER_SERVER_URL}/health`);
      const data = await response.json();
      return { ...data, connected: true };
    } catch (error) {
      return { connected: false, error: String(error) };
    }
  }),
});
