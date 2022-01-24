import { LoaderOptions as _LoaderOptions } from "@googlemaps/js-api-loader";

export type LoaderOptions = Omit<_LoaderOptions, "id" | "retries">;

export type LoaderCallbacks = {
  onLoadingStart: () => void;
  onLoaded: () => void;
  onError: (err: ErrorEvent) => void;
};
