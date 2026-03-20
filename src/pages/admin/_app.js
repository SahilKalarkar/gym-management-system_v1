import HeaderComponent from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Layout, message } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const { Content } = Layout;

export default function AdminApp({ Component, pageProps }) {
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="fixed inset-0 flex bg-linear-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden">
            {/* YOUR EXACT SIDEBAR - Fixed */}
            <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

            {/* MAIN CONTENT - Sidebar offset + Header offset */}
            <div className={`flex-1 flex flex-col transition-all duration-300`}>
                {/* YOUR EXACT HEADER - Fixed */}
                <HeaderComponent collapsed={collapsed} setCollapsed={setCollapsed} />

                {/* ONLY CHILDREN PAGES SCROLL */}
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-600/50 scrollbar-track-slate-900/50 pt-4">
                    <div>
                        <Component {...pageProps} />
                    </div>
                </main>
            </div>
        </div>
    );
}
