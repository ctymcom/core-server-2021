import { useEffect } from "react";
import { Spinner } from "../../components/shared/utilities/spinner";
import { useAuth } from "../../lib/providers/auth-provider";
import { DefaultHead } from "../default-head";
import { Header, HeaderPropsType } from "./components/header";
import { DefaulLayoutProvider } from "./provider/default-layout-provider";
import { ShopProvider, ShopConsumer } from "../../lib/providers/shop-provider";
import { CartProvider } from "../../lib/providers/cart-provider";

interface PropsType extends ReactProps, HeaderPropsType {
  code?: string;
  shop?: { shopName: string; shopLogo: string };
}
export function DefaultLayout({ code, shop, ...props }: PropsType) {
  const { user, redirectToWebappLogin } = useAuth();

  return (
    <DefaulLayoutProvider>
      <ShopProvider>
        <ShopConsumer>
          {({ shop }) => (
            <div className="flex flex-col min-h-screen relative bg-gray-800">
              <>
                <DefaultHead />
                {shop && <Header {...props} code={code} />}
                <div className="w-full max-w-lg mx-auto shadow-lg">
                  <div
                    className={`w-full flex-1 bg-bluegray-100 text-gray-700 ${shop && " mt-14 "}`}
                  >
                    {props.children}
                  </div>
                </div>
                {/* <Footer /> */}
              </>
            </div>
          )}
        </ShopConsumer>
      </ShopProvider>
    </DefaulLayoutProvider>
  );
}
