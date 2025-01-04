import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await db.query.rankingCategories.findMany();
  const items = await db.query.items.findMany();

  return (
    <div className="flex flex-1 flex-col gap-4">
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
    </div>
  );
}
