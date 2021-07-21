import { useEffect, useState } from "react";
import { FaAddressCard, FaBlenderPhone, FaEdit, FaUserAlt } from "react-icons/fa";
import { RiAddFill, RiMapPinLine } from "react-icons/ri";
import {
  GoongAutocompletePlace,
  GoongGeocoderService,
  GoongPlaceDetail,
} from "../../../../lib/helpers/goong";
import { useCartContext } from "../../../../lib/providers/cart-provider";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { Dialog } from "../../../shared/utilities/dialog/dialog";
import { Button } from "../../../shared/utilities/form/button";
import { Input } from "../../../shared/utilities/form/input";
import { Select } from "../../../shared/utilities/form/select";
import { NotFound } from "../../../shared/utilities/not-found";
import { Spinner } from "../../../shared/utilities/spinner";
import { BranchsDialog } from "../../homepage/components/branchs-dialog";
import { SelectTime } from "./select-time";

export function InforPayment() {
  const [openDialog, setOpenDialog] = useState(false);
  const { orderInput, setOrderInput, draftOrder } = useCartContext();
  const { shopBranchs, setBranchSelecting, branchSelecting } = useShopContext();
  const [openAddress, setOpenAddress] = useState(false);
  const [placeDetail, setPlaceDetail] = useState<GoongPlaceDetail>(null);
  const [addressInput, setAddressInput] = useState("");
  const [addressList, setAddressList] = useState<GoongAutocompletePlace[]>(null);
  const [buyerAddressNote, setBuyerAddressNote] = useState<string>(undefined);

  useEffect(() => {
    if (openAddress && placeDetail) {
      setAddressInput(placeDetail.name + ", " + placeDetail.formatted_address);
    }
  }, [openAddress]);

  useEffect(() => {
    if (addressInput) {
      setAddressList(null);
      GoongGeocoderService.getPlaces(addressInput).then((res) => {
        setAddressList(res);
      });
    } else {
      setAddressList(undefined);
    }
  }, [addressInput]);

  useEffect(() => {
    if (placeDetail) {
      setOrderInput({
        ...orderInput,
        buyerFullAddress: placeDetail.name + ", " + placeDetail.formatted_address,
        latitude: placeDetail.geometry.location.lat,
        longitude: placeDetail.geometry.location.lng,
      });
    } else {
      setOrderInput({
        ...orderInput,
        buyerFullAddress: "",
        latitude: 10.72883,
        longitude: 106.725484,
      });
    }
  }, [placeDetail]);

  useEffect(() => {
    setOrderInput({
      ...orderInput,
      buyerAddressNote,
    });
  }, [buyerAddressNote]);

  return (
    <div className="pt-4 bg-white">
      <div className="">
        <TabCustom />
        <div className="p-4 text-sm">
          <div className="flex flex-col gap-y-2">
            <Input
              name="name"
              placeholder="Nhập tên người nhận"
              prefix={<FaUserAlt />}
              className="rounded-2xl bg-primary-light"
              value={orderInput.buyerName}
              onChange={(data) => setOrderInput({ ...orderInput, buyerName: data })}
            />
            <Input
              name="phone"
              type="text"
              placeholder="Nhập số điện thoại"
              prefix={<FaBlenderPhone />}
              className="rounded-2xl bg-primary-light"
              value={orderInput.buyerPhone}
              onChange={(data) => setOrderInput({ ...orderInput, buyerPhone: data })}
            />
            {orderInput.pickupMethod == "DELIVERY" ? (
              <>
                <div
                  onClick={() => {
                    setOpenAddress(true);
                  }}
                >
                  <Input
                    readonly
                    value={
                      placeDetail ? `${placeDetail?.name}, ${placeDetail?.formatted_address}` : ""
                    }
                    type="text"
                    placeholder="Nhập địa chỉ giao đến"
                    prefix={<FaAddressCard />}
                    className="rounded-2xl bg-primary-light"
                  />
                </div>
                {buyerAddressNote === undefined ? (
                  <Button
                    className="py-2 px-0 w-full justify-start no-focus"
                    medium
                    textPrimary
                    icon={<RiAddFill />}
                    text="Thêm ghi chú địa chỉ giao hàng"
                    onClick={() => setBuyerAddressNote(null)}
                  />
                ) : (
                  <Input
                    autoFocus
                    value={buyerAddressNote}
                    onChange={setBuyerAddressNote}
                    type="text"
                    placeholder="Nhập ghi chú địa chỉ giao hàng (Toà nhà, Địa chỉ cụ thể)"
                    prefix={<FaEdit />}
                    className="rounded-2xl animate-emerge bg-primary-light"
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-between py-2">
                <p className="">Chọn thời gian lấy:</p>
                <SelectTime />
              </div>
            )}
          </div>
          {shopBranchs && (
            <BranchsDialog
              shopBranchs={shopBranchs}
              onClose={() => setOpenDialog(false)}
              isOpen={openDialog}
              onSelect={(branch) => {
                setBranchSelecting(branch);
              }}
            />
          )}
          <Dialog
            slideFromBottom="all"
            mobileSizeMode
            isOpen={openAddress}
            onClose={() => setOpenAddress(false)}
            title="Nhập địa chỉ giao hàng"
          >
            <div className="relative v-scrollbar" style={{ height: "calc(100vh - 100px" }}>
              <div className="p-4 bg-gray-100 sticky top-0">
                <Input
                  autoFocus
                  className="h-14"
                  debounce
                  clearable
                  name="address"
                  placeholder="Tìm địa chỉ giao hàng tại đây"
                  value={addressInput}
                  onChange={(val) => {
                    setAddressInput(val);
                  }}
                />
              </div>
              {addressInput === undefined && (
                <NotFound
                  icon={<RiMapPinLine />}
                  text="Nhập địa chỉ để tìm kiếm địa điểm giao hàng"
                />
              )}
              {addressList === null && <Spinner />}
              {addressList && (
                <>
                  {addressList.length ? (
                    <>
                      {addressList.map((address) => (
                        <button
                          type="button"
                          key={address.description}
                          className="w-full animate-emerge p-4 flex items-start text-gray-600 border-b border-gray-200 hover:bg-primary-light"
                          onClick={async () => {
                            let placeDetail = await GoongGeocoderService.getPlaceDetail(
                              address.place_id
                            );
                            setPlaceDetail({
                              ...placeDetail,
                              name: address.structured_formatting.main_text,
                              formatted_address: address.structured_formatting.secondary_text,
                            });
                            setOpenAddress(false);
                          }}
                        >
                          <i className="text-xl mr-2 mt-1">
                            <RiMapPinLine />
                          </i>
                          <div className="text-left">
                            <div className="font-semibold text-lg">
                              {address.structured_formatting.main_text}
                            </div>
                            <div>{address.structured_formatting.secondary_text}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <NotFound text="Không tìm thấy địa chỉ" />
                  )}
                </>
              )}
            </div>
            {/* <AddressGroup
              {...{
                wardId: orderInput.buyerWardId,
                districtId: orderInput.buyerDistrictId,
                provinceId: orderInput.buyerProvinceId,
                address: orderInput.buyerAddress,
              }}
              required
            />
            <SaveButtonGroup onCancel={() => setOpenInputAddress(false)} /> */}
          </Dialog>
        </div>
      </div>
    </div>
  );
}

const TabCustom = () => {
  const { orderInput, setOrderInput } = useCartContext();
  const options: Option[] = [
    { label: "Giao hàng", value: "DELIVERY" },
    { label: "Lấy tại quán", value: "STORE" },
  ];
  //TODO: viết selected vào trong cart provider

  const handleClick = (index) => {
    setOrderInput({ ...orderInput, pickupMethod: options[index].value });
  };
  if (!orderInput) return <Spinner></Spinner>;
  return (
    <div className="relative flex items-center justify-center">
      {options.map((item, index) => {
        const selectedIndex = options[index].value == orderInput.pickupMethod;
        const last = index == options.length - 1;
        const first = index == 0;
        return (
          <div
            className={`w-32 text-sm cursor-pointer flex justify-center items-center py-1 px-1 rounded border border-gray-400 
            ${last && "rounded-l-none border-l-0 "}
            ${first && "rounded-r-none border-r-0 "}  
            ${selectedIndex ? " text-white bg-primary " : "text-gray-500"}
            `}
            key={index}
            onClick={() => handleClick(index)}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};
