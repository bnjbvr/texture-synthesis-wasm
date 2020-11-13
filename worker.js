importScripts('./assets/wasm.js');

const Context = {
    initialized: false,
    initializing: false,
    memory: null,
    current: {
        livePreview: false,
        height: null,
        width: null
    }
};

// Copies the Rust Vec (disguised as a bytestream) into an ImageData, and
// returns it.
function toImageData(bytestream, width, height) {
    const u8array = new Uint8ClampedArray(Context.memory.buffer, bytestream.offset(), bytestream.size());
    const imageData = new ImageData(u8array, width, height);
    return imageData;
}

// Signal progress to the renderer.
function progress(st_current, st_total, total_current, total_total, tmp_image) {
    let imageData = Context.current.livePreview
        ? toImageData(tmp_image, Context.current.width, Context.current.height)
        : null;
    tmp_image.free();
    // Defer progress to the parent process.
    postMessage({
        status: 'progress',
        msg: `stage: ${st_current}/${st_total}, total: ${total_current}/${total_total}`,
        imageData,
    })
}

// Defer logging to the parent context.
function log(msg) {
    postMessage({
        status: 'log', msg
    })
}

const { Builder } = wasm_bindgen;

onmessage = async function(e) {
    if (Context.initializing) {
        log('please wait for initialization and then retry!');
    }

    if (!Context.initialized) {
        Context.initializing = true;
        log('initializing wasm...');
        try {
            let { memory } = await wasm_bindgen('./assets/wasm_bg.wasm');
            Context.memory = memory;
        } catch (exc) {
            log('Error during initialization:')
            return;
        } finally {
            // Note: this is run even in the error case, despite the catch
            // clause having a final return statement.
            Context.initializing = false;
        }
        log('done initializing wasm!');
        Context.initialized = true;
    }

    let { example, target, params } = e.data;

    log('worker: building session...');

    Context.current = {
        height: params.height,
        width: params.width,
        livePreview: params.livePreview,
    };

    let builder = Builder.new();

    // Pass parameters.
    builder.nearest_neighbors(params.nearest);
    builder.backtrack_stages(params.stage);
    builder.guide_alpha(params.alpha);
    builder.output_size(params.width, params.height);
    builder.resize_input(params.width, params.height);

    log('worker: run style transfer!');
    let bytestream = builder.run(example, target);
    log('worker: done!');

    const imageData = toImageData(bytestream, params.width, params.height);
    bytestream.free();

    postMessage({ status: 'done', imageData });
}
