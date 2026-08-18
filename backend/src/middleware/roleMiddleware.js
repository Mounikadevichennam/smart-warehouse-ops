const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.account || !allowedRoles.includes(req.account.role)) {
      return res.status(403).json({
        message: `Role (${req.account?.role || 'None'}) is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };
