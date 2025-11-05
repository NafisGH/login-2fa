import React from "react";
import { createRoot } from "react-dom/client";
import QueryProvider from "@/app/providers/QueryProvider";
import ThemeProvider from "@/app/providers/ThemeProvider";
import GlobalStyle from "@/app/providers/GlobalStyle";
import Root from "@/pages/Root";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <GlobalStyle />
        <Root />
      </ThemeProvider>
    </QueryProvider>
  </React.StrictMode>
);
