import express from "express";
import evoucherRoute from "./evoucher.route";
import smsRoute from "./sms.route";
import downloadRoute from "./download.route";
import campaignRoute from "./campaign.route";
import luckyWheelRoute from "./luckyWheel.route";
import addressStorehouse from "./addressStorehouse.route";
import addressDelivery from "./addressDelivery.route";
import delivery from "./delivery.route";
import collaborator from "./collaborator.route";
import diligencePointRoute from "./diligencePoint.route";
import testRoute from "./test.route";
import orderRoute from "./order.route";
import serviceRoute from "./service.route";
import commonRoute from "./common.route";
import memberRoute from "./member.route";
import settingRoute from "./setting.route";

const router = express.Router();
router.use("/evoucher", evoucherRoute);
router.use("/diligencePoint", diligencePointRoute);
router.use("/sms", smsRoute);
router.use("/service", serviceRoute);
router.use("/download", downloadRoute);
router.use("/campaign", campaignRoute);
router.use("/luckywheel", luckyWheelRoute);
router.use("/address-storehouse", addressStorehouse);
router.use("/address-delivery", addressDelivery);
router.use("/delivery", delivery);
router.use("/collaborator", collaborator);
router.use("/test", testRoute);
router.use("/order", orderRoute);
router.use("/member", memberRoute);
router.use("/common", commonRoute);
router.use("/setting", settingRoute);
export default router;
