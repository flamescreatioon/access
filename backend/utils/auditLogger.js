const { AuditLog } = require('../models');

/**
 * Records an audit log entry.
 * @param {Object} params
 * @param {number} params.user_id - ID of the user performing the action
 * @param {string} params.action - The action being performed (e.g., 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE')
 * @param {string} [params.resource_type] - The type of resource affected
 * @param {string} [params.resource_id] - The ID of the resource affected
 * @param {string} [params.status='SUCCESS'] - Result of the action ('SUCCESS' or 'FAILURE')
 * @param {Object} [params.req] - Express request object to extract IP and User Agent
 * @param {Object} [params.details={}] - Additional JSON metadata
 */
const recordAuditLog = async ({ user_id, action, resource_type, resource_id, status = 'SUCCESS', req, details = {} }) => {
    try {
        let ip_address = null;
        let user_agent = null;

        if (req) {
            ip_address = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            user_agent = req.headers['user-agent'];
        }

        await AuditLog.create({
            user_id,
            action,
            resource_type,
            resource_id: resource_id?.toString(),
            status,
            ip_address,
            user_agent,
            details
        });
    } catch (error) {
        console.error('Failed to record audit log:', error);
        // We don't throw here to avoid breaking the main flow if audit logging fails
    }
};

module.exports = { recordAuditLog };
