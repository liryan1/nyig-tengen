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
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizonalIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GoProblemEditor } from "../learn/go/GoProblemEditor";

const formSchema = z.object({
  rank: z.coerce.number().int().min(-29).max(8),
  description: z.string().optional(),
  sgf: z.string().nonempty("An SGF problems file is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function ProblemCreateForm() {
  const goGameRef = useRef<GoGame | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rank: -5,
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

        <Button className="gap-1" type="submit" disabled>
          Create
          <SendHorizonalIcon />
        </Button>
      </form>
    </Form>
  );
}
