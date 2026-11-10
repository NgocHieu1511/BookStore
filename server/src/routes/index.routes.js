const usersRoutes = require("./user.routes");
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const cartRoutes = require("./cart.routes");
const couponRoutes = require("./coupon.routes");
const paymentRoutes = require("./payment.routes");
const feedbackRoutes = require("./feedback.routes");
const blogsRoutes = require("./blogs.routes");
const messageRoutes = require("./message.routes");
const chatbotRoutes = require("./chatbot.routes");

function routes(app) {
  app.use("/api/user", usersRoutes);
  app.use("/api/category", categoryRoutes);
  app.use("/api/product", productRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/coupon", couponRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/blogs", blogsRoutes);
  app.use("/api/message", messageRoutes);
  app.use("/api/chatbot", chatbotRoutes);
}
module.exports = routes;
