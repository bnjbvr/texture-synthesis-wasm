all:
	rm -rf ./assets/wasm_bg.wasm ./wasm/target/wasm32-unknown-unknown/release/wasm.wasm
	(cd ./wasm && cargo build --release --target wasm32-unknown-unknown)
	wasm-bindgen --target=no-modules --out-dir ./assets ./wasm/target/wasm32-unknown-unknown/release/wasm.wasm

serve:
	python3 -m http.server

pretty:
	npx prettier *.js --write
	(cd wasm && cargo fmt)
