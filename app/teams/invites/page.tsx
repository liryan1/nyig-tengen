import { InvitesPage } from "@/components/teams/InvitesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Invites",
  description: "View and manage your team invites.",
};

function TeamInvitePage() {
  return <InvitesPage />;
}

export default TeamInvitePage;
