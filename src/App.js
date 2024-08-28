import React from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloakService from "./services/Keycloak";
import { AppRouter } from "./routers/AppRouter";
import { RouterProvider } from "react-router-dom";
function App() {
  return (
    <ReactKeycloakProvider authClient={keycloakService}>
      <RouterProvider router={AppRouter} />
    </ReactKeycloakProvider>
  );
}

export default App;
