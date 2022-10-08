import type { LoaderOptions, Library } from "./types";
import { CALLBACK_NAME, noop } from "./utils";

export type { LoaderOptions, Library };

const enum _LoaderStatus {
  NONE,
  LOADING,
  LOADED,
  ERROR,
}

export const LoaderStatus: typeof _LoaderStatus = {
  NONE: 0,
  LOADING: 1,
  LOADED: 2,
  ERROR: 3,
};

type OnError = (err: ErrorEvent | Error) => void;

type RunningStatus = Exclude<_LoaderStatus, _LoaderStatus.NONE>;

class Loader {
  private static _resolve?: () => void;
  private static _reject?: OnError;
  private static _options?: LoaderOptions;

  private static [_LoaderStatus.LOADING]? = new Set<() => void>();
  private static [_LoaderStatus.LOADED]? = new Set<() => void>();
  private static [_LoaderStatus.ERROR]? = new Set<OnError>();

  private static _runListeners(
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

  private static _cleanup(status: RunningStatus) {
    Loader[status]!.clear();

    delete Loader[status];
  }

  static setOptions(options: LoaderOptions) {
    Loader._options = options;

    Loader.setOptions = noop;
  }

  /**
   * Starts listening for given {@link status} changes and calls the given {@link callback} when it does
   * @returns a function that can be used to remove the listener, which can then be invoked in cleanup logic
   */
  static addListener(
    status: _LoaderStatus.LOADING | _LoaderStatus.LOADED,
    callback: () => void
  ): () => void;
  static addListener(
    status: _LoaderStatus.ERROR,
    callback: OnError
  ): () => void;

  static addListener(
    status: RunningStatus,
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
  static status = _LoaderStatus.NONE;

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
        Loader._runListeners(status, fn, arg);

        Loader._cleanup(_LoaderStatus.LOADED);

        Loader._cleanup(_LoaderStatus.ERROR);

        delete window[CALLBACK_NAME];
      };
    }

    Loader._resolve = handleSetStatus(_LoaderStatus.LOADED, resolve);
    Loader._reject = handleSetStatus(_LoaderStatus.ERROR, reject);
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
        errorMessage = "no options was set";
      } else if (window.google?.maps) {
        errorMessage = "google.maps already loaded";
      }

      if (errorMessage) {
        reject(new Error(errorMessage));
      } else {
        Loader._runListeners(_LoaderStatus.LOADING, noop);

        Loader._cleanup(_LoaderStatus.LOADING);

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

        let { retryCount = 2 } = options;

        const { retryDelay = 2000 } = options;

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
                createScript();

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

          script.src = url.toString();

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
