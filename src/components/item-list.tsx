"use client";

import { Edit, Grip } from "lucide-react";
import { cn } from "~/lib/utils";
import { type ItemRanking, type Item } from "~/server/db/schema";
import { ItemDrawer } from "./item-drawer";
import { buttonVariants, Button } from "./ui/button";
import { handleEnd as coreHandleEnd } from "@formkit/drag-and-drop";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { useCallback } from "react";
import { reorderItems } from "~/server/actions/items";
import { toast } from "sonner";

export default function ItemList({
  rankings,
}: {
  rankings: (ItemRanking & { item: Item })[];
}) {
  const [parentRef, values] = useDragAndDrop<
    HTMLDivElement,
    ItemRanking & { item: Item }
  >(rankings, {
    dragHandle: ".drag-handle",
    synthDraggingClass: "bg-transparent opacity-80",
    synthDropZoneClass: "outline-2 outline-dashed outline-current rounded-md",
    nativeDrag: false,
    handleEnd: (data) => {
      coreHandleEnd(data);
      void handleUpdateList(
        values.map((v) => ({
          categoryId: v.categoryId,
          itemId: v.itemId,
          projectId: v.item.projectId,
        })),
      );
    },
  });

  const handleUpdateList = useCallback(
    async (
      values: {
        categoryId: string;
        itemId: string;
        projectId: string;
      }[],
    ) => {
      try {
        await reorderItems(values);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to reorder items");
        }
      }
    },
    [],
  );

  return (
    <div ref={parentRef} className="flex flex-col gap-3">
      {values.map((ranking, index) => (
        <div
          className="ml-[-.75rem] flex items-center gap-2 pl-2"
          key={ranking.itemId}
          data-label={ranking.itemId}
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
            {index + 1}
          </span>
          <span className="flex min-w-0 flex-1 gap-[1px]">
            <span
              className={cn(
                buttonVariants({
                  variant: "secondary",
                  size: "sm",
                }),
                "min-w-0 flex-1 justify-start rounded-br-none rounded-tr-none hover:bg-secondary",
              )}
            >
              <span className="flex-1 truncate">{ranking.item.name}</span>
              <span className="drag-handle">
                <Grip />
              </span>
            </span>
            <ItemDrawer
              projectId={ranking.item.projectId}
              categoryId={ranking.categoryId}
              itemRanking={ranking}
              trigger={
                <Button
                  aria-label="Edit item"
                  size="sm"
                  variant="secondary"
                  className="rounded-bl-none rounded-tl-none"
                >
                  <Edit />
                </Button>
              }
            />
          </span>
        </div>
      ))}
    </div>
  );
}
