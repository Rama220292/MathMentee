const verifyRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      // Check if user exists (from verifyToken)
      if (!req.user) {
        return res.status(401).json({ err: "Not authenticated" });
      }

      // Check role
      if (req.user.role !== requiredRole) {
        return res.status(403).json({
          err: "Access denied: insufficient permissions"
        });
      }

      next();

    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  };
};

module.exports = verifyRole;