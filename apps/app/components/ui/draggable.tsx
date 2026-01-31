import React from "react";
import { useDrag } from "react-dnd";

interface DraggableProps {
  children: React.ReactNode;
  item: any;
}

export default function Draggable({ children, item }: DraggableProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "media",
    item,
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
