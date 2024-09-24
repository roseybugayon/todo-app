import { Amplify } from "aws-amplify";
import React from "react";
import ReactDOM from "react-dom/client";
import amplifyconfig from "./amplifyconfiguration.json";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./styles/index.css";

Amplify.configure(amplifyconfig);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
