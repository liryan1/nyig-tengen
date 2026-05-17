import { FindTeams } from "@/components/teams/FindTeams";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams",
  description: "Browse and join Go teams on NYIG Tengen.",
};

function AllTeamsPage() {
  return (
    <div className="container mx-auto max-w-7xl py-10 px-4">
      <FindTeams />
    </div>
  );
}

export default AllTeamsPage;
