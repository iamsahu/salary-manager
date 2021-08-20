import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import SafeProvider from "@gnosis.pm/safe-apps-react-sdk";
function getLibrary(provider: any, connector: any) {
	// return new ethers.providers.Web3Provider(window.ethereum);
	const test = new Web3Provider(provider);

	return test; // this will vary according to whether you use e.g. ethers or web3.js
}

ReactDOM.render(
	<React.StrictMode>
		<Web3ReactProvider getLibrary={getLibrary}>
			<App />
		</Web3ReactProvider>
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
