"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
import { DeleteProject } from "./delete-project";
import { toast } from "sonner";

interface ProjectDrawerProps {
  project?: Project & { categories: RankingCategory[] };
  trigger: React.ReactNode;
}

export function ProjectDrawer({ project, trigger }: ProjectDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [open]);

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
      try {
        if (project) {
          await updateProject(project.id, values);
        } else {
          await createProject(values);
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
          <DrawerTitle>
            {project ? "Edit ranked list" : "Create ranked list"}
          </DrawerTitle>
          <DrawerDescription className="row-start-2">
            {project
              ? `Editing ${project.name}`
              : "Add a new project with categories"}
          </DrawerDescription>
          {project && (
            <DeleteProject
              className="col-start-2 row-span-2"
              projectId={project.id}
            />
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
                      <Input placeholder="Project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <fieldset role="group" className="space-y-4">
                <FormLabel id="categories-label" htmlFor={undefined} asChild>
                  <legend>Categories</legend>
                </FormLabel>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`categories.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="grid flex-1 grid-cols-[1fr_auto] gap-y-2 space-y-0">
                        <FormLabel className="sr-only">
                          Category {index + 1}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Category name" {...field} />
                        </FormControl>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={() => remove(index)}
                            aria-label={`Remove category ${index + 1}`}
                            className="ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <FormMessage className="col-span-2" />
                      </FormItem>
                    )}
                  />
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
              </fieldset>
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
