import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

async function CategoryList() {
  const categories = await db.query.rankingCategories.findMany();
  const items = await db.query.items.findMany();
  // const categories = await db.query.rankingCategories.findMany({
  //   where: eq(RankingCategory.projectId, projectId),
  // });
  // const items = await db.query.items.findMany({
  //   where: eq(Item.projectId, projectId),
  // });

  return (
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
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <div key={item.id}>{item.name}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex flex-1 flex-col gap-4">
      {user ? (
        <CategoryList />
      ) : (
        <div className="p-8 text-center">Please sign in above</div>
      )}
    </div>
  );
}
