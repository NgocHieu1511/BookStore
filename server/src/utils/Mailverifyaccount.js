const { google } = require("googleapis");
const nodemailer = require("nodemailer");
require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Cùng cơ chế gửi mail Gmail OAuth2 với mailForgotPassword.js
const SendMailVerifyAccount = async (email, otp) => {
  const { token: accessToken } = await oAuth2Client.getAccessToken();
  if (!accessToken) {
    throw new Error("Không lấy được Gmail access token");
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken,
    },
  });

  return transport.sendMail({
    from: `"Moho" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Xác thực tài khoản",
    text: `Mã OTP xác thực tài khoản của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <body style="font-family: Roboto, Arial, sans-serif; background:#f2f4f8; margin:0; padding:30px; color:#2d3436;">
        <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:10px; padding:30px; box-shadow:0 6px 12px rgba(0,0,0,0.1);">
          <h2 style="margin-top:0;">Xác thực tài khoản</h2>
          <p>Cảm ơn bạn đã đăng ký. Vui lòng nhập mã OTP bên dưới để hoàn tất:</p>
          <p style="font-size:32px; font-weight:bold; letter-spacing:6px; text-align:center; margin:24px 0;">${otp}</p>
          <p>Mã có hiệu lực trong <b>5 phút</b>. Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.</p>
        </div>
      </body>
      </html>`,
  });
};

module.exports = SendMailVerifyAccount;