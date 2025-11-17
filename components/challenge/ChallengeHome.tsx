"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlameIcon, Info, LogInIcon, Trophy } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Spinner } from "../labels/Spinner";
import { HowChallengeWorks } from "./display/HowChallengeWorks";
import { LeaderboardTab } from "./display/LeaderboardTab";
import Link from "next/link";

export function ChallengeHome() {
  const router = useRouter();
  const { status } = useSession();

  const handleClickLogin = () => {
    router.push("/login");
  };

  return (
    <div className="container mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-4">Challenge Mode</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8">
            Fast, fun training to sharpen your reading under pressure.
          </p>

          {status === "unauthenticated" ? (
            <div className="w-full justify-center items-center">
              <Button variant="outline" onClick={handleClickLogin}>
                Sign in to start challenge
                <LogInIcon />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => router.push("/challenge/run")}
              disabled={status !== "authenticated"}
              className="bg-indigo-600 hover:bg-indigo-800 text-white"
            >
              Start Challenge
              {status === "loading" ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <FlameIcon fill="red" className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="how-it-works">
              How it Works
              <Info className="w-4 h-4 ml-2" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <LeaderboardTab />
          </TabsContent>

          <TabsContent value="how-it-works">
            <HowChallengeWorks />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
