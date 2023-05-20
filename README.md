# google-maps-loader

## Description

Lightweight JavaScript library that simplifies the process of adding `Google Maps JavaScript API` to web application.

## Example

```ts
import { GoogleMapsLoader, GoogleMapsLoaderStatus } from "google-maps-loader";

GoogleMapsLoader({
  key: API_KEY,
  // ...some other options
});

if (GoogleMapsLoader.status === GoogleMapsLoaderStatus.LOADED) {
  console.log("google.maps is ready");
}

GoogleMapsLoader.completion.then(() => console.log("google.maps is ready"));

await GoogleMapsLoader.load();
```

## API

### GoogleMapsLoader

```ts
function GoogleMapsLoader(options: GoogleMapsLoaderOptions): GoogleMapsLoader;
```

Sets options for a `Google Maps JavaScript API` script, options must be set before [load](#load) is executed

| GoogleMapsLoaderOptions | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| key                     | Your [API key](https://developers.google.com/maps/documentation/javascript/get-api-key)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| v?                      | The [version](https://developers.google.com/maps/documentation/javascript/versions) of the `Google Maps JavaScript API` to use                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| libraries?              | Array of additional `Google Maps JavaScript API` [libraries](https://developers.google.com/maps/documentation/javascript/libraries) to load                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| language?               | The [language](https://developers.google.com/maps/documentation/javascript/localization) to use. This affects the names of controls, copyright notices, driving directions, and control labels, as well as the responses to service requests. See the [list of supported languages](https://developers.google.com/maps/faq#languagesupport)                                                                                                                                                                                                                                                                                                                                                                                                         |
| region?                 | The [region](https://developers.google.com/maps/documentation/javascript/localization#Region) code to use. This alters the map's behavior based on a given country or territory                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| auth_referrer_policy?   | Maps JS customers can configure HTTP Referrer Restrictions in the Cloud Console to limit which URLs are allowed to use a particular API Key. By default, these restrictions can be configured to allow only certain paths to use an API Key. If any URL on the same domain or origin may use the API Key, you can set `"origin"` to limit the amount of data sent when authorizing requests from the `Google Maps JavaScript API`. This is available starting in version **3.46**. When this parameter is specified and HTTP Referrer Restrictions are enabled on Cloud Console, `Google Maps JavaScript API` will only be able to load if there is an HTTP Referrer Restriction that matches the current website's domain without a path specified |
| url?                    | Use a custom url and path to load the Google Maps API script                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| nonce?                  | Adds [nonce attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-nonce) to the script                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| async?                  | Adds [async attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-async) to the script                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| defer?                  | Adds [defer attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-defer) to the script                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

---

### load

```ts
static load(): Promise<void>
```

Can be called multiple times, only on the first call it starts loading `Google Maps JavaScript API` script with the given [options](#googlemapsloader)

Returns [completion](#completion)

---

### status

```ts
enum GoogleMapsLoaderStatus {
  NONE, // default value
  LOADING,
  LOADED,
  ERROR,
}

static status: GoogleMapsLoaderStatus
```

Current status of `GoogleMapsLoader`

---

### completion

```ts
static readonly completion: Promise<void>
```

Promise of loading

**Resolves** if [load](#load) is success

**Rejects**

- if `Google Maps JavaScript API` was loaded outside of this library
- if no options was [set](#googlemapsloader)
- if script loading failed

---

## License

MIT © [Krombik](https://github.com/Krombik)
