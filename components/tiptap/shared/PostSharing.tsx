import { authOptions } from "@/app/api/auth/authOptions";
import { LikeButton } from "@/components/LikeButton";
import { PostResponse } from "@/lib/rtk/slices/posts";
import { EditIcon, MessageCircleMoreIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { TbBrandFacebook, TbBrandLinkedin, TbBrandX } from "react-icons/tb";

interface PostSharingProps {
  post: PostResponse;
}

export async function PostSharing({ post }: PostSharingProps) {
  const session = await getServerSession(authOptions);
  const initialLiked =
    post.likes?.some((like) => like.userId === session?.user?.id) ?? false;

  const url = `https%3A%2F%2Ftengen.ny-go.org%2Fposts%2F${post.slug}`;
  const text = `I read an interesting post on ${url}`;
  const socials = [
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?text=${text}`,
      Icon: TbBrandX,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      Icon: TbBrandFacebook,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      Icon: TbBrandLinkedin,
    },
  ];
  return (
    <div className="flex justify-center lg:justify-end order-1 lg:order-3">
      <div className="sticky lg:h-[calc(100vh-120px)] top-24 flex lg:flex-col gap-4 items-center">
        {session?.user?.id === post.authorId ? (
          <Link href={`/posts/edit/${post.slug}`}>
            <EditIcon className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-foreground" />
          </Link>
        ) : (
          <LikeButton
            postId={post.id}
            initialLiked={initialLiked}
            initialCount={post.likes?.length}
            size={8}
          />
        )}

        <MessageCircleMoreIcon className="h-8 w-8 text-muted-foreground" />
        {socials.map((social, i) => (
          <Link
            key={i}
            href={social.href}
            target="_blank"
            className="cursor-pointer"
          >
            <social.Icon className="p-1 h-10 w-10 rounded-full border border-neutral-300 dark:border-neutral-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}
