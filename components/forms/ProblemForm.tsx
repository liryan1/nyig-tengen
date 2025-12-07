"use client";

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
import { GoProblemResponse } from "@/lib/go/interface";
import { goGameToSgf } from "@/lib/go/parser";
import {
  ProblemCreateRequest,
  useCreateProblemMutation,
  useUpdateProblemMutation,
} from "@/lib/rtk/slices/problems";
import { useGetMyTeamsQuery } from "@/lib/rtk/slices/teams";
import { zodResolver } from "@hookform/resolvers/zod";
import { Visibility } from "@prisma/client";
import { CircleAlertIcon, SendHorizonalIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CooldownButton } from "../CooldownButton";
import { Spinner } from "../labels/Spinner";
import { GoProblemSkeleton } from "../loading/GoProblemSkeleton";
import { MultiSelect } from "../ui/multiselect";

const GoProblemEditor = dynamic(
  () => import("@/components/learn/go/GoProblemEditor"),
  { ssr: false, loading: () => <GoProblemSkeleton /> },
);

// Update schema with teamId and add a refinement for TEAM visibility
const formSchema = z
  .object({
    rank: z.int().min(-30).max(8),
    description: z.string().optional(),
    visibility: z.enum(Visibility),
    teamSlugs: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => data.visibility !== Visibility.TEAM || !!data.teamSlugs?.length,
    {
      message: "Team is required when visibility is TEAM",
      path: ["teamSlugs"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

const iForm: FormValues = {
  rank: -5,
  description: "",
  visibility: Visibility.PUBLIC,
};

interface Props {
  problem?: GoProblemResponse;
}

export function ProblemForm({ problem }: Props) {
  const router = useRouter();
  const { data: teams, isLoading: tLoading } = useGetMyTeamsQuery();
  const teamOptions =
    teams?.map((team) => ({ value: team.slug, label: team.name })) || [];

  // Board state management
  const initialSgf = problem?.correct || problem?.initial;
  const goGameRef = useRef<GoGame>(
    initialSgf ? GoGame.fromSgf(initialSgf) : GoGame.empty(),
  );

  const [create, { isLoading: cLoading }] = useCreateProblemMutation();
  const [update, { isLoading: uLoading }] = useUpdateProblemMutation();
  const isLoading = cLoading || uLoading || tLoading;

  const actionWord = problem ? "Update" : "Create";

  let initialForm = iForm;
  if (problem) {
    initialForm = {
      rank: problem.rank,
      description: problem.description || "",
      visibility: problem.visibility,
      teamSlugs: problem.teams?.map((t) => ({ label: t.team, value: t.slug })),
    };
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: initialForm,
  });

  // Watch visibility value to conditionally render the team select
  const selectedVisibility = form.watch("visibility");

  const onSubmit = async (values: FormValues) => {
    const goGame = goGameRef.current;
    if (!goGame) {
      return;
    }
    if (goGame.isEmpty()) {
      form.setError("root", { message: "Please create a problem" });
      return;
    }
    const children = goGame.root.children;
    if (children.length === 0) {
      form.setError("root", {
        message: "Please provide at least one solution",
      });
      return;
    }
    if (children.some((c) => c.moveColor === -1)) {
      form.setError("root", {
        message: "Solutions must begin with black",
      });
      return;
    }

    const submit = async () => {
      const body: ProblemCreateRequest = {
        ...values,
        teamSlugs: values.teamSlugs?.map((t) => t.value) || undefined,
        description: values.description?.trim() || undefined,
        sgf: goGameToSgf(goGame),
      };
      if (problem) {
        return update({ num: problem.num, ...body }).unwrap();
      } else {
        return create(body).unwrap();
      }
    };

    toast.promise(submit, {
      duration: 8_000,
      error: (err) => `Failed to ${actionWord} problem: ${err?.data?.message}`,
      loading: `Attempting to ${actionWord} problem`,
      success: (res) => ({
        message: `Successfully ${actionWord}d problem`,
        action: res?.num
          ? {
              label: "View",
              onClick: () => {
                router.push("/learn/problems/" + res.num);
              },
            }
          : undefined,
      }),
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-4 mb-8">
        <h1 className="text-2xl font-semibold">{actionWord} Problem</h1>
        {form.formState.errors.root && (
          <div className="flex items-center text-red-600 text-sm gap-1">
            <CircleAlertIcon className="h-4 w-4" />
            {form.formState.errors.root.message}
          </div>
        )}

        <GoProblemEditor
          goGameRef={goGameRef}
          initialMode={problem ? "move" : "edit"}
        />

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
                  <SelectTrigger className="w-32">
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

        <div className="flex flex-wrap gap-4">
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Visibility)
                        .filter((v) => v !== Visibility.DELETED)
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
          {selectedVisibility === Visibility.TEAM && (
            <FormField
              control={form.control}
              name="teamSlugs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Teams</FormLabel>
                  <FormControl className="flex-1">
                    <MultiSelect
                      placeholder="Select teams"
                      options={teamOptions}
                      selected={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

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

        <CooldownButton
          className="gap-1"
          type="submit"
          disabled={isLoading}
          onClick={form.handleSubmit(onSubmit)}
          throttleMs={5_000}
          text={actionWord}
          icon={
            isLoading ? <Spinner className="h-4 w-4" /> : <SendHorizonalIcon />
          }
        />
      </form>
    </Form>
  );
}
