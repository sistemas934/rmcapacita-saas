import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 antialiased selection:bg-brand-primary selection:text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50/50">
        <Header />
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-0">
          <div className="max-w-[1400px] mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
