"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RANK_OPTIONS } from "@/lib/go/constants";
import { GoGame } from "@/lib/go/goGame";
import { goGameToSgf, rootNodeToSgf } from "@/lib/go/parser";
import {
  ProblemCreateRequest,
  useCreateProblemMutation,
} from "@/lib/rtk/slices/problems";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, SendHorizonalIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageSpinner, Spinner } from "../labels/Spinner";
import { revalidateTag } from "next/cache";
import { ALL_PROBLEMS_TAG } from "@/lib/nextTags";

const GoProblemEditor = dynamic(
  () => import("@/components/learn/go/GoProblemEditor"),
  { ssr: false, loading: () => <PageSpinner /> },
);

const formSchema = z.object({
  rank: z.coerce.number().int().min(-30).max(8),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  problemId?: string;
}

export function ProblemCreateForm({ problemId }: Props) {
  const goGameRef = useRef<GoGame | null>(null);
  const [create, { isLoading: cLoading }] = useCreateProblemMutation();
  const isLoading = cLoading;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rank: -5,
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const goGame = goGameRef.current;
    if (!goGame) {
      // nothing to submit
      return;
    }
    if (goGame.isEmpty()) {
      form.setError("root", { message: "Please create a problem" });
      return;
    }
    if (goGame.root.children.length === 0) {
      form.setError("root", {
        message: "Please provide at least one solution",
      });
      return;
    }
    const body: ProblemCreateRequest = {
      ...values,
      initial: rootNodeToSgf(goGame),
      correct: goGameToSgf(goGame),
    };
    try {
      if (problemId) {
        console.warn("Update not implemented yet. body:", body);
      } else {
        const createResponse = await create(body).unwrap();
        toast.success("Successfully created new problem", {
          duration: 5000,
          action: {
            label: "View",
            onClick: () => {
              window.location.href = "/learn/problems/" + createResponse.id;
            },
          },
        });
        // Creator should be able to see the new created problem
        revalidateTag(ALL_PROBLEMS_TAG);
      }
    } catch (error) {
      toast.error(
        "Failed to " + (problemId ? "update" : "create") + " problem",
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty</FormLabel>
              <FormControl>
                <Select
                  value={field.value.toString()}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="max-w-32">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    {RANK_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="flex items-center text-red-600 text-sm gap-1">
            <CircleAlertIcon className="h-4 w-4" />
            {form.formState.errors.root.message}
          </div>
        )}
        <GoProblemEditor goGameRef={goGameRef} />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  className="text-xs"
                  placeholder="(Optional) Describe the problem"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="gap-1" type="submit" disabled={isLoading}>
          Create
          {isLoading ? <Spinner className="h-4 w-4" /> : <SendHorizonalIcon />}
        </Button>
      </form>
    </Form>
  );
}
