import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminHome() {
    const router = useRouter();

    useEffect(() => {
        // Show "Redirecting..." for 1 second, then go to login
        const timer = setTimeout(() => {
            router.push('/admin/login');
        }, 500);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white text-xl animate-pulse">
                Redirecting to login...
            </div>
        </div>
    );
}
