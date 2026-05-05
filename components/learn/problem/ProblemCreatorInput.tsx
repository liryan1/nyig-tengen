"use client";
import { SearchSelect } from "@/components/learn/SearchSelect";
import { useGetProblemCreatorsQuery } from "@/lib/rtk/slices/problems";
import { UserIcon } from "lucide-react";

interface ProblemCreatorInputProps {
  onSelect: (creator: string) => void;
  placeholder?: string;
  value?: string;
}

export const ProblemCreatorInput: React.FC<ProblemCreatorInputProps> = ({
  value,
  onSelect,
  placeholder = "Creator",
}) => {
  const { data, isLoading } = useGetProblemCreatorsQuery();
  const creators = (data ?? []).map((creator) => ({
    value: creator.id,
    label: creator.name,
  }));

  return (
    <SearchSelect
      triggerClassName="sm:w-auto sm:min-w-60"
      contentClassName="sm:w-auto sm:min-w-60"
      options={creators}
      value={value}
      onValueChange={onSelect}
      disabled={isLoading}
      placeholder={placeholder}
      icon={<UserIcon className="h-4 w-4 text-muted-foreground" />}
    />
  );
};
