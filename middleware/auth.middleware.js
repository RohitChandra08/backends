const Admin = require("../model/auth.model");

const authMiddleware = async (req, res, next) => {
  if (!req.session.adminId) {
    return res.redirect("/login");
  }

  const admin = await Admin.findById(req.session.adminId);
  if (!admin) {
    req.session.destroy();
    return res.redirect("/login");
  }

  req.admin = admin; // store admin in request
  next();
};

module.exports = authMiddleware;
