import MainScene from "./components/MainScene";
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <div className="min-h-screen">
      <MainScene />
      <Analytics />
    </div>
  );
}

export default App;
