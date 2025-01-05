"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { type ItemRanking, type Item } from "~/server/db/schema";
import { itemFormSchema, type ItemFormValues } from "~/lib/schemas";
import { createItem, updateItem } from "~/server/actions/items";
import { Textarea } from "./ui/textarea";
import { DeleteItem } from "./delete-item";
import { toast } from "sonner";

interface ItemDrawerProps {
  projectId: string;
  categoryId: string;
  itemRanking?: ItemRanking & { item: Item };
  trigger: React.ReactNode;
}

export function ItemDrawer({
  projectId,
  categoryId,
  itemRanking,
  trigger,
}: ItemDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [open]);

  const { item, ...ranking } = itemRanking ?? { notes: null };

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: item?.name ?? "",
      notes: ranking?.notes ?? "",
      projectId: projectId,
      categoryId: categoryId,
    },
  });

  function onSubmit(values: ItemFormValues) {
    startTransition(async () => {
      try {
        if (item) {
          await updateItem(item.id, values);
        } else {
          await createItem(values);
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to save item");
        }
      } finally {
        form.reset();
        setOpen(false);
      }
    });
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        <DrawerHeader className="grid-flow-col grid-cols-[1fr_auto]">
          <DrawerTitle>{item ? "Edit item" : "Add new item"}</DrawerTitle>
          <DrawerDescription className="row-start-2">
            {item ? `Editing ${item.name}` : "Add a new item to rank"}
          </DrawerDescription>
          {item && (
            <DeleteItem className="col-start-2 row-span-2" itemId={item.id} />
          )}
        </DrawerHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-5 p-4 pt-0">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl ref={nameInputRef}>
                      <Input placeholder="Item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes for this ranking (optional"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DrawerFooter>
              <Button type="submit" disabled={isPending}>
                {item ? "Save changes" : "Add item"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
