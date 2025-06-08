"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { items, itemRankings, rankingCategories } from "~/server/db/schema";
import { type ItemFormValues } from "~/lib/schemas";
import { getItem, getProject } from "../queries";
import { ratelimit } from "../ratelimit";

export async function createItem(values: ItemFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const { success } = await ratelimit.limit(session.user.id);

  if (!success) {
    return { error: "Rate limited" };
  }

  const project = await getProject(values.projectId);
  if (!project) {
    return { error: "Unauthorized" };
  }

  // Get all categories for this project to create rankings
  const categories = await db.query.rankingCategories.findMany({
    where: eq(rankingCategories.projectId, values.projectId),
    orderBy: rankingCategories.orderIndex,
  });

  // Create the item
  const [item] = await db
    .insert(items)
    .values({
      name: values.name,
      projectId: values.projectId,
      userId: session.user.id,
    })
    .returning();

  if (!item) {
    return { error: "Failed to create item" };
  }

  // Create initial rankings for each category
  await db.insert(itemRankings).values(
    categories.map((category) => ({
      itemId: item.id,
      categoryId: category.id,
      rank: 0,
      userId: session.user.id,
      notes: category.id === values.categoryId ? values.notes : undefined,
    })),
  );

  revalidatePath(`/projects/${values.projectId}`);
  return { data: item };
}

export async function updateItem(id: string, values: ItemFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const { success } = await ratelimit.limit(session.user.id);

  if (!success) {
    return { error: "Rate limited" };
  }

  const existingItem = await getItem(id);

  if (!existingItem) {
    return { error: "Unauthorized" };
  }

  await db
    .update(items)
    .set({
      name: values.name,
    })
    .where(eq(items.id, id));

  await db
    .update(itemRankings)
    .set({
      notes: values.notes,
    })
    .where(
      and(
        eq(itemRankings.itemId, id),
        eq(itemRankings.categoryId, values.categoryId),
      ),
    );

  revalidatePath(`/projects/${values.projectId}`);
  return { data: { id } };
}

export async function deleteItem(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const { success } = await ratelimit.limit(session.user.id);

  if (!success) {
    return { error: "Rate limited" };
  }

  const [deletedItem] = await db
    .delete(items)
    .where(and(eq(items.id, id), eq(items.userId, session.user.id)))
    .returning();

  if (!deletedItem) {
    return { error: "Failed to delete item" };
  }

  revalidatePath(`/projects/${deletedItem.projectId}`);
  return { data: deletedItem };
}

export async function reorderItems(
  values: { categoryId: string; itemId: string; projectId: string }[],
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const { success } = await ratelimit.limit(session.user.id);

  if (!success) {
    return { error: "Rate limited" };
  }

  const updatedRankings = (
    await Promise.all(
      values.map((value, index) =>
        db
          .update(itemRankings)
          .set({
            rank: index,
          })
          .where(
            and(
              eq(itemRankings.userId, session.user.id),
              eq(itemRankings.categoryId, value.categoryId),
              eq(itemRankings.itemId, value.itemId),
            ),
          )
          .returning(),
      ),
    )
  ).flat();

  return { data: updatedRankings };
}
