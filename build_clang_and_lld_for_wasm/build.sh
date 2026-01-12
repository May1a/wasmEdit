

set TARGET wasm32-unknown-emscripten

cmake -G Ninja \
  -DCMAKE_BUILD_TYPE=Release \
  -DLLVM_ENABLE_PROJECTS="lld;clang" \
  -DCMAKE_TOOLCHAIN_FILE=$(pwd)/$TARGET-clang.cmake \
  -DLLVM_HOST_TRIPLE=$TARGET \
  -DCMAKE_INSTALL_PREFIX=$HOME/clang-$TARGET \
  -DCMAKE_EXE_LINKER_FLAGS="-o clang.js -s MODULARIZE=1 -s EXPORT_NAME='createClangModule' -s ALLOW_MEMORY_GROWTH=1 -s FORCE_FILESYSTEM=1 -s NO_EXIT_RUNTIME=1 -s EXPORTED_RUNTIME_METHODS=['FS','callMain'] " \  -DLLVM_ENABLE_ZSTD=ON \
  -Dzstd_INCLUDE_DIR=zstd/lib \
  -Dzstd_LIBRARY=zstd/lib/libzstd.a \
  -DLLVM_TABLEGEN=$(pwd)/build/native/bin/llvm-tblgen \
  -DCLANG_TABLEGEN_EXE=$(pwd)/build/native/bin/clang-tblgen \
  -DLLVM_TARGET_IS_CROSSCOMPILE_HOST=TRUE \
  -S ../llvm \
  -B build/$TARGET
