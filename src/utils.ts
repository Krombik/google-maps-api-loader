import { LoaderOptions } from "./types";

export const CALLBACK_NAME = "__googleMapsCallback";

export const noop = function () {};

const getSrc = (options: LoaderOptions) => {
  const params = {
    key: options.apiKey,
    channel: options.channel,
    client: options.client,
    v: options.version,
    language: options.language,
    region: options.region,
    map_ids: options.mapIds,
    libraries: options.libraries,
    callback: CALLBACK_NAME,
    auth_referrer_policy: options.authReferrerPolicy,
  };

  const keys = Object.keys(params) as (keyof typeof params)[];

  const arr: string[] = [];

  for (let i = keys.length; i--; ) {
    const key = keys[i];

    const param = params[key];

    if (param) {
      arr.push(`${key}=${Array.isArray(param) ? param.join(",") : param}`);
    }
  }

  const url = options.url || "https://maps.googleapis.com/maps/api/js";

  if (arr.length) {
    return `${url}?${arr.join("&")}`;
  }

  return url;
};

export const handleScript = (
  options: LoaderOptions,
  reject: (err: ErrorEvent) => void
) => {
  const script = document.createElement("script");

  const { nonce, defer, async } = options;

  if (defer !== undefined) {
    script.defer = defer;
  }

  if (async !== undefined) {
    script.async = true;
  }

  if (nonce) {
    script.nonce = nonce;
  }

  script.src = getSrc(options);

  script.type = "text/javascript";

  script.addEventListener("error", reject);

  document.head.appendChild(script);
};
