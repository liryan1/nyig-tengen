"use client";
import { SearchSelect } from "@/components/ui/SearchSelect";
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
    value: creator.name,
    label: creator.name,
  }));

  return (
    <SearchSelect
      options={creators}
      value={value}
      onValueChange={onSelect}
      disabled={isLoading}
      placeholder={placeholder}
    />
  );
};
