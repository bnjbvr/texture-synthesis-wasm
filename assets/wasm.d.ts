/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} style
* @param {Uint8Array} target
* @param {number} nearest_neighbors
* @param {number} stages
* @param {number} alpha
* @param {number} height
* @param {number} width
* @returns {ByteStream}
*/
export function transfer_style(style: Uint8Array, target: Uint8Array, nearest_neighbors: number, stages: number, alpha: number, height: number, width: number): ByteStream;
/**
* @returns {any}
*/
export function pub_memory(): any;
/**
*/
export class ByteStream {
  free(): void;
/**
* @param {Uint8Array} bytes
* @returns {ByteStream}
*/
  static new(bytes: Uint8Array): ByteStream;
/**
* @returns {number}
*/
  offset(): number;
/**
* @returns {number}
*/
  size(): number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly transfer_style: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => number;
  readonly pub_memory: () => number;
  readonly __wbg_bytestream_free: (a: number) => void;
  readonly bytestream_new: (a: number, b: number) => number;
  readonly bytestream_offset: (a: number) => number;
  readonly bytestream_size: (a: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
        