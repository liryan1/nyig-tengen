import { PSetCreateForm } from "@/components/forms/PSetCreateForm";

function ProblemSetCreatePage() {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-2xl font-medium">Create Problem Set</div>
      <PSetCreateForm />
    </div>
  );
}

export default ProblemSetCreatePage;
