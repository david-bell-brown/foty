import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getProject } from "~/server/queries";
import { ItemDrawer } from "~/components/item-drawer";
import { CirclePlus } from "lucide-react";
import { Button } from "~/components/ui/button";
import ItemList from "~/components/item-list";

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
            <Card
              key={category.id}
              className="flex w-full flex-col overflow-y-auto"
            >
              <CardHeader className="sticky top-0 bg-card/50 pb-4 backdrop-blur-md">
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
              <CardContent className="pt-1">
                <ItemList rankings={category.rankings} />
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
