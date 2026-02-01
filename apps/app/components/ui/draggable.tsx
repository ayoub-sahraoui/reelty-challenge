import { ClipType } from "@/lib/video-editor/types";
import React from "react";
import { useDrag } from "react-dnd";

interface DraggableProps {
  children: React.ReactNode;
  type: ClipType;
  data: any;
}

export default function Draggable({ children, type, data }: DraggableProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "media",
    item: { type, data },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const opacity = isDragging ? 0.4 : 1;
  return (
    <div ref={drag} style={{ opacity }}>
      {children}
    </div>
  );
}
