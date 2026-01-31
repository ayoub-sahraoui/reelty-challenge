import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Properties() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-1 flex-col gap-2 p-4">
        <h1 className="text-sm font-semibold">Properties</h1>
        <div className="flex flex-1 gap-2"></div>
      </CardContent>
    </Card>
  );
}
