"use client";

import { createElement, Fragment, useEffect, useState } from "react";
import { components } from "./components/custom";
import { createProcessor } from "./utils/processor";
import { useIncrementViewsMutation } from "@/lib/rtk/slices/posts";

interface TiptapRendererProps {
  slug: string;
  content: string;
}

export function TiptapClientRenderer({ slug, content }: TiptapRendererProps) {
  const [parsedContent, setParsedContent] = useState(createElement(Fragment));
  const [update] = useIncrementViewsMutation();

  useEffect(() => {
    const doSomething = async () => {
      update(slug);
      const processor = createProcessor({ components });
      const output = await processor.process(content);

      setParsedContent(output.result);
    };
    doSomething();
  }, [content]);

  return parsedContent;
}
