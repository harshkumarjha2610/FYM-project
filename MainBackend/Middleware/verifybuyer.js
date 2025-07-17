const jwt = require("jsonwebtoken");
const Buyer = require("../Models/buyer.model");

const verifyBuyer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access Denied. No Token Provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const buyer = await Buyer.findById(decoded.id).select("-password");

    if (!buyer) return res.status(401).json({ message: "Invalid Token." });

    req.buyer = buyer;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: "Invalid or Expired Token." });
  }
};

module.exports = verifyBuyer;
