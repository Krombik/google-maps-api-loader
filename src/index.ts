import equal from "fast-deep-equal";
import { LoaderCallbacks, LoaderOptions } from "./types";
import { CALLBACK_NAME, handleScript, noop } from "./utils";

export { LoaderCallbacks, LoaderOptions };

export enum LoaderStatus {
  NONE,
  LOADING,
  LOADED,
  ERROR,
}

class Loader {
  private static _status = LoaderStatus.NONE;
  private static _options: LoaderOptions;
  private static _promise: Promise<void>;

  static get status() {
    return this._status;
  }

  static async load(
    options: LoaderOptions,
    callbacks: Partial<LoaderCallbacks> = {}
  ) {
    if (!this._options) {
      if (window.google && window.google.maps) {
        throw new Error("Google Maps already loaded");
      }

      this._options = options;

      this._status = LoaderStatus.LOADING;

      (callbacks.onLoadingStart || noop)();

      let resolve: () => void;
      let reject: (err: ErrorEvent) => void;

      const promise = new Promise<void>((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      })
        .then(() => {
          //@ts-expect-error
          delete window[CALLBACK_NAME];

          this._status = LoaderStatus.LOADED;

          (callbacks.onLoaded || noop)();
        })
        .catch((err: ErrorEvent) => {
          this._status = LoaderStatus.ERROR;

          (callbacks.onError || noop)(err);
        });

      this._promise = promise;

      window[CALLBACK_NAME] = resolve!;

      handleScript(options, reject!);
    } else if (!equal(this._options, options)) {
      throw new Error("Loader must not be called again with different options");
    }

    return this._promise;
  }
}

export default Loader;
