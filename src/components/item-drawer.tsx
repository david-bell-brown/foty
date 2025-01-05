"use client";

import { useState, useTransition } from "react";
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
// import { Textarea } from "~/components/ui/textarea";
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

interface ItemDrawerProps {
  projectId: string;
  categoryId: string;
  itemRanking?: ItemRanking & { item: Item };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ItemDrawer({
  projectId,
  categoryId,
  itemRanking,
  trigger,
}: ItemDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

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
      if (item) {
        await updateItem(item.id, values);
      } else {
        await createItem(values);
      }
      setOpen(false);
    });
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DrawerHeader>
              <DrawerTitle>{item ? "Edit item" : "Add new item"}</DrawerTitle>
              <DrawerDescription>
                {item ? `Editing ${item.name}` : "Add a new item to rank"}
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-5 p-4 pt-0">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
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
