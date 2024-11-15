import React, { useEffect } from "react";
import Vara from "vara";

function VaraText({ text }) {
  useEffect(() => {
    new Vara("#vara-container", "https://path-to-font.json", [{ text }]);
  }, [text]);

  return <div id="vara-container"></div>;
}

export default VaraText;
