import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

async function ProjectList() {
  const projects = await db.query.projects.findMany();
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] justify-center gap-3 px-4">
      {projects.map((project) => (
        <Button key={project.id} asChild variant="outline">
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
    <div className="flex flex-1 flex-col gap-4">
      {user ? (
        <ProjectList />
      ) : (
        <div className="p-8 text-center">Please sign in above</div>
      )}
    </div>
  );
}
