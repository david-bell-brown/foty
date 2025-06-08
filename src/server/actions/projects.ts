"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  projects,
  rankingCategories,
  items,
  itemRankings,
} from "~/server/db/schema";
import { type ProjectFormValues } from "~/lib/schemas";
import { ratelimit } from "../ratelimit";

export async function createProject(values: ProjectFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const { success } = await ratelimit.limit(session.user.id);

  if (!success) {
    return { error: "Rate limited" };
  }

  const [project] = await db
    .insert(projects)
    .values({
      name: values.name,
      userId: session.user.id,
    })
    .returning();

  if (!project) {
    return { error: "Failed to create project" };
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
    return { error: "Unauthorized" };
  }

  const { success } = await ratelimit.limit(session.user.id);

  if (!success) {
    return { error: "Rate limited" };
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
    return { error: "Unauthorized" };
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
    const newCategories = await db
      .insert(rankingCategories)
      .values(
        categoriesToInsert.map((cat) => ({
          name: cat.name,
          projectId: id,
          orderIndex: cat.orderIndex,
          userId: session.user.id,
        })),
      )
      .returning();

    // Get all existing items for this project
    const existingItems = await db.query.items.findMany({
      where: eq(items.projectId, id),
    });

    // Create rankings for each item in the new categories
    const newRankings = existingItems.flatMap((item) =>
      newCategories.map((category) => ({
        itemId: item.id,
        categoryId: category.id,
        userId: session.user.id,
        notes: null,
        rank: 0,
      })),
    );

    if (newRankings.length > 0) {
      await db.insert(itemRankings).values(newRankings);
    }
  }

  revalidatePath(`/projects/${id}`);
  return { data: { id } };
}

export async function deleteProject(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const { success } = await ratelimit.limit(session.user.id);

  if (!success) {
    return { error: "Rate limited" };
  }

  await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, session.user.id)));

  revalidatePath("/");
  redirect("/");
}
