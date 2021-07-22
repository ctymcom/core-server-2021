import { BaseModel, CrudRepository } from "./crud.repo";

export interface ShopComment extends BaseModel {
  memberId: string;
  customerId: string;
  orderId: string;
  ownerName: string;
  message: string;
  rating: string;
  status: "PENDING" | "PUBLIC" | "HIDDEN";
  tags: ShopTag[];
}
export interface ShopTag {
  name: string;
  icon: string;
  qty: number;
}
export class ShopCommentRepository extends CrudRepository<ShopComment> {
  apiName: string = "ShopComment";
  displayName: string = "bình luận";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    customerId: ID
    orderId: ID
    ownerName: String
    message: String
    rating: Int
    status: String
    tags {
      name: String
      icon: String
      qty: Int
    }: [ShopTag]
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    customerId: ID
    orderId: ID
    ownerName: String
    message: String
    rating: Int
    status: String
    tags {
      name: String
      icon: String
      qty: Int
    }: [ShopTag]
  `);
  // async commentOrder(
  //   orderId: string,
  //   message: string,
  //   rating: number,
  //   tags: { name: string; icon: string; qty: number }[]
  // ) {
  //   // console.log(`query { commentOrder(key: "${key}"){ ${this.fullFragment} } }`);
  //   const result = await this.apollo.mutate({
  //     mutation: this.gql`mutation { commentOrder(key: "${key}"){ ${this.fullFragment} } }`,
  //   });
  //   this.handleError(result);
  //   return result.data["getOneSettingByKey"] as Setting;
  // }
}

export const ShopCommentService = new ShopCommentRepository();

export const SHOP_COMMENT_STATUS: Option[] = [
  { value: "PUBLIC", label: "Công khai", color: "success" },
  { value: "PENDING", label: "Chờ duyệt", color: "warning" },
  { value: "HIDDEN", label: "Đang ẩn", color: "bluegray" },
];
