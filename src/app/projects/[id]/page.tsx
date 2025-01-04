import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { items, projects, rankingCategories } from "~/server/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Edit } from "lucide-react";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    return notFound();
  }

  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project) {
    return notFound();
  }

  const categories = await db.query.rankingCategories.findMany({
    where: eq(rankingCategories.projectId, id),
    orderBy: rankingCategories.orderIndex,
  });

  const projectItems = await db.query.items.findMany({
    where: eq(items.projectId, id),
  });

  return (
    <div className="flex flex-1 flex-col gap-1">
      <div className="flex items-center justify-between gap-2 px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Projects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <span className="flex items-center gap-2 text-sm text-primary">
          <Edit className="size-4" />
          <span>Edit project</span>
        </span>
      </div>

      <div className="relative flex-1">
        <div className="absolute inset-0 flex w-full snap-x snap-mandatory overflow-x-auto md:flex-col">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex w-full shrink-0 snap-center p-2"
            >
              <Card key={category.id} className="w-full">
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {projectItems.map((item) => (
                      <div
                        key={item.id}
                        className="mx-[-.75rem] rounded-lg bg-secondary px-3 py-2"
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
