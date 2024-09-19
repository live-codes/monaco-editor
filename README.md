# Monaco Editor

This is patched version of [Monaco Editor](https://github.com/microsoft/monaco-editor) which allows specifying the TypeScript version to use. It is based on [TypeScript-Make-Monaco-Builds](https://github.com/microsoft/TypeScript-Make-Monaco-Builds) which builds the editor used for the [TypeScript playground](https://www.typescriptlang.org/play).

This was built for use in [LiveCodes](https://livecodes.io/).

## Usage

The editor is bundled as ESM. It can be used like this:

[try in LiveCodes](https://livecodes.io/?x=id/nug2m5cf3ms)

```html
<div id="container" style="height: 200px;"></div>

<script type="module">
  import { monaco } from "https://cdn.jsdelivr.net/npm/@live-codes/monaco-editor/monaco.js";

  const editor = monaco.editor.create(document.getElementById("container"), {
    value: `function x() {\n\tconsole.log("Hello world!");\n}`,
    language: "javascript",
  });
</script>
```

Alternatively, the base URL can be specified:

```ts
import { loadMonaco } from "https://cdn.jsdelivr.net/npm/@live-codes/monaco-editor/load-monaco.js";

const baseUrl = "https://cdn.jsdelivr.net/npm/@live-codes/monaco-editor/dist/";
const monaco = await loadMonaco(baseUrl);
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
