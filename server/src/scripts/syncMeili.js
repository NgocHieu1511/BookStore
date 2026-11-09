const connectDB = require("../config/connectDB");
const { setupMeili } = require("../config/meiliSearch");
const { syncAll } = require("../services/productSearch.service");

(async () => {
  await connectDB();
  await setupMeili();
  await syncAll({ reset: true });
  console.log("Đã đồng bộ xong");
  process.exit(0);
})();