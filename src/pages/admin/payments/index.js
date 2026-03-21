import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
    Table, Tag, Badge, Button, Input, Space, Modal, Form, DatePicker, Select,
    Popconfirm, message, Skeleton, Row, Col, Card, Typography, Statistic
} from 'antd';
import {
    SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
    FileTextOutlined, UserOutlined, DollarCircleOutlined, CalendarOutlined,
    CreditCardOutlined, ClockCircleOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { MEMBERS, PAYMENTS } from '@/utilities/apiUrls';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

export default function PaymentsPage() {
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);
    const [nextPaymentId, setNextPaymentId] = useState('PAY001');

    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [form] = Form.useForm();
    const [formType, setFormType] = useState('add');

    // --------------------- THIS IS FOR MEMBER LIST DROPDOWN ------------------------- //
    const [membersList, setMembersList] = useState([]);

    useEffect(() => {
        fetchMembersForDropdown();
    }, []);

    const fetchMembersForDropdown = async () => {
        try {
            const res = await fetch(`${MEMBERS}?action=get`);
            const data = await res.json();
            if (data.success) {
                setMembersList(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch members');
        }
    };

    const handleMemberSelect = (memberId) => {
        const member = membersList.find(m => m.member_id === memberId);
        if (member) {
            form.setFieldsValue({
                member_id: member.member_id,
                member_name: member.name
            });
        }
    };



    const generatePaymentId = () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PAY${year}${month}${day}${random}`;
    };



    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${PAYMENTS}?action=get`);
            const data = await res.json();
            if (data.success) {
                setPayments(data.data);
                setFilteredPayments(data.data);
            }
        } catch (error) {
            message.error('Failed to fetch payments');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const filtered = payments.filter(payment => {
            const searchLower = searchText.toLowerCase();
            const isOverdue = dayjs().isAfter(dayjs(payment.due_date));

            return (
                payment.id?.toLowerCase().includes(searchLower) ||
                payment.payment_id.toLowerCase().includes(searchLower) ||
                payment.member_name.toLowerCase().includes(searchLower) ||
                payment.member_id?.toLowerCase().includes(searchLower) ||
                payment.amount.toString().includes(searchLower) ||
                payment.membership_type.toLowerCase().includes(searchLower) ||
                payment.method.toLowerCase().includes(searchLower) ||
                payment.status.toLowerCase().includes(searchLower) ||
                dayjs(payment.payment_date).format('DD MMM, YYYY').toLowerCase().includes(searchLower) ||
                dayjs(payment.due_date).format('DD MMM').toLowerCase().includes(searchLower) ||
                payment.payment_date.toLowerCase().includes(searchLower) ||
                payment.due_date.toLowerCase().includes(searchLower) ||
                (searchLower === 'overdue' && isOverdue) ||
                (isOverdue && searchLower.includes('due'))
            );
        });
        setFilteredPayments(filtered);
    }, [searchText, payments]);



    const confirmDeletePayment = (payment) => {
        Modal.confirm({
            title: <span className="font-semibold text-lg">Delete Payment?</span>,
            content: (
                <div>
                    Are you sure you want to delete payment <strong>#{payment.payment_id}</strong>?
                    <br />
                    <span className="text-red-400 text-sm mt-2 flex items-center">
                        This action cannot be undone
                    </span>
                </div>
            ),
            okText: 'Delete Permanently',
            okType: 'danger',
            cancelText: 'Cancel',
            icon: <DeleteOutlined className="text-red-500! text-2xl!" />,
            className: 'custom-delete-modal',
            onOk: () => {
                deletePayment(payment.id);
            },
        });
    };

    const paymentsColumns = [
        {
            title: 'Payment Info',
            key: 'info',
            render: (_, record) => (
                <Space>
                    <div className="w-8 h-8 bg-linear-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                        <DollarCircleOutlined className="text-white! text-lg!" />
                    </div>
                    <div>
                        <div className="font-semibold">#{record.payment_id}</div>
                        <div className="text-sm">{record.member_name}</div>
                    </div>
                </Space>
            ),
            width: 280
        },
        {
            title: 'Amount',
            key: 'amount',
            render: (_, record) => (
                <div>
                    <div className="text-base font-semibold">₹{record.amount.toLocaleString()}</div>
                    <div className="text-xs">{record.membership_type}</div>
                </div>
            ),
            width: 150
        },
        {
            title: 'Method',
            dataIndex: 'method',
            render: (method) => (
                <Tag color={method === 'UPI' ? 'cyan' : method === 'Card' ? 'blue' : method === 'Cash' ? 'orange' : 'green'}>
                    {method}
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => (
                <Badge
                    status={status === 'paid' ? 'success' : status === 'pending' ? 'warning' : 'default'}
                    text={status.charAt(0).toUpperCase() + status.slice(1)}
                />
            )
        },
        {
            title: 'Payment Date',
            dataIndex: 'payment_date',
            render: (date) => <span>{dayjs(date).format('DD MMM, YYYY')}</span>
        },
        {
            title: 'Due Date',
            dataIndex: 'due_date',
            render: (date) => (
                <div className='flex items-center gap-2'>
                    <span className={dayjs().isAfter(dayjs(date)) ? 'text-red-400 font-medium' : ''}>
                        {dayjs(date).format('DD MMM, YYYY')}
                    </span>
                    {dayjs().isAfter(dayjs(date)) && (
                        <Tag color="red" size="small" className="ml-2">Overdue</Tag>
                    )}
                </div>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => editPayment(record)}
                        size="small"
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => confirmDeletePayment(record)}
                        size="small"
                        danger
                    />
                </Space>
            ),
            width: 150
        }
    ];

    const editPayment = (payment) => {
        setEditingPayment(payment);
        setFormType('edit');
        setNextPaymentId(payment.payment_id);

        form.setFieldsValue({
            member_id: payment.member_id,
            member_name: payment.member_name,
            payment_id: payment.payment_id,
            amount: payment.amount,
            membership_type: payment.membership_type,
            method: payment.method,
            status: payment.status,
            payment_date: dayjs(payment.payment_date),
            due_date: dayjs(payment.due_date)
        });
        setIsModalVisible(true);
    };

    const handleFormSubmit = async (values) => {
        setLoading(true);
        try {
            const url = formType === 'add'
                ? `${PAYMENTS}?action=add`
                : `${PAYMENTS}?action=update&id=${editingPayment.id}`;

            // 🔥 FormData (NO JSON headers = NO CORS!)
            const formData = new FormData();
            formData.append('payment_id', values.payment_id);
            formData.append('member_id', values.member_id);
            formData.append('member_name', values.member_name);
            formData.append('amount', parseFloat(values.amount));
            formData.append('membership_type', values.membership_type);
            formData.append('method', values.method);
            formData.append('status', values.status);
            formData.append('payment_date', dayjs(values.payment_date).format('YYYY-MM-DD'));
            formData.append('due_date', dayjs(values.due_date).format('YYYY-MM-DD'));

            const res = await fetch(url, {
                method: 'POST',
                body: formData  // 🔥 NO headers = SIMPLE request!
            });

            const data = await res.json();
            if (data.success) {
                message.success(formType === 'add' ? 'Payment added successfully' : 'Payment updated successfully');
                setIsModalVisible(false);
                form.resetFields();
                fetchPayments();
            }
        } catch (error) {
            message.error('Failed to save payment');
        } finally {
            setLoading(false);
        }
    };



    const deletePayment = async (id) => {
        try {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('id', id);

            const res = await fetch(`${PAYMENTS}`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                message.success('Payment deleted successfully');
                fetchPayments();
            }
        } catch (error) {
            message.error('Failed to delete payment');
        }
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={2} className="font-bold! mb-0!">Payments Management</Title>
                    <span>Track membership payments and billing</span>
                </Col>
                <Col>
                    <Space>
                        <Search
                            placeholder="Search payments..."
                            onChange={(e) => setSearchText(e.target.value)}
                            className="max-w-md"
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setFormType('add');
                                setEditingPayment(null);
                                form.resetFields();
                                const newPaymentId = generatePaymentId();
                                form.setFieldsValue({
                                    payment_id: newPaymentId,
                                    payment_date: dayjs(),  // 🔥 Today
                                    due_date: dayjs().add(30, 'day')  // 🔥 +30 days
                                });
                                setNextPaymentId(newPaymentId);
                                setIsModalVisible(true);
                            }}
                            className="bg-linear-to-r! from-emerald-500! to-green-600! hover:from-emerald-600! hover:to-green-700!"
                        >
                            Add Payment
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row gutter={[24, 24]} className='grid! grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className="px-4 py-4 border-none bg-linear-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-white/20 rounded-2xl p-6">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl mr-4 shrink-0">
                            <CheckCircleOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-1">Paid</div>
                            <div className="text-3xl font-black bg-linear-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                                {filteredPayments.filter(p => p.status === 'paid').length}
                            </div>
                            <div className="flex items-center text-xs text-blue-400 font-medium mt-1">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-1 animate-pulse"></span>
                                92% collection
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 border-none bg-linear-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-white/20 rounded-2xl p-6">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-xl mr-4 shrink-0">
                            <ClockCircleOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-1">Pending</div>
                            <div className="text-3xl font-black bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                                ₹{filteredPayments
                                    .filter(p => p.status === 'pending')
                                    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
                                    .toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                            </div>
                            <div className="flex items-center text-xs text-orange-400 font-medium mt-1">
                                <span className="w-2 h-2 bg-orange-400 rounded-full mr-1 animate-pulse"></span>
                                {filteredPayments.filter(p => p.status === 'pending').length} payments due
                            </div>
                        </div>
                    </div>
                </div>


                <div className="px-4 py-4 border-none bg-linear-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-white/20 rounded-2xl p-6">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mr-4 shrink-0">
                            <CreditCardOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-1">UPI Payments</div>
                            <div className="text-3xl font-black bg-linear-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                                {filteredPayments.filter(p => p.method === 'UPI').length}
                            </div>
                            <div className="flex items-center text-xs text-purple-400 font-medium mt-1">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-1 animate-pulse"></span>
                                Most popular
                            </div>
                        </div>
                    </div>
                </div>
            </Row>

            {/* Payments Table */}
            <Table
                columns={paymentsColumns}
                dataSource={filteredPayments}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                }}
                rowClassName="hover:bg-white/10 transition-colors cursor-pointer"
                // scroll={{ x: 1200 }}
                size="middle"
            />

            {/* Add/Edit Payment Modal */}
            <Modal
                title={formType === 'add' ? 'Add New Payment' : 'Edit Payment'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item name="member_id" label="Select Member" rules={[{ required: true }]}>
                                <Select
                                    showSearch
                                    placeholder="Search by member name..."
                                    optionFilterProp="children"
                                    onChange={handleMemberSelect}
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {membersList.map(member => (
                                        <Option key={member.id} value={member.member_id}>
                                            {member.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                        </Col>
                    </Row>

                    <Form.Item name="member_name" style={{ display: 'none' }}>
                        <Input />
                    </Form.Item>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="payment_id" label="Payment ID" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <Input readOnly prefix={<FileTextOutlined />} placeholder="PAY001" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="amount" label="Amount" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <Input type="number" prefix="₹" placeholder="1500" />
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
                            <Form.Item name="method" label="Payment Method" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <Select placeholder="Select method">
                                    <Option value="UPI">UPI</Option>
                                    <Option value="Card">Card</Option>
                                    <Option value="Cash">Cash</Option>
                                    <Option value="Wallet">Wallet</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="payment_date" label="Payment Date" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="due_date" label="Due Date" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="status" label="Status" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                <Select placeholder="Select status">
                                    <Option value="paid">Paid</Option>
                                    <Option value="pending">Pending</Option>
                                    <Option value="failed">Failed</Option>
                                </Select>
                            </Form.Item>
                        </Col>                    </Row>

                    <div className="flex justify-end">
                        <Button type="primary" htmlType="submit" loading={loading}
                            className="bg-linear-to-r! from-emerald-500! to-green-600!">
                            {formType === 'add' ? 'Add Payment' : 'Update Payment'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
