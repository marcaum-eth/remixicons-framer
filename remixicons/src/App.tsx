import { framer, CanvasNode } from "framer-plugin";
import { useState, useEffect } from "react";
import "./App.css";
import IconDropdown from '../components/IconDropdown';

framer.showUI({
  position: "top right",
  width: 240,
  height: 150,
});

function useSelection() {
  const [selection, setSelection] = useState<CanvasNode[]>([]);

  useEffect(() => {
    return framer.subscribeToSelection(setSelection);
  }, []);

  return selection;
}

const App: React.FC = () => {
  const selection = useSelection();
  const layer = selection.length === 1 ? "layer" : "layers";

  const [selectedSvg, setSelectedSvg] = useState<string>("");

  const handleAddSvg = async () => {
    if (selectedSvg) {
      await framer.addSVG({
        svg: selectedSvg,
        
      });
    }
  };

  return (
    <main>
      <p>
        Welcome! Check out the{" "}
        <a href="https://framer.com/developers/plugins/introduction" target="_blank">
          Docs
        </a>{" "}
        to start. You have {selection.length} {layer} selected.
      </p>
      <IconDropdown onSelect={setSelectedSvg} />
      <button className="framer-button-primary" onClick={handleAddSvg}>
        Inserir
      </button>
    </main>
  );
};

export default App;