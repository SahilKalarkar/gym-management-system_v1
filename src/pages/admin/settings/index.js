
import React, { useState, useEffect } from 'react';
import { Card, Switch, Form, Input, DatePicker, Button, Space, Alert, Tag, Divider, Modal, message } from 'antd';
import { SaveOutlined, InfoCircleOutlined, BellOutlined, PhoneOutlined, DatabaseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { SETTINGS } from '@/utilities/apiUrls';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function SettingsPanel() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${SETTINGS}?action=get`);
            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
                form.setFieldsValue(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch settings');
        }
    };

    const handleSave = async (values) => {
        setLoading(true);
        try {
            // 🔥 FormData (NO JSON headers = NO CORS!)
            const formData = new FormData();

            // 🔥 Switches (true/false → FormData)
            formData.append('site_status', values.site_status || false);
            formData.append('email_notifications', values.email_notifications || false);
            formData.append('sms_notifications', values.sms_notifications || false);
            formData.append('backup_enabled', values.backup_enabled || false);

            // 🔥 Text fields
            formData.append('maintenance_message', values.maintenance_message || 'Site is under maintenance');

            // 🔥 RangePicker → Two separate dates
            formData.append('maintenance_start', values.maintenance_period?.[0]?.format('YYYY-MM-DD HH:mm') || '');
            formData.append('maintenance_end', values.maintenance_period?.[1]?.format('YYYY-MM-DD HH:mm') || '');

            const res = await fetch(`${SETTINGS}?action=update`, {
                method: 'POST',
                body: formData  // 🔥 NO headers = SIMPLE request!
            });

            const data = await res.json();
            if (data.success) {
                message.success('Settings saved successfully');
                fetchSettings();
            }
        } catch (error) {
            message.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">
                        System Settings
                    </h2>
                    <span>Configure your admin panel and website behavior</span>
                </div>
            </div>

            <Form form={form} onFinish={handleSave} layout="vertical" className='space-y-4!'>
                {/* Site Maintenance Card */}
                <Card
                    title={
                        <div className="flex items-center gap-2">
                            <InfoCircleOutlined className="text-blue-500!" />
                            Website Status
                        </div>
                    }
                    className="border-none! shadow-2xl!"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl">
                            <div className='space-y-2'>
                                <h3 className="font-semibold text-lg">Site Maintenance Mode</h3>
                                <p className="text-sm">
                                    Turn ON: Shows "Under Maintenance" to visitors<br />
                                    Turn OFF: Shows normal website
                                </p>
                            </div>
                            <Form.Item name="site_status" valuePropName="checked" noStyle>
                                <Switch
                                    checkedChildren="ON"
                                    unCheckedChildren="OFF"
                                    className="w-20 h-10"
                                />
                            </Form.Item>

                        </div>

                        <Divider />

                        <Form.Item
                            name="maintenance_message"
                            label="Maintenance Message"
                            className="mb-0"
                        >
                            <TextArea
                                rows={4}
                                placeholder="Site is under maintenance. We will be back soon!"
                                maxLength={500}
                            />
                        </Form.Item>

                        <Form.Item name="maintenance_period" label="Maintenance Period">
                            <RangePicker
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                className="w-full"
                            />
                        </Form.Item>
                    </div>
                </Card>

                {/* Notifications Card */}
                <Card
                    title={
                        <div className="flex items-center gap-2">
                            <BellOutlined className="text-green-500!" />
                            Notifications
                        </div>
                    }
                    className="border-none! shadow-2xl!"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-3">
                                <Form.Item name="email_notifications" valuePropName="checked" noStyle>
                                    <Switch />
                                </Form.Item>
                                <div>
                                    <div className="font-medium">Email Notifications</div>
                                    <div className="text-sm">Send email alerts for payments, registrations</div>
                                </div>
                            </label>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3">
                                <Form.Item name="sms_notifications" valuePropName="checked" noStyle>
                                    <Switch />
                                </Form.Item>
                                <div>
                                    <div className="font-medium">SMS Notifications</div>
                                    <div className="text-sm">Send SMS for payment reminders, renewals</div>
                                </div>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* System Card */}
                <Card
                    title={
                        <div className="flex items-center gap-2">
                            <DatabaseOutlined className="text-purple-500!" />
                            System
                        </div>
                    }
                    className="border-none shadow-2xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex items-center gap-3">
                            <Form.Item name="backup_enabled" valuePropName="checked" noStyle>
                                <Switch />
                            </Form.Item>
                            <div>
                                <div className="font-medium">Auto Backup</div>
                                <div className="text-sm">Daily database backups at 2 AM</div>
                            </div>
                        </label>
                    </div>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end pt-6">
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        icon={<SaveOutlined />}
                        loading={loading}
                        className="bg-linear-to-r! from-emerald-500! to-green-600! hover:from-emerald-600! hover:to-green-700! px-8! h-12! text-lg! font-medium! shadow-xl!"
                    >
                        Save All Settings
                    </Button>
                </div>
            </Form>
        </div>
    );
}
