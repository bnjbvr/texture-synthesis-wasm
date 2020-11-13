/* tslint:disable */
/* eslint-disable */
/**
* A session builder exposed to JavaScript, straight copied from texture-synthesis's Parameters.
* TODO would be nice to find out if there's a way to add bindgens to an existing data structure
* from another crate.
*/
export class Builder {
  free(): void;
/**
* @returns {Builder}
*/
  static new(): Builder;
/**
* @param {boolean} val
*/
  tiling_mode(val: boolean): void;
/**
* @param {number} val
*/
  nearest_neighbors(val: number): void;
/**
* @param {BigInt} val
*/
  random_sample_locations(val: BigInt): void;
/**
* @param {number} val
*/
  cauchy_dispersion(val: number): void;
/**
* @param {number} val
*/
  backtrack_percent(val: number): void;
/**
* @param {number} val
*/
  backtrack_stages(val: number): void;
/**
* @param {number} width
* @param {number} height
*/
  resize_input(width: number, height: number): void;
/**
* @param {number} width
* @param {number} height
*/
  output_size(width: number, height: number): void;
/**
* @param {number} val
*/
  guide_alpha(val: number): void;
/**
* @param {BigInt} val
*/
  random_resolve(val: BigInt): void;
/**
* @param {BigInt} val
*/
  seed(val: BigInt): void;
/**
* @param {Uint8Array} style
* @param {Uint8Array} target
* @returns {Bytestream}
*/
  run(style: Uint8Array, target: Uint8Array): Bytestream;
}
/**
* Rust Vec encapsulated as its primitive components.
* Very unsafe! Make sure that JS doesn't hold onto the bytestream offset/size across a wasm call.
* The array may have moved because of reallocations!
*/
export class Bytestream {
  free(): void;
/**
* @param {Uint8Array} bytes
* @returns {Bytestream}
*/
  static new(bytes: Uint8Array): Bytestream;
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
  readonly __wbg_builder_free: (a: number) => void;
  readonly builder_new: () => number;
  readonly builder_tiling_mode: (a: number, b: number) => void;
  readonly builder_nearest_neighbors: (a: number, b: number) => void;
  readonly builder_random_sample_locations: (a: number, b: number, c: number) => void;
  readonly builder_cauchy_dispersion: (a: number, b: number) => void;
  readonly builder_backtrack_percent: (a: number, b: number) => void;
  readonly builder_backtrack_stages: (a: number, b: number) => void;
  readonly builder_resize_input: (a: number, b: number, c: number) => void;
  readonly builder_output_size: (a: number, b: number, c: number) => void;
  readonly builder_guide_alpha: (a: number, b: number) => void;
  readonly builder_random_resolve: (a: number, b: number, c: number) => void;
  readonly builder_seed: (a: number, b: number, c: number) => void;
  readonly builder_run: (a: number, b: number, c: number, d: number, e: number) => number;
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
        