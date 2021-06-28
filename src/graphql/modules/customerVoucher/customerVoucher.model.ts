import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;

export enum CustomerVoucherStatus {
  STILL_ALIVE = "STILL_ALIVE", // Còn hoạt động
  EXPIRED = "EXPIRED", // Hết hạn
}
export type ICustomerVoucher = BaseDocument & {
  memberId?: string; // Mã chủ shop
  customerId?: string; // Mã khách hàng
  voucherId?: string; // Mã voucher
  voucherCode?: string; // Mã voucher
  issueNumber?: number; // Số lượng phát hành
  used?: number; // Số lượng đã sử dụng
  expiredDate?: Date; // Ngày hết hạng
  status?: CustomerVoucherStatus; // Trạng thái voucher
};

const customerVoucherSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    voucherId: { type: Schema.Types.ObjectId, ref: "ShopVoucher", required: true },
    voucherCode: { type: String, required: true },
    issueNumber: { type: Number, default: 1, min: 1 },
    used: { type: Number, default: 0 },
    expiredDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(CustomerVoucherStatus),
      default: CustomerVoucherStatus.STILL_ALIVE,
    },
  },
  { timestamps: true }
);

customerVoucherSchema.index({ memberId: 1, customerId: 1 });
customerVoucherSchema.index({ voucherCode: "text" }, { weights: { voucherCode: 2 } });

export const CustomerVoucherHook = new ModelHook<ICustomerVoucher>(customerVoucherSchema);
export const CustomerVoucherModel: mongoose.Model<ICustomerVoucher> = MainConnection.model(
  "CustomerVoucher",
  customerVoucherSchema
);

export const CustomerVoucherLoader = ModelLoader<ICustomerVoucher>(
  CustomerVoucherModel,
  CustomerVoucherHook
);
