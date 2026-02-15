import { Outlet } from 'react-router-dom';
import { useUIStore } from '../../store';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-dark-900 mesh-bg">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        } [dir=rtl]:lg:ml-0 ${
          sidebarCollapsed ? '[dir=rtl]:lg:mr-[72px]' : '[dir=rtl]:lg:mr-[260px]'
        }`}
      >
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Floating Orbs (Background decoration) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="floating-orb w-[500px] h-[500px] bg-healix-500/10 top-[-200px] right-[-100px]" />
        <div className="floating-orb w-[400px] h-[400px] bg-emerald-500/8 bottom-[-150px] left-[-100px] animation-delay-300" />
        <div className="floating-orb w-[300px] h-[300px] bg-violet-500/6 top-[40%] left-[30%] animation-delay-700" />
      </div>
    </div>
  );
}
