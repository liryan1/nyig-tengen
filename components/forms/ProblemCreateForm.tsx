"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  rank: z.string(),
  description: z
    .string()
    .min(20, "Please enter a description of at least 20 characters"),
  sgf: z.string().nonempty("An SGF problems file is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function ProblemCreateForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rank: "",
      description: "",
      sgf: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log("Form values:", values);
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
                <Input placeholder="Rank" {...field} />
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
                <Textarea
                  placeholder="(Optional) Provide a description"
                  {...field}
                />
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

        <Button type="submit" disabled>
          Save draft
        </Button>
      </form>
    </Form>
  );
}
