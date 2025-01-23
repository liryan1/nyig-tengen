import PostContent from "@/components/tiptap/shared/PostContent";
import PostHeader from "@/components/tiptap/shared/PostHeader";
import PostReadingProgress from "@/components/tiptap/shared/PostReadingProgress";
import { PostSharing } from "@/components/tiptap/shared/PostSharing";
import PostToc from "@/components/tiptap/shared/PostToc";
import { TiptapClientRenderer } from "@/components/tiptap/TiptapRenderer/ClientRenderer";
import { fetchData } from "@/lib/fetch";
import { PostResponse } from "@/lib/rtk/slices/posts";
import { notFound } from "next/navigation";

async function PostViewPage({ params }: { params: Promise<{ slug: string }> }) {
  const {slug} = await params;
  const post: PostResponse | undefined = await fetchData(`posts/${slug}`, {next: {revalidate: 5}})
  if (!post) {
    return notFound()
  }
  const readingTime = post.wordCount ? Math.ceil(post.wordCount / 150) : 0;
  return (
    <article className="py-10 flex flex-col items-center">
      <PostReadingProgress />
      <PostHeader
        title={post.title}
        author={post.author.name}
        createdAt={new Date(post.publishedAt).toLocaleDateString()}
        readingTime={readingTime}
      />
      <div className="grid grid-cols-1 w-full lg:w-auto lg:grid-cols-[minmax(auto,256px)_minmax(720px,1fr)_minmax(auto,256px)] gap-6 lg:gap-12">
        <PostToc />
        <PostContent>
          <TiptapClientRenderer content={post.content} />
        </PostContent>
        <PostSharing />
      </div>
    </article>
  )
}

export default PostViewPage
