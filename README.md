# google-maps-js-api-loader

## Description

Async loader for `Maps JavaScript API`

## Example

```ts
import Loader from "google-maps-js-api-loader";

Loader.setOptions({
  apiKey: API_KEY,
  // ...some other options
});

await Loader.load();
```

## API

### setOptions

```ts
static setOptions(options: LoaderOptions): void
```

Loader options should be set before [load](#load) execution

| LoaderOptions       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| apiKey              | Your [API key](https://developers.google.com/maps/documentation/javascript/get-api-key). The `Maps JavaScript API` will not load unless a valid API key is specified                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |        |
| version?            | The [version](https://developers.google.com/maps/documentation/javascript/versions) of the `Maps JavaScript API` to use                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |        |
| libraries?          | Array of additional `Maps JavaScript API` [libraries](https://developers.google.com/maps/documentation/javascript/libraries) to load                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |        |
| language?           | The [language](https://developers.google.com/maps/documentation/javascript/localization) to use. This affects the names of controls, copyright notices, driving directions, and control labels, as well as the responses to service requests. See the [list of supported languages](https://developers.google.com/maps/faq#languagesupport)                                                                                                                                                                                                                                                                                                                                                                                           |        |
| region?             | The [region](https://developers.google.com/maps/documentation/javascript/localization#Region) code to use. This alters the map's behavior based on a given country or territory                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |        |
| authReferrerPolicy? | Maps JS customers can configure HTTP Referrer Restrictions in the Cloud Console to limit which URLs are allowed to use a particular API Key. By default, these restrictions can be configured to allow only certain paths to use an API Key. If any URL on the same domain or origin may use the API Key, you can set `"origin"` to limit the amount of data sent when authorizing requests from the `Maps JavaScript API`. This is available starting in version **3.46**. When this parameter is specified and HTTP Referrer Restrictions are enabled on Cloud Console, `Maps JavaScript API` will only be able to load if there is an HTTP Referrer Restriction that matches the current website's domain without a path specified |        |
| url?                | Use a custom url and path to load the Google Maps API script                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |        |
| nonce?              | Adds [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-nonce) attribute to the script                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |        |
| async?              | Adds [async](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-async) attribute to the script                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |        |
| defer?              | Adds [defer](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-defer) attribute to the script                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |        |
| retryCount?         | Number of retries if script loading fails                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `2`    |
| retryDelay?         | Delay between retries                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `2000` |

---

### load

```ts
static load(): Promise<void>
```

On the first call, it starts loading the `Maps JavaScript API` with the given [options](#setoptions)

Returns ‎[completion](#completion)

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
static readonly completion: Promise<void>
```

Promise of loading

**Resolves** if [load](#load) is success

**Rejects** when

- `Maps JavaScript API` was loaded outside of this library
- no options was [set](#setoptions)
- script loading failed

---

### onLoadingStart

```ts
static onLoadingStart?(): void
```

Callback which will be fired after loading starts

---

## License

MIT © [Krombik](https://github.com/Krombik)
