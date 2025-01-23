import { Editor } from "@/components/forms/Editor";

async function PostEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="max-w-[56rem] w-full mx-auto py-6">
      <Editor slug={slug} />
    </div>
  );
}

export default PostEditPage;
