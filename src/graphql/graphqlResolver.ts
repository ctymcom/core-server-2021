import { get } from "lodash";

import { Context } from "./context";

export class GraphqlResolver {
  static loadById(
    loader: any,
    idField: string,
    option: { defaultValue?: any; select?: string } = {} as any
  ) {
    return (root: any, args: any, context: Context) => {
      return root[idField]
        ? loader
            .load(root[idField].toString() + (option.select ? ":" + option.select : ""))
            .then((res: any) => res || option.defaultValue)
        : undefined;
    };
  }
  static loadManyById(
    loader: any,
    idField: string,
    option: { defaultValue?: any; skipNull?: boolean } = {} as any
  ) {
    const { defaultValue, skipNull } = option;
    return async (root: any, args: any, context: Context) => {
      let result = root[idField]
        ? await loader
            .loadMany(root[idField])
            .then((res: any[]) => res.map((r) => r || defaultValue))
        : [];
      if (skipNull) {
        result = result.filter((r: any) => r != null && r != undefined);
      }
      return result;
    };
  }
  static requireRoles(roles: string[], defaultValue: any = null) {
    return (root: any, args: any, context: Context, info: any) => {
      try {
        context.auth(roles);
      } catch (err) {
        return defaultValue;
      }
      return root[info.fieldName];
    };
  }
  static dependOnFieldEq(field: string, equal: any, next: any) {
    return (root: any, args: any, context: Context) => {
      return get(root, field) == equal ? next(root, args, context) : null;
    };
  }
}
