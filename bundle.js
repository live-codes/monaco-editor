const { existsSync, rmSync } = require("fs");
const esbuild = require("esbuild");

const outdir = "dist/";
const monacoBasePath = "monaco-editor/out/monaco-editor/esm/vs/";

const bundle = () => {
  if (existsSync(outdir)) {
    rmSync(outdir, { recursive: true, force: true });
  }

  /** @type {Partial<esbuild.BuildOptions>} */
  const baseOptions = {
    bundle: true,
    minify: true,
    target: "es2020",
    sourcemap: false,
    format: "iife",
    define: { global: "window", "process.env.NODE_ENV": '"production"' },
  };

  // Monaco editor
  esbuild.buildSync({
    ...baseOptions,
    stdin: {
      contents: `export * from "./monaco-editor/out/monaco-editor/esm/vs/editor/editor.main.js";`,
      loader: "js",
      resolveDir: ".",
      sourcefile: "./monaco-editor.js",
    },
    loader: { ".ttf": "file" },
    format: "esm",
    outfile: outdir + "monaco-editor.js",
  });

  // Monaco editor workers
  const entryFiles = [
    "language/json/json.worker.js",
    "language/css/css.worker.js",
    "language/html/html.worker.js",
    "language/typescript/ts.worker.js",
    "editor/editor.worker.js",
  ].map((entry) => `${monacoBasePath}${entry}`);

  entryFiles.forEach((entry) => {
    esbuild.buildSync({
      ...baseOptions,
      outdir,
      entryPoints: [entry],
    });
  });
};

module.exports = bundle;

if (require.main === module) {
  bundle();
}
