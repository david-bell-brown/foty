import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { projects, rankingCategories } from "~/server/db/schema";
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
import { Button } from "~/components/ui/button";
import { ProjectDrawer } from "~/components/project-drawer";

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
    with: {
      rankingCategories: {
        orderBy: rankingCategories.orderIndex,
      },
      items: {},
    },
  });

  if (!project) {
    return notFound();
  }

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
        <ProjectDrawer
          project={{ ...project, categories: project.rankingCategories }}
          trigger={
            <Button variant="ghost" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit project
            </Button>
          }
        />
      </div>

      <div className="relative flex-1">
        <div className="absolute inset-0 flex w-full snap-x snap-mandatory overflow-x-auto">
          {project.rankingCategories.map((category) => (
            <div
              key={category.id}
              className="flex w-full shrink-0 snap-start p-2 md:w-6/12"
            >
              <Card key={category.id} className="w-full">
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {project.items.map((item) => (
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
