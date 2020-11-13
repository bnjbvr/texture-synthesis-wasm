use wasm_bindgen::prelude::*;
use texture_synthesis as ts;

use crate::byte_stream::Bytestream;

#[wasm_bindgen]
extern "C" {
    /// JS function callback handling the current progress information.
    fn progress(
        stage_current: usize,
        stage_total: usize,
        total_current: usize,
        total_total: usize,
        current_img: Bytestream,
    );
}

/// A simple progress bar that to send the information via the JS signal_progress function.
pub(crate) struct JSProgressCallback;

impl ts::GeneratorProgress for JSProgressCallback {
    fn update(&mut self, info: ts::ProgressUpdate<'_>) {
        progress(
            info.stage.current,
            info.stage.total,
            info.total.current,
            info.total.total,
            Bytestream::new(info.image.as_raw()),
        );
    }
}
