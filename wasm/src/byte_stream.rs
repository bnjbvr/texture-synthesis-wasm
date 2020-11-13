/// All of the following are hacks to be able to pass an array from Rust to JS. Oh my.

use wasm_bindgen::prelude::*;

/// Rust Vec encapsulated as its primitive components.
/// Very unsafe! Make sure that JS doesn't hold onto the bytestream offset/size across a wasm call.
/// The array may have moved because of reallocations!
#[wasm_bindgen]
pub struct Bytestream {
    offset: *const u8,
    size: usize,
}

#[wasm_bindgen]
impl Bytestream {
    pub fn new(bytes: &[u8]) -> Self {
        Self {
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
