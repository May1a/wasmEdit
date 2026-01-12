cmake -G Ninja \
  -DCMAKE_BUILD_TYPE=Release \
  -DLLVM_ENABLE_PROJECTS="clang-tblgen" \
  -DCMAKE_INSTALL_PREFIX=$HOME/clang-native \
  -S ../llvm \
  -B build/native
