import { ProblemCreateForm } from "@/components/forms/ProblemCreateForm";

function ProblemCreatePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1">
      <div className="text-2xl font-medium">Create Problem</div>
      <ProblemCreateForm />
    </div>
  );
}

export default ProblemCreatePage;
