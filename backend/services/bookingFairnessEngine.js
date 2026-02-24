/**
 * Booking Fairness Engine
 * 
 * Central validation service implementing 7 enforcement layers:
 *   1. Availability Validation (double-booking prevention)
 *   2. Temporary Slot Locking (race condition prevention)
 *   3. Rolling Usage Window (7-day hour limit)
 *   4. Per-User Booking Cap (max future bookings)
 *   5. Cooldown Enforcement (same-resource cooldown)
 *   6. No-Show Penalty System (progressive penalties)
 *   7. (Waitlist is handled separately in waitlistService.js)
 * 
 * All rejections are audit-logged with the specific rule that failed.
 */

const { Booking, SlotLock, BookingConfig, Sequelize } = require('../models');
const { Op } = Sequelize;
const { recordAuditLog } = require('../utils/auditLogger');

// ─── Config Resolution ──────────────────────────────────────────────

/**
 * Merges config layers: global → resource_type → specific resource.
 * More specific configs override less specific ones.
 */
async function getEffectiveConfig(resource_type, resource_id) {
    const defaults = {
        weekly_hour_limit: 6.0,
        max_active_bookings: 3,
        cooldown_hours: 24,
        no_show_warning_threshold: 1,
        no_show_quota_reduction_threshold: 2,
        no_show_suspension_threshold: 3,
        no_show_window_days: 30,
        waitlist_enabled: false,
        waitlist_claim_minutes: 10,
        lock_duration_seconds: 300,
    };

    // Fetch all potentially applicable configs, ordered from least to most specific
    const configs = await BookingConfig.findAll({
        where: {
            [Op.or]: [
                { resource_type: 'global', resource_id: null },
                { resource_type, resource_id: null },
                { resource_type, resource_id },
            ]
        },
        order: [
            // global first, then type, then specific
            [Sequelize.literal(`CASE 
                WHEN "resource_type" = 'global' AND "resource_id" IS NULL THEN 0
                WHEN "resource_type" != 'global' AND "resource_id" IS NULL THEN 1
                ELSE 2
            END`), 'ASC']
        ]
    });

    // Merge: each successive config overrides previous
    let merged = { ...defaults };
    for (const config of configs) {
        const raw = config.toJSON();
        for (const key of Object.keys(defaults)) {
            if (raw[key] !== null && raw[key] !== undefined) {
                merged[key] = raw[key];
            }
        }
    }

    // Parse numeric values that may come as strings from DECIMAL columns
    merged.weekly_hour_limit = parseFloat(merged.weekly_hour_limit);

    return merged;
}

// ─── Rejection Helper ───────────────────────────────────────────────

function reject(rule, message, statusCode = 400) {
    return { valid: false, rule, message, statusCode };
}

function pass() {
    return { valid: true };
}

// ─── Layer 1: Availability Validation ───────────────────────────────

async function validateAvailability({ resource_type, resource_id, start, end, exclude_booking_id, transaction }) {
    const where = {
        status: { [Op.in]: ['confirmed', 'pending'] },
        [Op.or]: [{
            start_time: { [Op.lt]: end },
            end_time: { [Op.gt]: start },
        }],
    };

    if (resource_type === 'space') {
        where.space_id = resource_id;
    } else {
        where.equipment_id = resource_id;
    }

    if (exclude_booking_id) {
        where.id = { [Op.ne]: exclude_booking_id };
    }

    const conflict = await Booking.findOne({
        where,
        lock: true,
        transaction
    });

    if (conflict) {
        return reject('AVAILABILITY', 'This slot is already booked for the selected time.', 409);
    }

    return pass();
}

// ─── Layer 2: Temporary Slot Locking ────────────────────────────────

async function validateSlotLock({ resource_type, resource_id, user_id, start, end, config, transaction }) {
    // Clean up expired locks first
    await SlotLock.destroy({
        where: { expires_at: { [Op.lt]: new Date() } },
        transaction
    });

    // Check if another user has a lock on this slot
    const existingLock = await SlotLock.findOne({
        where: {
            resource_type,
            resource_id,
            user_id: { [Op.ne]: user_id },
            expires_at: { [Op.gt]: new Date() },
            [Op.or]: [{
                start_time: { [Op.lt]: end },
                end_time: { [Op.gt]: start },
            }],
        },
        transaction
    });

    if (existingLock) {
        return reject('SLOT_LOCK', 'This slot is temporarily reserved by another user. Please try again in a few minutes.', 423);
    }

    // Create or refresh lock for current user
    const lockTTL = config.lock_duration_seconds || 300;
    const expiresAt = new Date(Date.now() + lockTTL * 1000);

    // Upsert: if user already has a lock on this exact slot, refresh it
    const [lock, created] = await SlotLock.findOrCreate({
        where: {
            resource_type,
            resource_id,
            user_id,
            start_time: start,
            end_time: end,
        },
        defaults: {
            resource_type,
            resource_id,
            user_id,
            start_time: start,
            end_time: end,
            expires_at: expiresAt,
        },
        transaction
    });

    if (!created) {
        await lock.update({ expires_at: expiresAt }, { transaction });
    }

    return pass();
}

// ─── Layer 3: Rolling Usage Window ──────────────────────────────────

async function validateRollingUsage({ user_id, start, end, config, exclude_booking_id, transaction }) {
    const weeklyLimit = config.weekly_hour_limit;

    // -1 means unlimited
    if (weeklyLimit < 0) return pass();

    const windowStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const where = {
        user_id,
        status: { [Op.in]: ['confirmed', 'pending', 'completed'] },
        start_time: { [Op.gte]: windowStart },
    };

    if (exclude_booking_id) {
        where.id = { [Op.ne]: exclude_booking_id };
    }

    const recentBookings = await Booking.findAll({ where, transaction });

    const usedHours = recentBookings.reduce((sum, b) => {
        return sum + (new Date(b.end_time) - new Date(b.start_time)) / 3600000;
    }, 0);

    const requestedHours = (end - start) / 3600000;

    if (usedHours + requestedHours > weeklyLimit) {
        return reject(
            'ROLLING_USAGE',
            `Weekly booking limit reached (${weeklyLimit}hrs). Used: ${usedHours.toFixed(1)}hrs in the last 7 days.`,
            400
        );
    }

    return pass();
}

// ─── Layer 4: Per-User Booking Cap ──────────────────────────────────

async function validateBookingCap({ user_id, config, exclude_booking_id, transaction }) {
    const maxActive = config.max_active_bookings;

    // -1 means unlimited
    if (maxActive < 0) return pass();

    const where = {
        user_id,
        status: { [Op.in]: ['confirmed', 'pending'] },
        start_time: { [Op.gt]: new Date() },
    };

    if (exclude_booking_id) {
        where.id = { [Op.ne]: exclude_booking_id };
    }

    const activeCount = await Booking.count({ where, transaction });

    if (activeCount >= maxActive) {
        return reject(
            'BOOKING_CAP',
            `Maximum ${maxActive} future bookings allowed. You currently have ${activeCount} active bookings.`,
            400
        );
    }

    return pass();
}

// ─── Layer 5: Cooldown Enforcement ──────────────────────────────────

async function validateCooldown({ user_id, resource_type, resource_id, start, config, transaction }) {
    const cooldownHours = config.cooldown_hours;

    // 0 or -1 means disabled
    if (cooldownHours <= 0) return pass();

    const resourceField = resource_type === 'space' ? 'space_id' : 'equipment_id';

    const lastBooking = await Booking.findOne({
        where: {
            user_id,
            [resourceField]: resource_id,
            status: { [Op.in]: ['confirmed', 'pending', 'completed'] },
        },
        order: [['start_time', 'DESC']],
        transaction
    });

    if (lastBooking) {
        const hoursSinceLast = (new Date(start) - new Date(lastBooking.start_time)) / 3600000;
        if (hoursSinceLast < cooldownHours && hoursSinceLast >= 0) {
            const remainingHours = Math.ceil(cooldownHours - hoursSinceLast);
            return reject(
                'COOLDOWN',
                `Cooldown active: you must wait ${remainingHours}h before rebooking this resource.`,
                429
            );
        }
    }

    return pass();
}

// ─── Layer 6: No-Show Penalty System ────────────────────────────────

async function validateNoShowPenalty({ user_id, config, transaction }) {
    const windowStart = new Date(Date.now() - config.no_show_window_days * 24 * 60 * 60 * 1000);

    const noShowCount = await Booking.count({
        where: {
            user_id,
            status: 'no_show',
            start_time: { [Op.gte]: windowStart },
        },
        transaction
    });

    // Suspension
    if (noShowCount >= config.no_show_suspension_threshold) {
        return reject(
            'NO_SHOW_SUSPENSION',
            `Booking suspended: ${noShowCount} no-shows in the last ${config.no_show_window_days} days. Contact admin.`,
            403
        );
    }

    // Quota reduction — we don't block but modify effective weekly limit
    // This is handled by returning a penalty multiplier via the result
    let penaltyMultiplier = 1.0;
    if (noShowCount >= config.no_show_quota_reduction_threshold) {
        penaltyMultiplier = 0.5; // 50% reduction
    }

    // Warning — informational, doesn't block
    let warning = null;
    if (noShowCount >= config.no_show_warning_threshold && noShowCount < config.no_show_quota_reduction_threshold) {
        warning = `Warning: You have ${noShowCount} no-show(s). Continued no-shows will result in booking restrictions.`;
    }

    return { valid: true, penaltyMultiplier, warning, noShowCount };
}

// ─── Main Validation Pipeline ───────────────────────────────────────

/**
 * Validates a booking request against all fairness layers.
 *
 * @param {Object} params
 * @param {number} params.user_id
 * @param {string} params.resource_type - 'space' or 'equipment'
 * @param {number} params.resource_id
 * @param {Date} params.start
 * @param {Date} params.end
 * @param {Object} [params.transaction] - Sequelize transaction
 * @param {Object} [params.req] - Express request for audit logging
 * @param {number} [params.exclude_booking_id] - Booking to exclude (for modifications)
 * @param {boolean} [params.is_admin] - Skip fairness checks for admins
 * @returns {{ valid: true, warning?: string } | { valid: false, rule: string, message: string, statusCode: number }}
 */
async function validateBookingRequest({
    user_id,
    resource_type,
    resource_id,
    start,
    end,
    transaction,
    req,
    exclude_booking_id,
    is_admin = false,
}) {
    // Admins skip fairness layers (but not availability)
    const config = await getEffectiveConfig(resource_type, resource_id);

    // Layer 1: Availability (always enforced, even for admins)
    const availResult = await validateAvailability({
        resource_type, resource_id, start, end, exclude_booking_id, transaction
    });
    if (!availResult.valid) {
        await logRejection(user_id, resource_type, resource_id, availResult, req);
        return availResult;
    }

    // Admins bypass remaining fairness layers
    if (is_admin) {
        return pass();
    }

    // Layer 2: Slot Lock
    const lockResult = await validateSlotLock({
        resource_type, resource_id, user_id, start, end, config, transaction
    });
    if (!lockResult.valid) {
        await logRejection(user_id, resource_type, resource_id, lockResult, req);
        return lockResult;
    }

    // Layer 6 (run early): No-Show Penalty — may modify config
    const noShowResult = await validateNoShowPenalty({ user_id, config, transaction });
    if (!noShowResult.valid) {
        await logRejection(user_id, resource_type, resource_id, noShowResult, req);
        return noShowResult;
    }

    // Apply penalty multiplier to weekly limit
    const adjustedConfig = { ...config };
    if (noShowResult.penaltyMultiplier && noShowResult.penaltyMultiplier < 1.0) {
        adjustedConfig.weekly_hour_limit = config.weekly_hour_limit * noShowResult.penaltyMultiplier;
    }

    // Layer 3: Rolling Usage Window (with penalty-adjusted limit)
    const usageResult = await validateRollingUsage({
        user_id, start, end, config: adjustedConfig, exclude_booking_id, transaction
    });
    if (!usageResult.valid) {
        await logRejection(user_id, resource_type, resource_id, usageResult, req);
        return usageResult;
    }

    // Layer 4: Per-User Booking Cap
    const capResult = await validateBookingCap({
        user_id, config, exclude_booking_id, transaction
    });
    if (!capResult.valid) {
        await logRejection(user_id, resource_type, resource_id, capResult, req);
        return capResult;
    }

    // Layer 5: Cooldown Enforcement
    const cooldownResult = await validateCooldown({
        user_id, resource_type, resource_id, start, config, transaction
    });
    if (!cooldownResult.valid) {
        await logRejection(user_id, resource_type, resource_id, cooldownResult, req);
        return cooldownResult;
    }

    // All layers passed
    return { valid: true, warning: noShowResult.warning || null };
}

// ─── Audit Logging ──────────────────────────────────────────────────

async function logRejection(user_id, resource_type, resource_id, result, req) {
    try {
        await recordAuditLog({
            user_id,
            action: 'BOOKING_REJECTED',
            resource_type: resource_type,
            resource_id: resource_id?.toString(),
            status: 'REJECTED',
            req,
            details: {
                rule: result.rule,
                message: result.message,
                timestamp: new Date().toISOString(),
            }
        });
    } catch (err) {
        console.error('Failed to log booking rejection:', err);
    }
}

// ─── Slot Lock Cleanup (for use in scheduled jobs) ──────────────────

async function cleanupExpiredLocks() {
    const deleted = await SlotLock.destroy({
        where: { expires_at: { [Op.lt]: new Date() } }
    });
    return deleted;
}

// ─── Exports ────────────────────────────────────────────────────────

module.exports = {
    validateBookingRequest,
    getEffectiveConfig,
    cleanupExpiredLocks,
};
