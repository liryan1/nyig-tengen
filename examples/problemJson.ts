import { GoProblem } from "@/lib/go/interface";
import { convertProblemsToSGF } from "@/lib/go/JsonToSGFparser";
import { convertSGFToProblems } from "@/lib/go/SGFToJsonParser";

const problem: GoProblem = {
  initial: {
    board: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, -1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, -1, -1, 0, 0, 0, 0, 0],
      [0, 0, 1, -1, 0, 0, 0, 0, 0],
      [0, 0, 1, -1, 0, 0, 0, 0, 0],
      [0, 0, 1, -1, 0, -1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    color: -1,
  },
  correct: [
    [
      [4, 1],
      [3, 1],
      [4, 0],
      [8, 2],
      [8, 1],
      [7, 0],
      [6, 0],
      [6, 1],
      [5, 1],
    ],
    [
      [4, 1],
      [3, 1],
      [4, 0],
      [6, 0],
      [7, 0],
      [7, 1],
      [8, 1],
    ],
    [
      [4, 1],
      [3, 1],
      [4, 0],
      [8, 2],
      [8, 1],
      [6, 1],
      [5, 1],
      [7, 0],
      [6, 0],
    ],
    [
      [4, 1],
      [3, 1],
      [4, 0],
      [7, 1],
      [8, 1],
      [6, 1],
      [5, 1],
      [6, 0],
      [7, 0],
    ],
    [
      [4, 1],
      [3, 1],
      [4, 0],
      [7, 1],
      [8, 1],
      [6, 1],
      [5, 1],
      [7, 0],
      [6, 0],
    ],
  ],
};

export const problemSgf = convertProblemsToSGF([problem, problem]);
export const problemsJson = convertSGFToProblems(problemSgf);

console.log(JSON.stringify([problem, problem]));
console.log(JSON.stringify(problemsJson));
