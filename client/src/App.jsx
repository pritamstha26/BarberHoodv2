import React from "react";
import { Route, Routes } from "react-router-dom";
import routes from "./routes/routes";
import { Container } from "react-bootstrap";
//
export default function App() {
  return (
    <Container fluid className="vh-100  p-0">
      <Routes>
        {routes.map((route, index) => (
          // <Route key={index} path={route.path} element={route.element} />
          <Route key={index} path={route.path} element={route.element}>
            {route.children?.map((rt, index) => (
              <Route key={index} path={rt.path} element={rt.element} />
            ))}
          </Route>
        ))}
      </Routes>
    </Container>
  );
}
