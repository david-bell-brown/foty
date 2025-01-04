"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { type Project, type RankingCategory } from "~/server/db/schema";
import { projectFormSchema, type ProjectFormValues } from "~/lib/schemas";
import { createProject, updateProject } from "~/server/actions/projects";

interface ProjectDrawerProps {
  project?: Project & { categories: RankingCategory[] };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProjectDrawer({ project, trigger }: ProjectDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name ?? "",
      categories: project?.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        orderIndex: cat.orderIndex,
      })) ?? [{ name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "categories",
    control: form.control,
  });

  function onSubmit(values: ProjectFormValues) {
    startTransition(async () => {
      if (project) {
        await updateProject(project.id, values);
      } else {
        await createProject(values);
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
              <DrawerTitle>
                {project ? "Edit ranked list" : "Create ranked list"}
              </DrawerTitle>
              <DrawerDescription className="">
                {project
                  ? `Editing ${project.name}`
                  : "Add a new project with categories"}
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
                      <Input placeholder="Project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Categories</FormLabel>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`categories.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Category name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: "" })}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add category
                </Button>
              </div>
            </div>

            <DrawerFooter>
              <Button type="submit" disabled={isPending}>
                {project ? "Save changes" : "Create project"}
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
