import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import { Layout, Button, Tag, Menu, Space } from "antd";
import { useWeb3React } from "@web3-react/core";
import { injected } from "./helpers/connector";
import { SFProvider } from "./helpers/sfcontext";
import { StateProvider } from "./helpers/statecontext";
import Web3 from "web3";
import SuperfluidSDK from "@superfluid-finance/js-sdk";

import {
	useSafeAppConnection,
	SafeAppConnector,
} from "@gnosis.pm/safe-apps-web3-react";

// import {
// 	AreaChartOutlined,
// 	DatabaseOutlined,
// 	FieldTimeOutlined,
// 	UnorderedListOutlined,
// } from "@ant-design/icons";
import DataDisplay from "./components/DataDisplay";
import Framework from "@superfluid-finance/js-sdk/src/Framework";
import Title from "antd/lib/typography/Title";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { SafeAppProvider } from "@gnosis.pm/safe-apps-provider";
import { Web3Provider } from "@ethersproject/providers";
const { Header, Content, Footer, Sider } = Layout;
const safeMultisigConnector = new SafeAppConnector();

declare let window: any;
function App() {
	const web3React = useWeb3React();
	const [SF, setSF] = useState<Framework>();
	const [state, setState] = useState({
		stakePool: false,
		blackPool: false,
		rektPool: false,
	});

	const triedToConnectToSafe = useSafeAppConnection(safeMultisigConnector);
	const { sdk, safe } = useSafeAppsSDK();

	// console.log(SF);
	useEffect(() => {
		async function initSf() {
			console.log("init sf");

			const sf = new SuperfluidSDK.Framework({
				web3: new Web3Provider(new SafeAppProvider(safe, sdk)),
			});
			await sf.initialize().then(() => setSF(sf));
		}

		if (triedToConnectToSafe) {
			// fallback to other providers
			if (SF === undefined) initSf();
			console.log("fallback");
		}
	}, [triedToConnectToSafe, SF]);

	const onError = (err: any) => {
		console.error(err);
		// debugger;
	};

	const activateWeb3 = () => {
		web3React
			.activate(safeMultisigConnector, onError, true)
			.catch((err: any) => {
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
		return (
			<div className="App">
				<Content style={{ minHeight: "83vh" }}>
					<Space direction="vertical" align="center">
						<Title>Loading Superfluid!</Title>
					</Space>
				</Content>
			</div>
		);
	}

	return (
		<div className="App">
			<SFProvider value={SF}>
				<StateProvider value={[state, setState]}>
					<Layout>
						<Header>
							{!web3React.active ? (
								<Button onClick={ConnectWallet}>Connect Wallet</Button>
							) : (
								<></>
							)}
						</Header>
						<Content style={{ minHeight: "80vh" }}>
							<Space direction="vertical">
								{!web3React.active ? <></> : <DataDisplay />}
							</Space>
						</Content>
						<Footer></Footer>
					</Layout>
				</StateProvider>
			</SFProvider>
		</div>
	);
}

export default App;
