import { createContext, useContext, useEffect, useState } from "react";
import { Shop, ShopService } from "../repo/shop.repo";
import { useRouter } from "next/router";
import {
  SetAnonymousToken,
  SetCustomerToken,
  ClearAnonymousToken,
  ClearCustomerToken,
  GetAnonymousToken,
  GetCustomerToken,
} from "../graphql/auth.link";
import cloneDeep from "lodash/cloneDeep";
import { Category, CategoryService } from "../repo/category.repo";
import { ShopBranchService, ShopBranch } from "../repo/shop-branch.repo";
import { UserService } from "../repo/user.repo";
import sortBy, { orderBy } from "lodash";
import { Customer, CustomerService } from "../repo/customer.repo";
import jwt_decode from "jwt-decode";
import { GoongGeocoderService } from "../helpers/goong";

export const ShopContext = createContext<
  Partial<{
    shop: Shop;
    setShop: Function;
    customer: Customer;
    locationCustomer: any;
    customerLogin: Function;
    customerLogout: Function;
    shopCode: string;
    setShopCode: Function;
    shopBranchs: ShopBranch[];
    branchSelecting: ShopBranch;
    setBranchSelecting: Function;
    loginCustomerByPhone: Function;
    loading: boolean;
    setCustomer: Function;
    getCustomner: Function;
    customerLoginOTP: (phone: string, otp: string) => any;
    showGongAddress: boolean;
    setLocationCustomer: Function;
    setShowGongAddress: Function;
  }>
>({});
export function ShopProvider(props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  let [shopCode, setShopCode] = useState<string>();
  let [branchSelecting, setBranchSelecting] = useState<ShopBranch>();
  let [shop, setShop] = useState<Shop>();
  let [customer, setCustomer] = useState<Customer>();
  let [shopBranchs, setShopBranch] = useState<ShopBranch[]>([]);
  const [showGongAddress, setShowGongAddress] = useState(false);
  const [locationCustomer, setLocationCustomer] = useState<{
    fullAddress: string;
    lg: number;
    lat: number;
  }>();
  async function getShop() {
    await ShopService.clearStore();
    setLoading(true);
    shopCode = sessionStorage.getItem("shopCode");
    if (!shopCode) router.push("404");
    setShopCode(shopCode);
    const anonymousToken = GetAnonymousToken(shopCode);
    if (!anonymousToken) await ShopService.loginAnonymous(shopCode);
    console.log("GET SHOP DATA", shopCode);
    await ShopService.getShopData().then(setShop);
    setLoading(false);
  }
  async function loadCustomer() {
    const customerToken = GetCustomerToken(shopCode);
    if (!customerToken) {
      let phoneUser = localStorage.getItem("phoneUser");
      if (phoneUser && !shop.config.smsOtp) {
        let dataCus = await CustomerService.loginCustomerByPhone(phoneUser);
        if (dataCus) {
          SetCustomerToken(dataCus.token, shopCode);
          customer = cloneDeep(dataCus.customer);
          setCustomer(customer);
        } else {
          setCustomer(null);
        }
      } else {
        setCustomer(null);
      }
    } else {
      let decodedToken = jwt_decode(customerToken) as {
        exp: number;
        role: string;
        customer: Customer;
      };
      console.log("decodedToken", decodedToken);
      if (Date.now() >= decodedToken.exp * 1000) {
        ClearCustomerToken(shopCode);
        setCustomer(null);
        return false;
      } else {
        await getCustomner();
      }
    }
  }
  function loadLocation() {
    let address = sessionStorage.getItem("addressSelected");
    if (address) {
      setLocationCustomer(JSON.parse(address));
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log(position);
            setLocationCustomer({
              ...locationCustomer,
              fullAddress: "",
              lg: position.coords.longitude,
              lat: position.coords.latitude,
            });
          },
          (err) => {
            if (customer && customer.latitude && customer.longitude) {
              setLocationCustomer({
                ...locationCustomer,
                fullAddress: customer.fullAddress,
                lat: customer.latitude,
                lg: customer.longitude,
              });
            } else {
              setLocationCustomer(null);
              setShowGongAddress(true);
            }
          }
        );
      }
    }
  }
  function loadBrand(coords?: { fullAddress: string; lg: number; lat: number }) {
    ShopBranchService.getAll({
      fragment: `${ShopBranchService.fullFragment} ${
        coords ? `distance(lat:${coords.lat}, lng:${coords.lg})` : ""
      } `,
      cache: false,
    }).then((res) => {
      let branchs = res.data;
      shopBranchs = orderBy(branchs, (o) => o.distance);
      setShopBranch(shopBranchs);
      let neared = shopBranchs.findIndex((item) => item.isOpen);
      if (neared) {
        branchSelecting = shopBranchs[neared];
      } else {
        branchSelecting = shopBranchs[0];
      }
      console.log("setBranchSelecting", branchSelecting);
      setBranchSelecting(branchSelecting);
    });
  }

  async function getCustomner() {
    let res = await CustomerService.getCustomer();
    setCustomer(res);
  }

  async function customerLogin(phone: string) {
    if (phone) {
      let dataCus = await CustomerService.loginCustomerByPhone(phone);
      if (dataCus) {
        SetCustomerToken(dataCus.token, shopCode);
        setCustomer(cloneDeep(dataCus.customer));
        localStorage.setItem("phoneUser", dataCus.customer.phone);
        return true;
      } else {
        setCustomer(null);
        return false;
      }
    } else {
      setCustomer(null);
      return false;
    }
  }
  async function customerLoginOTP(phone: string, otp: string) {
    if (phone && otp) {
      let dataCus = await CustomerService.loginCustomerByPhone(phone, otp);
      if (dataCus) {
        SetCustomerToken(dataCus.token, shopCode);
        setCustomer(cloneDeep(dataCus.customer));
        localStorage.setItem("phoneUser", dataCus.customer.phone);
        return true;
      } else {
        setCustomer(null);
        return false;
      }
    } else {
      setCustomer(null);
      return false;
    }
  }
  function customerLogout() {
    ClearCustomerToken(shopCode);
    localStorage.removeItem("phoneUser");
    setCustomer(null);
    if (router.pathname !== "/") {
      router.push(`/${shopCode}`);
    }
  }
  useEffect(() => {
    if (!props.code) return;
    getShop();
    return () => {
      setShop(null);
    };
  }, [props.code]);
  useEffect(() => {
    if (!shop) return;
    loadCustomer();
    loadLocation();
  }, [shop]);
  useEffect(() => {
    if (locationCustomer === undefined) return;
    if (locationCustomer === null) loadBrand();
    if (locationCustomer && locationCustomer.fullAddress)
      sessionStorage.setItem("addressSelected", JSON.stringify(locationCustomer));
    loadBrand(locationCustomer);
  }, [locationCustomer]);
  useEffect(() => {
    if (customer) {
      const colCode = sessionStorage.getItem(shopCode + "colCode");
      if (colCode) {
        CustomerService.updatePresenter(colCode).then((res) => {
          sessionStorage.removeItem(shopCode + "colCode");
        });
      }
    }
  }, [customer]);
  return (
    <ShopContext.Provider
      value={{
        shop,
        shopCode,
        customer,
        locationCustomer,
        customerLogin,
        customerLogout,
        setShop,
        setShopCode,
        branchSelecting,
        shopBranchs,
        setBranchSelecting,
        loading,
        setCustomer,
        customerLoginOTP,
        showGongAddress,
        setLocationCustomer,
        setShowGongAddress,
      }}
    >
      {props.children}
    </ShopContext.Provider>
  );
}

export const useShopContext = () => useContext(ShopContext);
