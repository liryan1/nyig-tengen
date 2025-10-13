import { HomeCards } from "@/components/home/HomeCards";
import { Button } from "@/components/ui/button";
import { isUserAdmin } from "@/lib/utils";
import { CrownIcon, LogInIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { MdWavingHand } from "react-icons/md";
import { authOptions } from "../api/auth/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <div className="max-w-[56rem] w-full mx-auto text-center">
      <div className="pt-12 pb-4 space-y-12">
        <div className="space-y-4">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal">
            Tengen
          </div>
          <div className="text-muted-foreground text-sm sm:text-xl">
            &mdash; Expand the Go Universe &mdash;
          </div>
        </div>

        {session?.user.id ? (
          <div className="flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-xl">
            <MdWavingHand className="text-indigo-600 h-5 w-5" />
            Welcome, {session.user.name}
            {isUserAdmin(session) && <CrownIcon className="h-5 w-5" />}
            <MdWavingHand className="text-indigo-600 h-5 w-5" />
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-2">
            <Button variant="outline">
              Sign in
              <LogInIcon />
            </Button>
          </Link>
        )}
        <HomeCards />
      </div>
    </div>
  );
}
