// @ts-check

// based on https://github.com/microsoft/TypeScript-Make-Monaco-Builds/blob/master/publish-monaco-editor.js

const { execSync } = require("child_process");
const fs = require("fs");
const bundle = require("./bundle");

const args = process.argv.slice(2);

const exec = (cmd, opts) => {
  console.log(`> ${cmd} ${opts ? JSON.stringify(opts) : ""}`);
  try {
    return execSync(cmd, opts);
  } catch (error) {
    console.log("Command Failed:");
    console.log("STDOUT:" + error.stdout.toString());
    console.log("STDERR:" + error.stderr.toString());
    throw error;
  }
};

const failableMergeBranch = (exec, name) => {
  try {
    exec(`git merge ${name}`);
  } catch (e) {
    // NOOP
  }
};

const patchEsmWorker = () => {
  const path =
    "monaco-editor/out/monaco-editor/esm/vs/base/browser/defaultWorkerFactory.js";
  const content = fs.readFileSync(path, "utf8");
  const patchedContent = content.replace(
    "const isESM = true;",
    "const isESM = false;"
  );
  fs.writeFileSync(path, patchedContent);
};

const step = (msg) => console.log("\n\n - " + msg);

function main() {
  // TypeScript calls nightlies latest... So should we.
  const typescriptTag = args[0] ? args[0] : "latest";
  const typescriptModuleName = args[1] ? args[1] : "typescript";

  console.log("## Creating build of Monaco Editor");
  process.stdout.write("> node publish-monaco-editor.js");

  const execME = (cmd) => exec(cmd, { cwd: "monaco-editor" });

  // Create a tarball of the current version
  step("Cloning the repo");

  if (fs.existsSync("monaco-editor")) {
    fs.rmSync("monaco-editor", { recursive: true, force: true });
  }
  exec("git clone https://github.com/microsoft/monaco-editor.git");

  // Add typescript to the tsWorker export
  // https://github.com/microsoft/monaco-editor/pull/2775
  step("Merging in open PRs we want");
  execME(
    "git remote add andrewbranch https://github.com/andrewbranch/monaco-editor.git"
  );
  execME("git fetch andrewbranch");
  failableMergeBranch(execME, "andrewbranch/update-ts");

  execME(
    "git remote add jakebailey https://github.com/jakebailey/monaco-editor.git"
  );
  execME("git fetch jakebailey");
  failableMergeBranch(execME, "jakebailey/fix-compile-regex-parse");
  failableMergeBranch(execME, "jakebailey/emit-file-diagnostics");

  execME("git rev-parse HEAD");

  step(
    "Removing TypeDoc because its ships its own version of TypeScript and npm complains"
  );
  execME(`npm remove typedoc`);

  step(
    "Updating @types/node to ensure we compile on newer versions of TypeScript"
  );
  execME(`npm update @types/node`);

  step("Overwriting the version of TypeScript");
  if (typescriptModuleName === "typescript") {
    execME(`npm install --save-exact "typescript@${typescriptTag}" --force`);
  } else {
    execME(
      `npm install --save-exact "typescript@npm:${typescriptModuleName}@${typescriptTag}" --force`
    );
  }

  step("Getting TypeScript and Monaco versions");

  const typeScriptVersion = execME(
    "npx json -f node_modules/typescript/package.json version"
  )
    .toString()
    .trim();

  const monacoVersion = execME("npx json -f package.json version")
    .toString()
    .trim();

  step("Creating release folder");
  execME(`npm run build-monaco-editor`);

  step("Updating TS in monaco-typescript");
  execME(`npm run import-typescript`);

  step("Re-running release");
  execME(`npm run build-monaco-editor`);

  step("Apply patch to prevent using ESM workers");
  patchEsmWorker();

  step("Creating bundles");
  bundle();

  step(
    "Build complete in `dist`!\n" +
      "Monaco version: " +
      monacoVersion +
      "\nTypeScript version: " +
      typeScriptVersion
  );
  step("Done!");
}

main();
