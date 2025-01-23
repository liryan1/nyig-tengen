export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium my-6">
      {children}
    </h1>
  );
}
