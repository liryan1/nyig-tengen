import { authOptions } from "@/app/api/auth/authOptions";
import { TeamForm } from "@/components/forms/TeamForm";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create Team",
  description: "Create a new Go team on NYIG Tengen.",
};

async function CreateTeamPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/teams/new");
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    redirect("/teams");
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-1 sm:px-0">
      <TeamForm />
    </div>
  );
}

export default CreateTeamPage;
