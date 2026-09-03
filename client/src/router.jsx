import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout, NotFoundComponent } from "./routes/__root";
import Home from "./routes/index";
import About from "./routes/about";
import WiresCables from "./routes/wires-cables";
import Switchgear from "./routes/switchgear";
import Brands from "./routes/brands";
import Services from "./routes/services";
import Projects from "./routes/projects";
import Contact from "./routes/contact";
import BulkQuote from "./routes/bulk-quote";
import ChannelPartner from "./routes/channel-partner";
import Legal from "./routes/legal";
import Privacy from "./routes/privacy";
import Terms from "./routes/terms";
import ResetPassword from "./routes/reset-password";
import Admin from "./routes/admin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundComponent />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "wires-cables", element: <WiresCables /> },
      { path: "switchgear", element: <Switchgear /> },
      { path: "brands", element: <Brands /> },
      { path: "services", element: <Services /> },
      { path: "projects", element: <Projects /> },
      { path: "contact", element: <Contact /> },
      { path: "bulk-quote", element: <BulkQuote /> },
      { path: "channel-partner", element: <ChannelPartner /> },
      { path: "legal", element: <Legal /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "admin", element: <Admin /> },
      { path: "*", element: <NotFoundComponent /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
