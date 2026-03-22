import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
    Table, Tag, Badge, Button, Input, Space, Modal, Form, DatePicker, Select,
    Popconfirm, message, Skeleton, Row, Col, Card, Typography, Statistic, TimePicker
} from 'antd';
import {
    SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
    ClockCircleOutlined, UserOutlined, EnvironmentOutlined, VideoCameraOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { CLASSES, TRAINERS } from '@/utilities/apiUrls';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

export default function ClassesPage() {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [form] = Form.useForm();
    const [formType, setFormType] = useState('add');

    const [trainers, setTrainers] = useState([]);

    const [viewMode, setViewMode] = useState(false);


    const fetchClasses = async () => {
        setLoading(true);
        try {
            const [classesRes, trainersRes] = await Promise.all([
                fetch(`${CLASSES}?action=get`),
                fetch(`${TRAINERS}?action=get&status=active`)
            ]);
            const classesData = await classesRes.json();
            const trainersData = await trainersRes.json();
            if (classesData.success) {
                setClasses(classesData.data);
                setFilteredClasses(classesData.data);
            }
            if (trainersData.success) {
                setTrainers(trainersData.data);
            }
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        const filtered = classes.filter(cls => {
            const searchLower = searchText.toLowerCase();
            return (
                cls.title?.toLowerCase().includes(searchLower) ||
                cls.trainer_name?.toLowerCase().includes(searchLower) ||
                cls.type?.toLowerCase().includes(searchLower) ||
                cls.day?.toLowerCase().includes(searchLower) ||
                cls.location?.toLowerCase().includes(searchLower) ||
                cls.status?.toLowerCase().includes(searchLower)
            );
        });
        setFilteredClasses(filtered);
    }, [searchText, classes]);


    const confirmDeleteClass = (cls) => {
        Modal.confirm({
            title: <span className="font-semibold! text-lg!">Delete Class?</span>,
            content: (
                <div>
                    Are you sure you want to delete <strong>"{cls.title}"</strong>?
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
                deleteClass(cls.id);
            },
        });
    };


    const classesColumns = [
        {
            title: 'Class Name',
            key: 'info',
            render: (_, record) => (
                <Space>
                    <div className="w-8 h-8 bg-linear-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                        <VideoCameraOutlined className="text-white! text-lg!" />
                    </div>
                    <div>
                        <div className="font-semibold">{record.title}</div>
                        {/* <div>{record.trainer_name || '--'}</div> */}
                    </div>
                </Space>
            ),
            width: 280
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (type) => (
                <Tag color={type === 'Yoga' ? 'purple' : type === 'Cardio' ? 'red' : type === 'Strength' ? 'orange' : 'green'}>
                    {type}
                </Tag>
            )
        },
        {
            title: 'Schedule',
            key: 'schedule',
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.day}</div>
                    {/* <div className="text-sm">{record.start_time} - {record.end_time}</div> */}
                </div>
            )
        },
        {
            title: 'Location',
            dataIndex: 'location',
            render: (location) => <span>{location}</span>
        },
        {
            title: 'Capacity',
            key: 'capacity',
            render: (_, record) => (
                <div>
                    <div className="font-bold text-emerald-400">{record.current_enrolled}/{record.capacity}</div>
                    <div className="text-xs">{((record.current_enrolled / record.capacity) * 100).toFixed(0)}%</div>
                </div>
            ),
            width: 120
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => (
                <Badge
                    status={status === 'active' ? 'success' : status === 'full' ? 'warning' : 'default'}
                    text={status.charAt(0).toUpperCase() + status.slice(1)}
                />
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => viewClass(record)}
                        size="small"
                        className="text-blue-400! border-blue-400!"
                        title="View Details"
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => editClass(record)}
                        size="small"
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => confirmDeleteClass(record)}
                        size="small"
                        danger
                    />
                </Space>
            ),
            width: 150
        }
    ];

    const editClass = (cls) => {
        setEditingClass(cls);
        setFormType('edit');
        setViewMode(false);
        form.setFieldsValue({
            title: cls.title,
            trainer_id: cls.trainer_id,
            trainer_name: cls.trainer_name,
            type: cls.type,
            day: cls.day,
            start_time: dayjs(cls.start_time, 'HH:mm'),
            end_time: dayjs(cls.end_time, 'HH:mm'),
            location: cls.location,
            capacity: cls.capacity,
            current_enrolled: cls.current_enrolled,
            status: cls.status
        });
        setIsModalVisible(true);
    };

    const viewClass = (cls) => {
        setEditingClass(cls);
        setFormType('view');
        setViewMode(true);
        form.setFieldsValue({
            title: cls.title,
            trainer_id: cls.trainer_id,
            trainer_name: cls.trainer_name,
            type: cls.type,
            day: cls.day,
            start_time: dayjs(cls.start_time, 'HH:mm'),
            end_time: dayjs(cls.end_time, 'HH:mm'),
            location: cls.location,
            capacity: cls.capacity,
            current_enrolled: cls.current_enrolled,
            status: cls.status
        });
        setIsModalVisible(true);
    };


    const handleFormSubmit = async (values) => {
        setLoading(true);
        try {
            const url = formType === 'add'
                ? `${CLASSES}?action=add`
                : `${CLASSES}?action=update&id=${editingClass.id}`;

            // 🔥 FormData + TimePicker format (NO CORS!)
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('trainer_id', values.trainer_id);
            formData.append('trainer_name', values.trainer_name);
            formData.append('type', values.type);
            formData.append('day', values.day);
            formData.append('location', values.location);
            formData.append('capacity', values.capacity);
            formData.append('current_enrolled', values.current_enrolled || 0);
            formData.append('status', values.status);

            // 🔥 TimePicker dayjs format
            formData.append('start_time', dayjs(values.start_time).format('HH:mm'));
            formData.append('end_time', dayjs(values.end_time).format('HH:mm'));

            const res = await fetch(url, {
                method: 'POST',
                body: formData  // NO JSON headers = SIMPLE request!
            });

            const data = await res.json();
            if (data.success) {
                message.success(formType === 'add' ? 'Class added successfully' : 'Class updated successfully');
                setIsModalVisible(false);
                form.resetFields();
                fetchClasses();
            }
        } catch (error) {
            message.error('Failed to save class');
        } finally {
            setLoading(false);
        }
    };


    const deleteClass = async (id) => {
        try {
            const res = await fetch(`${CLASSES}?action=delete&id=${id}`, {
                method: 'POST',
            });

            const data = await res.json();
            if (data.success) {
                message.success('Class deleted successfully');
                fetchClasses();
            }
        } catch (error) {
            message.error('Failed to delete class');
        }
    };



    return (
        <div className="space-y-6">
            {/* Header */}
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={2} className="font-bold! mb-0!">Classes Management</Title>
                    <span>Schedule and manage fitness classes</span>
                </Col>
                <Col>
                    <Space>
                        <Search
                            placeholder="Search classes..."
                            onChange={(e) => setSearchText(e.target.value)}
                            className="max-w-md!"
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setFormType('add');
                                setEditingClass(null);
                                setViewMode(false);
                                form.resetFields();
                                setIsModalVisible(true);
                            }}
                            className="bg-linear-to-r! from-purple-500! to-pink-600! hover:from-purple-600! hover:to-pink-700!"
                        >
                            Add Class
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row gutter={[24, 24]} className='grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-4! gap-4!'>
                <div className="px-4 py-4 border-none bg-linear-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl shadow-2xl rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mr-4">
                            <VideoCameraOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium">Total Classes</div>
                            <div className="text-3xl font-black">{filteredClasses.length}</div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4  border-none bg-linear-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl shadow-2xl rounded-2xl">
                    <div className="flex items-center h-full">
                        <div className="w-14 h-14 bg-linear-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl mr-4">
                            <ClockCircleOutlined className="text-2xl! text-white!" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium">Today's Classes</div>
                            <div className="text-3xl font-black">
                                {filteredClasses.filter(c => c.day === 'Monday').length}
                            </div>
                        </div>
                    </div>
                </div>
            </Row>

            {/* Classes Table */}
            <Table
                columns={classesColumns}
                dataSource={filteredClasses}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                }}
                rowClassName="hover:bg-white/10 transition-colors cursor-pointer"
                // scroll={ { x: 1200 }}
                size="middle"
            />

            {/* Add/Edit Class Modal */}
            <Modal
                title={
                    formType === 'add' ? 'Add New Class' :
                        formType === 'view' ? 'Class Details' :
                            'Edit Class'
                }

                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                    <div className={viewMode ? 'pointer-events-none select-none opacity-75' : ''}>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="title" label="Class Title" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                    <Input prefix={<VideoCameraOutlined />} placeholder="Class name" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="trainer_id" label="Select Trainer" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                    <Select
                                        showSearch
                                        placeholder="Choose trainer"
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().includes(input.toLowerCase())
                                        }
                                        onChange={(value, option) => {
                                            form.setFieldsValue({
                                                trainer_name: option.children
                                            });
                                        }}
                                    >
                                        {trainers.map(trainer => (
                                            <Option key={trainer.id} value={trainer.id}>
                                                {trainer.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item name="trainer_name" style={{ display: 'none' }}>
                            <Input />
                        </Form.Item>

                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item name="type" label="Class Type" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                    <Select placeholder="Select type">
                                        <Option value="Yoga">Yoga</Option>
                                        <Option value="Cardio">Cardio</Option>
                                        <Option value="Strength">Strength Training</Option>
                                        <Option value="Zumba">Zumba</Option>
                                        <Option value="HIIT">HIIT</Option>
                                        <Option value="Pilates">Pilates</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="day" label="Day" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                    <Select placeholder="Select day">
                                        <Option value="Monday">Monday</Option>
                                        <Option value="Tuesday">Tuesday</Option>
                                        <Option value="Wednesday">Wednesday</Option>
                                        <Option value="Thursday">Thursday</Option>
                                        <Option value="Friday">Friday</Option>
                                        <Option value="Saturday">Saturday</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="location" label="Location" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                    <Input prefix={<EnvironmentOutlined />} placeholder="Studio A/B/C" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item name="start_time" label="Start Time" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                    <TimePicker style={{ width: '100%' }} format="HH:mm" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="end_time" label="End Time" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                    <TimePicker style={{ width: '100%' }} format="HH:mm" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="capacity" label="Capacity" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                    <Input type="number" placeholder="Max students" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="current_enrolled" label="Current Enrolled" style={{ marginBottom: 5 }}>
                                    <Input type="number" placeholder="0" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="status" label="Status" rules={[{ required: true }]} style={{ marginBottom: 5 }}>
                                    <Select placeholder="Select status">
                                        <Option value="active">Active</Option>
                                        <Option value="full">Full</Option>
                                        <Option value="inactive">Inactive</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    {!viewMode && (
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button type="primary" htmlType="submit" loading={loading}
                                className="bg-linear-to-r! from-purple-500! to-pink-600!">
                                {formType === 'add' ? 'Add Class' : 'Update Class'}
                            </Button>
                        </div>
                    )}
                </Form>
            </Modal>
        </div>
    );
}
