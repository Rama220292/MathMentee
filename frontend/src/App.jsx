import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
// import NavBar from "./components/common/NavBar";

function App() {
  return (
    <BrowserRouter>
      {/* <Navbar /> */}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;