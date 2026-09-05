const { AuthFailureError, ForbiddenError } = require("../core/error.response");
const { verifyToken } = require("../auth/checkAuth");
const userModel = require("../models/user.model");
const authUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const logged = req.cookies.logged;
     if ((logged && !accessToken) || (!logged && accessToken)) {
            res.clearCookie('logged');
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            throw new AuthFailureError('Vui lòng đăng nhập lại');
        }

    if (!accessToken) {
      throw new AuthFailureError("Vui lòng đăng nhập để truy cập");
    }

    const decoded = await verifyToken(accessToken);
    if (!decoded) {
      throw new AuthFailureError("Vui lòng đăng nhập để truy cập");
    }

    req.user = decoded.id;
    next();
  } catch (error) {
    throw new AuthFailureError("Vui lòng đăng nhập để truy cập");
  }
};
const authAdmin = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    const decoded = await verifyToken(accessToken);

    const findUser = await userModel.findById(decoded.id);

    if (!findUser) {
      throw new AuthFailureError("Không tìm thấy user");
    }

    if (!findUser.isAdmin) {
      throw new ForbiddenError("Bạn không có quyền truy cập");
    }

    next();
  } catch (error) {
    console.log(error);
    next(error); // Đừng throw lỗi mới, để thấy lỗi gốc
  }
};
module.exports = { authUser, authAdmin };
