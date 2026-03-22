import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Input, Form, message, Divider, Typography } from 'antd';
import { LockOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import { LOGIN } from '@/utilities/apiUrls';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function AdminLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', values.username);
            formData.append('password', values.password);

            const res = await fetch(LOGIN, {
                method: 'POST',
                body: formData  // NO Content-Type header = SIMPLE request!
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('adminToken', 'loggedin');
                message.success({
                    content: 'Welcome back! Login successful',
                    duration: 2
                });
                router.push('/admin/dashboard');
            } else {
                message.error(data.message || 'Invalid credentials');
                form.setFields([
                    {
                        name: 'password',
                        errors: [' ']
                    }
                ]);
            }
        } catch (error) {
            message.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
            {/* Animated Background Shapes */}
            <div className="absolute inset-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-40 left-1/2 w-96 h-96 bg-linear-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-spin-slow"></div>
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 transform hover:scale-[1.02] transition-all duration-300">

                    {/* Header */}
                    <div className="text-center mb-4">
                        <Title level={2} className="text-3xl! font-black! text-white! mb-2! drop-shadow-lg!">
                            Admin Portal
                        </Title>
                        <Text className="text-gray-300! text-sm! font-medium!">
                            Sign in to continue to PowerForge Dashboard
                        </Text>
                    </div>

                    {/* Form */}
                    <Form
                        form={form}
                        name="admin-login"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                        className="space-y-6"
                    >
                        <div className="space-y-4!">
                            <Form.Item
                                name="username"
                                rules={[
                                    { required: true, message: 'Username is required!' },
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input
                                    prefix={<UserOutlined className="text-gray-400" />}
                                    placeholder="Enter your username"
                                    className="h-10 rounded-2xl! border-2! border-gray-700/50! bg-white/5! backdrop-blur-sm! text-white! placeholder-gray-400! focus:border-orange-500! focus:bg-white/10! transition-all! duration-300!"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[
                                    { required: true, message: 'Password is required!' },
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-gray-400" />}
                                    placeholder="Enter your password"
                                    className="h-10 rounded-2xl! border-2! border-gray-700/50! bg-white/5! backdrop-blur-sm! text-white! placeholder-gray-400! focus:border-orange-500! focus:bg-white/10! transition-all! duration-300!"
                                />
                            </Form.Item>
                        </div>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                size="large"
                                className="h-14 bg-linear-to-r! from-orange-500! to-red-600! hover:from-orange-600! hover:to-red-700! text-white! font-bold! rounded-2xl! shadow-xl! transform! hover:scale-[1.02]! transition-all! duration-200! border-none! py-3!"
                                icon={loading ? null : <LoginOutlined />}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </Form.Item>
                    </Form>

                    {/* Footer */}
                    <div className="mt-4 border-t border-gray-700/30 text-center">
                        <Text className="text-gray-400 text-xs">
                            © 2026 PowerForge. All rights reserved.
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
}
