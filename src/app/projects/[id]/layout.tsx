import Link from "next/link";
import { Edit } from "lucide-react";
import { notFound } from "next/navigation";
import { ProjectDrawer } from "~/components/project-drawer";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { getProject } from "~/server/queries";

async function ProjectHeader({ projectId }: { projectId: string }) {
  const project = await getProject(projectId);
  if (!project) {
    return notFound();
  }
  return (
    <div className="flex items-center justify-between gap-2 px-4 pr-0">
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
          <Button variant="link" className="gap-2">
            <Edit />
            Edit project
          </Button>
        }
      />
    </div>
  );
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="flex flex-1 flex-col gap-1">
      <ProjectHeader projectId={id} />
      {children}
    </div>
  );
}
