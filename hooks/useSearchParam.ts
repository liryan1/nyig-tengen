import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function useSearchParam(
  key: string,
  initialValue: string,
  validator?: (value: string) => string | null,
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(key) || initialValue);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const validatedValue = validator ? validator(value) : value;
    if (validatedValue) {
      params.set(key, validatedValue);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  }, [value, key, searchParams, router, validator]);

  return [value, setValue] as const;
}
