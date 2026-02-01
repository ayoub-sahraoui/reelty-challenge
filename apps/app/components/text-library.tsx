"use client";

import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Card, CardContent } from "./ui/card";
import { useEditorStore } from "@/lib/video-editor/hooks/use-editor-store";
import Draggable from "./ui/draggable";
import { ClipType, Media } from "@/lib/video-editor/types";
import { trpc } from "@/api/client";
import Lottie from "lottie-react";
import { twMerge } from "tailwind-merge";

function replaceAnimationPlaceholder(animationData: any, text: string) {
  const jsonString = JSON.stringify(animationData);
  if (!jsonString.includes("{{content}}")) return animationData;
  const cloned = structuredClone
    ? structuredClone(animationData)
    : JSON.parse(JSON.stringify(animationData));
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

const AnimatedTemplateItem = ({
  template,
}: {
  template: { id: string; key: string; name: string; content?: unknown };
}) => {
  const animationData = useMemo(() => {
    if (!template.content) return null;
    return replaceAnimationPlaceholder(template.content, "Text"); // Default preview text
  }, [template.content]);

  if (!template.content || !animationData) return null;

  // Create a Media object for dragging
  // We store the animation key and default text in the source
  const media = new Media(
    ClipType.Text,
    template.name,
    JSON.stringify({
      text: "New Text",
      animationKey: template.key,
      content: template.content,
    }),
    template.id
  );

  return (
    <Draggable type={ClipType.Text} data={media}>
      <div className="group bg-card relative flex cursor-grab flex-col gap-2 rounded-xl border p-2 transition-all hover:border-[#8E2DF6] hover:shadow-md active:cursor-grabbing">
        <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-[#F5F5F5] bg-[#A3A3A3]">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            className="h-full w-full scale-[130%] object-cover"
          />
        </div>
        <div className="flex items-center justify-between px-1">
          <p className="line-clamp-1 text-xs font-medium text-zinc-700">{template.name}</p>
        </div>
      </div>
    </Draggable>
  );
};

const TextLibrary = observer(() => {
  const { data: templates, isLoading, error } = trpc.textTemplates.getAll.useQuery();

  return (
    <Card className="flex h-full flex-col overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-sm font-semibold">Animated Text Library</h1>
      </div>

      <CardContent className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-200 flex-1 overflow-y-auto p-0">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center p-4 text-center text-xs text-red-500">
            Failed to load templates.
          </div>
        )}

        {templates && (
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <AnimatedTemplateItem key={template.key} template={template} />
            ))}
          </div>
        )}

        {!isLoading && !error && (!templates || templates.length === 0) && (
          <div className="mt-10 text-center text-xs text-zinc-500">No templates found.</div>
        )}
      </CardContent>
    </Card>
  );
});

TextLibrary.displayName = "TextLibrary";

export default TextLibrary;
