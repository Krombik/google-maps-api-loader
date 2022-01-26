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

// or

// start load in root file
Loader.load({
  apiKey: API_KEY,
  // ...some other options
});

// and then await it in nested files
await Loader.completion;
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
enum LoaderStatus {
  NONE, // default value
  LOADING,
  LOADED,
  ERROR,
}

static status: LoaderStatus
```

Current status of `Loader`

---

### completion

```ts
static completion: Promise<void>
```

Promise from [load](#load) first call

---

### libraries

```ts
static libraries: Libraries
```

List of [libraries](https://developers.google.com/maps/documentation/javascript/libraries) from [options](#loaderoptions)

---

### LoaderOptions

Options structure is similar to [@googlemaps/js-api-loader](https://github.com/googlemaps/js-api-loader)

---

## License

MIT © [Krombik](https://github.com/Krombik)
