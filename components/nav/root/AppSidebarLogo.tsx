import Link from "next/link";
import { Logo } from "../../labels/Logo";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";

export function AppSidebarLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/">
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Logo />
            <div className="truncate flex flex-col text-left leading-tight">
              <span className="text-3xl font-medium">Tengen</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
