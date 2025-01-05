import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getProject } from "~/server/queries";

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
