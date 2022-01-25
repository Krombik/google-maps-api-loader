# google-maps-js-api-loader

## Description

Async loader for google maps api

## Example

```ts
import Loader from "google-maps-js-api-loader";

await Loader.load({
  apiKey: API_KEY,
  // ...some other options
});
```

## API

### load

```ts
async static load(options: LoaderOptions, onLoadingStart?: () => void): Promise<void>
```

Asynchronously loads Google Maps JavaScript API with given options, can be called multiple times, but always returns promise from the first call

> Note: it throws an error if google.maps already exists on the first call or if the options are different from the first call

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

## License

MIT © [Krombik](https://github.com/Krombik)
