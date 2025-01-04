import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { signOut } from "~/server/auth";
import type { Session } from "next-auth";
import { LogOut } from "lucide-react";

interface UserMenuProps {
  user: Session["user"];
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = user?.name?.[0] ?? "?";

  async function handleSignOut() {
    "use server";
    await signOut();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.image ?? ""}
              alt={user?.name ?? "User avatar"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer" asChild>
          <button onClick={handleSignOut}>
            <LogOut />
            <span>Sign out</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
