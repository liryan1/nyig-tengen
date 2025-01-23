import { components } from "./components/custom";
import { createProcessor } from "./utils/processor";

interface TiptapRendererProps {
  content: string;
}

export async function TiptapServerRenderer ({ content }: TiptapRendererProps) {
  const processor = createProcessor({ components });
  const processed = await processor.process(content);
  return processed.result;
};
