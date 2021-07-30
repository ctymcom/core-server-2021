import React, { useState } from "react";
import { DialogPropsType, Dialog } from "../../../shared/utilities/dialog/dialog";
import useDevice from "../../../../lib/hooks/useDevice";
import useScreen from "../../../../lib/hooks/useScreen";

interface RecommendedDialogProps extends DialogPropsType {}
export function RecommendedDialog(props: RecommendedDialogProps) {
  const { isMobile } = useDevice();
  let screenSm = useScreen("sm");
  return (
    <Dialog {...props}>
      <div
        className={`bg-white shadow relative rounded-md w-full v-scrollbar ${
          isMobile ? "pb-12" : ""
        }`}
        style={{ maxHeight: `calc(96vh - 150px)`, minHeight: `calc(96vh - 350px)` }}
      >
        {listCommision.map((item, index) => (
          <div key={index} className="px-4 py-2 border-b flex items-center justify-between">
            <div>
              <span className="font-semibold">Nguyễn Văn A</span>
              <span className="px-1">-</span>
              <span>0123345561</span>
              {/* <span
                className={`px-1 rounded-full ${
                  item === "Đã mua" ? "bg-success" : "bg-trueGray"
                } text-white font-semibold`}
              >
                {item}
              </span> */}
            </div>
            <span className="font-bold text-success text-lg">+{item}</span>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
const listCommision = [
  "123",
  "345",
  "345",
  "345",
  "345",
  "345",
  "123",
  "345",
  "123",
  "345",
  "123",
  "345",
  "123",
  "345",
];
