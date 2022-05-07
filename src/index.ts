import { LoaderOptions } from "./types";
import { CALLBACK_NAME, handleScript, noop } from "./utils";

export { LoaderOptions };

export enum LoaderStatus {
  NONE,
  LOADING,
  LOADED,
  ERROR,
}

let resolve: () => void;
let reject: (err: ErrorEvent) => void;

const promise = new Promise<void>((_resolve, _reject) => {
  resolve = _resolve;
  reject = _reject;
});

let status = LoaderStatus.NONE;

class Loader {
  static options: LoaderOptions;

  static onLoadingStart = noop;

  /** Current status of {@link Loader} */
  static get status() {
    return status;
  }

  /**
   * Promise of loading, it has pending status even if {@link load} not called yet (can be useful if you want to do something after loading done, but don't want to start loading)
   */
  static get completion() {
    return promise;
  }

  /**
   * Starts loading of Google Maps JavaScript API with given {@link options} (if it not loaded yet)
   * @returns {} {@link completion}
   * @throws error if {@link google.maps} already loaded by something else or if no {@link options} was provided
   */
  static load() {
    if (status === LoaderStatus.NONE) {
      if (!this.options) {
        status = LoaderStatus.ERROR;

        throw new Error("no options was provided");
      }

      if (window.google && window.google.maps) {
        status = LoaderStatus.ERROR;

        throw new Error("Google Maps already loaded");
      }

      status = LoaderStatus.LOADING;

      this.onLoadingStart();

      window[CALLBACK_NAME] = () => {
        status = LoaderStatus.LOADED;

        resolve();

        //@ts-expect-error
        delete window[CALLBACK_NAME];
      };

      handleScript(this.options, (err) => {
        status = LoaderStatus.ERROR;

        reject(err);
      });
    }

    return promise;
  }
}

export default Loader;
