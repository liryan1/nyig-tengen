import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LuCalendarDays, LuClock } from "react-icons/lu";

interface PostHeaderProps {
  title: string;
  author: string;
  createdAt: string;
  readingTime: number;
}

const PostHeader = ({ title, author, createdAt, readingTime }: PostHeaderProps) => {
  return (
    <div className="lg:max-w-[45rem] mx-auto mb-6 lg:mb-12">
      <h1 className="text-3xl leading-snug md:text-4xl md:leading-normal font-bold">{title}</h1>

      <div className="flex items-center mt-6 gap-4">
        <Avatar className="h-12 w-12 md:mx-2 cursor-pointer text-3xl">
          <AvatarFallback>{author.at(0) ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="">
          <div className="font-semibold mb-3">
            By <u>{author}</u>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-2 text-sm">
              <LuCalendarDays size={18} />
              <span>{createdAt}</span>
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
};

export default PostHeader;
