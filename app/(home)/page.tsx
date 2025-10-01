import { Button } from "@/components/ui/button";
import {
  ChartNoAxesCombinedIcon,
  CrownIcon,
  ExternalLinkIcon,
  LogInIcon,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { MdWavingHand } from "react-icons/md";
import { authOptions } from "../api/auth/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <div className="max-w-[56rem] w-full mx-auto text-center space-y-24">
      <div className="py-12 space-y-12">
        <div className="space-y-4">
          <div className="text-4xl sm:text-6xl font-normal">Tengen</div>
          <div className="text-muted-foreground text-lg sm:text-xl">
            &mdash; Expand the Go Universe &mdash;
          </div>
        </div>
        <div className="flex gap-12 justify-center">
          <Link href="/learn" className="flex items-center gap-2">
            <Button>
              <ChartNoAxesCombinedIcon />
              Practice
            </Button>
          </Link>
          <Link
            href="https://ny-go.org/classes"
            target="_blank"
            className="flex items-center gap-2"
          >
            <Button>
              Learn Go
              <ExternalLinkIcon />
            </Button>
          </Link>
        </div>
        {session?.user.id ? (
          <div className="flex items-center justify-center gap-2 text-xl">
            <MdWavingHand className="text-indigo-600 h-5 w-5" />
            Welcome, {session.user.name}
            {session?.user.role === "ADMIN" && (
              <CrownIcon className="h-5 w-5" />
            )}
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
      </div>
    </div>
  );
}
