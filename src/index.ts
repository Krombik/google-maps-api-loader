import type { GoogleMapsLoaderOptions, GoogleMapsLibrary } from "./types";

export type { GoogleMapsLoaderOptions, GoogleMapsLibrary };

const enum _GoogleMapsLoaderStatus {
  NONE,
  LOADING,
  LOADED,
  ERROR,
}

export const GoogleMapsLoaderStatus: typeof _GoogleMapsLoaderStatus = {
  NONE: 0,
  LOADING: 1,
  LOADED: 2,
  ERROR: 3,
};

declare class GoogleMapsLoader {
  /** Current status of {@link GoogleMapsLoader} */
  static readonly status: _GoogleMapsLoaderStatus;
  /**
   * Promise of loading
   *
   * **Resolves** if {@link GoogleMapsLoader.load load} is success
   *
   * **Rejects**
   *
   * - if {@link google.maps} was loaded outside of this library
   * - if no `options` was set
   * - if script loading failed
   */
  static readonly completion: Promise<void>;
  /**
   * Can be called multiple times, only on the first call it starts loading {@link google.maps} script with the given `options`
   * @returns ‎{@link GoogleMapsLoader.completion completion}
   */
  static load(): Promise<void>;
}

type Identity<T> = T;

interface GoogleMapsLoader extends Identity<typeof GoogleMapsLoader> {
  /**
   * Sets options for the {@link GoogleMapsLoader}
   * @param options - options for {@link google.maps} script loading
   */
  (options: GoogleMapsLoaderOptions): GoogleMapsLoader;
}

const googleMapsLoader = ((): GoogleMapsLoader => {
  let options!: GoogleMapsLoaderOptions;

  let load!: () => Promise<void>;

  const CALLBACK_NAME = "__gmlcb";

  const completion = new Promise<void>((resolve, reject) => {
    load = () => {
      load = () => completion;

      if (typeof window != "undefined") {
        let errorMessage: string | undefined;

        if (!options) {
          errorMessage = "no options was set";
        } else if (window.google && google.maps) {
          errorMessage = "google.maps already loaded";
        }

        if (errorMessage) {
          GoogleMapsLoader.status = _GoogleMapsLoaderStatus.ERROR;

          reject(new Error(errorMessage));
        } else {
          GoogleMapsLoader.status = _GoogleMapsLoaderStatus.LOADING;

          const { async, defer, nonce, url, ...rest } = options;

          const combinedUrl = (
            Object.keys(rest) as Array<keyof typeof rest>
          ).reduce(
            (acc, key) => `${acc}&${key}=${rest[key]}`,
            `${
              url || "https://maps.googleapis.com/maps/api/js"
            }?callback=${CALLBACK_NAME}`
          );

          const createScript = () => {
            window.removeEventListener("online", createScript);

            const script = document.createElement("script");

            const { head } = document;

            script.type = "text/javascript";

            script.onerror = () => {
              head.removeChild(script);

              if (navigator.onLine) {
                GoogleMapsLoader.status = _GoogleMapsLoaderStatus.ERROR;

                reject(new Error("google.maps could not load"));
              } else {
                window.addEventListener("online", createScript);
              }
            };

            if (defer != undefined) {
              script.defer = defer;
            }

            if (async != undefined) {
              script.async = async;
            }

            if (nonce != undefined) {
              script.nonce = nonce;
            }

            script.src = combinedUrl;

            head.appendChild(script);
          };

          window[CALLBACK_NAME as any] = (() => {
            delete window[CALLBACK_NAME as any];

            GoogleMapsLoader.status = _GoogleMapsLoaderStatus.LOADED;

            resolve();
          }) as any;

          if (navigator.onLine) {
            createScript();
          } else {
            window.addEventListener("online", createScript);
          }
        }
      }

      return completion;
    };
  });

  const GoogleMapsLoader = (_options: GoogleMapsLoaderOptions) => {
    options = _options;

    return GoogleMapsLoader;
  };

  GoogleMapsLoader.status = _GoogleMapsLoaderStatus.NONE;

  GoogleMapsLoader.completion = completion;

  GoogleMapsLoader.load = () => load();

  return GoogleMapsLoader as GoogleMapsLoader;
})();

export { googleMapsLoader as GoogleMapsLoader };
