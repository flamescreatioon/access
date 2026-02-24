/**
 * Waitlist Service
 * 
 * Manages a FIFO queue for fully-booked slots.
 * When a cancellation occurs, the first user in the queue is offered the slot
 * with a configurable claim window.
 */

const { WaitlistEntry, BookingConfig, User, Sequelize } = require('../models');
const { Op } = Sequelize;

/**
 * Add a user to the waitlist for a specific slot.
 */
async function addToWaitlist({ resource_type, resource_id, start_time, end_time, user_id, transaction }) {
    // Check if user is already on waitlist for this slot
    const existing = await WaitlistEntry.findOne({
        where: {
            resource_type,
            resource_id,
            start_time,
            end_time,
            user_id,
            status: 'waiting',
        },
        transaction
    });

    if (existing) {
        return { success: false, message: 'You are already on the waitlist for this slot.' };
    }

    // Determine position (next in line)
    const maxPosition = await WaitlistEntry.max('position', {
        where: {
            resource_type,
            resource_id,
            start_time,
            end_time,
            status: { [Op.in]: ['waiting', 'offered'] },
        },
        transaction
    });

    const position = (maxPosition || 0) + 1;

    const entry = await WaitlistEntry.create({
        resource_type,
        resource_id,
        start_time,
        end_time,
        user_id,
        position,
        status: 'waiting',
    }, { transaction });

    return { success: true, data: entry, position };
}

/**
 * Process the waitlist when a cancellation occurs.
 * Offers the slot to the first waiting user.
 */
async function processWaitlist(resource_type, resource_id, start_time, end_time, transaction) {
    const nextInLine = await WaitlistEntry.findOne({
        where: {
            resource_type,
            resource_id,
            status: 'waiting',
            // Match overlapping time slots
            start_time: { [Op.lte]: end_time },
            end_time: { [Op.gte]: start_time },
        },
        order: [['position', 'ASC']],
        include: [{ model: User, attributes: ['id', 'name', 'email'] }],
        transaction
    });

    if (!nextInLine) {
        return null; // No one waiting
    }

    // Offer the slot
    await nextInLine.update({
        status: 'offered',
        offered_at: new Date(),
    }, { transaction });

    // In a real system, you'd send a push notification here
    // For now, we return the entry so the caller can trigger notifications
    return nextInLine;
}

/**
 * Claim a waitlisted slot within the claim window.
 */
async function claimSlot(waitlist_id, user_id) {
    const entry = await WaitlistEntry.findByPk(waitlist_id);

    if (!entry) {
        return { success: false, message: 'Waitlist entry not found.', statusCode: 404 };
    }

    if (entry.user_id !== user_id) {
        return { success: false, message: 'This waitlist entry does not belong to you.', statusCode: 403 };
    }

    if (entry.status !== 'offered') {
        return { success: false, message: 'This slot is not currently offered to you.', statusCode: 400 };
    }

    // Check claim window using config
    const { getEffectiveConfig } = require('./bookingFairnessEngine');
    const config = await getEffectiveConfig(entry.resource_type, entry.resource_id);
    const claimWindowMs = (config.waitlist_claim_minutes || 10) * 60 * 1000;
    const deadline = new Date(new Date(entry.offered_at).getTime() + claimWindowMs);

    if (new Date() > deadline) {
        await entry.update({ status: 'expired' });
        // Move to next person
        await processWaitlist(entry.resource_type, entry.resource_id, entry.start_time, entry.end_time);
        return { success: false, message: 'Claim window has expired. The slot has been offered to the next person.', statusCode: 410 };
    }

    await entry.update({ status: 'claimed' });

    return {
        success: true,
        data: entry,
        // Caller should now create the booking using the entry details
    };
}

/**
 * Expire stale offers and cascade to next person.
 * Should be run periodically (e.g., every minute via cron).
 */
async function expireStaleOffers() {
    const staleEntries = await WaitlistEntry.findAll({
        where: {
            status: 'offered',
            offered_at: { [Op.ne]: null },
        }
    });

    let expired = 0;
    for (const entry of staleEntries) {
        // Load config for this resource to get claim window
        const { getEffectiveConfig } = require('./bookingFairnessEngine');
        const config = await getEffectiveConfig(entry.resource_type, entry.resource_id);
        const claimWindowMs = (config.waitlist_claim_minutes || 10) * 60 * 1000;
        const deadline = new Date(new Date(entry.offered_at).getTime() + claimWindowMs);

        if (new Date() > deadline) {
            await entry.update({ status: 'expired' });
            await processWaitlist(entry.resource_type, entry.resource_id, entry.start_time, entry.end_time);
            expired++;
        }
    }

    return expired;
}

module.exports = {
    addToWaitlist,
    processWaitlist,
    claimSlot,
    expireStaleOffers,
};
