import { ChallengeHome } from "@/components/challenge/ChallengeHome";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Challenge",
  description: "Challenge home",
};

export default function ChallengePage() {
  return <ChallengeHome />;
}
