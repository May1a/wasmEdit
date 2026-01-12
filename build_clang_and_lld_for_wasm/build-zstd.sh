set TARGET wasm32-unknown-emscripten

cmake -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=$HOME/zstd \
    -S ../zstd \
    -B build/zstd