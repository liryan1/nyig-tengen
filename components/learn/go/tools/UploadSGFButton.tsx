"use client";

import { RefObject, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CircleAlertIcon, FolderUpIcon } from "lucide-react";
import { GoGame } from "@/lib/go/goGame";

interface UploadSGFButtonProps {
  notEmpty?: boolean;
  onUpload: (sgfContent: string) => void;
  className?: string;
}

export function UploadSGFButton({
  onUpload,
  className,
  notEmpty,
}: UploadSGFButtonProps) {
  const [fileContent, setFileContent] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text);
      };
      reader.readAsText(file);
    }
  };

  const handleConfirm = () => {
    if (fileContent) {
      onUpload(fileContent);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                className,
              )}
              type="button"
              onClick={() => setOpen(true)}
            >
              <FolderUpIcon />
            </TooltipTrigger>
            <TooltipContent>Upload SGF</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className="max-w-md p-4">
        <DialogHeader>
          <DialogTitle>Upload SGF File</DialogTitle>
        </DialogHeader>
        {notEmpty && (
          <div className="text-sm flex items-center gap-1 text-red-500">
            <CircleAlertIcon />
            Warning: This will overwrite all existing data.
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          One single branch on the root node. Each variation is a solution to
          the problem.
        </p>
        <Input
          type="file"
          accept="application/x-go-sgf"
          onChange={handleFileChange}
        />
        <DialogFooter>
          <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={!fileContent}>
            Confirm Upload
          </Button>
        </DialogFooter>
        <DialogDescription hidden>Upload SGF file dialog</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
