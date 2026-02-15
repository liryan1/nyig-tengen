import { useShowCoord } from "@/components/providers/ShowCoordProvider";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog-w-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  CircleAlertIcon,
  CopyIcon,
  DownloadIcon,
  FolderUpIcon,
  MoreVerticalIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";

interface GoBoardMenuProps {
  className?: string;
  handleExportSgf?: () => string;
  onUpload?: (sgfContent: string) => void;
  boardIsNotEmpty?: boolean;
  dropdownMenuSide?: "top" | "bottom" | "left" | "right";
  onResetVariations?: () => void;
}

export function GoBoardMenu({
  className,
  handleExportSgf,
  onUpload,
  boardIsNotEmpty,
  dropdownMenuSide,
  onResetVariations,
}: GoBoardMenuProps) {
  const { toggleShowCoord, showCoord } = useShowCoord();
  const [fileContent, setFileContent] = useState("");
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
    if (fileContent && onUpload) {
      onUpload(fileContent);
      setOpen(false);
    }
  };

  const downloadTxtFile = () => {
    if (!handleExportSgf) {
      return;
    }

    const sgfContent = handleExportSgf();
    const blob = new Blob([sgfContent], { type: "application/x-go-sgf" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "problem.sgf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySgf = () => {
    if (!handleExportSgf) {
      return;
    }

    const sgfContent = handleExportSgf();
    navigator.clipboard.writeText(sgfContent);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({
            size: "sm",
            variant: "outline",
            className: "p-0",
          }),
          className,
        )}
      >
        <MoreVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 rounded-lg"
        side={dropdownMenuSide ?? "bottom"}
        align="end"
      >
        {onUpload && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(true);
                }}
              >
                <FolderUpIcon />
                <span>Upload SGF</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="max-w-md p-4">
              <DialogHeader>
                <DialogTitle>Upload SGF File</DialogTitle>
              </DialogHeader>
              {boardIsNotEmpty && (
                <div className="text-sm flex items-center gap-1 text-red-500">
                  <CircleAlertIcon />
                  Warning: This will overwrite all existing data.
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                One single branch on the root node. Each variation is a solution
                to the problem.
              </p>
              <Input
                type="file"
                accept="application/x-go-sgf"
                onChange={handleFileChange}
              />
              <DialogFooter>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  disabled={!fileContent}
                >
                  Confirm Upload
                </Button>
              </DialogFooter>
              <DialogDescription hidden>
                Upload SGF file dialog
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )}
        {handleExportSgf && (
          <DropdownMenuItem onClick={downloadTxtFile}>
            <DownloadIcon />
            <span>Download as SGF</span>
          </DropdownMenuItem>
        )}
        {onResetVariations && (
          <DropdownMenuItem onClick={onResetVariations}>
            <XIcon />
            <span>Clear Variations</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopySgf}>
          <CopyIcon />
          <span>Copy to clipboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleShowCoord}>
          <span className={showCoord ? "" : "line-through"}>A1</span>
          <span>Coordinates</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
