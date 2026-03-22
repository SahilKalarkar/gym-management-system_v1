import { useState, useEffect } from 'react';
import {
    Table, Tag, Badge, Button, Input, Space, Modal, Form, Select, DatePicker,
    Popconfirm, message, Row, Col, Card, Typography
} from 'antd';
import {
    SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
    ToolOutlined, TagOutlined, BarcodeOutlined, BuildOutlined,
    CalendarOutlined, DollarCircleOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { EQUIPMENTS } from '@/utilities/apiUrls';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

export default function EquipmentsPage() {
    const [loading, setLoading] = useState(false);
    const [equipments, setEquipments] = useState([]);
    const [filteredEquipments, setFilteredEquipments] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [form] = Form.useForm();
    const [formType, setFormType] = useState('add');

    const [viewMode, setViewMode] = useState(false);

    useEffect(() => {
        fetchEquipments();
    }, []);

    const fetchEquipments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${EQUIPMENTS}?action=get`);
            const data = await res.json();
            if (data.success) {
                setEquipments(data.data);
                setFilteredEquipments(data.data);
            }
        } catch (error) {
            message.error('Failed to fetch equipments');
        } finally {
            setLoading(false);
        }
    };

    // Search filter
    useEffect(() => {
        const filtered = equipments.filter(equipment => {
            const searchLower = searchText.toLowerCase();
            return (
                equipment.equipment_id?.toLowerCase().includes(searchLower) ||
                equipment.name.toLowerCase().includes(searchLower) ||
                equipment.category.toLowerCase().includes(searchLower) ||
                equipment.brand?.toLowerCase().includes(searchLower) ||
                equipment.status.toLowerCase().includes(searchLower)
            );
        });
        setFilteredEquipments(filtered);
    }, [searchText, equipments]);

    const confirmDeleteEquipment = (equipment) => {
        Modal.confirm({
            title: <span className="font-semibold! text-lg!">Delete Equipment?</span>,
            content: (
                <div>
                    Are you sure you want to delete <strong>{equipment.name}</strong>?
                    <br />
                    <span className="text-red-400! text-sm! mt-2! flex! items-center!">
                        <BuildOutlined className="mr-2 text-lg" />
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
                deleteEquipment(equipment.id);
            },
        });
    };

    const equipmentsColumns = [
        {
            title: 'Equipment ID',
            dataIndex: 'equipment_id',
            render: (equipId) => (
                <Tag color="orange" className="font-mono! font-semibold! px-3! py-1!">
                    {equipId}
                </Tag>
            ),
        },
        {
            title: 'Equipment Name',
            key: 'info',
            render: (_, record) => (
                <Space>
                    <div className="w-8 h-8 bg-linear-to-r from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                        <ToolOutlined className="text-white! text-lg!" />
                    </div>
                    <div>
                        <div className="font-semibold">{record.name}</div>
                        {/* <div className="text-sm text-gray-500">{record.brand || 'Generic'}</div> */}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            render: (category) => (
                <Tag color="blue" className="font-medium!">
                    {category}
                </Tag>
            )
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            render: (qty) => (
                <Badge
                    count={qty}
                    style={{ backgroundColor: '#52c41a' }}
                    overflowCount={999}
                />
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => (
                <Badge
                    status={status === 'Available' ? 'success' : status === 'Maintenance' ? 'warning' : 'error'}
                    text={status}
                />
            ),
        },
        {
            title: 'Cost',
            dataIndex: 'cost',
            render: (cost) => cost ? `₹${parseInt(cost).toLocaleString()}` : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => viewEquipment(record)}
                        size="small"
                        className="text-blue-400! border-blue-400!"
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => editEquipment(record)}
                        size="small"
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => confirmDeleteEquipment(record)}
                        className="text-red-400 border-red-400 hover:bg-red-400/20"
                        size="small"
                        danger
                    />
                </Space>
            ),
        }
    ];

    const editEquipment = (equipment) => {
        setEditingEquipment(equipment);
        setFormType('edit');
        setViewMode(false);
        form.setFieldsValue({
            name: equipment.name,
            category: equipment.category,
            brand: equipment.brand || '',
            quantity: equipment.quantity,
            status: equipment.status,
            purchase_date: equipment.purchase_date ? dayjs(equipment.purchase_date) : null,
            next_maintenance: equipment.next_maintenance ? dayjs(equipment.next_maintenance) : null,
            warranty_end: equipment.warranty_end ? dayjs(equipment.warranty_end) : null,
            cost: equipment.cost
        });
        setIsModalVisible(true);
    };


    const viewEquipment = (equipment) => {
        setEditingEquipment(equipment);
        setFormType('view');
        setViewMode(true);
        form.setFieldsValue({
            name: equipment.name,
            category: equipment.category,
            brand: equipment.brand || '',
            quantity: equipment.quantity,
            status: equipment.status,
            purchase_date: equipment.purchase_date ? dayjs(equipment.purchase_date) : null,
            next_maintenance: equipment.next_maintenance ? dayjs(equipment.next_maintenance) : null,
            warranty_end: equipment.warranty_end ? dayjs(equipment.warranty_end) : null,
            cost: equipment.cost
        });
        setIsModalVisible(true);
    };


    const handleFormSubmit = async (values) => {
        setLoading(true);
        try {
            const url = formType === 'add'
                ? `${EQUIPMENTS}?action=add`
                : `${EQUIPMENTS}?action=update&id=${editingEquipment.id}`;

            const formData = new FormData();

            if (formType === 'edit') {
                formData.append('equipment_id', editingEquipment.equipment_id);
            }

            formData.append('name', values.name);
            formData.append('category', values.category);
            formData.append('brand', values.brand || '');
            formData.append('quantity', values.quantity);
            formData.append('status', values.status);
            formData.append('cost', values.cost || 0);

            // 🔥 Date fields - format like Members
            if (values.purchase_date) {
                formData.append('purchase_date', values.purchase_date.format('YYYY-MM-DD'));
            }
            if (values.next_maintenance) {
                formData.append('next_maintenance', values.next_maintenance.format('YYYY-MM-DD'));
            }
            if (values.warranty_end) {
                formData.append('warranty_end', values.warranty_end.format('YYYY-MM-DD'));
            }

            const res = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                message.success(
                    formType === 'add'
                        ? `Equipment added successfully`
                        : 'Equipment updated successfully'
                );
                setIsModalVisible(false);
                form.resetFields();
                fetchEquipments();
            }
        } catch (error) {
            message.error('Failed to save equipment');
        } finally {
            setLoading(false);
        }
    };

    const deleteEquipment = async (id) => {
        try {
            const res = await fetch(`${EQUIPMENTS}?action=delete&id=${id}`, {
                method: 'POST',
            });

            const data = await res.json();
            if (data.success) {
                message.success('Equipment deleted successfully');
                fetchEquipments();
            }
        } catch (error) {
            message.error('Failed to delete equipment');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Row align="middle" className='flex! flex-col! md:flex-row! items-center! justify-between!'>
                <Col>
                    <Title level={2} className="font-bold! mb-0!">Equipment Management</Title>
                    <span>Manage gym equipments, maintenance & inventory</span>
                </Col>
                <Col>
                    <Space>
                        <Search
                            placeholder="Search equipments..."
                            onChange={(e) => setSearchText(e.target.value)}
                            className="max-w-md!"
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setFormType('add');
                                setEditingEquipment(null);
                                setViewMode(false);
                                form.resetFields();
                                setIsModalVisible(true);
                            }}
                            className="bg-linear-to-r! from-orange-500! to-yellow-500! hover:from-orange-600! hover:to-yellow-600!"
                        >
                            Add Equipment
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row gutter={[24, 24]} className='grid! grid-cols-1 md:grid-cols-2! xl:grid-cols-4! gap-4!'>
                <div className="px-4 py-4 border-none bg-linear-to-br from-orange-500/10 via-yellow-500/5 to-amber-500/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-white/20 rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-orange-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl mr-4 shrink-0">
                            <ToolOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium uppercase tracking-wide mb-1">Total Equipments</div>
                            <div className="text-3xl font-black bg-linear-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                                {filteredEquipments.length.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 border-none bg-linear-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-white/20 rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl mr-4 shrink-0">
                            <BarcodeOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium uppercase tracking-wide mb-1">Available</div>
                            <div className="text-3xl font-black bg-linear-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                                {filteredEquipments.filter(e => e.status === 'Available').length}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 border-none bg-linear-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-white/20 rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl mr-4 shrink-0">
                            <BuildOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium uppercase tracking-wide mb-1">Maintenance</div>
                            <div className="text-3xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                {filteredEquipments.filter(e => e.status === 'Maintenance').length}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 border-none bg-linear-to-br from-red-500/10 via-rose-500/5 to-pink-500/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-white/20 rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-xl mr-4 shrink-0">
                            <DollarCircleOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium uppercase tracking-wide mb-1">Out of Order</div>
                            <div className="text-3xl font-black bg-linear-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
                                {filteredEquipments.filter(e => e.status === 'Out of Order').length}
                            </div>
                        </div>
                    </div>
                </div>
            </Row>

            <Table
                columns={equipmentsColumns}
                dataSource={filteredEquipments}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                rowClassName="hover:bg-white/10 transition-colors cursor-pointer"
                size="middle"
            />

            {/* Enhanced Modal with NEW FIELDS */}
            <Modal
                title={
                    formType === 'add' ? 'Add New Equipment' :
                        formType === 'view' ? 'Equipment Details' :
                            'Edit Equipment'
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    initialValues={{
                        status: 'Available',
                        category: 'Strength',
                        quantity: 1,
                        cost: ''
                    }}
                >
                    <div className={viewMode ? 'pointer-events-none select-none opacity-75' : ''}>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="name" label="Name" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                    <Input prefix={<ToolOutlined />} placeholder="Treadmill Pro X" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="category" label="Category" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                    <Select placeholder="Select category">
                                        <Option value="Cardio">Cardio</Option>
                                        <Option value="Strength">Strength</Option>
                                        <Option value="Free Weights">Free Weights</Option>
                                        <Option value="Functional">Functional</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="brand" label="Brand" style={{ marginBottom: 5 }}>
                                    <Input placeholder="Life Fitness" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                    <Input type="number" min={1} placeholder="1" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* NEW DATE FIELDS + COST */}
                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item name="purchase_date" label="Purchase Date" style={{ marginBottom: 5 }}>
                                    <DatePicker
                                        format='DD-MM-YYYY'
                                        style={{ width: '100%' }}
                                        disabledDate={(current) => {
                                            return current && current < dayjs().startOf('day');
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="next_maintenance" label="Next Maintenance Date" style={{ marginBottom: 5 }}>
                                    <DatePicker
                                        format='DD-MM-YYYY'
                                        style={{ width: '100%' }}
                                        disabledDate={(current) => {
                                            return current && current < dayjs().startOf('day');
                                        }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="warranty_end" label="Warranty End" style={{ marginBottom: 5 }}>
                                    <DatePicker
                                        format='DD-MM-YYYY'
                                        style={{ width: '100%' }}
                                        disabledDate={(current) => {
                                            return current && current < dayjs().startOf('day');
                                        }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                                    <Select placeholder="Select status">
                                        <Option value="Available">Available</Option>
                                        <Option value="Maintenance">Maintenance</Option>
                                        <Option value="Out of Order">Out of Order</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="cost" label="Cost (₹)" style={{ marginBottom: 5 }}>
                                    <Input type="number" prefix={<DollarCircleOutlined />} placeholder="50000" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    {!viewMode && (
                        <div className="flex! justify-end space-x-3 pt-4">
                            <Button type="primary" htmlType="submit" loading={loading} className="bg-linear-to-r! from-orange-500! to-yellow-500!">
                                {formType === 'add' ? 'Add Equipment' : 'Update Equipment'}
                            </Button>
                        </div>
                    )}
                </Form>
            </Modal>
        </div>
    );
}
