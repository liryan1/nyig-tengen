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

const FormSchema = z.object({
  name: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string(),
  sgf: z.string().nonempty("An SGF problems file is required"),
});

type FormValues = z.infer<typeof FormSchema>;

export function PSetCreateForm() {
  const router = useRouter();
  const [create, { isLoading, isError }] = useCreatePSetMutation();
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      sgf: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const createPSet = () => create(values).unwrap();
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
