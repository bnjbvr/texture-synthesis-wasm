use texture_synthesis as ts;
use wasm_bindgen::prelude::*;

mod byte_stream;
mod progress_bar;

use crate::byte_stream::Bytestream;
use crate::progress_bar::JSProgressCallback;

#[wasm_bindgen]
extern "C" {
    /// JS function helper, used for logging purposes.
    fn log(s: &str);
}

/// A session builder exposed to JavaScript, straight copied from texture-synthesis's Parameters.
/// TODO would be nice to find out if there's a way to add bindgens to an existing data structure
/// from another crate.
#[wasm_bindgen]
pub struct Builder {
    tiling_mode: bool,
    nearest_neighbors: u32,
    random_sample_locations: u64,
    cauchy_dispersion: f32,
    backtrack_percent: f32,
    backtrack_stages: u32,
    resize_input: Option<ts::Dims>,
    output_size: ts::Dims,
    guide_alpha: f32,
    random_resolve: Option<u64>,
    seed: u64,
}

fn to_js_err(err: ts::Error) -> JsValue {
    JsValue::from(format!("{}", err))
}

#[wasm_bindgen]
impl Builder {
    pub fn new() -> Self {
        // Taken from Parameters::default().
        Self {
            tiling_mode: false,
            nearest_neighbors: 50,
            random_sample_locations: 50,
            cauchy_dispersion: 1.0,
            backtrack_percent: 0.5,
            backtrack_stages: 5,
            resize_input: None,
            output_size: ts::Dims::square(500),
            guide_alpha: 0.8,
            random_resolve: None,
            seed: 0,
        }
    }
    pub fn tiling_mode(&mut self, val: bool) {
        self.tiling_mode = val;
    }
    pub fn nearest_neighbors(&mut self, val: u32) {
        self.nearest_neighbors = val;
    }
    pub fn random_sample_locations(&mut self, val: u64) {
        self.random_sample_locations = val;
    }
    pub fn cauchy_dispersion(&mut self, val: f32) {
        self.cauchy_dispersion = val;
    }
    pub fn backtrack_percent(&mut self, val: f32) {
        self.backtrack_percent = val;
    }
    pub fn backtrack_stages(&mut self, val: u32) {
        self.backtrack_stages = val;
    }
    pub fn resize_input(&mut self, width: u32, height: u32) {
        self.resize_input = Some(ts::Dims::new(width, height));
    }
    pub fn output_size(&mut self, width: u32, height: u32) {
        self.output_size = ts::Dims::new(width, height);
    }
    pub fn guide_alpha(&mut self, val: f32) {
        self.guide_alpha = val;
    }
    pub fn random_resolve(&mut self, val: u64) {
        self.random_resolve = Some(val);
    }
    pub fn seed(&mut self, val: u64) {
        self.seed = val;
    }

    pub fn run(self, style: &[u8], target: &[u8]) -> Result<Bytestream, JsValue> {
        log("Building session...");

        let mut session_builder = ts::Session::builder()
            .add_example(ts::ImageSource::Memory(style))
            .load_target_guide(ts::ImageSource::Memory(target))
            .tiling_mode(self.tiling_mode)
            .nearest_neighbors(self.nearest_neighbors)
            .random_sample_locations(self.random_sample_locations)
            .cauchy_dispersion(self.cauchy_dispersion)
            .backtrack_percent(self.backtrack_percent)
            .backtrack_stages(self.backtrack_stages)
            .output_size(self.output_size)
            .guide_alpha(self.guide_alpha)
            .seed(self.seed);

        if let Some(resize_input) = self.resize_input {
            session_builder = session_builder.resize_input(resize_input);
        }
        if let Some(random_resolve) = self.random_resolve {
            session_builder = session_builder.random_init(random_resolve);
        }

        let texsynth = session_builder.build().map_err(to_js_err)?;

        log("Done building parameters! Running algorithm.");

        let progress = Box::new(JSProgressCallback);
        let generated = texsynth.run(Some(progress));

        log("Done generating!");

        let image_data = generated.into_image().into_rgba().into_raw();
        Ok(Bytestream::new(&image_data))
    }
}
