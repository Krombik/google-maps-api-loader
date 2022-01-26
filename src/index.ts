import equal from "fast-deep-equal";
import { LoaderOptions } from "./types";
import { CALLBACK_NAME, handleScript, noop } from "./utils";

export { LoaderOptions };

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

  /** Current status of {@link Loader Loader} */
  static get status() {
    return this._status;
  }

  /** Promise from {@link Loader.load load} first call */
  static get completion() {
    return this._promise;
  }

  /** List of [libraries](https://developers.google.com/maps/documentation/javascript/libraries) from {@link Loader.load load} options */
  static get libraries() {
    return this._options.libraries || [];
  }

  /**
   * Asynchronously loads Google Maps JavaScript API with given options, can be called multiple times
   * @returns promise from the first call
   * @throws error if google.maps already exists on the first call or if the options are different from the first call
   */
  static async load(options: LoaderOptions, onLoadingStart?: () => void) {
    if (!this._options) {
      if (window.google && window.google.maps) {
        throw new Error("Google Maps already loaded");
      }

      this._options = options;

      this._status = LoaderStatus.LOADING;

      (onLoadingStart || noop)();

      let reject: (err: ErrorEvent) => void;

      this._promise = new Promise<void>((_resolve, _reject) => {
        window[CALLBACK_NAME] = () => {
          this._status = LoaderStatus.LOADED;

          _resolve();

          //@ts-expect-error
          delete window[CALLBACK_NAME];
        };

        reject = (err) => {
          this._status = LoaderStatus.ERROR;

          _reject(err);
        };
      });

      handleScript(options, reject!);
    } else if (!equal(this._options, options)) {
      throw new Error("Loader must not be called again with different options");
    }

    return this._promise;
  }
}

export default Loader;
