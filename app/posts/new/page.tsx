import { authOptions } from "@/app/api/auth/authOptions";
import { Editor } from "@/components/forms/Editor";
import { PageError } from "@/components/labels/Error";
import { Heading } from "@/components/labels/Heading";
import { Button } from "@/components/ui/button";
import { CircleAlertIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

async function NewPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <>
        <PageError className="gap-2">
          <CircleAlertIcon />
          You must be logged in to create a post.
        </PageError>
        <div className="flex items-center justify-center">
          <Button variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </>
    );
  }
  return (
    <div className="max-w-[56rem] w-full mx-auto">
      <Heading>New post</Heading>
      <Editor />
    </div>
  );
}

export default NewPostPage;
