/** @internal */
export const CALLBACK_NAME = "__gmlc";

/** @internal */
export const noop = function () {};

type AddFn<K> = {
  <T extends K>(key: T, queryKey?: string): AddFn<Exclude<K, T>>;
  (): string;
};

/** @internal */
export const getQueryParameterAcc = <T extends object>(url: string, obj: T) => {
  const add = (key?: keyof T, queryKey?: string) => {
    if (key) {
      const value = obj[key] as undefined | string | string[];

      if (value) {
        url += `&${queryKey || (key as string)}=${
          typeof value == "string" ? value : value.join(",")
        }`;
      }

      return add;
    }

    return url;
  };

  return add as AddFn<keyof T>;
};
