importScripts('./assets/wasm.js');

let initialized = false;

function signal_progress(st_current, st_total, total_current, total_total) {
    postMessage({
        status: 'progress',
        msg: `stage: ${st_current}/${st_total}, total: ${total_current}/${total_total}`
    })
}

function async_log(msg) {
    postMessage({
        status: 'log', msg
    })
}

const { pub_memory, transfer_style } = wasm_bindgen;

onmessage = async function(e) {
    if (!initialized) {
        initialized = true;
        async_log('initializing wasm...');
        await wasm_bindgen('./assets/wasm_bg.wasm');
        async_log('done initializing wasm!');
    }

    let {styleData, userData, nearest, stage, alpha, height, width} = e.data;

    async_log('transfer style!');
    let texture = transfer_style(styleData, userData, nearest, stage, alpha, height, width);
    async_log('done transfer style! offset/size', texture.offset(), texture.size());

    let wasmMemory = pub_memory();

    const textureRaw = new Uint8ClampedArray(wasmMemory.buffer, texture.offset(), texture.size());
    const imageData = new ImageData(textureRaw, width, height);

    texture.free();

    postMessage({ status: 'done', imageData });
}
