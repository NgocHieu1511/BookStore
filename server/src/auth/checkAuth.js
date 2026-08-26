//import jsonwebtoken
const jwt = require("jsonwebtoken");
const AsyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
//Sau khi người dùng đăng ký thành công thì người dùng sẽ đăng nhập thành công luôn không bắt người dùng phải đăng nhập lại nữa
// thế nếu muốn đăng nhập lại thì làm thế nào
const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
    algorithm: "HS256",
  });
};
const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
    algorithm: "HS256",
  });
};
const verifyToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  return decoded;
};
module.exports = {
  AsyncHandler,
  createAccessToken,
  createRefreshToken,
  verifyToken,
};
