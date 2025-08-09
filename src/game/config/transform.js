import pako from 'pako';
import { LATEST_VERSION, versions, migrate } from './versions/versions';

/**
 * Encode a string using base64, but replace the +, /, and = characters
 * with URL-safe alternatives -, _, and '' respectively.
 * @param {string} str - The string to encode.
 * @return {string} The encoded string.
 */
function b64URLEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode a base64url string back into a regular string.
 * @param {string} str - The string to decode.
 * @return {string} The decoded string.
 */
function b64URLDecode(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  return atob(b64);
}

/**
 * Compresses and encodes an object into a base64url string.
 * @param {Object} data - The object to serialize and compress.
 * @return {string} The base64url-encoded string representing the compressed data.
 */
function serialize(data) {
  const compressed = pako.deflate(JSON.stringify(data));
  const encoded = b64URLEncode(String.fromCharCode(...compressed));
  return encoded;
}

/**
 * Decodes and decompresses a base64url string back into an object.
 * @param {string} data - The base64url-encoded string representing the compressed data.
 * @return {Object} The deserialized object.
 */
function deserialize(data) {
  const decoded = b64URLDecode(data);
  const compressed = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
  const decompressed = pako.inflate(compressed, { to: 'string' });
  return JSON.parse(decompressed);
}

/**
 * Removes any key-value pairs from the given config object if they are equal
 * to the default values.
 *
 * @param {Object} config - The object to remove default values from.
 * @return {Object} An object with all default values removed.
 */
function removeDefaults(config) {
  const defaults = versions[LATEST_VERSION].defaults;

  const noDefaults = {};
  for (const key in config) {
    if (config[key] !== defaults[key]) {
      noDefaults[key] = config[key];
    }
  }
  return noDefaults;
}

/**
 * Replaces the keys in a config object with their corresponding minified
 * versions as given by the current version's keyMap.
 *
 * @param {Object} config - The object to minify the keys of.
 * @return {Object} A new object with the same values as config, but with
 * minified keys.
 */
function minifyKeys(config) {
  const keyMap = versions[LATEST_VERSION].keyMap;

  const shortKeys = {};
  for (const key in config) {
    shortKeys[keyMap[key]] = config[key];
  }
  return shortKeys;
}

/**
 * Replaces the minified keys in a config object with their full versions as
 * given by the given version's keyMap.
 *
 * @param {Object} config - The object to unminify the keys of.
 * @param {string} version - The version of the config object.
 * @return {Object} A new object with the same values as config, but with
 * full keys.
 */
function unminifyKeys(config, version) {
  // keyMap has keys as values (we need values as keys)
  const keyMap = versions[version].keyMap;
  const reverseKeyMap = Object.fromEntries(
    Object.entries(keyMap).map(([k, v]) => [v, k])
  );

  const fullKeys = {};
  for (const key in config) {
    fullKeys[reverseKeyMap[key]] = config[key];
  }
  return fullKeys;
}

/**
 * Encodes a configuration object into a compressed, minified, and base64url-encoded string.
 *
 * This function normalizes the configuration, removes default values, minifies the keys, and then
 * serializes the result into a string that can be easily stored or transmitted.
 *
 * @param {Object} config - The configuration object to encode.
 * @param {boolean} [keepSeed=true] - Whether to keep the seed values in the configuration.
 * @return {string} The base64url-encoded string representing the processed configuration object.
 */
function encode(config, keepSeed = true) {
  let minified = versions[LATEST_VERSION].normalize(config, keepSeed);
  minified = removeDefaults(minified);
  minified = minifyKeys(minified);
  const data = {
    v: LATEST_VERSION,
    c: minified,
  };
  return serialize(data);
}

/**
 * Decodes a configuration string produced by encode back into a configuration object.
 *
 * @param {string} data - The base64url-encoded string representing the configuration.
 * @return {Object} The decoded configuration object.
 */
function decode(data) {
  const { v, c } = deserialize(data);
  const config = unminifyKeys(c, v);
  return migrate(config, v);
}

export { encode, decode };
