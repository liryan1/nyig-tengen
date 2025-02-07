import { GoProblemWrapper } from "@/components/learn/go/GoProblemWrapper";

async function TestPage() {
  // const {response: problem} = await fetchSafe<GoProblemResponse>("/problems/67a2fbe63ce02da6dca0aca4")
  // if (!problem) {
  //   return <div>Problem not found</div>
  // }
  return <GoProblemWrapper id="67958d7ae23a14e85207f850" />;
}

export default TestPage;
