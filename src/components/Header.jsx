'use client';

import { Space, Badge, Dropdown, Button, Menu, Avatar, Typography } from 'antd';
import { useRouter } from 'next/router';
import { message } from 'antd';
import {
    MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined,
    DownOutlined, UserOutlined, LogoutOutlined,
    SettingOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Title } = Typography;

export default function HeaderComponent({ collapsed, setCollapsed }) {
    const router = useRouter();

    const handleSetting = () => {
        router.push('/admin/settings');
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        message.success('Logged out successfully');
        router.push('/admin/login');
    };

    const getCurrentPage = () => {
        return router.pathname.split('/')[2]?.toUpperCase() || 'DASHBOARD';
    };

    return (
        <div className="flex! items-center! px-4! justify-between! bg-linear-to-b! from-gray-900! to-gray-800! h-15! shadow!">

            {/* Left: Hamburger + Page Title */}
            <Space className='flex! items-center!'>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-white! hover:bg-gray-800! rounded-xl! text-xl!"
                    size="large"
                />
                <Title level={4} className="text-white! mb-0! hidden! lg:block!">
                    {getCurrentPage()}
                </Title>
            </Space>

            {/* Right: Notifications + Profile */}
            <Space size="middle" className='flex! items-center!'>
                <Badge count={3} offset={[-5, 5]}>
                    <Button type="text" icon={<BellOutlined className="text-xl! text-gray-300! hover:text-white!" />} />
                </Badge>
                <Space className="cursor-pointer! p-3! hover:bg-gray-800/50! rounded-xl! transition-all! duration-200!">
                    <Avatar size={36} icon={<UserOutlined />} className="bg-linear-to-r! from-orange-500! to-red-500!" />
                    <div className="hidden! md:block!">
                        <div className="text-white font-semibold text-sm">Admin</div>
                        <div className="text-gray-400 text-xs">Super Admin</div>
                    </div>
                </Space>
                <Button key="setting" onClick={handleSetting} icon={<SettingOutlined />} />
                <Button danger key="logout" onClick={handleLogout} icon={<LogoutOutlined />} />
            </Space>
        </div>
    );
}
