"use client";

import {
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
import { MultiSelect } from "@/components/ui/multiselect";
import { Visibility } from "@prisma/client";
import { useGetMyTeamsQuery } from "@/lib/rtk/slices/teams";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const visibilitySchema = z.object({
  visibility: z.nativeEnum(Visibility),
  teamSlugs: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .optional(),
});

export const visibilityRefinement = (data: {
  visibility: Visibility;
  teamSlugs?: { value: string; label: string }[];
}) => data.visibility !== Visibility.TEAM || !!data.teamSlugs?.length;

export const visibilityRefinementMessage = {
  message: "Team is required when visibility is TEAM",
  path: ["teamSlugs"],
};

interface VisibilityFieldsProps {
  form: UseFormReturn<any>;
}

export function VisibilityFields({ form }: VisibilityFieldsProps) {
  const { data: teams } = useGetMyTeamsQuery();
  const teamOptions =
    teams?.map((team) => ({ value: team.slug, label: team.name })) || [];

  const selectedVisibility = form.watch("visibility");

  return (
    <>
      <FormField
        control={form.control}
        name="visibility"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Visibility</FormLabel>
            <FormControl>
              <Select value={field.value || ""} onValueChange={field.onChange}>
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
    </>
  );
}
