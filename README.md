# Monaco Editor

This is patched version of [Monaco Editor](https://github.com/microsoft/monaco-editor) which allows specifying the TypeScript version to use. It is based on [TypeScript-Make-Monaco-Builds](https://github.com/microsoft/TypeScript-Make-Monaco-Builds) which builds the editor used for the [TypeScript playground](https://www.typescriptlang.org/play).

This was built for use in [LiveCodes](https://livecodes.io/).

## Usage

The editor is bundled as ESM. It can be used like this:

[try in LiveCodes](https://livecodes.io/?x=id/mvkc9zu9sa2)

```js
import * as monaco from "https://unpkg.com/@live-codes/monaco-editor/dist/monaco-editor.js";
import "https://unpkg.com/@live-codes/monaco-editor/dist/monaco-editor.css";

const editorBaseUrl = "https://unpkg.com/@live-codes/monaco-editor/dist/";

// allow using web workers from CDN
const toDataUrl = (content, type = "text/javascript") =>
  `data:${type};charset=UTF-8;base64,` + btoa(content);

const getWorkerDataURL = (url) => toDataUrl(`importScripts("${url}");`);

// configure monaco to use the web workers
self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === "json") {
      return getWorkerDataURL(editorBaseUrl + "json.worker.js");
    }
    if (label === "css" || label === "scss" || label === "less") {
      return getWorkerDataURL(editorBaseUrl + "css.worker.js");
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return getWorkerDataURL(editorBaseUrl + "html.worker.js");
    }
    if (label === "typescript" || label === "javascript") {
      return getWorkerDataURL(editorBaseUrl + "ts.worker.js");
    }
    return getWorkerDataURL(editorBaseUrl + "editor.worker.js");
  },
};

monaco.editor.create(document.getElementById("container"), {
  value: ["function x() {", '\tconsole.log("Hello world!");', "}"].join("\n"),
  language: "javascript",
});
```

## Build

```bash
npm run build
```

By default, this uses the latest TypeScript version. You can specify the version/tag to use by passing it as an argument:

```bash
npm run build 5.4.5
npm run build next
```
