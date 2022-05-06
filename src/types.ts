import type { LoaderOptions as _LoaderOptions } from "@googlemaps/js-api-loader";

export type LoaderOptions = Omit<_LoaderOptions, "id" | "retries"> & {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-async
   */
  async?: boolean;
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-defer
   */
  defer?: boolean;
};
