import { LoaderOptions as _LoaderOptions } from "@googlemaps/js-api-loader";

export type LoaderOptions = Omit<_LoaderOptions, "id" | "retries">;
