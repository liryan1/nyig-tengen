import { ProblemForm } from "@/components/forms/ProblemForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Problem",
  description: "Create a new Go problem on NYIG Tengen.",
};

function ProblemCreatePage() {
  return (
    <div className="container max-w-7xl mx-auto px-1 sm:px-0">
      <ProblemForm />
    </div>
  );
}

export default ProblemCreatePage;
