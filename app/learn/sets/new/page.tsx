import { PSetCreateForm } from "@/components/forms/PSetCreateForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Problem Set",
  description: "Create a new Go problem set on NYIG Tengen.",
};

function ProblemSetCreatePage() {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-2xl font-medium">Create Problem Set</div>
      <PSetCreateForm />
    </div>
  );
}

export default ProblemSetCreatePage;
