"use client";

import TiptapEditor, {
  type TiptapEditorRef,
} from "@/components/tiptap/TiptapEditor/components/TiptapEditor";
import {
  useCreatePostMutation,
  useUpdatePostMutation,
} from "@/lib/rtk/slices/posts";
import { Post } from "@prisma/client";
import { SendHorizonalIcon } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Spinner } from "../labels/Spinner";
import { Button } from "../ui/button";
import "./editFormStyle.scss";
import { debounce } from "@/lib/debounce";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const initialForm: PostForm = {
  title: "",
  content: "",
};

interface PostForm {
  title: string;
  content: string;
}

export function TiptapEditForm({ iform }: { iform?: Post }) {
  const router = useRouter();
  const [update, { isLoading: uLoading }] = useUpdatePostMutation();
  const [create, { isLoading: cLoading }] = useCreatePostMutation();
  const isLoading = uLoading || cLoading;
  const editorRef = useRef<TiptapEditorRef>(null);

  const form = useForm<PostForm>({
    values: iform ?? initialForm,
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty]);

  const getWordCount: () => number = useCallback(
    () => editorRef.current?.getInstance()?.storage.characterCount.words() ?? 0,
    [editorRef],
  );

  const handlePublish = async () => {
    const payload = { wordCount: getWordCount(), ...form.getValues() };
    if (iform) {
      try {
        await update({
          ...payload,
          slug: iform.slug,
          wordCount: getWordCount(),
        }).unwrap();
        toast.success("Post updated successfully");
        router.push(`/posts/${iform.slug}`);
        editorRef.current?.getInstance()?.commands.clearContent();
      } catch (error) {
        toast.error("Error updating post");
      }
    } else {
      try {
        await create({ ...payload, wordCount: getWordCount() }).unwrap();
        toast.success("Post created successfully");
        router.push("/posts");
        editorRef.current?.getInstance()?.commands.clearContent();
      } catch (error) {
        toast.error("Error creating post");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Controller
          control={form.control}
          name="title"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
              placeholder="Enter post title..."
            />
          )}
        />
      </div>

      <div>
        <Controller
          control={form.control}
          name="content"
          render={({ field }) => (
            <TiptapEditor
              ref={editorRef}
              output="html"
              placeholder={{
                paragraph: "Type your content here...",
                imageCaption: "Type caption for image (optional)",
              }}
              contentMinHeight={256}
              contentMaxHeight={640}
              onContentChange={field.onChange}
              initialContent={field.value}
            />
          )}
        />
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!form.formState.isDirty}
          className="flex items-center gap-2"
          onClick={debounce(handlePublish, 500)}
        >
          Publish
          {isLoading ? <Spinner className="h-4 w-4" /> : <SendHorizonalIcon />}
        </Button>
      </div>
    </div>
  );
}
