# google-maps-js-api-loader

## Description

Async loader for google maps api

## Example

```ts
import Loader from "google-maps-js-api-loader";

Loader.options = {
  apiKey: API_KEY,
  // ...some other options
};

await Loader.load();
```

## API

### options

```ts
static options: LoaderOptions
```

Loader options (query parameters for script url and some script attributes), should be set before [load](#load) execution

---

### load

```ts
async static load(): Promise<void>
```

Starts loading of Google Maps JavaScript API with given [options](#options) (if it not loaded yet), returns [completion](#completion)

> throws error if google.maps already loaded by something else or if no [options](#options) was provided

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

Promise of loading, it has pending status even if [load](#load) not called yet (can be useful if you want to do something after loading done, but don't want to start loading)

---

## License

MIT © [Krombik](https://github.com/Krombik)
