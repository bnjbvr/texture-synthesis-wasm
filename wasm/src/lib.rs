use texture_synthesis as ts;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn async_log(s: &str);

    fn signal_progress(
        stage_current: usize,
        stage_total: usize,
        total_current: usize,
        total_total: usize,
        tmp: ByteStream,
    );
}

struct ProgressBar;

impl ts::GeneratorProgress for ProgressBar {
    fn update(&mut self, info: ts::ProgressUpdate<'_>) {
        signal_progress(
            info.stage.current,
            info.stage.total,
            info.total.current,
            info.total.total,
            ByteStream::new(info.image.as_raw()),
        );
    }
}

fn to_js_err(err: ts::Error) -> JsValue {
    JsValue::from(format!("{}", err))
}

#[wasm_bindgen]
pub fn transfer_style(
    style: &[u8],
    target: &[u8],
    nearest_neighbors: u32,
    stages: u32,
    alpha: f32,
    height: u32,
    width: u32,
) -> Result<ByteStream, JsValue> {
    async_log(&format!(
        "Starting transfer_style with parameters: neighbours={}, stages={}, alpha={}",
        nearest_neighbors, stages, alpha
    ));

    let dims = ts::Dims { width, height };

    let texsynth = ts::Session::builder()
        .add_example(ts::ImageSource::Memory(style))
        .load_target_guide(ts::ImageSource::Memory(target))
        .nearest_neighbors(nearest_neighbors)
        .backtrack_stages(stages)
        .guide_alpha(alpha)
        .output_size(dims)
        .build()
        .map_err(to_js_err)?;

    async_log("Done building parameters! Running algorithm.");

    let progress = Box::new(ProgressBar);
    let generated = texsynth.run(Some(progress));

    let image_data = generated.into_image().into_rgba().into_raw();
    Ok(ByteStream::new(&image_data))
}

// All of the following are hacks to be able to pass an array from Rust to JS. Oh my.

#[wasm_bindgen]
pub struct ByteStream {
    offset: *const u8,
    size: usize,
}

#[wasm_bindgen]
impl ByteStream {
    pub fn new(bytes: &[u8]) -> ByteStream {
        ByteStream {
            offset: bytes.as_ptr(),
            size: bytes.len(),
        }
    }
    pub fn offset(&self) -> *const u8 {
        self.offset
    }
    pub fn size(&self) -> usize {
        self.size
    }
}
