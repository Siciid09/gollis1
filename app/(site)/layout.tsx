import Sidebar from "@/components/Sidebar";
import { Toaster } from "sonner";
import { GlobalProvider } from "@/context/GlobalContext"; // Adjust path as needed

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Wrapped the entire layout in the GlobalProvider for state sharing (Auth, Theme, etc.)
    <GlobalProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#050505]">
        
        <Sidebar />
        
        {/* Main content wrapper */}
        <main className="flex-1 h-screen overflow-y-auto no-scrollbar relative flex flex-col">
          {/* Subtle background glow effect for modern feel */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl w-full mx-auto p-6 md:p-10 relative z-10">
            {children}
          </div>
        </main>

        {/* Global Toaster for premium, slide-in notifications anywhere in the app */}
        <Toaster 
          theme="dark" 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#171717', // neutral-900
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
            },
            className: 'font-sans tracking-wide shadow-2xl rounded-xl',
          }}
        />
      </div>
    </GlobalProvider>
  );
}