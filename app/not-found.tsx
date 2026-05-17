import { Logo } from "@/components/labels/Logo";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center py-32 text-center bg-gray-200 dark:bg-slate-800">
      <Logo h={48} />
      <h1 className="text-4xl mt-6">Oops! Page not found.</h1>
      <p className="text-lg mt-2 mb-12">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/">
        <Button>Back to Homepage</Button>
      </Link>
    </div>
  );
};

export default NotFound;
