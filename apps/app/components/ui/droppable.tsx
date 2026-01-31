import React from "react";
import { useDrop } from "react-dnd";

interface DroppableProps {
  children: React.ReactNode;
  onDrop: (id: string) => void;
}

export default function Droppable({ children, onDrop }: DroppableProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "media",
    drop: (item: { id: string }) => onDrop(item.id),
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
