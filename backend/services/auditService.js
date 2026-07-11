import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({ userId, action, resource, resourceId, details, ip, userAgent, level }) => {
  try {
    return await AuditLog.create({
      userId,
      action,
      resource,
      resourceId,
      details,
      ip,
      userAgent,
      level: level || 'info'
    });
  } catch (err) {
    console.error('Audit log failed (operation continues):', err.message);
    return null;
  }
};

export const getAuditLogs = async ({ filters = {}, page = 1, limit = 20 } = {}) => {
  try {
    const query = {};
    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.resource) query.resource = filters.resource;
    if (filters.level) query.level = filters.level;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (err) {
    console.error('getAuditLogs error:', err.message);
    return { logs: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
  }
};

export const getAuditStats = async ({ startDate, endDate } = {}) => {
  try {
    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const [byAction, byLevel, byResource, total] = await Promise.all([
      AuditLog.aggregate([
        ...(Object.keys(match).length ? [{ $match: match }] : []),
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      AuditLog.aggregate([
        ...(Object.keys(match).length ? [{ $match: match }] : []),
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ]),
      AuditLog.aggregate([
        ...(Object.keys(match).length ? [{ $match: match }] : []),
        { $group: { _id: '$resource', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      AuditLog.countDocuments(match)
    ]);

    return {
      total,
      byAction,
      byLevel,
      byResource,
      period: { startDate: startDate || 'all', endDate: endDate || 'all' }
    };
  } catch (err) {
    console.error('getAuditStats error:', err.message);
    return { total: 0, byAction: [], byLevel: [], byResource: [], period: {} };
  }
};
