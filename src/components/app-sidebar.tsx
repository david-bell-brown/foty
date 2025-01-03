import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

const testData = [
  {
    id: 1,
    name: "List 1",
    url: "/list/1",
  },
  {
    id: 2,
    name: "List 2",
    url: "/list/2",
  },
];

export function AppSidebar() {
  return (
    <Sidebar
      title="App menu"
      description="Created lists navigation menu"
      side="right"
    >
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xl">Foty</span>
          <span>avatar</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Lists</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {testData.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>{item.name}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
