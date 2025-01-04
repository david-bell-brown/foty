import Link from "next/link";
import { SignIn } from "~/components/signin-button";
import { UserMenu } from "~/components/user-menu";
import { auth } from "~/server/auth";

export default async function Nav() {
  const session = await auth();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b p-4">
      <Link href="/" className="text-xl">
        Foty
      </Link>
      {session ? <UserMenu user={session.user} /> : <SignIn />}
    </header>
  );
}
