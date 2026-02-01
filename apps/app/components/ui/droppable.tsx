import { ClipType } from "@/lib/video-editor/types";
import React from "react";
import { useDrop } from "react-dnd";

interface DroppableProps {
  children: React.ReactNode;
  onDrop: (item: DropItem) => void;
}

export interface DropItem {
  type: ClipType;
  data: any;
}

export default function Droppable({ children, onDrop }: DroppableProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "media",
    drop: (item: DropItem) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const opacity = isOver ? 0.4 : 1;
  return (
    <div ref={drop} style={{ opacity }}>
      {children}
    </div>
  );
}
