// @ts-ignore
import createClangModule from "./assets/clang-21";
// @ts-ignore
import createWasmLdModule from "./assets/wasm-ld";
declare namespace Emscripten {
    interface FileSystemType {
        mount(mount: FS.Mount): FS.FSNode;
        syncfs(
            mount: FS.Mount,
            populate: () => unknown,
            done: (err?: number | null) => unknown
        ): void;
    }
    type EnvironmentType = "WEB" | "NODE" | "SHELL" | "WORKER";

    type JSType = "number" | "string" | "array" | "boolean" | "bigint";
    type TypeCompatibleWithC = number | string | any[] | boolean;

    type CIntType = "i8" | "i16" | "i32" | "i64";
    type CFloatType = "float" | "double";
    type CPointerType =
        | "i8*"
        | "i16*"
        | "i32*"
        | "i64*"
        | "float*"
        | "double*"
        | "*";
    type CType = CIntType | CFloatType | CPointerType;

    interface CCallOpts {
        async?: boolean | undefined;
    }
}

declare namespace FS {
    interface Lookup {
        path: string;
        node: FSNode;
    }

    interface Analyze {
        isRoot: boolean;
        exists: boolean;
        error: Error;
        name: string;
        path: Lookup["path"];
        object: Lookup["node"];
        parentExists: boolean;
        parentPath: Lookup["path"];
        parentObject: Lookup["node"];
    }

    interface Mount {
        type: Emscripten.FileSystemType;
        opts: object;
        mountpoint: string;
        mounts: Mount[];
        root: FSNode;
    }

    class FSStream {
        constructor();
        object: FSNode;
        readonly isRead: boolean;
        readonly isWrite: boolean;
        readonly isAppend: boolean;
        flags: number;
        position: number;
        fd?: number;
        nfd?: number;
    }

    interface StreamOps {
        open(stream: FSStream): void;
        close(stream: FSStream): void;
        read(
            stream: FSStream,
            buffer: Uint8Array,
            offset: number,
            length: number,
            position: number
        ): number;
        write(
            stream: FSStream,
            buffer: Uint8Array,
            offset: number,
            length: number,
            position: number
        ): number;
        llseek(stream: FSStream, offset: number, whence: number): number;
    }

    class FSNode {
        parent: FSNode;
        mount: Mount;
        mounted?: Mount;
        // Supported in MEMFS
        contents?: any;
        id: number;
        name: string;
        mode: number;
        rdev: number;
        readMode: number;
        writeMode: number;
        constructor(parent: FSNode, name: string, mode: number, rdev: number);
        read: boolean;
        write: boolean;
        readonly isFolder: boolean;
        readonly isDevice: boolean;
    }

    interface NodeOps {
        getattr(node: FSNode): Stats;
        setattr(node: FSNode, attr: Stats): void;
        lookup(parent: FSNode, name: string): FSNode;
        mknod(parent: FSNode, name: string, mode: number, dev: unknown): FSNode;
        rename(oldNode: FSNode, newDir: FSNode, newName: string): void;
        unlink(parent: FSNode, name: string): void;
        rmdir(parent: FSNode, name: string): void;
        readdir(node: FSNode): string[];
        symlink(parent: FSNode, newName: string, oldPath: string): void;
        readlink(node: FSNode): string;
    }

    interface Stats {
        dev: number;
        ino: number;
        mode: number;
        nlink: number;
        uid: number;
        gid: number;
        rdev: number;
        size: number;
        blksize: number;
        blocks: number;
        atime: Date;
        mtime: Date;
        ctime: Date;
        timestamp?: number;
    }

    class ErrnoError extends Error {
        name: "ErronoError";
        errno: number;
        code: string;
        constructor(errno: number);
    }

    let ignorePermissions: boolean;
    let trackingDelegate: {
        onOpenFile(path: string, trackingFlags: number): unknown;
        onCloseFile(path: string): unknown;
        onSeekFile(path: string, position: number, whence: number): unknown;
        onReadFile(path: string, bytesRead: number): unknown;
        onWriteToFile(path: string, bytesWritten: number): unknown;
        onMakeDirectory(path: string, mode: number): unknown;
        onMakeSymlink(oldpath: string, newpath: string): unknown;
        willMovePath(old_path: string, new_path: string): unknown;
        onMovePath(old_path: string, new_path: string): unknown;
        willDeletePath(path: string): unknown;
        onDeletePath(path: string): unknown;
    };
    let tracking: any;
    let genericErrors: Record<number, ErrnoError>;

    //
    // paths
    //
    function lookupPath(
        path: string,
        opts: Partial<{
            follow_mount: boolean;
            /**
             * by default, lookupPath will not follow a symlink if it is the final path component.
             * setting opts.follow = true will override this behavior.
             */
            follow: boolean;
            recurse_count: number;
            parent: boolean;
        }>
    ): Lookup;
    function getPath(node: FSNode): string;
    function analyzePath(path: string, dontResolveLastLink?: boolean): Analyze;

    //
    // nodes
    //
    function isFile(mode: number): boolean;
    function isDir(mode: number): boolean;
    function isLink(mode: number): boolean;
    function isChrdev(mode: number): boolean;
    function isBlkdev(mode: number): boolean;
    function isFIFO(mode: number): boolean;
    function isSocket(mode: number): boolean;

    //
    // devices
    //
    function major(dev: number): number;
    function minor(dev: number): number;
    function makedev(ma: number, mi: number): number;
    function registerDevice(dev: number, ops: Partial<StreamOps>): void;
    function getDevice(dev: number): { stream_ops: StreamOps };
    var createDevice: ((
        parent: string | FSNode,
        name: string,
        input?: (() => number | null | undefined) | null,
        output?: ((code: number) => void) | null
    ) => FSNode) & {
        major: number;
    };

    //
    // core
    //
    function getMounts(mount: Mount): Mount[];
    function syncfs(populate: boolean, callback: (e: any) => any): void;
    function syncfs(callback: (e: any) => any, populate?: boolean): void;
    function mount(
        type: Emscripten.FileSystemType,
        opts: any,
        mountpoint: string
    ): any;
    function unmount(mountpoint: string): void;
    function isMountpoint(node: FSNode): boolean;

    function closeStream(fd: number): void;
    function getStream(fd: number): FSStream;

    function mkdir(path: string, mode?: number): FSNode;
    function mkdirTree(path: string, mode?: number): void;
    function mkdev(path: string, mode?: number, dev?: number): FSNode;
    function symlink(oldpath: string, newpath: string): FSNode;
    function rename(old_path: string, new_path: string): void;
    function rmdir(path: string): void;
    function readdir(path: string): string[];
    function unlink(path: string): void;
    function readlink(path: string): string;
    function stat(path: string, dontFollow?: boolean): Stats;
    function lstat(path: string): Stats;
    function chmod(path: string, mode: number, dontFollow?: boolean): void;
    function lchmod(path: string, mode: number): void;
    function fchmod(fd: number, mode: number): void;
    function chown(
        path: string,
        uid: number,
        gid: number,
        dontFollow?: boolean
    ): void;
    function lchown(path: string, uid: number, gid: number): void;
    function fchown(fd: number, uid: number, gid: number): void;
    function truncate(path: string, len: number): void;
    function ftruncate(fd: number, len: number): void;
    function utime(path: string, atime: number, mtime: number): void;
    function open(
        path: string,
        flags: string | number,
        mode?: number
    ): FSStream;
    function close(stream: FSStream): void;
    function llseek(stream: FSStream, offset: number, whence: number): number;
    function read(
        stream: FSStream,
        buffer: ArrayBufferView,
        offset: number,
        length: number,
        position?: number
    ): number;
    function write(
        stream: FSStream,
        buffer: ArrayBufferView,
        offset: number,
        length: number,
        position?: number,
        canOwn?: boolean
    ): number;
    function mmap(
        stream: FSStream,
        buffer: ArrayBufferView,
        offset: number,
        length: number,
        position: number,
        prot: number,
        flags: number
    ): {
        allocated: boolean;
        ptr: number;
    };
    function ioctl(stream: FSStream, cmd: any, arg: any): any;
    function readFile(
        path: string,
        opts: { encoding: "binary"; flags?: string | undefined }
    ): Uint8Array;
    function readFile(
        path: string,
        opts: { encoding: "utf8"; flags?: string | undefined }
    ): string;
    function readFile(
        path: string,
        opts?: { flags?: string | undefined }
    ): Uint8Array;
    function writeFile(
        path: string,
        data: string | ArrayBufferView,
        opts?: {
            flags?: string | undefined;
            mode?: number | undefined;
            canOwn?: boolean | undefined;
        }
    ): void;

    //
    // module-level FS code
    //
    function cwd(): string;
    function chdir(path: string): void;
    function init(
        input: null | (() => number | null),
        output: null | ((c: number) => any),
        error: null | ((c: number) => any)
    ): void;

    function createLazyFile(
        parent: string | FSNode,
        name: string,
        url: string,
        canRead: boolean,
        canWrite: boolean
    ): FSNode;
    function createPreloadedFile(
        parent: string | FSNode,
        name: string,
        url: string,
        canRead: boolean,
        canWrite: boolean,
        onload?: () => void,
        onerror?: () => void,
        dontCreateFile?: boolean,
        canOwn?: boolean
    ): void;
    function createDataFile(
        parent: string | FSNode,
        name: string,
        data: ArrayBufferView,
        canRead: boolean,
        canWrite: boolean,
        canOwn: boolean
    ): FSNode;
}

interface EmscriptenModule {
    print(str: string): void;
    printErr(str: string): void;
    arguments: string[];
    preInit: Array<{ (): void }>;
    preRun: Array<{ (): void }>;
    postRun: Array<{ (): void }>;
    onAbort: { (what: any): void };
    onRuntimeInitialized: { (): void };
    preinitializedWebGLContext: WebGLRenderingContext;
    noInitialRun: boolean;
    noExitRuntime: boolean;
    logReadFiles: boolean;
    filePackagePrefixURL: string;
    wasmBinary: ArrayBuffer;
    callMain: (args: string[]) => void;
    FS: typeof FS;

    destroy(object: object): void;
    getPreloadedPackage(
        remotePackageName: string,
        remotePackageSize: number
    ): ArrayBuffer;
    instantiateWasm(
        imports: WebAssembly.Imports,
        successCallback: (module: WebAssembly.Instance) => void
    ): WebAssembly.Exports | undefined;
    locateFile(url: string, scriptDirectory: string): string;
    onCustomMessage(event: MessageEvent): void;

    // USE_TYPED_ARRAYS == 1
    HEAP: Int32Array;
    IHEAP: Int32Array;
    FHEAP: Float64Array;

    // USE_TYPED_ARRAYS == 2
    HEAP8: Int8Array;
    HEAP16: Int16Array;
    HEAP32: Int32Array;
    HEAPU8: Uint8Array;
    HEAPU16: Uint16Array;
    HEAPU32: Uint32Array;
    HEAPF32: Float32Array;
    HEAPF64: Float64Array;
    HEAP64: BigInt64Array;
    HEAPU64: BigUint64Array;

    TOTAL_STACK: number;
    TOTAL_MEMORY: number;
    FAST_MEMORY: number;

    addOnPreRun(cb: () => any): void;
    addOnInit(cb: () => any): void;
    addOnPreMain(cb: () => any): void;
    addOnExit(cb: () => any): void;
    addOnPostRun(cb: () => any): void;

    preloadedImages: any;
    preloadedAudios: any;

    _malloc(size: number): number;
    _free(ptr: number): void;
}

async function loadWasmLdModule() {
    const wM = await createWasmLdModule({
        print: (text: string) => console.log("wasm-ld: ", text),
        printErr: (text: string) => console.error("wasm-ld: ", text),
        noInitialRun: true,
        thisProgram: "wasm-ld",
        args: [],
    });
    return wM as EmscriptenModule;
}

async function loadClangModule() {
    const cM = await createClangModule({
        print: (text: string) => console.log("clang: ", text),
        printErr: (text: string) => console.error("clang: ", text),
        noInitialRun: true,
        args: [],
    });
    return cM as EmscriptenModule;
}

class ClangInstance {
    public wasmLd: EmscriptenModule;
    public clang: EmscriptenModule;

    private constructor(
        wasmLdArg: EmscriptenModule,
        clangArg: EmscriptenModule
    ) {
        this.wasmLd = wasmLdArg;
        this.clang = clangArg;
    }
    static async init() {
        const wasmLd = await loadWasmLdModule();
        const clang = await loadClangModule();
        return new ClangInstance(wasmLd, clang);
    }
    public createSourceCodeFile(path: string, content: string) {
        this.clang.FS.writeFile(path, content);
    }
    public compileSourceCodeFile(
        path: string,
        outputPath: string,
        extraOpts?: string[]
    ) {
        this.clang.callMain([
            path,
            "-o",
            outputPath,
            "-c",
            ...(extraOpts ?? []),
        ]);
    }
    private moveFilesFromClangFSToWasmLdFS(
        filesNames: string[],
        toPath: string
    ) {
        for (const fileName of filesNames) {
            const file = this.clang.FS.readFile(fileName);
            this.wasmLd.FS.writeFile(toPath + "/" + fileName, file);
        }
    }
    public createExecutable(objectFiles: string[], outputPath: string) {
        const tempPath = "/tmp" + Math.random().toString(36).substring(2, 15);
        this.moveFilesFromClangFSToWasmLdFS(objectFiles, tempPath);
        const args = [];
        for (const file of objectFiles) {
            args.push(tempPath + "/" + file);
        }
        args.push("-o", outputPath);
        this.wasmLd.callMain(args);
        this.wasmLd.FS.rmdir(tempPath);
    }
}
