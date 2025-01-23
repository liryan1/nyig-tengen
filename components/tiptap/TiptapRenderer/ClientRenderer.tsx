"use client";

import { createElement, Fragment, useEffect, useState } from "react";
import { components } from "./components/custom";
import { createProcessor } from "./utils/processor";

interface TiptapRendererProps {
  content: string;
}

export function TiptapClientRenderer ({ content }: TiptapRendererProps) {
  const [parsedContent, setParsedContent] = useState(createElement(Fragment));

  useEffect(() => {
    const doSomething = async () => {
      const processor = createProcessor({ components });
      const output = await processor.process(content);

      setParsedContent(output.result);
    }
    doSomething();
  }, [content]);

  return parsedContent;
};

