import { useCallback, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
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
    <main className="flex min-h-screen flex-col items-center p-8 gap-8">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Tauri + React
        </h1>

        <div className="flex items-center gap-6">
          <a
            href="https://vitejs.dev"
            target="_blank"
            className="transition-transform hover:scale-110"
          >
            <img src="/vite.svg" className="h-16 w-16" alt="Vite logo" />
          </a>
          <a
            href="https://tauri.app"
            target="_blank"
            className="transition-transform hover:scale-110"
          >
            <img src="/tauri.svg" className="h-16 w-16" alt="Tauri logo" />
          </a>
          <a
            href="https://reactjs.org"
            target="_blank"
            className="transition-transform hover:scale-110"
          >
            <img src={reactLogo} className="h-16 w-16" alt="React logo" />
          </a>
        </div>
        <p className="text-muted-foreground">
          Click on the Tauri, Vite, and React logos to learn more.
        </p>
      </div>

      <form
        className="flex gap-4 items-center"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          type="submit"
        >
          Greet
        </button>
      </form>
      <p className="text-sm">{greetMsg}</p>

      <button
        onClick={handleOpenFile}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
      >
        Open File (.js or .py)
      </button>

      {fileContent && (
        <div className="w-full max-w-3xl rounded-lg border bg-card text-card-foreground shadow-sm">
          <CodeMirror
            value={value}
            height="400px"
            theme={tokyoNight}
            extensions={[javascript({ jsx: true })]}
            onChange={onChange}
          />
        </div>
      )}
    </main>
  );
}

export default App;
