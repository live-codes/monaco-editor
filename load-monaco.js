export const loadMonaco = async ({
  baseUrl = "",
  injectStyles = true,
} = {}) => {
  const editorBaseUrl =
    baseUrl || import.meta.url.split("/").slice(0, -1).join("/") + "/dist/";

  // allow using web workers from CDN
  const toDataUrl = (content, type = "text/javascript") =>
    `data:${type};charset=UTF-8;base64,` + btoa(content);

  const getWorkerDataURL = (url) => toDataUrl(`importScripts("${url}");`);

  // configure monaco to use the web workers
  globalThis.MonacoEnvironment = {
    getWorkerUrl: function (_moduleId, label) {
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

  if (injectStyles) {
    const stylesheet = document.createElement("link");
    stylesheet.crossOrigin = "anonymous";
    stylesheet.href = editorBaseUrl + "monaco-editor.css";
    stylesheet.rel = "stylesheet";
    document.head.appendChild(stylesheet);
  }

  const monaco = await import(editorBaseUrl + "monaco-editor.js");

  return monaco;
};
