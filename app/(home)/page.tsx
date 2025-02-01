import { Button } from "@/components/ui/button";
import {
  BookCheckIcon,
  ChartNoAxesCombinedIcon,
  CrownIcon,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../api/auth/authOptions";
import { MdWavingHand } from "react-icons/md";
import { FeaturedSites } from "@/components/home/FeaturedSites";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <div className="max-w-[56rem] w-full mx-auto py-12 space-y-6 text-center">
      <div>
        <div className="text-4xl sm:text-6xl font-normal">NYIG Tengen</div>
        <div className="text-muted-foreground text-lg sm:text-2xl">
          Expand the Go Universe
        </div>
      </div>
      <div className="flex gap-12 justify-center">
        <Button>
          <Link href="/learn" className="flex items-center gap-2">
            <ChartNoAxesCombinedIcon />
            Learn Go
          </Link>
        </Button>
        <Button>
          <Link href="/posts" className="flex items-center gap-2">
            <BookCheckIcon />
            Read posts
          </Link>
        </Button>
      </div>
      {session?.user.id && (
        <div className="flex items-center justify-center gap-2 text-xl">
          <MdWavingHand className="text-indigo-600 h-5 w-5" />
          Welcome, {session.user.name}
          {session?.user.role === "ADMIN" && <CrownIcon className="h-5 w-5" />}
          <MdWavingHand className="text-indigo-600 h-5 w-5" />
        </div>
      )}
      <FeaturedSites />
    </div>
  );
}
