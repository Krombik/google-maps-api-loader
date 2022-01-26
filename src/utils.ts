import { stringifyUrl } from "query-string";
import { LoaderOptions } from "./types";

export const CALLBACK_NAME = "__googleMapsCallback";

export const noop = function () {};

const handleOptions = (options: LoaderOptions) => ({
  params: {
    key: options.apiKey,
    channel: options.channel,
    client: options.client,
    v: options.version,
    language: options.language,
    region: options.region,
    map_ids: options.mapIds,
    libraries: options.libraries,
  },
  url: options.url || "https://maps.googleapis.com/maps/api/js",
  nonce: options.nonce,
});

export const handleScript = (
  options: LoaderOptions,
  reject: (err: ErrorEvent) => void
) => {
  const { params, url, nonce } = handleOptions(options);

  const script = document.createElement("script");

  script.src = stringifyUrl(
    {
      url,
      query: { ...params, callback: CALLBACK_NAME },
    },
    { skipEmptyString: true, arrayFormat: "comma" }
  );

  script.type = "text/javascript";
  script.defer = true;
  script.async = true;

  script.addEventListener("error", reject);

  if (nonce) {
    script.nonce = nonce;
  }

  document.head.appendChild(script);
};
