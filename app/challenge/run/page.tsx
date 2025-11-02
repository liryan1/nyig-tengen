import { authOptions } from "@/app/api/auth/authOptions";
import { ChallengeScreen } from "@/components/challenge/ChallengeScreen";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Challenge mode",
  description: "A fun challenge mode to test your reading skills.",
};

export default async function ChallengeRunPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <ChallengeScreen />;
}
