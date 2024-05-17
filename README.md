# google-maps-js-api-loader

## Description

Lightweight JavaScript library that simplifies the process of adding `Google Maps JavaScript API` to web application.

## Installation

using npm:

```
npm install --save google-maps-js-api-loader
```

or yarn:

```
yarn add google-maps-js-api-loader
```

or pnpm:

```
pnpm add google-maps-js-api-loader
```

---

## Example

```ts
import { GoogleMapsLoader } from 'google-maps-js-api-loader';

GoogleMapsLoader(
  {
    key: API_KEY,
    // ...some other options
  },
  { async: true }
);

if (GoogleMapsLoader.getStatus() === 'loaded') {
  console.log('google.maps is ready');
}

GoogleMapsLoader.getCompletion('maps').then(({ Map }) =>
  // ...do something with Map
);

const [{ Map }, { AutocompleteService }] = await GoogleMapsLoader.load(
  'maps',
  'places'
);
```

## API

### GoogleMapsLoader

```ts
function GoogleMapsLoader(
  options: GoogleMapsLoaderOptions,
  scriptOptions: ScriptOptions,
  callbackName?: string
): GoogleMapsLoader;
```

Sets options for a `Google Maps JavaScript API` script, options must be set before [load](#load) is executed

| GoogleMapsLoaderOptions | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| key                     | Your [API key](https://developers.google.com/maps/documentation/javascript/get-api-key)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| v?                      | The [version](https://developers.google.com/maps/documentation/javascript/versions) of the `Google Maps JavaScript API` to use                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| language?               | The [language](https://developers.google.com/maps/documentation/javascript/localization) to use. This affects the names of controls, copyright notices, driving directions, and control labels, as well as the responses to service requests. See the [list of supported languages](https://developers.google.com/maps/faq#languagesupport)                                                                                                                                                                                                                                                                                                                                                                                                         |
| region?                 | The [region](https://developers.google.com/maps/documentation/javascript/localization#Region) code to use. This alters the map's behavior based on a given country or territory                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| auth_referrer_policy?   | Maps JS customers can configure HTTP Referrer Restrictions in the Cloud Console to limit which URLs are allowed to use a particular API Key. By default, these restrictions can be configured to allow only certain paths to use an API Key. If any URL on the same domain or origin may use the API Key, you can set `"origin"` to limit the amount of data sent when authorizing requests from the `Google Maps JavaScript API`. This is available starting in version **3.46**. When this parameter is specified and HTTP Referrer Restrictions are enabled on Cloud Console, `Google Maps JavaScript API` will only be able to load if there is an HTTP Referrer Restriction that matches the current website's domain without a path specified |

`scriptOptions` - object with options for script element

`callbackName` - `Google Maps JavaScript API` load callback name, `"__gmlcb"` by default

---

### load

```ts
static load(): Promise<void>;

static load<L extends GoogleMapsLibrary>(
  library: L
): Promise<GoogleMapsLibraries[L]>;

static load<const A extends GoogleMapsLibrary[]>(
  ...libraries: A
): Promise<{
  [Index in keyof A]: GoogleMapsLibraries[A[Index]];
}>;
```

Can be called multiple times, only on the first call it starts loading `Google Maps JavaScript API` script with the given [options](#googlemapsloader)

Returns a promise that resolves when the Google Maps JavaScript API script and specified libraries have been successfully loaded, or rejects if an error occurs during the loading process.

---

### getStatus

```ts
type GoogleMapsLoaderStatus = "none" | "loading" | "loaded" | "error";

static getStatus(): GoogleMapsLoaderStatus;

static getStatus(library: GoogleMapsLibrary): GoogleMapsLoaderStatus;
```

Returns current status of `GoogleMapsLoader` or provided library loading

---

### getCompletion

```ts
static getCompletion(): Promise<void>;

static getCompletion<L extends GoogleMapsLibrary>(
  library: L
): Promise<GoogleMapsLibraries[L]>;

static getCompletion<const A extends GoogleMapsLibrary[]>(
  ...libraries: A
): Promise<{
  [Index in keyof A]: GoogleMapsLibraries[A[Index]];
}>;
```

Returns a promise that resolves when the `Google Maps JavaScript API` script and specified libraries have been successfully loaded, or rejects if an error occurs during the loading process.

---

### get

```ts
static get<L extends GoogleMapsLibrary>(
  library: L
): GoogleMapsLibraries[L] | undefined;
```

Returns the provided library or `undefined` if it has not been loaded yet.

---

### getError

```ts
static getError(
  library: GoogleMapsLibrary
):
  | google.maps.MapsServerError
  | google.maps.MapsNetworkError
  | google.maps.MapsRequestError
  | undefined;
```

Returns the error for the provided library or `undefined`

---

## License

MIT © [Krombik](https://github.com/Krombik)
