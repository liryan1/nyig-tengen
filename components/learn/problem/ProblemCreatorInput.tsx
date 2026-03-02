"use client";
import { SearchSelect } from "@/components/learn/SearchSelect";
import { useGetProblemCreatorsQuery } from "@/lib/rtk/slices/problems";

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
      triggerClassName="w-80 sm:w-auto sm:min-w-60"
      contentClassName="w-80 sm:w-auto sm:min-w-60"
      options={creators}
      value={value}
      onValueChange={onSelect}
      disabled={isLoading}
      placeholder={placeholder}
    />
  );
};
