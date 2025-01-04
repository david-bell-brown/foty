import { z } from "zod";

export const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categories: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Category name is required"),
        orderIndex: z.number().optional(),
      }),
    )
    .min(1, "At least one category is required"),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
