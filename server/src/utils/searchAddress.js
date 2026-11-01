require("dotenv").config();

// Gợi ý địa chỉ qua Goong AutoComplete. Dùng fetch có sẵn của Node 18+ nên không cần cài axios.
// Cần thêm GOONG_API_KEY vào .env
const searchAddress = async (address) => {
  const url = new URL("https://rsapi.goong.io/Place/AutoComplete");
  url.searchParams.set("input", address);
  url.searchParams.set("api_key", process.env.GOONG_API_KEY || "");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000); // tối đa 5 giây

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.predictions) ? data.predictions : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
};

module.exports = searchAddress;