'use client';
import { useState, useEffect } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { SETTINGS } from '@/utilities/apiUrls';

export default function MaintenancePage() {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        checkMaintenance();
    }, []);

    const checkMaintenance = async () => {
        try {
            const res = await fetch(`${SETTINGS}?action=get`);
            const data = await res.json();

            if (data.success && data.data.site_status === true) {
                setIsMaintenance(true);
                setMessage(data.data.maintenance_message || 'Site is under maintenance');
            }
        } catch (error) {
            console.error('Maintenance check failed');
        }
    };


    if (!isMaintenance) return null; // Show nothing if NOT maintenance

    return (
        <div className="fixed inset-0 bg-linear-to-br from-gray-900 via-orange-900 to-red-900 z-99999 flex items-center justify-center p-8">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-12 text-center max-w-2xl mx-auto border-4 border-white/20 shadow-4xl animate-pulse">
                {/* Warning Icon */}
                <div className="w-32 h-32 bg-linear-to-r from-orange-400 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-3xl border-4 border-white/30">
                    <ClockCircleOutlined className="text-5xl text-white drop-shadow-lg" />
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-black bg-linear-to-r from-white to-gray-200 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
                    UNDER MAINTENANCE
                </h1>

                {/* Message */}
                <p className="text-2xl md:text-3xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-xl">
                    {message}
                </p>

                {/* Status */}
                <div className="space-y-3 text-white/80 mb-12">
                    <p className="text-xl flex items-center justify-center gap-2">
                        <span className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></span>
                        Our team is working hard to improve your experience
                    </p>
                    <p className="text-lg">We'll be back online shortly!</p>
                </div>

                {/* Admin Link */}
                <p className="text-white/70 text-sm mb-8">
                    Admin? <a href="/admin/login" className="underline hover:text-orange-300">Login here →</a>
                </p>
            </div>
        </div>
    );
}
