import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import GradientBackdrop from "./components/ui/GradientBackdrop";

function App() {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden text-slate-100">
      <GradientBackdrop />
      <Sidebar />
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Home />
        </main>
      </div>
    </div>
  );
}

export default App;
