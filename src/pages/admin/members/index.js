
import { useState, useEffect } from 'react';
import {
    Table, Tag, Badge, Button, Input, Space, Modal, Form, DatePicker, Select,
    Popconfirm, message, Row, Col, Card, Typography
} from 'antd';
import {
    SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
    UserOutlined, PhoneOutlined, MailOutlined, CalendarOutlined,
    FireOutlined,
    DollarCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { MEMBERS } from '@/utilities/apiUrls';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

export default function MembersPage() {
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [form] = Form.useForm();
    const [formType, setFormType] = useState('add'); // 'add' or 'edit'

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${MEMBERS}?action=get`);
            const data = await res.json();
            if (data.success) {
                setMembers(data.data);
                setFilteredMembers(data.data);
            }
        } catch (error) {
            message.error('Failed to fetch members');
        } finally {
            setLoading(false);
        }
    };

    // Search filter
    useEffect(() => {
        const filtered = members.filter(member => {
            const searchLower = searchText.toLowerCase();
            return (
                member.member_id?.toLowerCase().includes(searchLower) ||
                member.name.toLowerCase().includes(searchLower) ||
                member.email.toLowerCase().includes(searchLower) ||
                member.phone.toLowerCase().includes(searchLower) ||
                member.membership_type.toLowerCase().includes(searchLower) ||
                member.status.toLowerCase().includes(searchLower) ||
                dayjs(member.join_date).format('DD MMM, YYYY').toLowerCase().includes(searchLower) ||
                dayjs(member.join_date).format('DD/MM/YYYY').toLowerCase().includes(searchLower) ||
                member.join_date.toLowerCase().includes(searchLower)
            );
        });
        setFilteredMembers(filtered);
    }, [searchText, members]);

    const confirmDeleteMember = (member) => {
        Modal.confirm({
            title: <span className="font-semibold! text-lg!">Delete Member?</span>,
            content: (
                <div>
                    Are you sure you want to delete <strong>{member.name}</strong>?
                    <br />
                    <span className="text-red-400! text-sm! mt-2! flex! items-center!">
                        <FireOutlined className="mr-2 text-lg" />
                        This action cannot be undone.
                    </span>
                </div>
            ),
            okText: 'Delete Permanently',
            okType: 'danger',
            cancelText: 'Cancel',
            icon: <DeleteOutlined className="text-red-500! text-2xl!" />,
            width: 450,
            onOk: () => {
                deleteMember(member.id);
            },
        });
    };


    const membersColumns = [

        {
            title: 'Member ID',
            dataIndex: 'member_id',
            render: (memberId) => (
                <Tag color="cyan" className="font-mono! font-semibold! px-3! py-1!">
                    {memberId}
                </Tag>
            ),
            width: 120
        },
        {
            title: 'Member Info',
            key: 'info',
            render: (_, record) => (
                <Space>
                    <div className="w-8 h-8 bg-linear-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <UserOutlined className="text-white! text-lg!" />
                    </div>
                    <div>
                        <div className="font-semibold ">{record.name}</div>
                        <div className="text-sm">{record.phone}</div>
                    </div>
                </Space>
            ),
            width: 250
        },
        {
            title: 'Email',
            dataIndex: 'email',
            render: (email) => <span>{email}</span>
        },
        {
            title: 'Membership',
            dataIndex: 'membership_type',
            render: (type) => (
                <Tag color={type === 'Elite' ? 'purple' : type === 'Premium' ? 'blue' : 'green'} className="font-medium!">
                    {type}
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => (
                <Badge
                    status={status === 'active' ? 'success' : 'default'}
                    text={status.charAt(0).toUpperCase() + status.slice(1)}
                />
            )
        },
        {
            title: 'Join Date',
            dataIndex: 'join_date',
            render: (date) => <span>{dayjs(date).format('DD MMM, YYYY')}</span>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => editMember(record)}
                        size="small"
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => confirmDeleteMember(record)}  // 🎯 ONE LINE CALL
                        className="text-red-400 border-red-400 hover:bg-red-400/20"
                        size="small"
                        danger
                    />
                </Space>
            ),
            width: 150
        }
    ];

    const editMember = (member) => {
        setEditingMember(member);
        setFormType('edit');
        form.setFieldsValue({
            name: member.name,
            email: member.email,
            phone: member.phone,
            membership_type: member.membership_type,
            status: member.status,
            join_date: dayjs(member.join_date)
        });
        setIsModalVisible(true);
    };

    const handleFormSubmit = async (values) => {
        setLoading(true);
        try {
            const url = formType === 'add'
                ? `${MEMBERS}?action=add`
                : `${MEMBERS}?action=update&id=${editingMember.id}`;

            // 🔥 FormData (NO CORS!)
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('email', values.email);
            formData.append('phone', values.phone);
            formData.append('membership_type', values.membership_type);
            formData.append('status', values.status);
            formData.append('join_date', values.join_date.format('YYYY-MM-DD'));

            const res = await fetch(url, {
                method: 'POST',
                body: formData  // NO JSON headers!
            });

            const data = await res.json();
            if (data.success) {
                message.success(formType === 'add' ? 'Member added successfully' : 'Member updated successfully');
                setIsModalVisible(false);
                form.resetFields();
                fetchMembers();
            }
        } catch (error) {
            message.error('Failed to save member');
        } finally {
            setLoading(false);
        }
    };


    const deleteMember = async (id) => {
        try {
            // 🔥 FormData POST delete (same as trainers!)
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('id', id);

            const res = await fetch(`${MEMBERS}`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                message.success('Member deleted successfully');
                fetchMembers();
            }
        } catch (error) {
            message.error('Failed to delete member');
        }
    };



    return (
        <div className="space-y-6">
            {/* Header */}
            <Row align="middle" className='flex! flex-col! md:flex-row! items-center! justify-between!'>
                <Col>
                    <Title level={2} className="font-bold! mb-0!">Members Management</Title>
                    <span >Manage all gym members and their memberships</span>
                </Col>
                <Col>
                    <Space>
                        <Search
                            placeholder="Search members..."
                            onChange={(e) => setSearchText(e.target.value)}
                            className="max-w-md!"
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setFormType('add');
                                setEditingMember(null);
                                form.resetFields();
                                setIsModalVisible(true);
                            }}
                            className="bg-linear-to-r! from-green-500! to-emerald-600! hover:from-green-600! hover:to-emerald-700!"
                        >
                            Add Member
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Enhanced Stats Cards */}
            <Row gutter={[24, 24]} className='grid! grid-cols-1 md:grid-cols-2! xl:grid-cols-4! gap-4!'>

                <div className="px-4 py-4 border-none bg-linear-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-white/20 rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl mr-4 shrink-0">
                            <UserOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium uppercase tracking-wide mb-1">Total Members</div>
                            <div className="text-3xl font-black bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                {filteredMembers.length.toLocaleString()}
                            </div>
                            <div className="flex items-center text-xs text-green-400 font-medium mt-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                                +{(filteredMembers.length * 0.12).toFixed(0)} this month
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 border-none bg-linear-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-white/20 rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl mr-4 shrink-0">
                            <FireOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium uppercase tracking-wide mb-1">Active Today</div>
                            <div className="text-3xl font-black bg-linear-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                                {filteredMembers.filter(m => m.status === 'active').length}
                            </div>
                            <div className="flex items-center text-xs text-emerald-400 font-medium mt-1">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-1 animate-pulse"></span>
                                78% attendance
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 border-none bg-linear-to-br from-orange-500/10 via-amber-500/5 to-red-500/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-white/20 rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-xl mr-4 shrink-0">
                            <DollarCircleOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium uppercase tracking-wide mb-1">Pending Payments</div>
                            <div className="text-3xl font-black bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                                ₹{(filteredMembers.length * 1500).toLocaleString()}
                            </div>
                            <div className="flex items-center text-xs text-orange-400 font-medium mt-1">
                                <span className="w-2 h-2 bg-orange-400 rounded-full mr-1 animate-pulse"></span>
                                12 due this week
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 border-none bg-linear-to-br from-purple-500/10 via-pink-500/5 to-fuchsia-500/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-white/20 rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mr-4 shrink-0">
                            <ClockCircleOutlined
                                className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium uppercase tracking-wide mb-1">Avg Membership</div>
                            <div className="text-3xl font-black bg-linear-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                                {filteredMembers.length > 0
                                    ? `₹${(filteredMembers.reduce((sum, m) => sum + (m.membership_type === 'Elite' ? 3000 : m.membership_type === 'Premium' ? 2000 : 1000), 0) / filteredMembers.length).toFixed(0)}`
                                    : '₹0'
                                }
                            </div>
                            <div className="flex items-center text-xs text-purple-400 font-medium mt-1">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-1 animate-pulse"></span>
                                Premium avg tier
                            </div>
                        </div>
                    </div>
                </div>
            </Row>


            {/* Members Table */}
            <Table
                columns={membersColumns}
                dataSource={filteredMembers}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                }}
                rowClassName="hover:bg-white/10 transition-colors cursor-pointer"
                // scroll={{ x: 1000 }}
                size="middle"
            />

            {/* Add/Edit Member Modal */}
            <Modal
                title={formType === 'add' ? 'Add New Member' : 'Edit Member'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    initialValues={{ status: 'active', membership_type: 'Basic' }}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="name" label="Full Name" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <Input prefix={<UserOutlined />} placeholder="Enter full name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phone" label="Phone" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]} style={{ marginBottom: 5 }}>
                                <Input prefix={<MailOutlined />} placeholder="Enter email" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="join_date" label="Join Date" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <DatePicker format='DD-MM-YYYY' style={{ width: '100%' }} className="custom-date-picker" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="membership_type" label="Membership Type" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <Select placeholder="Select membership">
                                    <Option value="Basic">Basic - ₹999/month</Option>
                                    <Option value="Premium">Premium - ₹1999/month</Option>
                                    <Option value="Elite">Elite - ₹2999/month</Option>
                                </Select>
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

                    <div className="flex! justify-end space-x-3 pt-4">
                        <Button type="primary" htmlType="submit" loading={loading} className="bg-linear-to-r! from-green-500! to-emerald-600!">
                            {formType === 'add' ? 'Add Member' : 'Update Member'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}