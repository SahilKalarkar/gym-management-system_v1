import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
    Table, Badge, Button, Input, Space, Modal, Form, Select,
    message, Skeleton, Row, Col, Card, Typography, Statistic, Upload
} from 'antd';
import {
    SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
    UserOutlined, PhoneOutlined, MailOutlined, CameraOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { TRAINERS } from '@/utilities/apiUrls';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

export default function TrainersPage() {
    const [loading, setLoading] = useState(false);
    const [trainers, setTrainers] = useState([]);
    const [filteredTrainers, setFilteredTrainers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [form] = Form.useForm();
    const [formType, setFormType] = useState('add');

    const fetchTrainers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${TRAINERS}?action=get`);
            const data = await res.json();
            if (data.success) {
                setTrainers(data.data);
                setFilteredTrainers(data.data);
            }
        } catch (error) {
            message.error('Failed to fetch trainers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainers();
    }, []);

    useEffect(() => {
        const filtered = trainers.filter(trainer => {
            const searchLower = searchText.toLowerCase();
            return (
                trainer.name?.toLowerCase().includes(searchLower) ||
                trainer.specialty?.toLowerCase().includes(searchLower) ||
                trainer.phone?.toLowerCase().includes(searchLower) ||
                trainer.email?.toLowerCase().includes(searchLower) ||
                trainer.status?.toLowerCase().includes(searchLower)
            );
        });
        setFilteredTrainers(filtered);
    }, [searchText, trainers]);

    const confirmDeleteTrainer = (trainer) => {
        Modal.confirm({
            title: <span className="font-semibold! text-lg!">Delete Trainer?</span>,
            content: (
                <div>
                    Are you sure you want to delete <strong>"{trainer.name}"</strong>?
                    <br />
                    <span className="text-red-400 text-sm block mt-2 items-center">
                        This action cannot be undone.
                    </span>
                </div>
            ),
            okText: 'Delete Permanently',
            okType: 'danger',
            cancelText: 'Cancel',
            icon: <DeleteOutlined className="text-red-500! text-2xl!" />,
            onOk: () => {
                deleteTrainer(trainer.id);
            },
        });
    };

    const trainersColumns = [
        {
            title: 'Trainer Info',
            key: 'info',
            render: (_, record) => {
                const initials = record.name
                    ? record.name.charAt(0).toUpperCase() +
                    (record.name.match(/ /)?.[0]?.charAt(1)?.toUpperCase() || record.name.charAt(1)?.toUpperCase() || '')
                    : 'TN';
                return (
                    <Space>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shadow-md">
                            {record.image ? (
                                <img
                                    src={record.image}
                                    alt={record.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback to initials if image fails
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className={`w-full h-full bg-linear-to-r from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm ${record.image ? 'hidden' : 'flex'}`}
                            >
                                {initials}
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">{record.name}</div>
                            <div className="text-sm text-orange-600 font-medium">{record.specialty}</div>
                        </div>
                    </Space>
                );
            },
            width: 300
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_, record) => (
                <div className="space-y-1">
                    <div className="flex items-center text-sm">
                        <PhoneOutlined className="text-orange-500 mr-1" />
                        {record.phone}
                    </div>
                    {record.email && (
                        <div className="flex items-center text-sm text-gray-600">
                            <MailOutlined className="text-orange-500 mr-1" />
                            {record.email}
                        </div>
                    )}
                </div>
            ),
            width: 220
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => (
                <Badge
                    status={status === 'active' ? 'success' : 'default'}
                    text={status.charAt(0).toUpperCase() + status.slice(1)}
                />
            ),
            width: 120
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => editTrainer(record)}
                        size="small"
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => confirmDeleteTrainer(record)}
                        size="small"
                        danger
                    />
                </Space>
            ),
            width: 150
        }
    ];

    const editTrainer = (trainer) => {
        setEditingTrainer(trainer);
        setFormType('edit');
        form.setFieldsValue(trainer);
        setIsModalVisible(true);
    };

    const handleFormSubmit = async (values) => {
        setLoading(true);
        try {
            const url = formType === 'add'
                ? `${TRAINERS}?action=create`
                : `${TRAINERS}?action=update`;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    id: editingTrainer?.id
                })
            });

            const data = await res.json();
            if (data.success) {
                message.success(formType === 'add' ? 'Trainer added successfully' : 'Trainer updated successfully');
                setIsModalVisible(false);
                form.resetFields();
                fetchTrainers();
            }
        } catch (error) {
            message.error('Failed to save trainer');
        } finally {
            setLoading(false);
        }
    };

    const deleteTrainer = async (id) => {
        try {
            const res = await fetch(`${TRAINERS}?action=delete&id=${id}`);
            const data = await res.json();
            if (data.success) {
                message.success('Trainer deleted successfully');
                fetchTrainers();
            }
        } catch (error) {
            message.error('Failed to delete trainer');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={2} className="font-bold! mb-0! text-gray-900">Trainers Management</Title>
                    <span className="text-gray-600">Manage your fitness trainers and instructors</span>
                </Col>
                <Col>
                    <Space>
                        <Search
                            placeholder="Search trainers..."
                            onChange={(e) => setSearchText(e.target.value)}
                            className="max-w-md!"
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setFormType('add');
                                setEditingTrainer(null);
                                form.resetFields();
                                setIsModalVisible(true);
                            }}
                            className="bg-linear-to-r! from-orange-500! to-red-600! hover:from-orange-600! hover:to-red-700!"
                        >
                            Add Trainer
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Stats Cards - ORANGE THEME */}
            <Row gutter={[24, 24]} className='grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-3! gap-6!'>
                <div className="px-4 py-4 border-none bg-linear-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl shadow-2xl rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-xl mr-4">
                            <UserOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-600">Total Trainers</div>
                            <div className="text-4xl font-black text-gray-900">{filteredTrainers.length}</div>
                            <div className="flex items-center text-xs text-orange-500 font-medium">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-1 animate-pulse"></span>
                                {filteredTrainers.filter(t => t.status === 'active').length} active
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 border-none bg-linear-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl shadow-2xl rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl mr-4">
                            <CheckCircleOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-600">Active Trainers</div>
                            <div className="text-4xl font-black text-emerald-600">
                                {filteredTrainers.filter(t => t.status === 'active').length}
                            </div>
                            <div className="flex items-center text-xs text-emerald-500 font-medium">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                                Ready to train
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 border-none bg-linear-to-br from-gray-500/10 to-gray-400/10 backdrop-blur-xl shadow-2xl rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-xl mr-4">
                            <PhoneOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-600">Contact Info</div>
                            <div className="text-4xl font-black text-gray-900">
                                {filteredTrainers.filter(t => t.phone).length}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 font-medium">
                                <span className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-pulse"></span>
                                With phone numbers
                            </div>
                        </div>
                    </div>
                </div>
            </Row>

            {/* Trainers Table */}
                <Table
                    columns={trainersColumns}
                    dataSource={filteredTrainers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                    }}
                    rowClassName="hover:bg-white/10 transition-colors cursor-pointer"
                    // scroll={{ x: 1200 }}
                    size="middle"
                />
          
            {/* Add/Edit Trainer Modal */}
            <Modal
                title={formType === 'add' ? 'Add New Trainer' : 'Edit Trainer'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="name" label="Full Name" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <Input prefix={<UserOutlined />} placeholder="Enter full name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="specialty" label="Specialty" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <Input prefix={<CameraOutlined />} placeholder="Yoga, HIIT, CrossFit etc." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="phone" label="Phone" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <Input prefix={<PhoneOutlined />} placeholder="9876543210" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" style={{ marginBottom: 5 }}>
                                <Input prefix={<MailOutlined />} placeholder="trainer@example.com" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="image" label="Profile Image" style={{ marginBottom: 5 }}>
                                <Input placeholder="/images/trainer1.png" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="status" label="Status" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <Select placeholder="Select status">
                                    <Option value="active">Active</Option>
                                    <Option value="inactive">Inactive</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={loading}
                            className="bg-linear-to-r! from-orange-500! to-red-600! hover:from-orange-600! hover:to-red-700!"
                        >
                            {formType === 'add' ? 'Add Trainer' : 'Update Trainer'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
