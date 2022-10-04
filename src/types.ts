export type Library =
  | "drawing"
  | "geometry"
  | "localContext"
  | "places"
  | "visualization";

export type LoaderOptions = {
  /**
   * Your [API key](https://developers.google.com/maps/documentation/javascript/get-api-key). The Maps JavaScript API will not load unless a valid API key is specified
   */
  apiKey: string;
  /**
   * @deprecated
   * @see https://developers.google.com/maps/premium/overview
   */
  channel?: string;
  /**
   * @deprecated use {@link LoaderOptions.apiKey apiKey} instead
   * @see https://developers.google.com/maps/premium/overview
   */
  client?: string;
  /**
   * The [version](https://developers.google.com/maps/documentation/javascript/versions) of the Maps JavaScript API to use
   */
  version?: string;
  /**
   * Array of additional Maps JavaScript API [libraries](https://developers.google.com/maps/documentation/javascript/libraries) to load
   */
  libraries?: Library[];
  /**
   * The [language](https://developers.google.com/maps/documentation/javascript/localization) to use. This affects the names of controls, copyright notices, driving directions, and control labels, as well as the responses to service requests. See the [list of supported languages](https://developers.google.com/maps/faq#languagesupport)
   */
  language?: string;
  /**
   * The [region](https://developers.google.com/maps/documentation/javascript/localization#Region) code to use. This alters the map's behavior based on a given country or territory
   */
  region?: string;
  /**
   * @deprecated Passing `mapIds` is no longer required in the script tag
   */
  mapIds?: string[];
  /**
   * Maps JS customers can configure HTTP Referrer Restrictions in the Cloud Console to limit which URLs are allowed to use a particular API Key. By default, these restrictions can be configured to allow only certain paths to use an API Key. If any URL on the same domain or origin may use the API Key, you can set `"origin"` to limit the amount of data sent when authorizing requests from the Maps JavaScript API. This is available starting in version **3.46**. When this parameter is specified and HTTP Referrer Restrictions are enabled on Cloud Console, Maps JavaScript API will only be able to load if there is an HTTP Referrer Restriction that matches the current website's domain without a path specified
   */
  authReferrerPolicy?: "origin";
  /**
   * Use a custom url and path to load the Google Maps API script
   * @default "https://maps.googleapis.com/maps/api/js"
   */
  url?: string;
  /**
   * Adds {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-nonce nonce} attribute to the script
   */
  nonce?: string;
  /**
   * Adds {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-async async} attribute to the script
   */
  async?: boolean;
  /**
   * Adds {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-defer defer} attribute to the script
   */
  defer?: boolean;
  /**
   * Number of retries if script loading fails
   * @default 2
   */
  retryCount?: number;
  /**
   * Delay between retries
   * @default 2000
   */
  retryDelay?: number;
};
