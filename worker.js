importScripts('./assets/wasm.js');

let INITIALIZED = false;
let WASM_MEMORY = null;

let LAST_HEIGHT = null;
let LAST_WIDTH = null;

function signal_progress(st_current, st_total, total_current, total_total, tmp_image) {
    let imageData = toImageData(tmp_image, LAST_WIDTH, LAST_HEIGHT);
    postMessage({
        status: 'progress',
        msg: `stage: ${st_current}/${st_total}, total: ${total_current}/${total_total}`,
        imageData,
    })
}

function async_log(msg) {
    postMessage({
        status: 'log', msg
    })
}

function toImageData(bytestream, width, height) {
    const u8array = new Uint8ClampedArray(WASM_MEMORY.buffer, bytestream.offset(), bytestream.size());
    const imageData = new ImageData(u8array, width, height);
    bytestream.free();
    return imageData;
}

const { transfer_style } = wasm_bindgen;

onmessage = async function(e) {
    if (!INITIALIZED) {
        INITIALIZED = true;
        async_log('initializing wasm...');
        let { memory } = await wasm_bindgen('./assets/wasm_bg.wasm');
        WASM_MEMORY = memory;
        async_log('done initializing wasm!');
    }

    let {styleData, userData, nearest, stage, alpha, height, width} = e.data;

    LAST_HEIGHT = height;
    LAST_WIDTH = width;

    async_log('transfer style!');
    let bytestream = transfer_style(styleData, userData, nearest, stage, alpha, height, width);
    async_log('done transfer style! offset/size', bytestream.offset(), bytestream.size());

    const imageData = toImageData(bytestream, width, height);

    postMessage({ status: 'done', imageData });
}
