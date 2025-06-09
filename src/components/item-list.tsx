"use client";

import { Edit, Grip } from "lucide-react";
import { cn } from "~/lib/utils";
import { type ItemRanking, type Item } from "~/server/db/schema";
import { ItemDrawer } from "./item-drawer";
import { buttonVariants, Button } from "./ui/button";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { useCallback, useEffect } from "react";
import { reorderItems } from "~/server/actions/items";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import styles from "./item-list.module.css";

export default function ItemList({
  rankings,
}: {
  rankings: (ItemRanking & { item: Item })[];
}) {
  const router = useRouter();

  const [parentRef, values, setValues] = useDragAndDrop<
    HTMLDivElement,
    ItemRanking & { item: Item }
  >(rankings, {
    dragHandle: ".drag-handle",
    synthDraggingClass: styles.dragging,
    dragPlaceholderClass:
      "opacity-30 outline-2 outline-dashed outline-current rounded-md",
    synthDragPlaceholderClass:
      "opacity-30 outline-2 outline-dashed outline-current rounded-md",
    onDragend: () => {
      void handleUpdateList(values);
    },
  });

  const handleUpdateList = useCallback(
    async (values: (ItemRanking & { item: Item })[]) => {
      const result = await reorderItems(
        values.map((v) => ({
          categoryId: v.categoryId,
          itemId: v.itemId,
          projectId: v.item.projectId,
        })),
      );
      if (result.error) {
        toast.error(result.error);
      }
      router.refresh();
    },
    [router],
  );

  useEffect(() => {
    setValues(rankings);
  }, [rankings, setValues]);

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
          <span className="flex min-w-0 flex-1 gap-[1px] rounded-md">
            <span
              className={cn(
                buttonVariants({
                  variant: "secondary",
                  size: "sm",
                }),
                "drag-handle min-w-0 flex-1 cursor-grab justify-start gap-0 rounded-br-none rounded-tr-none pr-0 hover:bg-secondary",
              )}
            >
              <span className="flex-1 truncate">{ranking.item.name}</span>
              <span className="flex h-9 items-center justify-center px-3">
                <Grip className="size-4" />
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
