import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden antialiased selection:bg-blue-600 selection:text-white bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Ambient Premium Corporate Background */}
        <div className="absolute top-0 left-0 right-0 w-full h-[500px] bg-gradient-to-br from-indigo-100/80 via-blue-50/50 to-transparent pointer-events-none z-0"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-200/20 blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-indigo-200/20 blur-[100px] pointer-events-none z-0"></div>

        <Header />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
          <div className="max-w-[1400px] mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
