import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

export default function AppShell() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { resetInactivityTimer } = useAuthStore();
    const { init } = useThemeStore();

    useEffect(() => { init(); }, []);

    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetInactivityTimer));
        return () => events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
    }, [resetInactivityTimer]);

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

            <div className={`transition-all duration-300 ${collapsed ? 'md:ml-[68px]' : 'md:ml-[260px]'}`}>
                <Topbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} menuOpen={mobileMenuOpen} />

                <main className="p-4 md:p-6 pb-24 md:pb-6 min-h-[calc(100vh-4rem)]">
                    <Outlet />

                    <footer className="mt-12 pt-8 border-t border-surface-200 dark:border-surface-800 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 mb-2">Official Hub Location</p>
                        <p className="text-xs font-bold text-surface-500 dark:text-surface-400">
                            Michael Okpara University Of Agriculture Umudike, Umuahia Abia State
                        </p>
                    </footer>
                </main>
            </div>

            <MobileNav />
        </div>
    );
}
