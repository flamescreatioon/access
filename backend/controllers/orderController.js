const { Order, OrderItem, CafeItem, User, Sequelize } = require('../models');
const { Op } = Sequelize;

// Generate unique order reference (e.g., ORD-12345678-ABCD)
const generateOrderReference = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${randomChars}`;
};

exports.createOrder = async (req, res) => {
    const t = await Order.sequelize.transaction();
    try {
        const { items } = req.body; // array of { cafe_item_id, quantity }
        const user_id = req.user.id;

        if (!items || items.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Order must contain items' });
        }

        let totalAmount = 0;
        const processedItems = [];

        // Validate items and calculate total
        for (const item of items) {
            const cafeItem = await CafeItem.findByPk(item.cafe_item_id, { transaction: t });
            if (!cafeItem) {
                await t.rollback();
                return res.status(404).json({ message: `Cafe item ${item.cafe_item_id} not found` });
            }
            if (!cafeItem.is_available) {
                await t.rollback();
                return res.status(400).json({ message: `Cafe item ${cafeItem.name} is currently unavailable` });
            }

            const itemTotal = parseFloat(cafeItem.price) * item.quantity;
            totalAmount += itemTotal;

            processedItems.push({
                cafe_item_id: cafeItem.id,
                quantity: item.quantity,
                unit_price: cafeItem.price
            });
        }

        const order = await Order.create({
            order_reference: generateOrderReference(),
            user_id,
            total_amount: totalAmount,
            status: 'PENDING_PAYMENT'
        }, { transaction: t });

        // Add items to order
        for (const pItem of processedItems) {
            await OrderItem.create({
                order_id: order.id,
                ...pItem
            }, { transaction: t });
        }

        await t.commit();

        const newOrder = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: 'items', include: [{ model: CafeItem, as: 'cafeItem' }] }]
        });

        res.status(201).json(newOrder);
    } catch (error) {
        if (t) await t.rollback();
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const where = { user_id: req.user.id };
        if (status) where.status = status;

        const orders = await Order.findAll({
            where,
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{ model: CafeItem, as: 'cafeItem' }]
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: OrderItem, as: 'items', include: [{ model: CafeItem, as: 'cafeItem' }] },
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
            ]
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Authorization check
        const isAdmin = req.user.role === 'Admin' || req.user.role === 'Hub Manager';
        if (order.user_id !== req.user.id && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order details', error: error.message });
    }
};

// Admin
exports.getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) where.status = status;

        const orders = await Order.findAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: OrderItem, as: 'items', include: [{ model: CafeItem, as: 'cafeItem' }] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all orders', error: error.message });
    }
};

// Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByPk(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const validStatuses = [
            'PENDING_PAYMENT', 'PAYMENT_UNDER_REVIEW', 'PAYMENT_CONFIRMED',
            'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED', 'REJECTED'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await order.update({ status: status });

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
};

// Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalOrdersToday = await Order.count({
            where: { createdAt: { [Op.gte]: today } }
        });

        const pendingPayments = await Order.count({
            where: { status: 'PENDING_PAYMENT' }
        });

        const inProgress = await Order.count({
            where: { status: { [Op.in]: ['PREPARING', 'READY_FOR_PICKUP'] } }
        });

        const revenueResult = await Order.sum('total_amount', {
            where: { status: { [Op.in]: ['PAYMENT_CONFIRMED', 'COMPLETED', 'PREPARING', 'READY_FOR_PICKUP'] } }
        });

        res.json({
            todayOrders: totalOrdersToday,
            pendingPayments: pendingPayments,
            inProgressOrders: inProgress,
            totalRevenue: revenueResult || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};
