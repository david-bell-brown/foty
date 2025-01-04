import { Button } from "~/components/ui/button";
import { ProjectDrawer } from "~/components/project-drawer";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function ProjectList() {
  const projects = await db.query.projects.findMany();
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] justify-center gap-3">
      {projects.map((project) => (
        <Button key={project.id} asChild variant="secondary">
          <Link href={`/projects/${project.id}`}>
            <span className="flex-1">{project.name}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex flex-1 flex-col gap-3 px-4">
      {user ? (
        <>
          <ProjectDrawer
            trigger={
              <Button variant="default">
                <Plus />
                New Ranked List
              </Button>
            }
          />
          <hr />
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectList />
          </Suspense>
        </>
      ) : (
        <div className="p-8 text-center">Please sign in above</div>
      )}
    </div>
  );
}
