import { PSetCreateForm } from "@/components/forms/PSetCreateForm";

function ProblemSetCreatePage() {
  return (
    <div className="space-y-6">
      <div className="text-2xl font-medium">Create Problem Set</div>
      <div className="text-sm">
        Upload an SGF file with branches on the root node. Each branch is a
        problem. All variations end with the starting side and are solution
        variations. Do not include incorrect variations.
      </div>
      <PSetCreateForm />
    </div>
  );
}

export default ProblemSetCreatePage;
