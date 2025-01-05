import "server-only";
import { db } from "./db";
import { auth } from "./auth";

export async function getUserProjects() {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return [];
  }
  return await db.query.projects.findMany({
    where: (projects, { eq }) => eq(projects.userId, user.id),
    orderBy: (projects, { desc }) => desc(projects.createdAt),
  });
}

export async function getProject(id: string) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return null;
    }
    return await db.query.projects.findFirst({
      where: (projects, { and, eq }) =>
        and(eq(projects.id, id), eq(projects.userId, user.id)),
      with: {
        rankingCategories: {
          orderBy: (rankingCategories, { asc }) =>
            asc(rankingCategories.orderIndex),
          with: {
            rankings: {
              orderBy: (rankings, { asc }) => asc(rankings.rank),
              with: {
                item: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    // Handle invalid UUID/input syntax error
    if (
      error instanceof Error &&
      error.message.includes("invalid input syntax")
    ) {
      return null;
    }
    throw error;
  }
}

export async function getCategoryItemRankings(categoryId: string) {
  return await db.query.itemRankings.findMany({
    where: (itemRankings, { eq }) => eq(itemRankings.categoryId, categoryId),
    with: {
      item: true,
    },
  });
}

export async function getItem(id: string) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return null;
    }
    return await db.query.items.findFirst({
      where: (items, { and, eq }) =>
        and(eq(items.id, id), eq(items.userId, user.id)),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("invalid input syntax")
    ) {
      return null;
    }
    throw error;
  }
}
