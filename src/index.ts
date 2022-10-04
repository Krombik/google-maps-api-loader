import type { LoaderOptions } from "./types";
import { CALLBACK_NAME, noop } from "./utils";

export type { LoaderOptions };

export enum LoaderStatus {
  NONE,
  LOADING,
  LOADED,
  ERROR,
}

class Loader {
  private static _resolve?: () => void;
  private static _reject?: (err: ErrorEvent | Error) => void;
  private static _options?: LoaderOptions;

  /**
   * @throws error if options will be set more then 1 time
   */
  static setOptions(options: LoaderOptions) {
    Loader.setOptions = () => {
      throw new Error("options already set");
    };

    Loader._options = options;
  }

  /**
   * Callback which will be fired after loading starts
   */
  static onLoadingStart = noop;

  /** Current status of {@link Loader} */
  static status: LoaderStatus = 0; // LoaderStatus.NONE

  /**
   * Promise of loading
   *
   * **Resolves** if [load](#load) is success
   *
   * **Rejects** when
   *
   * - Maps JavaScript API was loaded outside of this library
   * - no options was [set](#setoptions)
   * - script loading failed
   */
  static readonly completion = new Promise<void>((resolve, reject) => {
    Loader._resolve = () => {
      Loader.status = 2; // LoaderStatus.LOADED

      resolve();
    };
    Loader._reject = (err) => {
      Loader.status = 3; // LoaderStatus.ERROR

      reject(err);
    };
  }).finally(() => {
    delete window[CALLBACK_NAME];
  });

  /**
   * On the first call, it starts loading {@link google.maps} with the given {@link options}
   * @returns ‎{@link completion}
   */
  static load() {
    if (!Loader.status) {
      let errorMessage: string | undefined;

      const options = Loader._options!;

      const reject = Loader._reject!;

      if (!options) {
        errorMessage = "no options was provided";
      } else if (window.google?.maps) {
        errorMessage = "Google Maps already loaded";
      }

      if (errorMessage) {
        reject(new Error(errorMessage));
      } else {
        Loader.status = 1; // LoaderStatus.LOADING

        Loader.onLoadingStart();

        const params = {
          key: options.apiKey,
          v: options.version,
          libraries: options.libraries,
          channel: options.channel,
          client: options.client,
          language: options.language,
          region: options.region,
          map_ids: options.mapIds,
          auth_referrer_policy: options.authReferrerPolicy,
          callback: CALLBACK_NAME,
        };

        const url = new URL(
          options.url || "https://maps.googleapis.com/maps/api/js"
        );

        for (const key in params) {
          const param = params[key];

          if (param) {
            url.searchParams.set(
              key,
              typeof param === "string" ? param : param.join(",")
            );
          }
        }

        const src = url.toString();

        let { retryCount = 2 } = options;

        const { retryDelay = 2000 } = options;

        const createScript = () => {
          const script = document.createElement("script");

          const onError = (err: ErrorEvent) => {
            if (retryCount) {
              setTimeout(() => {
                retryCount--;

                document.head.removeChild(script);

                createScript();
              }, retryDelay);
            } else {
              reject(err);
            }
          };

          script.type = "text/javascript";

          if ("defer" in options) {
            script.defer = options.defer!;
          }

          if ("async" in options) {
            script.async = options.async!;
          }

          if ("nonce" in options) {
            script.nonce = options.nonce!;
          }

          script.src = src;

          script.addEventListener(
            "load",
            () => {
              script.removeEventListener("error", onError);
            },
            { once: true }
          );

          script.addEventListener("error", onError);

          document.head.appendChild(script);
        };

        window[CALLBACK_NAME] = Loader._resolve!;

        createScript();
      }

      delete Loader._options;

      delete Loader._reject;

      delete Loader._resolve;
    }

    return Loader.completion;
  }
}

export default Loader;
