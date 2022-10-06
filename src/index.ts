import type { LoaderOptions, Library } from "./types";
import { CALLBACK_NAME, noop } from "./utils";

export type { LoaderOptions, Library };

export enum LoaderStatus {
  NONE,
  LOADING,
  LOADED,
  ERROR,
}

type OnError = (err: ErrorEvent | Error) => void;

type RunningStatus =
  | LoaderStatus.LOADING
  | LoaderStatus.LOADED
  | LoaderStatus.ERROR;

class Loader {
  private static _resolve?: () => void;
  private static _reject?: OnError;
  private static _options?: LoaderOptions;

  private static [1]? = new Set<() => void>();
  private static [2]? = new Set<() => void>();
  private static [3]? = new Set<OnError>();

  private static _runListeners?(
    status: RunningStatus,
    fn: (...args: any[]) => void,
    arg?: any
  ) {
    Loader.status = status;

    fn(arg);

    const iterator = Loader[status]!.values();

    for (let i = Loader[status]!.size; i--; ) {
      iterator.next().value(arg);
    }
  }

  private static _cleanup?(status: RunningStatus) {
    Loader[status]!.clear();

    delete Loader[status];
  }

  static setOptions(options: LoaderOptions) {
    Loader.setOptions = noop;

    Loader._options = options;
  }

  /**
   * Starts listening for given {@link status} changes and calls the given {@link callback} when it does
   * @returns a function that can be used to remove the listener, which can then be invoked in cleanup logic
   */
  static addListener(
    status: LoaderStatus.LOADING | LoaderStatus.LOADED,
    callback: () => void
  ): () => void;
  static addListener(status: LoaderStatus.ERROR, callback: OnError): () => void;

  static addListener(
    status: Exclude<LoaderStatus, LoaderStatus.NONE>,
    callback: (...args: any[]) => void
  ) {
    const set = Loader[status];

    if (set) {
      set.add(callback);

      return () => {
        set.delete(callback);
      };
    }

    return noop;
  }

  /** Current status of {@link Loader} */
  static status: LoaderStatus = 0; // LoaderStatus.NONE

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
        Loader._runListeners!(status, fn, arg);

        Loader._cleanup!(2);

        Loader._cleanup!(3);

        delete Loader._runListeners;

        delete Loader._cleanup;

        delete window[CALLBACK_NAME];
      };
    }

    Loader._resolve = handleSetStatus(2, resolve);
    Loader._reject = handleSetStatus(3, reject);
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
        Loader._runListeners!(1, noop);

        Loader._cleanup!(1);

        let { retryCount = 2 } = options;

        const { retryDelay = 2000 } = options;

        const url = new URL(
          options.url || "https://maps.googleapis.com/maps/api/js"
        );

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

        for (const key in params) {
          const param = params[key];

          if (param) {
            url.searchParams.set(
              key,
              typeof param === "string" ? param : param.join(",")
            );
          }
        }

        const createScript = () => {
          const onError = (err: ErrorEvent) => {
            if (retryCount--) {
              setTimeout(() => {
                createScript();

                head.removeChild(script);
              }, retryDelay);
            } else {
              reject(err);
            }
          };

          const script = document.createElement("script");

          const { head } = document;

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

          script.src = url.toString();

          script.addEventListener(
            "load",
            () => {
              script.removeEventListener("error", onError);
            },
            { once: true }
          );

          script.addEventListener("error", onError);

          head.appendChild(script);
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
