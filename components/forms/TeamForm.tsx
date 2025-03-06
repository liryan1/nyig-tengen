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
import { Textarea } from "@/components/ui/textarea";
import { useCreateTeamMutation } from "@/lib/rtk/slices/teams";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, SendHorizonalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "../labels/Spinner";
import { Input } from "../ui/input";

const formSchema = z.object({
  name: z.string().min(1).max(30),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const iForm: FormValues = {
  name: "",
  description: "",
};

interface TeamFormProps {
  team?: { name: string; description?: string; slug: string };
}

export function TeamForm({ team }: TeamFormProps) {
  const router = useRouter();
  const actionWord = team ? "Update" : "Create";
  const [create, { isLoading }] = useCreateTeamMutation();

  let initialForm = iForm;
  if (team) {
    initialForm = {
      name: team.name,
      description: team.description || "",
    };
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: initialForm,
  });

  const onSubmit = async (values: FormValues) => {
    const submit = async () => {
      if (team) {
        console.warn("Not implemented");
      } else {
        return create(values).unwrap();
      }
    };

    try {
      const res = await submit();
      if (res) {
        toast.success(`Successfully ${actionWord.toLowerCase()}d team!`);
        form.reset();
        router.push(`/teams/${res.slug}`);
      } else {
        throw Error("No response from server");
      }
    } catch (err) {
      toast.error(
        `Failed to ${actionWord} team: ${(err as any)?.data?.message}`,
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h1 className="text-2xl font-semibold">{actionWord} Team</h1>
        {form.formState.errors.root && (
          <div className="flex items-center text-red-600 text-sm gap-1">
            <CircleAlertIcon className="h-4 w-4" />
            {form.formState.errors.root.message}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team name</FormLabel>
                <FormControl>
                  <Input
                    className="text-xs"
                    placeholder="Team name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  placeholder="(Optional) Briefly describe the team"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="gap-1" type="submit" disabled={isLoading}>
          {actionWord}
          {isLoading ? <Spinner className="h-4 w-4" /> : <SendHorizonalIcon />}
        </Button>
      </form>
    </Form>
  );
}
