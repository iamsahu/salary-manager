import sfcontext from "../helpers/sfcontext";
import statecontext from "../helpers/statecontext";
import React, { useContext, useState } from "react";
import { useWeb3React } from "@web3-react/core";

import { Button } from "antd";
import { PoweroffOutlined } from "@ant-design/icons";
import { poolID, tokenAddress } from "../helpers/helperFunctions";

function PoolCreator(props: any) {
	const web3React = useWeb3React();
	const sf = useContext<any>(sfcontext);
	const [state, setState] = useContext(statecontext);
	const [loadingState, setLoadingState] = useState(false);

	async function CreateIndex() {
		if (sf === null) return;
		await sf.ida
			.createIndex({
				superToken: tokenAddress(props.vertical),
				indexId: poolID(props.vertical),
				publisher: web3React.account,
			})
			.then((response: any) => {
				console.log(response);
				// setVisible(false);
				// setConfirmLoading(false);
				switch (props.vertical) {
					case "stakePool":
						setState((state: any) => ({
							...state,
							stakePool: true,
						}));
						break;
					case "blackPool":
						setState((state: any) => ({
							...state,
							blackPool: true,
						}));
						break;
					case "rektPool":
						setState((state: any) => ({
							...state,
							rektPool: true,
						}));
						break;
					default:
						break;
				}
				setLoadingState(false);
			})
			.catch((error: any) => {
				console.log(error);
				setLoadingState(false);
			});
	}

	function create() {
		setLoadingState(true);
		CreateIndex();
	}

	return (
		<Button type="primary" loading={loadingState} onClick={create}>
			Create {props.vertical}
		</Button>
	);
}

export default PoolCreator;
