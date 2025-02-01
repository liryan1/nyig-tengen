import Link from "next/link";
import { LogoWithText } from "../labels/Logo";
import { ThemeToggle } from "../ThemeToggle";
import { NavbarLinks } from "./NavbarLinks";
import { UserMenu } from "./UserMenu";

export async function Navbar() {
  return (
    <header className="sticky z-50 top-0 px-2 sm:px-6 border-b border-neutral-300 dark:border-neutral-700 bg-white/20 dark:bg-[#0d101820] backdrop-blur-lg">
      <div className="h-14 md:h-16 w-full mx-auto flex items-center justify-between gap-6">
        <Link href="/" className="order-2 sm:order-1">
          <LogoWithText h={34} text="Tengen" school="NYIG" />
        </Link>
        <NavbarLinks className="order-1 sm:order-2" />
        <div className="flex items-center gap-2 order-3">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
