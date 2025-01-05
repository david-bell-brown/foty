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
        },
        items: {},
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
