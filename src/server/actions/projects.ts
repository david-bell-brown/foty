"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { projects, rankingCategories } from "~/server/db/schema";
import { type ProjectFormValues } from "~/lib/schemas";

export async function createProject(values: ProjectFormValues) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const [project] = await db
    .insert(projects)
    .values({
      name: values.name,
      userId: session.user.id,
    })
    .returning();

  if (!project) {
    throw new Error("Failed to create project");
  }

  await db.insert(rankingCategories).values(
    values.categories.map((cat, index) => ({
      name: cat.name,
      projectId: project.id,
      orderIndex: index,
      userId: session.user.id,
    })),
  );

  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(id: string, values: ProjectFormValues) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const existingProject = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      rankingCategories: {
        orderBy: rankingCategories.orderIndex,
      },
    },
  });

  if (!existingProject || existingProject.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Update project details
  await db
    .update(projects)
    .set({
      name: values.name,
    })
    .where(eq(projects.id, id));

  // Create a map of existing categories by name for easy lookup
  const existingCategoriesMap = new Map(
    existingProject.rankingCategories.map((cat) => [cat.name, cat]),
  );

  // Separate categories into updates and inserts
  const categoriesToUpdate: typeof values.categories = [];
  const categoriesToInsert: typeof values.categories = [];

  values.categories.forEach((cat, index) => {
    const existing = existingCategoriesMap.get(cat.name);
    if (existing) {
      categoriesToUpdate.push({
        ...cat,
        id: existing.id,
        orderIndex: index,
      });
      existingCategoriesMap.delete(cat.name);
    } else {
      categoriesToInsert.push({
        ...cat,
        orderIndex: index,
      });
    }
  });

  // Delete categories that are no longer present
  const categoriesToDelete = Array.from(existingCategoriesMap.values());
  if (categoriesToDelete.length > 0) {
    await db.delete(rankingCategories).where(
      inArray(
        rankingCategories.id,
        categoriesToDelete.map((cat) => cat.id),
      ),
    );
  }

  // Update existing categories
  if (categoriesToUpdate.length > 0) {
    await Promise.all(
      categoriesToUpdate.map((cat) =>
        db
          .update(rankingCategories)
          .set({
            name: cat.name,
            orderIndex: cat.orderIndex,
          })
          .where(eq(rankingCategories.id, cat.id!)),
      ),
    );
  }

  // Insert new categories
  if (categoriesToInsert.length > 0) {
    await db.insert(rankingCategories).values(
      categoriesToInsert.map((cat) => ({
        name: cat.name,
        projectId: id,
        orderIndex: cat.orderIndex,
        userId: session.user.id,
      })),
    );
  }

  revalidatePath(`/projects/${id}`);
}
