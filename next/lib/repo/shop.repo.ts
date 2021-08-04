import { ShopConfig } from "./shop-config.repo";
import { BaseModel, CrudRepository } from "./crud.repo";
import { SetAnonymousToken } from "../graphql/auth.link";

export interface Shop extends BaseModel {
  code: string;
  id: string;
  username: string;
  uid: string;
  name: string;
  avatar: string;
  shopCover: string;
  phone: string;
  fanpageId: string;
  fanpageName: string;
  fanpageImage: string;
  shopName: string;
  shopLogo: string;
  address: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  province: string;
  district: string;
  ward: string;
  allowSale: boolean;
  deliveryDistricts: string[];
  config: ShopConfig;
}
export interface PublicShop extends BaseModel {
  id: string;
  coverImage: string;
  name: string;
  fullAddress: string;
  distance: string;
  rating: string;
  ratingQty: string;
  shopCode: string;
}
export class ShopRepository extends CrudRepository<Shop> {
  apiName: string = "Shop";
  displayName: string = "shop";
  shortFragment: string = this.parseFragment(`
  code: String
  id: String
  username: String
  uid: String
  name: String
  avatar: String
  phone: String
  fanpageId: String
  fanpageName: String
  fanpageImage: String
  shopName: String
  shopLogo: String
  address: String
  provinceId: String
  districtId: String
  wardId: String
  province: String
  district: String
  ward: String
  allowSale: Boolean`);
  fullFragment: string = this.parseFragment(`
  code: String
  id: String
  username: String
  uid: String
  name: String
  avatar: String
  phone: String
  fanpageId: String
  fanpageName: String
  fanpageImage: String
  shopCover: String
  shopName: String
  shopLogo: String
  address: String
  provinceId: String
  districtId: String
  wardId: String
  province: String
  district: String
  ward: String
  allowSale: Boolean
  addressDeliveryIds: [ID]
  deliveryDistricts: [String]
  config{
    vnpostCode: String
    vnpostPhone: String
    vnpostName: String
    shipPreparationTime: String
    shipDefaultDistance: Int
    shipDefaultFee: Float
    shipNextFee: Float
    shipOneKmFee: Float
    shipUseOneKmFee: Boolean
    shipNote: String
    rating: Float
    ratingQty: Int
    soldQty: Int
    upsaleTitle: String
    smsOtp: Boolean
    banners {
      image: String
      title: String
      subtitle: String
      actionType: String
      link: String
      productId: ID
      voucherId: ID
      isPublic: Boolean
      product {
        id: String
        code: String
        name: String
      }: Product
      voucher {
        id: String
        code: String
        description: String
      }: ShopVoucher
    }: [ShopBanner]
    productGroups {
      name: String
      isPublic: Boolean
      productIds: [ID]
      products {
        id: String
        code: String
        name: String
        allowSale: Boolean
        basePrice: Float
        downPrice: Float
        saleRate: Int
        subtitle: String
        image: String
        rating: Float
        soldQty: Int
        labelIds: [ID]
        labels {
          id: String
          name: String
          color: String
        }: [ProductLabel]
      }: [Product]
    }: [ShopProductGroup]
    tags { 
      name: String
      icon: String
      qty: Int 
    }: [ShopTag]
  }:[ShopConfig]
  `);

  async getShopData() {
    return await this.query({
      query: `getShopData { ${this.fullFragment} }`,
      options: {
        fetchPolicy: "no-cache",
      },
    }).then((res) => res.data["g0"] as Shop);
  }
  async loginAnonymous(shopCode: string) {
    return await this.apollo
      .mutate({
        mutation: this.gql`mutation{
          loginAnonymous(shopCode:"${shopCode}")
        }`,
      })
      .then((res) => res.data["loginAnonymous"] as string)
      .then((token) => {
        SetAnonymousToken(token, shopCode);
        return token;
      });
  }
  async getAllShop(lat: number, lng: number) {
    return await this.apollo
      .query({
        query: this.gql`query {  getAllShop(lat: ${lat} lng: ${lng}) {
          id
          coverImage
          name
          fullAddress
          distance
          rating
          ratingQty
          shopCode
         }
        }`,
      })
      .then((res) => res.data["getAllShop"] as PublicShop[]);
  }
}
export const ShopService = new ShopRepository();
