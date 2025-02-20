import { ProblemForm } from "@/components/forms/ProblemForm";

function ProblemCreatePage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-0">
      {/* <div className="text-sm">
        First, edit the board to create the initial position. Then, play all correct variations up to the point at which the answer is obvious to any player at the selected level.
      </div> */}
      <ProblemForm />
    </div>
  );
}

export default ProblemCreatePage;
