'use client';

import { usePathname } from 'next/navigation';
import { Layout, Menu, Typography } from 'antd';
import Link from 'next/link';
import {
  BarChartOutlined, TeamOutlined, FileTextOutlined, DollarCircleOutlined,
  SettingOutlined,
  UserOutlined,
  PullRequestOutlined
} from '@ant-design/icons';


const { Sider } = Layout;

const { Title, Text } = Typography;

export default function Sidebar({ collapsed, onCollapse }) {
  const pathname = usePathname();
  const currentPage = pathname?.split('/')[2] || 'dashboard';

  const menuItems = [
    { key: 'dashboard', icon: <BarChartOutlined />, label: <Link href="/admin/dashboard">Dashboard</Link> },
    { key: 'equipments', icon: <PullRequestOutlined />, label: <Link href="/admin/equipments">Equipments</Link> },
    { key: 'trainers', icon: <UserOutlined />, label: <Link href="/admin/trainers">Trainers</Link> },
    { key: 'members', icon: <TeamOutlined />, label: <Link href="/admin/members">Members</Link> },
    { key: 'classes', icon: <FileTextOutlined />, label: <Link href="/admin/classes">Classes</Link> },
    { key: 'payments', icon: <DollarCircleOutlined />, label: <Link href="/admin/payments">Payments</Link> },
    // { key: 'settings', icon: <SettingOutlined />, label: <Link href="/admin/settings">Settings</Link> }
  ];

  return (
    <Sider collapsible collapsed={collapsed} trigger={null} >
      {/* Logo */}
      <div className="text-black text-center px-4 py-4 font-bold text-lg">
        <div className="flex items-center justify-center space-x-3">
          {!collapsed && (
            <>
              <Title level={4} className="text-white! font-black! mb-1! m-0!">
                PowerForge
              </Title>
            </>
          )}
          {collapsed && (
            <div className="w-8! h-8! mx-auto! bg-linear-to-r! from-orange-500! to-red-500! rounded-lg! flex! items-center! justify-center!">
              <span className="text-white font-bold text-lg">PF</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[currentPage]}
        items={menuItems}
        className="border-none! px-2!"
        inlineCollapsed={collapsed}
      />
    </Sider>
  );
}
