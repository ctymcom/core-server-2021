import { set, times } from "lodash";
import { ErrorHelper } from "../../../base/error";
import { ROLES } from "../../../constants/role.const";
import { AuthHelper } from "../../../helpers";
import { Context } from "../../context";
import { OperatingTimeStatus } from "./operatingTime.graphql";
import { ShopBranchModel } from "./shopBranch.model";
import { shopBranchService } from "./shopBranch.service";

const Query = {
  getAllShopBranch: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ANONYMOUS_CUSTOMER_MEMBER_STAFF);
    if (context.sellerId) {
      set(args, "q.filter.memberId", context.sellerId);
    }
    return shopBranchService.fetch(args.q);
  },
  getOneShopBranch: async (root: any, args: any, context: Context) => {
    const { id } = args;
    return await shopBranchService.findOne({ _id: id });
  },
};

const Mutation = {
  createShopBranch: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER]);
    const { data } = args;
    data.memberId = context.id;
    data.operatingTimes = times(7, (i) => ({
      day: i + 1,
      timeFrames: [["07:00", "21:00"]],
      status: OperatingTimeStatus.OPEN,
    }));
    return await shopBranchService.create(data);
  },
  updateShopBranch: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER]);
    const { id, data } = args;
    await protectItem(id, context);
    return await shopBranchService.updateOne(id, data);
  },
  deleteOneShopBranch: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER]);
    const { id } = args;
    await protectItem(id, context);
    return await shopBranchService.deleteOne(id);
  },
};

const ShopBranch = {};

export default {
  Query,
  Mutation,
  ShopBranch,
};
async function protectItem(id: any, context: Context) {
  const branch = await ShopBranchModel.findById(id);
  if (branch.memberId.toString() != context.id) throw ErrorHelper.permissionDeny();
}