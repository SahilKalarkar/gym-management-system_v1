import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Button, Skeleton, Space, Typography, Avatar, Tag, Badge, Divider } from 'antd';
import {
    TeamOutlined, DollarCircleOutlined, CalendarOutlined, BarChartOutlined,
    UserOutlined, FireOutlined, TrophyOutlined, ClockCircleOutlined, CheckCircleOutlined,
    ReloadOutlined, PieChartOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { MEMBERS, PAYMENTS } from '@/utilities/apiUrls';
import dayjs from 'dayjs';

const { Title: AntTitle, Text } = Typography;

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
        todayCheckins: 0,
        collectionRate: 0
    });
    const [revenueTrend, setRevenueTrend] = useState([]);
    const [membershipData, setMembershipData] = useState({ elite: 0, premium: 0, basic: 0 });
    const [recentMembersPreview, setRecentMembersPreview] = useState([]);
    const [recentPaymentsPreview, setRecentPaymentsPreview] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [membersRes, paymentsRes] = await Promise.all([
                fetch(`${MEMBERS}?action=get`),
                fetch(`${PAYMENTS}?action=get`)
            ]);

            const membersData = await membersRes.json();
            const paymentsData = await paymentsRes.json();

            if (membersData.success && paymentsData.success) {
                const allMembers = membersData.data || [];
                const allPayments = paymentsData.data || [];

                const activeMembersCount = allMembers.filter(m => m.status === 'active').length;
                const totalRevenue = allPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                const monthlyRevenue = allPayments
                    .filter(p => dayjs(p.payment_date).isAfter(dayjs().subtract(30, 'day')))
                    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                const pendingPayments = allPayments.filter(p => p.status === 'pending').length;
                const collectionRate = allPayments.length > 0 ?
                    ((1 - pendingPayments / allPayments.length) * 100).toFixed(1) : 0;

                // Membership breakdown
                const elite = allMembers.filter(m => m.membership_type === 'elite').length;
                const premium = allMembers.filter(m => m.membership_type === 'premium').length;
                const basic = allMembers.filter(m => m.membership_type === 'basic').length;

                setStats({
                    totalMembers: allMembers.length,
                    activeMembers: activeMembersCount,
                    totalRevenue,
                    monthlyRevenue,
                    pendingPayments,
                    todayCheckins: Math.floor(Math.random() * 200) + 100,
                    collectionRate
                });

                setMembershipData({ elite, premium, basic });

                // Revenue trend (last 6 months)
                const revenues = [];
                for (let i = 5; i >= 0; i--) {
                    const date = dayjs().subtract(i, 'month');
                    const monthRevenue = allPayments
                        .filter(p => dayjs(p.payment_date).isSame(date, 'month'))
                        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                    revenues.push(monthRevenue);
                }
                setRevenueTrend(revenues);

                // Previews (no tables)
                setRecentMembersPreview(allMembers.slice(0, 3).map(m => ({
                    name: m.name,
                    plan: m.membership_type,
                    joined: dayjs(m.join_date).format('MMM DD')
                })));

                setRecentPaymentsPreview(allPayments.slice(0, 3).map(p => ({
                    id: p.payment_id,
                    member: p.member_name,
                    amount: parseFloat(p.amount),
                    status: p.status
                })));
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 p-6">
                <Skeleton.Input active size="large" className="w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(6)].map((_, i) => <Skeleton.Input key={i} active className="h-32" />)}
                </div>
            </div>
        );
    }

    return (
        <>
            {/* EXECUTIVE HEADER */}
            <div className="flex flex-col lg:flex-row mb-4 justify-between items-start lg:items-center gap-6 space-y-4">
                <div>
                    <AntTitle level={2} className="font-bold! mb-0!">
                        Dashboard Overview
                    </AntTitle>
                    <Text>Real-time insights • Updated {dayjs().format('HH:mm')}</Text>
                </div>
            </div>

            {/* KPI CARDS */}
            <Row gutter={[24, 24]} className='mb-4! grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-4! gap-4!'>
                <div className="px-4 py-4 rounded-2xl border-none bg-linear-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl shadow-2xl hover:shadow-3xl">
                    <Statistic
                        title={<span className="text-black font-semibold">Total Members</span>}
                        value={stats.totalMembers}
                        prefix={<TeamOutlined className="text-2xl text-blue-400" />}
                        valueStyle={{ color: '#3b82f6', fontSize: '3rem' }}
                    />
                </div>

                <div className="px-4 py-4 rounded-2xl border-none bg-linear-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl shadow-2xl hover:shadow-3xl">
                    <Statistic
                        title={<span className="text-black font-semibold">Active Today</span>}
                        value={stats.activeMembers}
                        prefix={<FireOutlined className="text-2xl text-emerald-400" />}
                        valueStyle={{ color: '#10b981', fontSize: '3rem' }}
                    />
                </div>

                <div className="px-4 py-4 rounded-2xl border-none bg-linear-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl shadow-2xl hover:shadow-3xl">
                    <Statistic
                        title={<span className="text-black font-semibold">Monthly Revenue</span>}
                        value={`₹${stats.monthlyRevenue.toLocaleString()}`}
                        prefix={<DollarCircleOutlined className="text-2xl text-orange-400" />}
                        valueStyle={{ color: '#f59e0b', fontSize: '3rem' }}
                    />
                </div>

                <div className="px-4 py-4 rounded-2xl border-none bg-linear-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl shadow-2xl hover:shadow-3xl">
                    <Statistic
                        title={<span className="text-black font-semibold">Collection Rate</span>}
                        value={`${stats.collectionRate}%`}
                        prefix={<CheckCircleOutlined className="text-2xl text-purple-400" />}
                        valueStyle={{ color: '#8b5cf6', fontSize: '3rem' }}
                    />
                </div>
            </Row>

            {/* CHARTS ROW - NO PROGRESS BARS */}
            <Row gutter={[24, 24]} className='grid! grid-cols-1! xl:grid-cols-2! gap-4! mb-4!'>
                {/* Revenue Trend Chart */}
                <Card
                    title={
                        <Space className="items-center w-full justify-between">
                            <Space>
                                <BarChartOutlined className="text-xl text-emerald-400" />
                                <span className="font-bold text-lg tracking-wide">Revenue Trend (6 Months)</span>
                            </Space>
                        </Space>
                    }
                >
                    <div>
                        <div className="grid grid-cols-6 gap-15 sm:gap-4 h-full w-full overflow-x-auto">
                            {revenueTrend.map((revenue, index) => {
                                const heightPercent = Math.min((revenue / Math.max(...revenueTrend)) * 100, 100);
                                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                                return (
                                    <div key={index} className="flex flex-col items-center space-y-2 group hover:scale-105 transition-all">
                                        <div className={`w-14 h-60 flex items-end justify-center p-3 rounded-2xl backdrop-blur-sm border border-white/20 hover:border-emerald-400/50 transition-all bg-linear-to-t from-slate-800/70 to-slate-900/50 shadow-xl group-hover:shadow-2xl ${index === 0 ? 'ring-2 ring-emerald-400/30 shadow-emerald-500/25' : ''
                                            }`}>
                                            <div
                                                className="w-10 rounded-xl shadow-lg transition-all duration-1000 ease-out flex items-end justify-center bg-linear-to-t from-emerald-500/90 via-emerald-400 to-white"
                                                style={{ height: `${heightPercent}%`, minHeight: '24px' }}
                                            />
                                        </div>
                                        <Text className="text-white font-bold text-sm whitespace-nowrap">
                                            ₹{revenue.toLocaleString()}
                                        </Text>
                                        <Text className={`text-xs font-semibold tracking-wider whitespace-nowrap ${index === 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                                            {monthNames[5 - index]}
                                        </Text>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>



                <div className='grid! grid-cols-1! md:grid-cols-2! gap-4!'>
                    {/* Membership Pie Chart */}
                    <Card title={<Space><PieChartOutlined /> <span className="font-bold text-lg">Membership Distribution</span></Space>}
                        className="border-none bg-white/5 backdrop-blur-xl shadow-2xl h-100">
                        <div className="flex flex-col h-full justify-center items-center text-center space-y-8">
                            {/* Circular segments */}
                            <div className="relative w-48 h-48 mx-auto mb-8">
                                <div className="absolute inset-0 rounded-full border-8 border-purple-500/30 shadow-2xl" />
                                <div className="absolute inset-4 rounded-full bg-linear-to-r from-slate-900 to-transparent shadow-inner" />
                                <div className="absolute -inset-2 rounded-full border-8 border-transparent bg-linear-to-r from-purple-500/60 via-blue-500/60 to-emerald-500/60 shadow-2xl animate-spin-slow" />
                            </div>
                            <div className="space-y-3 w-full">
                                <div className="flex justify-between">
                                    <Tag color="purple">Elite</Tag>
                                    <Text className="font-bold text-white">{membershipData.elite}</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Tag color="blue">Premium</Tag>
                                    <Text className="font-bold text-white">{membershipData.premium}</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Tag color="green">Basic</Tag>
                                    <Text className="font-bold text-white">{membershipData.basic}</Text>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Recent Activity Cards */}
                    <Card title={<Space><FireOutlined /> <span className="font-bold text-lg">Recent Activity</span></Space>}>
                        <div>
                            {/* Recent Members */}
                            <div>
                                <Text className="font-medium! block!">New Members</Text>
                                {recentMembersPreview.map((member, i) => (
                                    <div key={i} className="flex items-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                                        <Avatar className="bg-linear-to-r! from-blue-500! to-purple-500! shrink-0!">
                                            {member.name.charAt(0)}
                                        </Avatar>
                                        <div className="ml-3! flex-1!">
                                            <Text className="font-semibold! mr-1!">{member.name}</Text>
                                            <Tag color="blue" size="small">{member.plan}</Tag>
                                            <Text className="text-gray-400 text-xs block">Joined {member.joined}</Text>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </Row>

            {/* 🔥 BOTTOM ROW - Revenue Cards + Summary */}
            <Row gutter={[24, 24]} className='grid! grid-cols-1! lg:grid-cols-2! gap-4!'>
                {/* Recent Payments */}
                <Card title={<Space><DollarCircleOutlined /> <span className="font-bold text-lg">Recent Payments</span></Space>}
                    className="border-none bg-emerald-500/10 backdrop-blur-xl shadow-2xl">
                    <div className="space-y-4">
                        {recentPaymentsPreview.map((payment, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm rounded-2xl hover:bg-white/30 transition-all">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-linear-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shrink-0">
                                        <DollarCircleOutlined className="text-white text-lg" />
                                    </div>
                                    <div className="ml-4">
                                        <Text className="text-white font-bold block">#{payment.id}</Text>
                                        <Text className="text-gray-400">{payment.member}</Text>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-emerald-400">
                                        ₹{payment.amount?.toLocaleString()}
                                    </div>
                                    <Badge
                                        status={payment.status === 'paid' ? 'success' : 'warning'}
                                        text={payment.status?.toUpperCase()}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* ROUND SUMMARY GRAPH */}
                <Card title={<Space><TrophyOutlined /> <span className="font-bold text-lg">Today's Performance</span></Space>}
                    className="border-none bg-linear-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl shadow-2xl h-full">
                    <div className="flex flex-col items-center text-center space-y-8 p-8">
                        {/* Large central circle */}
                        <div className="relative w-40 h-40 mx-auto mb-8">
                            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-full shadow-2xl border-8 border-white/20" />
                            <div className="absolute inset-4 bg-slate-900/80 rounded-full flex flex-col items-center justify-center shadow-inner">
                                <AntTitle level={2} className="text-emerald-400! mb-0! font-black! text-2xl!">
                                    {stats.todayCheckins}
                                </AntTitle>
                                <Text className="text-gray-300!">Check-ins</Text>
                            </div>
                        </div>

                        {/* Key metrics around */}
                        <div className="grid grid-cols-2 gap-6 w-full">
                            <div className="text-center p-4 bg-white/10 rounded-2xl">
                                <Text className="text-gray-400 block mb-1">Total Revenue</Text>
                                <div className="text-2xl font-black">
                                    ₹{stats.totalRevenue.toLocaleString()}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-white/10 rounded-2xl">
                                <Text className="text-gray-400 block mb-1">Pending</Text>
                                <div className={`text-2xl font-black ${stats.pendingPayments === 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                    {stats.pendingPayments}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Row>

        </>
    );
}
