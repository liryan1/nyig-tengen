import { authOptions } from "@/app/api/auth/authOptions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostResponse } from "@/lib/rtk/slices/posts";
import { getServerSession } from "next-auth";
import { LuCalendarDays, LuClock } from "react-icons/lu";

interface PostHeaderProps {
  post: PostResponse;
}

export async function PostHeader({ post }: PostHeaderProps) {
  const session = await getServerSession(authOptions);
  const readingTime = post.wordCount ? Math.ceil(post.wordCount / 150) : 0;

  return (
    <div className="lg:max-w-[45rem] mx-auto mb-12">
      <h1 className="text-3xl leading-snug md:text-4xl md:leading-normal font-bold">
        {post.title}
      </h1>
      <div className="flex items-center mt-6 gap-4">
        <Avatar className="h-12 w-12 md:mx-2 cursor-pointer text-3xl">
          <AvatarFallback>{post.author?.name?.at(0) ?? "?"}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold mb-3">
            By <u>{post.author?.name}</u>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-2 text-sm">
              <LuCalendarDays size={18} />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="h-1.5 w-1.5 mx-3 rounded-full bg-gray-500 dark:bg-gray-300"></div>
            <div className="flex items-center gap-2 text-sm">
              <LuClock size={18} />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
