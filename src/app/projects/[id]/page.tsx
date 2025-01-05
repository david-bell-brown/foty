import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getProject } from "~/server/queries";
import { ItemDrawer } from "~/components/item-drawer";
import { CirclePlus, Edit } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

async function Project({ projectId }: { projectId: string }) {
  const project = await getProject(projectId);
  if (!project) {
    return notFound();
  }
  return (
    <main className="relative flex-1">
      <div className="absolute inset-0 flex w-full snap-x snap-mandatory overflow-x-auto">
        {project.rankingCategories.map((category) => (
          <div
            key={category.id}
            className="flex w-full shrink-0 snap-start p-2 md:w-6/12"
          >
            <Card key={category.id} className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{category.name}</CardTitle>
                  <ItemDrawer
                    projectId={project.id}
                    categoryId={category.id}
                    trigger={
                      <Button size="sm" aria-label="Add item">
                        <CirclePlus />
                        Add item
                      </Button>
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {category.rankings.map((ranking, index) => (
                    <div
                      key={ranking.itemId}
                      className="ml-[-.25rem] flex items-center gap-2"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                        {index + 1}
                      </span>
                      <span className="flex min-w-0 flex-1 gap-[1px]">
                        <span
                          className={cn(
                            buttonVariants({
                              variant: "secondary",
                              size: "sm",
                            }),
                            "min-w-0 flex-1 justify-start rounded-br-none rounded-tr-none hover:bg-secondary",
                          )}
                        >
                          <span className="truncate">{ranking.item.name}</span>
                        </span>
                        <ItemDrawer
                          projectId={project.id}
                          categoryId={category.id}
                          itemRanking={ranking}
                          trigger={
                            <Button
                              aria-label="Edit item"
                              size="sm"
                              variant="secondary"
                              className="rounded-bl-none rounded-tl-none"
                            >
                              <Edit />
                            </Button>
                          }
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </main>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <Project projectId={id} />;
}
