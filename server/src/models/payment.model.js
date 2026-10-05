const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const paymentModel = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    totalPrice: {
      type: Number,
      default: 0,
    },

    fullName: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    finalPrice: {
      type: Number,
      default: 0,
    },

    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "coupon",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "delivered",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "momo", "vnpay"],
      required: true,
    },

    // Lịch sử trạng thái đơn hàng
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "pending",
            "confirmed",
            "delivered",
            "completed",
            "cancelled",
          ],
          required: true,
        },

        changedAt: {
          type: Date,
          default: Date.now,
        },

        note: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);


// ==========================================
// TỰ ĐỘNG LƯU LỊCH SỬ KHI TẠO ĐƠN HÀNG
// ==========================================

paymentModel.pre("save", function () {
  // Chỉ khởi tạo lịch sử khi tạo đơn hàng mới
  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory = [
      {
        status: this.status,
        changedAt: new Date(),
        note: "Đơn hàng được tạo",
      },
    ];
  }
});


module.exports = mongoose.model("payment", paymentModel);