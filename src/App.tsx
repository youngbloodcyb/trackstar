import { useCallback, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [fileContent, setFileContent] = useState<string>("");
  const [value, setValue] = useState("");

  const onChange = useCallback((val: string, _viewUpdate: any) => {
    console.log("val:", val);
    setValue(val);
  }, []);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  const handleOpenFile = async () => {
    try {
      // Open file dialog
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Code",
            // extensions: ["js", "py"],
            extensions: ["js"],
          },
        ],
      });

      // Check if file was selected (user didn't cancel)
      if (selected) {
        // Read the file contents
        const contents = await readTextFile(selected as string);
        console.log("File contents:", contents);
        setFileContent(contents);
        setValue(contents);
      }
    } catch (err) {
      console.error("Error reading file:", err);
    }
  };

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>

      <button onClick={handleOpenFile}>Open File (.js or .py)</button>

      {fileContent && (
        <CodeMirror
          value={value}
          height="200px"
          theme={tokyoNight}
          extensions={[javascript({ jsx: true })]}
          onChange={onChange}
        />
      )}
    </main>
  );
}

export default App;
