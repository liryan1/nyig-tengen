import { Logo } from "@/components/labels/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function AllTeamsPage() {
  return (
    <div className="flex flex-col justify-center items-center py-32 text-center bg-gray-100">
      <Logo h={48} />
      <h1 className="text-4xl mt-6 text-gray-800">Coming soon</h1>
      <p className="text-lg mt-2 mb-12 text-gray-600">
        The page you are looking for will be landing soon!
      </p>
      <Button>
        <Link href="/learn">Back to Learn</Link>
      </Button>
    </div>
  );
}

export default AllTeamsPage;
