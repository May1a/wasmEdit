# Build Clang and LLD for WebAssembly (emscripten)

# Prerequisites

-   CMake
-   Ninja
-   5-10GB of free space
-   Linux/MacOS (or FreeBSD)
-   emsdk (in your PATH)
-   Lot's of time

## Clone the LLVM repository

```bash
# This will take a while, this is LLVM were talking about here.
git clone https://github.com/llvm/llvm-project.git
```

## Clone the Zstd repository

NOTE: This is probably wrong
FIXME: zstd build instructions

```bash
git clone https://github.com/facebook/zstd.git
cp wasm32-unknown-emscripten-clang-zstd.cmake zstd/cmake/
cp build-zstd.sh env.sh zstd/
cd zstd/
./build-zstd.sh
```

## Move the `build.sh`, `build-native.sh` and `env.sh` to the root of the repository

```bash
mv build.sh build-native.sh env.sh llvm-project/clang/
cd llvm-project/clang/
# then make the build directory
mkdir build
```

## Run the native build script first, this builds clang-tblgen:

```bash
./build-native.sh
cd build/native
ninja # should be pretty quick
cd ../..
```

## Now run the `build.sh` script:

```bash
./build.sh
cd build/wasm32-unknown-emscripten
ninja clang # This will take a long time
ninja lld # Slightly less time
echo "export default createClangModule;" > bin/clang-21
echo "export default createClangModule;" > bin/wasm-ld
cd ../../../.. # go back to the `[repository root]/build_clang_and_lld_for_wasm` directory
```

## Copy the assets:

```bash
cp llvm-project/clang/build/wasm32-unknown-emscripten/bin/clang-21.wasm ../public/clang-21.wasm
cp build/wasm32-unknown-emscripten/bin/lld.wasm ../public/lld.wasm
cp llvm-project/clang/build/wasm32-unknown-emscripten/bin/clang-21 ../src/assets/clang-21.js
cp llvm-project/clang/build/wasm32-unknown-emscripten/bin/wasm-ld ../src/assets/wasm-ld.js
```
