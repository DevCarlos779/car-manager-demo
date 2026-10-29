import { Sidebar } from "@/src/components/app/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />

      <main className="h-screen overflow-hidden pt-14 lg:pl-64 lg:pt-0">
        <div className="mx-auto h-full w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </div>
      </main>
    </>
  );
}
