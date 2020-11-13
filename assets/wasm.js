let wasm_bindgen;
(function() {
    const __exports = {};
    let wasm;

    let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

    cachedTextDecoder.decode();

    let cachegetUint8Memory0 = null;
    function getUint8Memory0() {
        if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
            cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
        }
        return cachegetUint8Memory0;
    }

    function getStringFromWasm0(ptr, len) {
        return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
    }

    const heap = new Array(32).fill(undefined);

    heap.push(undefined, null, true, false);

    let heap_next = heap.length;

    function addHeapObject(obj) {
        if (heap_next === heap.length) heap.push(heap.length + 1);
        const idx = heap_next;
        heap_next = heap[idx];

        heap[idx] = obj;
        return idx;
    }

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const u32CvtShim = new Uint32Array(2);

const uint64CvtShim = new BigUint64Array(u32CvtShim.buffer);

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
* A session builder exposed to JavaScript, straight copied from texture-synthesis's Parameters.
* TODO would be nice to find out if there's a way to add bindgens to an existing data structure
* from another crate.
*/
class Builder {

    static __wrap(ptr) {
        const obj = Object.create(Builder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_builder_free(ptr);
    }
    /**
    * @returns {Builder}
    */
    static new() {
        var ret = wasm.builder_new();
        return Builder.__wrap(ret);
    }
    /**
    * @param {boolean} val
    */
    tiling_mode(val) {
        wasm.builder_tiling_mode(this.ptr, val);
    }
    /**
    * @param {number} val
    */
    nearest_neighbors(val) {
        wasm.builder_nearest_neighbors(this.ptr, val);
    }
    /**
    * @param {BigInt} val
    */
    random_sample_locations(val) {
        uint64CvtShim[0] = val;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        wasm.builder_random_sample_locations(this.ptr, low0, high0);
    }
    /**
    * @param {number} val
    */
    cauchy_dispersion(val) {
        wasm.builder_cauchy_dispersion(this.ptr, val);
    }
    /**
    * @param {number} val
    */
    backtrack_percent(val) {
        wasm.builder_backtrack_percent(this.ptr, val);
    }
    /**
    * @param {number} val
    */
    backtrack_stages(val) {
        wasm.builder_backtrack_stages(this.ptr, val);
    }
    /**
    * @param {number} width
    * @param {number} height
    */
    resize_input(width, height) {
        wasm.builder_resize_input(this.ptr, width, height);
    }
    /**
    * @param {number} width
    * @param {number} height
    */
    output_size(width, height) {
        wasm.builder_output_size(this.ptr, width, height);
    }
    /**
    * @param {number} val
    */
    guide_alpha(val) {
        wasm.builder_guide_alpha(this.ptr, val);
    }
    /**
    * @param {BigInt} val
    */
    random_resolve(val) {
        uint64CvtShim[0] = val;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        wasm.builder_random_resolve(this.ptr, low0, high0);
    }
    /**
    * @param {BigInt} val
    */
    seed(val) {
        uint64CvtShim[0] = val;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        wasm.builder_seed(this.ptr, low0, high0);
    }
    /**
    * @param {Uint8Array} style
    * @param {Uint8Array} target
    * @returns {Bytestream}
    */
    run(style, target) {
        var ptr = this.ptr;
        this.ptr = 0;
        var ptr0 = passArray8ToWasm0(style, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passArray8ToWasm0(target, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.builder_run(ptr, ptr0, len0, ptr1, len1);
        return Bytestream.__wrap(ret);
    }
}
__exports.Builder = Builder;
/**
* Rust Vec encapsulated as its primitive components.
* Very unsafe! Make sure that JS doesn't hold onto the bytestream offset/size across a wasm call.
* The array may have moved because of reallocations!
*/
class Bytestream {

    static __wrap(ptr) {
        const obj = Object.create(Bytestream.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bytestream_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Bytestream}
    */
    static new(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bytestream_new(ptr0, len0);
        return Bytestream.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    offset() {
        var ret = wasm.bytestream_offset(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    size() {
        var ret = wasm.bytestream_size(this.ptr);
        return ret >>> 0;
    }
}
__exports.Bytestream = Bytestream;

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {

        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        let src;
        if (typeof document === 'undefined') {
            src = location.href;
        } else {
            src = document.currentScript.src;
        }
        input = src.replace(/\.js$/, '_bg.wasm');
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_log_682923c8ea4d4d53 = function(arg0, arg1) {
        log(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_progress_08a12f55de6f0fde = function(arg0, arg1, arg2, arg3, arg4) {
        progress(arg0 >>> 0, arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, Bytestream.__wrap(arg4));
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_rethrow = function(arg0) {
        throw takeObject(arg0);
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;

    return wasm;
}

wasm_bindgen = Object.assign(init, __exports);

})();
