import AuditLog from '../models/AuditLog.js';

export const auditLog = (action, resource) => async (req, res, next) => {
  try {
    const originalJson = res.json.bind(res);
    res.json = function(body) {
      if (res.statusCode < 400) {
        AuditLog.create({
          userId: req.user?._id,
          action,
          resource,
          resourceId: req.params.id || body?._id || null,
          details: { before: req._auditBefore || null, after: body },
          ip: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          level: action.includes('delete') ? 'warning' : 'info'
        }).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  } catch {
    next();
  }
};
