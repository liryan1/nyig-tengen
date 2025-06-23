"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonalIcon } from "lucide-react";
import { useCreatePSetMutation } from "@/lib/rtk/slices/problemSets";
import { Spinner } from "../labels/Spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Visibility } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { MultiSelect } from "../ui/multiselect";
import { useGetMyTeamsQuery } from "@/lib/rtk/slices/teams";

const FormSchema = z
  .object({
    name: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string(),
    sgf: z.string().nonempty("An SGF problems file is required"),
    visibility: z.nativeEnum(Visibility),
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

type FormValues = z.infer<typeof FormSchema>;

export function PSetCreateForm() {
  const router = useRouter();
  const [create, { isLoading: cLoading, isError }] = useCreatePSetMutation();
  const { data: teams, isLoading: tLoading } = useGetMyTeamsQuery();
  const isLoading = cLoading || tLoading;
  const teamOptions =
    teams?.map((team) => ({ value: team.slug, label: team.name })) || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      sgf: "",
    },
  });
  const selectedVisibility = form.watch("visibility");

  const onSubmit = async (values: FormValues) => {
    const teamSlugs = values.teamSlugs?.map((s) => s.value);
    const createPSet = () => create({ ...values, teamSlugs }).unwrap();
    toast.promise(createPSet, {
      loading: "Creating problem set...",
      success: (res) => ({
        message: "Successfully created problem set",
        action: res?.problemSetNum
          ? {
              label: "View",
              onClick: () => {
                router.push("/learn/problems/" + res.problemSetNum);
              },
            }
          : undefined,
      }),
      error: (err) => err.data?.message,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Provide a description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sgf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SGF File</FormLabel>
              <div className="text-sm">
                Upload an SGF file with branches on the root node. Each branch
                is a problem and each variation is a solution to the problem.
                Please include all of the opponent&apos;s reasonable responses.
              </div>
              <FormControl>
                <Input
                  type="file"
                  accept=".sgf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (loadEvent) => {
                        const text = loadEvent.target?.result;
                        if (typeof text === "string") {
                          // Set the string contents of the file in the form
                          field.onChange(text);
                        }
                      };
                      reader.readAsText(file);
                    } else {
                      // Reset the field if no file is chosen
                      field.onChange("");
                    }
                  }}
                />
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
                <FormControl>
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

        <Button type="submit">
          Create
          {isLoading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <SendHorizonalIcon className="h-4 w-4" />
          )}
        </Button>
      </form>
    </Form>
  );
}
