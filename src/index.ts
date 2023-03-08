import type { GoogleMapsLoaderOptions, GoogleMapsLibrary } from "./types";
import { CALLBACK_NAME, noop, getQueryParameterAcc } from "./utils";

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

type OnError = (err: ErrorEvent | Error) => void;

type RunningStatus = Exclude<
  _GoogleMapsLoaderStatus,
  _GoogleMapsLoaderStatus.NONE
>;

class GoogleMapsLoader {
  private static _resolve?: () => void;
  private static _reject?: OnError;
  private static _options?: GoogleMapsLoaderOptions;

  private static [_GoogleMapsLoaderStatus.LOADING]? = new Set<() => void>();
  private static [_GoogleMapsLoaderStatus.LOADED]? = new Set<() => void>();
  private static [_GoogleMapsLoaderStatus.ERROR]? = new Set<OnError>();

  private static _runListeners(
    status: RunningStatus,
    fn: (...args: any[]) => void,
    arg?: any
  ) {
    GoogleMapsLoader.status = status;

    fn(arg);

    const iterator = GoogleMapsLoader[status]!.values();

    for (let i = GoogleMapsLoader[status]!.size; i--; ) {
      iterator.next().value(arg);
    }
  }

  private static _cleanup(status: RunningStatus) {
    GoogleMapsLoader[status]!.clear();

    delete GoogleMapsLoader[status];
  }

  static setOptions(options: GoogleMapsLoaderOptions) {
    GoogleMapsLoader._options = options;

    GoogleMapsLoader.setOptions = noop;
  }

  /**
   * Starts listening for given {@link status} changes and calls the given {@link callback} when it does
   * @returns a function that can be used to remove the listener, which can then be invoked in cleanup logic
   */
  static addListener(
    status: _GoogleMapsLoaderStatus.LOADING | _GoogleMapsLoaderStatus.LOADED,
    callback: () => void
  ): () => void;
  static addListener(
    status: _GoogleMapsLoaderStatus.ERROR,
    callback: OnError
  ): () => void;

  static addListener(
    status: RunningStatus,
    callback: (...args: any[]) => void
  ) {
    const set = GoogleMapsLoader[status];

    if (set) {
      set.add(callback);

      return () => {
        set.delete(callback);
      };
    }

    return noop;
  }

  /** Current status of {@link GoogleMapsLoader} */
  static status = _GoogleMapsLoaderStatus.NONE;

  /**
   * Promise of loading
   *
   * **Resolves** if {@link load} is success
   *
   * **Rejects**
   *
   * - if {@link google.maps} was loaded outside of this library
   * - if no options was {@link setOptions set}
   * - if script loading failed
   */
  static readonly completion = new Promise<void>((resolve, reject) => {
    function handleSetStatus(
      status: RunningStatus,
      fn: (...args: any[]) => void
    ) {
      return (arg?: any) => {
        GoogleMapsLoader._runListeners(status, fn, arg);

        GoogleMapsLoader._cleanup(_GoogleMapsLoaderStatus.LOADED);

        GoogleMapsLoader._cleanup(_GoogleMapsLoaderStatus.ERROR);

        delete window[CALLBACK_NAME as any];
      };
    }

    GoogleMapsLoader._resolve = handleSetStatus(
      _GoogleMapsLoaderStatus.LOADED,
      resolve
    );
    GoogleMapsLoader._reject = handleSetStatus(
      _GoogleMapsLoaderStatus.ERROR,
      reject
    );
  });

  /**
   * On the first call, it starts loading {@link google.maps} with the given {@link options}
   * @returns ‎{@link completion}
   */
  static load() {
    if (!GoogleMapsLoader.status && typeof window != "undefined") {
      let errorMessage: string | undefined;

      const options = GoogleMapsLoader._options!;

      const reject = GoogleMapsLoader._reject!;

      if (!options) {
        errorMessage = "no options was set";
      } else if (window.google && google.maps) {
        errorMessage = "google.maps already loaded";
      }

      if (errorMessage) {
        reject(new Error(errorMessage));
      } else {
        GoogleMapsLoader._runListeners(_GoogleMapsLoaderStatus.LOADING, noop);

        GoogleMapsLoader._cleanup(_GoogleMapsLoaderStatus.LOADING);

        let { retryCount = 2 } = options;

        const createScript = (url: string, retryDelay: number) => {
          const script = document.createElement("script");

          const { head } = document;

          script.type = "text/javascript";

          script.onload = () => {
            script.onerror = null;

            script.onload = null;
          };

          script.onerror = (err: ErrorEvent) => {
            if (retryCount--) {
              setTimeout(() => {
                createScript(url, retryDelay);

                head.removeChild(script);
              }, retryDelay);
            } else {
              reject(err);
            }
          };

          if (options.defer !== undefined) {
            script.defer = options.defer;
          }

          if (options.async !== undefined) {
            script.async = options.async;
          }

          if (options.nonce !== undefined) {
            script.nonce = options.nonce;
          }

          script.src = url;

          head.appendChild(script);
        };

        window[CALLBACK_NAME as any] = GoogleMapsLoader._resolve! as any;

        createScript(
          getQueryParameterAcc(
            `${
              options.url || "https://maps.googleapis.com/maps/api/js"
            }?callback=${CALLBACK_NAME}`,
            options
          )("apiKey", "key")(
            "version",
            "v"
          )("libraries")("channel")("client")("language")("region")(
            "mapIds",
            "map_ids"
          )("authReferrerPolicy", "auth_referrer_policy")(),
          options.retryDelay || 2000
        );
      }

      delete GoogleMapsLoader._options;

      delete GoogleMapsLoader._reject;

      delete GoogleMapsLoader._resolve;
    }

    return GoogleMapsLoader.completion;
  }
}

export default GoogleMapsLoader;
