import type {
  GoogleMapsLoaderOptions,
  GoogleMapsLibraries,
  GoogleMapsLibrary,
  ScriptOptions,
  GoogleMapsLoaderStatus,
} from './types';

export type {
  GoogleMapsLoaderOptions,
  GoogleMapsLoaderStatus,
  GoogleMapsLibrary,
  GoogleMapsLibraries,
  ScriptOptions,
};

declare class GoogleMapsLoader {
  /** @returns current status of {@link google.maps} script loading */
  static getStatus(): GoogleMapsLoaderStatus;
  /** @returns current status of a specific {@link library} loading */
  static getStatus(library: GoogleMapsLibrary): GoogleMapsLoaderStatus;

  /**
   * @returns promise of {@link google.maps} script loading completion
   *
   * **Resolves** if {@link GoogleMapsLoader.load load} is successful
   *
   * **Rejects**
   *
   * - if {@link google.maps} was loaded outside of this library
   * - if no `options` were set
   * - if script loading failed
   */
  static getCompletion(): Promise<void>;
  /**
   * @returns promise of loading the provided {@link library}
   */
  static getCompletion<L extends GoogleMapsLibrary>(
    library: L
  ): Promise<GoogleMapsLibraries[L]>;
  /**
   * @returns promise of loading provided {@link libraries}
   */
  static getCompletion<const A extends GoogleMapsLibrary[]>(
    ...libraries: A
  ): Promise<{
    [Index in keyof A]: GoogleMapsLibraries[A[Index]];
  }>;

  /**
   * Can be called multiple times, only on the first call it starts loading {@link google.maps} script with the given `options`
   */
  static load(): Promise<void>;
  /**
   * loads {@link google.maps} script and a provided {@link library}
   */
  static load<L extends GoogleMapsLibrary>(
    library: L
  ): Promise<GoogleMapsLibraries[L]>;
  /**
   * loads {@link google.maps} script and provided {@link libraries}
   */
  static load<const A extends GoogleMapsLibrary[]>(
    ...libraries: A
  ): Promise<{
    [Index in keyof A]: GoogleMapsLibraries[A[Index]];
  }>;

  /**
   * @returns provided {@link library} or `undefined` if it's not loaded yet
   */
  static get<L extends GoogleMapsLibrary>(
    library: L
  ): GoogleMapsLibraries[L] | undefined;

  /**
   * @returns error for {@link google.maps} script or `undefined`
   */
  static getError(): Error | undefined;
  /**
   * @returns error for the provided {@link library} or `undefined`
   */
  static getError(
    library: GoogleMapsLibrary
  ):
    | Error
    | google.maps.MapsServerError
    | google.maps.MapsNetworkError
    | google.maps.MapsRequestError
    | undefined;
}

type Identity<T> = T;

interface GoogleMapsLoader extends Identity<typeof GoogleMapsLoader> {
  /**
   * Sets options for the {@link GoogleMapsLoader}
   * @param options - options for {@link google.maps} script loading
   * @param scriptOptions - options for script element
   * @param callbackName - name for callback, which will be called when {@link google.maps} script loading ends, defaults to `"__gmlcb"`
   */
  (
    options: GoogleMapsLoaderOptions,
    scriptOptions?: ScriptOptions,
    callbackName?: string
  ): GoogleMapsLoader;
}

const enum Status {
  NONE,
  LOADING,
  LOADED,
  ERROR,
}

const googleMapsLoader = (() => {
  let options: GoogleMapsLoaderOptions;

  let scriptOptions: ScriptOptions;

  let callbackName: string;

  const GoogleMapsLoader = (
    _options: GoogleMapsLoaderOptions,
    _scriptProps?: ScriptOptions,
    _callbackName?: string
  ) => {
    options = _options;

    scriptOptions = _scriptProps || {};

    callbackName = _callbackName || '__gmlcb';

    return GoogleMapsLoader;
  };

  const completion = new Promise<void>((resolve, reject) => {
    type Data = [
      status: Status,
      promise: Promise<any>,
      lib: any,
      error: any,
      load: () => void,
    ];

    let status = Status.NONE;

    let error: Error | undefined;

    const statuses = ['none', 'loading', 'loaded', 'error'] as const;

    const store = new Map<GoogleMapsLibrary, Data>();

    const handleOnline = (cb: () => void, ifOnline?: () => void) => {
      if (navigator.onLine) {
        (ifOnline || cb)();
      } else {
        window.addEventListener('online', cb, { once: true });
      }
    };

    const initData = (key: GoogleMapsLibrary) => {
      let load!: () => void;

      const data: Data = [
        Status.NONE,
        new Promise((res, rej) => {
          load = () => {
            const reject = (err: any) => {
              handleOnline(load, () => {
                data[0] = Status.ERROR;

                data[3] = err;

                rej(err);
              });
            };

            completion.then(() => {
              google.maps.importLibrary(key).then((value) => {
                data[0] = Status.LOADED;

                data[2] = value;

                res(value);
              }, reject);
            }, reject);
          };
        }),
        undefined,
        undefined,
        load,
      ];

      store.set(key, data);

      return data;
    };

    const createCompletionGetter =
      (
        getCompletion: (key: GoogleMapsLibrary) => Promise<any>,
        onetime?: () => undefined
      ) =>
      (...libraries: GoogleMapsLibrary[]) => {
        if (onetime) {
          onetime = onetime();
        }

        const l = libraries.length;

        return l
          ? l > 1
            ? Promise.all(libraries.map(getCompletion))
            : getCompletion(libraries[0])
          : completion;
      };

    (GoogleMapsLoader as GoogleMapsLoader).get = (key) =>
      store.has(key) ? store.get(key)![2] : undefined;

    (GoogleMapsLoader as GoogleMapsLoader).getError = (
      key?: GoogleMapsLibrary
    ) => (key ? (store.has(key) ? store.get(key)![3] : undefined) : error);

    (GoogleMapsLoader as GoogleMapsLoader).getStatus = (
      key?: GoogleMapsLibrary
    ) =>
      statuses[
        key ? (store.has(key) ? store.get(key)![0] : Status.NONE) : status
      ];

    (GoogleMapsLoader as GoogleMapsLoader).getCompletion =
      createCompletionGetter((key) => (store.get(key) || initData(key))[1]);

    (GoogleMapsLoader as GoogleMapsLoader).load = createCompletionGetter(
      (key) => {
        const data = store.get(key) || initData(key);

        if (!data[0]) {
          data[0] = Status.LOADING;

          handleOnline(data.pop()!);
        }

        return data[1];
      },
      () => {
        let errorMessage: string | undefined;

        if (!options) {
          errorMessage = 'no options was set';
        } else if (window.google && google.maps) {
          errorMessage = 'google.maps already loaded';
        }

        if (errorMessage) {
          status = Status.ERROR;

          reject((error = new Error(errorMessage)));
        } else {
          status = Status.LOADING;

          const src = (
            Object.keys(options) as Array<keyof GoogleMapsLoaderOptions>
          ).reduce(
            (acc, key) => `${acc}&${key}=${options[key]}`,
            `https://maps.googleapis.com/maps/api/js?callback=${callbackName}&loading=async`
          );

          const createScript = () => {
            const script = document.createElement('script');

            script.type = 'text/javascript';

            script.onerror = () => {
              script.remove();

              handleOnline(createScript, () => {
                status = Status.ERROR;

                reject((error = new Error('google.maps could not load')));
              });
            };

            script.src = src;

            for (const key in scriptOptions) {
              // @ts-expect-error
              script[key] = scriptOptions[key as keyof ScriptOptions]!;
            }

            document.head.appendChild(script);
          };

          window[callbackName as any] = (() => {
            delete window[callbackName as any];

            status = Status.LOADED;

            resolve();
          }) as any;

          handleOnline(createScript);
        }
      }
    );
  });

  return GoogleMapsLoader as GoogleMapsLoader;
})();

export { googleMapsLoader as GoogleMapsLoader };
