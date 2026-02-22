const { User, AccessLog, Booking, Sequelize } = require('../models');
const { Op } = Sequelize;

// Simple In-Memory Cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCached = (key) => {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }
    return null;
};

const setCache = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

exports.getDashboardStats = async (req, res) => {
    try {
        const cacheKey = 'dashboard_stats';
        const cachedData = getCached(cacheKey);
        if (cachedData) return res.json(cachedData);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalMembers,
            activeToday,
            totalBookings,
            securityFailures,
            insideNow
        ] = await Promise.all([
            User.count({
                where: {
                    role: { [Op.in]: ['Student', 'Lecturer', 'Member'] }
                }
            }),
            AccessLog.count({
                where: {
                    createdAt: { [Op.gte]: today },
                    decision: 'Grant'
                }
            }),
            Booking.count(),
            AccessLog.count({
                where: {
                    decision: 'Deny'
                }
            }),
            User.count({
                where: { is_inside: true }
            })
        ]);

        res.json({
            totalMembers,
            activeToday,
            totalBookings,
            securityFailures,
            insideNow,
            capacityLimit: 200 // Default capacity
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics stats', error: error.message });
    }
};

exports.getGrowthData = async (req, res) => {
    try {
        const days = 14;
        const growthData = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = await User.count({
                where: {
                    createdAt: {
                        [Op.gte]: date,
                        [Op.lt]: nextDate
                    },
                    role: { [Op.in]: ['Student', 'Lecturer', 'Member'] }
                }
            });

            growthData.push(count);
        }

        setCache(cacheKey, growthData);
        res.json(growthData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching growth data', error: error.message });
    }
};

exports.getEntryTrends = async (req, res) => {
    try {
        const cacheKey = 'entry_trends';
        const cachedData = getCached(cacheKey);
        if (cachedData) return res.json(cachedData);

        const hours = 24;
        const trendData = [];
        const now = new Date();

        for (let i = hours - 1; i >= 0; i--) {
            const startTime = new Date(now);
            startTime.setHours(now.getHours() - i, 0, 0, 0);

            const endTime = new Date(startTime);
            endTime.setHours(startTime.getHours() + 1);

            const count = await AccessLog.count({
                where: {
                    createdAt: {
                        [Op.gte]: startTime,
                        [Op.lt]: endTime
                    },
                    decision: 'Grant'
                }
            });

            trendData.push(count);
        }

        setCache(cacheKey, trendData);
        res.json(trendData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching entry trends', error: error.message });
    }
};

exports.getUserImpact = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            logsCount,
            uniqueEquipmentCount,
            totalBookings
        ] = await Promise.all([
            AccessLog.count({
                where: {
                    user_id: userId,
                    createdAt: { [Op.gte]: startOfMonth },
                    decision: 'Grant'
                }
            }),
            Booking.count({
                distinct: true,
                col: 'equipment_id',
                where: {
                    user_id: userId,
                    createdAt: { [Op.gte]: startOfMonth },
                    equipment_id: { [Op.ne]: null }
                }
            }),
            Booking.count({
                where: {
                    user_id: userId,
                    createdAt: { [Op.gte]: startOfMonth },
                    status: 'completed'
                }
            })
        ]);

        // Simple heuristic for hours: logs count * 2 (avg visit)
        const estimatedHours = logsCount * 2.5;

        res.json({
            logsCount,
            uniqueEquipmentCount,
            totalBookings,
            estimatedHours,
            utilizationRate: 75 // Placeholder for now or calculate based on occupancy
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user impact', error: error.message });
    }
};
