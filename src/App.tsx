import React, { useState, useEffect } from "react";
import "./App.css";
import { Layout, Button, Tag, Menu } from "antd";
import { useWeb3React } from "@web3-react/core";
import { injected } from "./helpers/connector";
import { SFProvider } from "./helpers/sfcontext";
import { StateProvider } from "./helpers/statecontext";
import Web3 from "web3";
import SuperfluidSDK from "@superfluid-finance/js-sdk";

// import {
// 	AreaChartOutlined,
// 	DatabaseOutlined,
// 	FieldTimeOutlined,
// 	UnorderedListOutlined,
// } from "@ant-design/icons";
import DataDisplay from "./components/DataDisplay";
import Framework from "@superfluid-finance/js-sdk/src/Framework";

// const { Header, Content, Footer, Sider } = Layout;
declare let window: any;
function App() {
	const web3React = useWeb3React();
	const [SF, setSF] = useState<Framework>();
	const [state, setState] = useState({
		stakePool: false,
		blackPool: false,
		rektPool: false,
	});
	console.log(SF);
	useEffect(() => {
		async function initSf() {
			console.log("init sf");
			const sf = new SuperfluidSDK.Framework({
				web3: new Web3(window.ethereum),
			});
			await sf.initialize().then(() => setSF(sf));
		}
		if (SF === undefined) initSf();
	}, []);

	const onError = (err: any) => {
		console.error(err);
		// debugger;
	};

	const activateWeb3 = () => {
		web3React.activate(injected, onError, true).catch((err: any) => {
			console.error(err);
		});
	};

	function handleChainChanged(chainId: number) {
		// details.current.chainid = chainId;
		window.location.reload();
		activateWeb3();
	}
	function handleAccountsChanged(accounts: any) {
		if (accounts.length > 0) {
			// details.current.accounts = accounts;
		} else {
			// details.current.accounts = accounts;
			// setMetaMask("");
		}
	}
	function handleClose() {
		// setMetaMask("");
	}
	function handleNetworkChanged() {}

	async function ConnectWallet() {
		activateWeb3();
	}

	if (SF === undefined) {
		return <div>Loading Superfluid!</div>;
	}

	return (
		<div className="App">
			<SFProvider value={SF}>
				<StateProvider value={[state, setState]}>
					{!web3React.active ? (
						<Button onClick={ConnectWallet}>Connect Wallet</Button>
					) : (
						<DataDisplay />
					)}
				</StateProvider>
			</SFProvider>
		</div>
	);
}

export default App;
