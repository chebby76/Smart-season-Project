/**
 * Role-Based Access Control Middleware
 * Restricts routes to specific user roles.
 * 
 * Usage:
 *   router.get('/admin-only', authenticate, roleCheck('admin'), handler);
 *   router.get('/both', authenticate, roleCheck('admin', 'field_agent'), handler);
 */
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = roleCheck;
