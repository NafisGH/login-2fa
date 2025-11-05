import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root { color-scheme: light; }

  *, *::before, *::after { box-sizing: border-box; }

  html, body, #root { height: 100%; }

  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
  }

  button { font: inherit; }
  input { font: inherit; }
`;

export default GlobalStyle;
