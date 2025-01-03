import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { db } from "~/server/db";

const mockCategories = [
  {
    id: 1,
    name: "Category 1",
  },
  {
    id: 2,
    name: "Category 2",
  },
  {
    id: 3,
    name: "Category 3",
  },
  {
    id: 4,
    name: "Category 4",
  },
];

const mockDefaultOrder = [
  {
    categoryId: 1,
    order: 1,
  },
  {
    categoryId: 2,
    order: 2,
  },
  {
    categoryId: 3,
    order: 3,
  },
  {
    categoryId: 4,
    order: 4,
  },
];

const mockItems = [
  {
    id: 1,
    name: "Item 1",
    orders: mockDefaultOrder,
  },
  {
    id: 2,
    name: "Item 2",
    orders: mockDefaultOrder,
  },
  {
    id: 3,
    name: "Item 3",
    orders: mockDefaultOrder,
  },
  {
    id: 4,
    name: "Item 4",
    orders: mockDefaultOrder,
  },
];

export default async function HomePage() {
  const posts = await db.query.posts.findMany();
  console.log(posts);
  return (
    <div className="flex flex-1 flex-col gap-4">
      {posts.map((post) => (
        <div key={post.id}>{post.name}</div>
      ))}
      <div className="relative flex-1">
        <div className="absolute inset-0 flex w-full snap-x snap-mandatory overflow-x-auto md:flex-col">
          {mockCategories.map((category) => (
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
                    {mockItems.map((item) => (
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
