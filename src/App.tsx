import { useCallback, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [fileContent, setFileContent] = useState<string>("");
  const [value, setValue] = useState("");
  const [fileType, setFileType] = useState<"js" | "py">("js");

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
            extensions: ["js", "py"],
          },
        ],
      });

      // Check if file was selected (user didn't cancel)
      if (selected) {
        // Determine file type from extension
        const filePath = selected as string;
        const extension = filePath.split(".").pop()?.toLowerCase();
        setFileType(extension === "py" ? "py" : "js");

        // Read the file contents
        const contents = await readTextFile(filePath);
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
        <Input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <Button type="submit">Greet</Button>
      </form>
      <p className="text-sm">{greetMsg}</p>

      <Button onClick={handleOpenFile}>Open File (.js or .py)</Button>

      {fileContent && (
        <div className="w-full max-w-3xl rounded-lg border bg-card text-card-foreground shadow-sm">
          <CodeMirror
            value={value}
            height="400px"
            theme={tokyoNight}
            extensions={[
              fileType === "py" ? python() : javascript({ jsx: true }),
            ]}
            onChange={onChange}
          />
        </div>
      )}
    </main>
  );
}

export default App;
