import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, X } from "lucide-react";

export function HowChallengeWorks() {
  return (
    <Card>
      <CardHeader className="text-sm sm:text-base">
        <div className="mb-1">
          Black to play. In each problem, choose from one of the following
          options:
        </div>
        <ol className="list-decimal pl-4 space-y-0.5 sm:space-y-2">
          <li>
            <span className="font-bold">Alive</span> - the position is alive if
            white plays first
          </li>
          <li>
            <span className="font-bold">Unsettled</span> - the position is alive
            if black plays first & dead if white plays first
          </li>
          <li>
            <span className="font-bold">Dead</span> - the position is dead if
            black plays first
          </li>
        </ol>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 sm:gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">30s</div>
          <p className="text-sm">Starting time</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">+3s</div>
          <p className="text-sm">For each correct answer</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600 mb-2 flex justify-center">
            <X size={36} strokeWidth={3} />
          </div>
          <p className="text-sm">Wrong answer = game over</p>
        </div>
      </CardContent>
    </Card>
  );
}
