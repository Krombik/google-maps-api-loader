# google-maps-loader

## Description

Async loader for google maps api

## Example

```ts
import Loader from "google-maps-loader";

await Loader.load(
  {
    apiKey: API_KEY,
    // ...some other options
  },
  {
    onLoadingStart: () => {
      // will be executed after load has started
    },
    onLoaded: () => {
      // will be executed after loading ends
    },
    onError: (err) => {
      // will be executed if script loading fails
    },
  }
);
```

## API

### load

```ts
async static load(options: LoaderOptions, callbacks: Partial<LoaderCallbacks>): Promise<void>
```

Asynchronously loads Google Maps JavaScript API with given options, can be called multiple times, but always returns promise from the first call

> Note: throws an error if google.maps already exists on the first call or if the options are different from the first call

---

### status

```ts
static status: LoaderStatus
```

Current status of `Loader`

---

### LoaderStatus

```ts
enum LoaderStatus {
  NONE,
  LOADING,
  LOADED,
  ERROR,
}
```

---

### LoaderOptions

Options structure is same to [@googlemaps/js-api-loader](https://github.com/googlemaps/js-api-loader)

---

### LoaderCallbacks

```ts
type LoaderCallbacks = {
  onLoadingStart: () => void;
  onLoaded: () => void;
  onError: (err: ErrorEvent) => void;
};
```

---

## License

MIT © [Krombik](https://github.com/Krombik)
