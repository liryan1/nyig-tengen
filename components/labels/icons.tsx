import { CircleCheckBig, InfoIcon, TriangleAlertIcon } from "lucide-react";

export const infoIcon = (
  <InfoIcon className="h-4 w-4 text-yellow-600" strokeWidth={3} />
);
export const successIcon = (
  <CircleCheckBig className="h-4 w-4 text-green-700" strokeWidth={3} />
);
export const errorIcon = (
  <TriangleAlertIcon className="h-4 w-4 text-red-700" strokeWidth={3} />
);
