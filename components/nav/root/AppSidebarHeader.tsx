import { BreadcrumbNav } from "./BreadcrumbNav";
import { ThemeToggle } from "./ThemeToggle";
import { Separator } from "../../ui/separator";
import { SidebarTrigger } from "../../ui/sidebar";

export function AppSidebarHeader() {
  return (
    <header className="flex justify-between h-12 sm:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-2 sm:px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4" />
        <BreadcrumbNav />
      </div>
      <ThemeToggle />
    </header>
  );
}

export default AppSidebarHeader;
