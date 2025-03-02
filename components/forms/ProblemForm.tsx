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
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageSpinner, Spinner } from "../labels/Spinner";
import { GoProblemResponse } from "@/lib/go/interface";
import { Visibility } from "@prisma/client";

const GoProblemEditor = dynamic(
  () => import("@/components/learn/go/GoProblemEditor"),
  { ssr: false, loading: () => <PageSpinner /> },
);

const formSchema = z.object({
  rank: z.coerce.number().int().min(-30).max(8),
  description: z.string().optional(),
  visibility: z.nativeEnum(Visibility),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  problem?: GoProblemResponse;
}

export function ProblemForm({ problem }: Props) {
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const actionWord = problem ? "Update" : "Create";
  const goGameRef = useRef<GoGame | null>(null);
  if (problem) {
    goGameRef.current = GoGame.fromSgf(problem.initial);
  }
  const [create, { isLoading: cLoading }] = useCreateProblemMutation();
  const isLoading = cLoading;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rank: -5,
      description: "",
      visibility: Visibility.PUBLIC,
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
    const submit = async () => {
      const body: ProblemCreateRequest = {
        ...values,
        initial: rootNodeToSgf(goGame),
        correct: goGameToSgf(goGame),
      };
      if (problem) {
        console.warn("Update not implemented yet. body:", body);
      } else {
        return create(body).unwrap();
      }
    };

    toast.promise(submit, {
      duration: 5000,
      error: (err) => `Failed to ${actionWord} problem: ${err?.message}`,
      loading: `Successfully ${actionWord}d problem`,
      success: (res) => {
        setButtonDisabled(true);
        setTimeout(() => {
          setButtonDisabled(false);
        }, 10000);
        return {
          message: "Successfully created new problem",
          action: res
            ? {
                label: "View",
                onClick: () => {
                  window.location.href = "/learn/problems/" + res.id;
                },
              }
            : undefined,
        };
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2">
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
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="max-w-40">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Visibility)
                        .filter((v) => v !== Visibility.TEAM)
                        .map((o) => (
                          <SelectItem key={o} value={o}>
                            {o.toLowerCase()}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <Button
          className="gap-1"
          type="submit"
          disabled={isLoading || buttonDisabled}
        >
          Create
          {isLoading ? <Spinner className="h-4 w-4" /> : <SendHorizonalIcon />}
        </Button>
      </form>
    </Form>
  );
}
