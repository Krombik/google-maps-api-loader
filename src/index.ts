import { LoaderOptions } from "./types";
import { CALLBACK_NAME, handleScript, noop } from "./utils";

export { LoaderOptions };

export enum LoaderStatus {
  NONE,
  LOADING,
  LOADED,
  ERROR,
}

type HiddenFields = {
  promise: Promise<void>;
  resolve(): void;
  reject(err: ErrorEvent): void;
  status: LoaderStatus;
};

//@ts-expect-error
const hiddenFields: HiddenFields = {
  promise: new Promise<void>((resolve, reject) => {
    Object.defineProperties(hiddenFields, {
      resolve: { value: resolve },
      reject: { value: reject },
    });
  }),
  status: LoaderStatus.NONE,
};

class Loader {
  static options: LoaderOptions;

  static onLoadingStart = noop;

  /** Current status of {@link Loader} */
  static get status() {
    return hiddenFields.status;
  }

  /**
   * Promise of loading, it has pending status even if {@link load} not called yet (can be useful if you want to do something after loading done, but don't want to start loading)
   */
  static get completion() {
    return hiddenFields.promise;
  }

  /**
   * Starts loading of Google Maps JavaScript API with given {@link options} (if it not loaded yet)
   * @returns {} {@link completion}
   * @throws error if {@link google.maps} already loaded by something else or if no {@link options} was provided
   */
  static load() {
    if (hiddenFields.status === LoaderStatus.NONE) {
      if (!this.options) {
        hiddenFields.status = LoaderStatus.ERROR;

        throw new Error("no options was provided");
      }

      if (window.google && window.google.maps) {
        hiddenFields.status = LoaderStatus.ERROR;

        throw new Error("Google Maps already loaded");
      }

      hiddenFields.status = LoaderStatus.LOADING;

      this.onLoadingStart();

      window[CALLBACK_NAME] = () => {
        hiddenFields.status = LoaderStatus.LOADED;

        hiddenFields.resolve();

        //@ts-expect-error
        delete window[CALLBACK_NAME];
      };

      handleScript(this.options, (err) => {
        hiddenFields.status = LoaderStatus.ERROR;

        hiddenFields.reject(err);
      });
    }

    return hiddenFields.promise;
  }
}

export default Loader;
