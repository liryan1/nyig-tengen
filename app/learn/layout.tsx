import { BreadcrumbNav } from "@/components/nav/BreadcrumbNav";
import { ShowCoordProvider } from "../../components/providers/ShowCoordProvider";
import { ShowCoordButton } from "@/components/learn/ShowCoordButton";

export default async function ProblemsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ShowCoordProvider>
      <BreadcrumbNav>
        <ShowCoordButton />
      </BreadcrumbNav>
      <div className="px-1 sm:px-6">{children}</div>
    </ShowCoordProvider>
  );
}
