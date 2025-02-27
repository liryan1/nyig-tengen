import { CircleCheckBig, InfoIcon, TriangleAlertIcon } from "lucide-react";

export const infoIcon = (
  <InfoIcon className="h-5 w-5 text-yellow-600" strokeWidth={3} />
);
export const successIcon = (
  <CircleCheckBig className="h-5 w-5 text-green-700" strokeWidth={3} />
);
export const errorIcon = (
  <TriangleAlertIcon className="h-5 w-5 text-red-700" strokeWidth={3} />
);
