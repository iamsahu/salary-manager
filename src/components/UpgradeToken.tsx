import React, { useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import SuperToken from "../abis/SuperToken.json";
import ERC20 from "../abis/ERC20.json";
import { useWeb3React } from "@web3-react/core";
import {
	Form,
	Input,
	InputNumber,
	Modal,
	Button,
	notification,
	Space,
} from "antd";
import Web3 from "web3";
import { superTokenAddress, tokenAddress } from "../helpers/helperFunctions";

function UpgradeToken(params: any) {
	const web3React = useWeb3React();
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [tokBalance, setTokBalance] = useState("0");
	const [form] = Form.useForm();

	const openNotification = () => {
		notification["success"]({
			message: "Success!",
			description: "Token upgrade successful!",
			duration: 2.5,
			onClick: () => {
				console.log("Notification Clicked!");
			},
		});
	};
	const openFailNotification = () => {
		notification["error"]({
			message: "Fail!",
			description: "Token upgrade failed!",
			duration: 2.5,
			onClick: () => {
				console.log("Notification Clicked!");
			},
		});
	};

	const showModal = () => {
		setVisible(true);
	};

	const onOk = () => {
		setConfirmLoading(true);
		form.submit();
	};

	const onCancel = () => {
		setVisible(false);
		setConfirmLoading(false);
	};

	const onFinish = async (values: any) => {
		console.log("Success:", values);
		//TO DO: Add function to fire a query to handle addition of subscriber data.
		await UpgradeToken(values);
		// setVisible(false);
		// setConfirmLoading(false);
	};
	let sT: any = superTokenAddress(params.vertical); // process.env.REACT_APP_SDAM3CRVX;
	let bT: any = tokenAddress(params.vertical); // process.env.REACT_APP_SDAM3CRV;
	let contractx = new Contract(
		sT, //Super Token Address
		SuperToken.abi,
		web3React.library.getSigner()
	);

	useEffect(() => {
		async function GetTokBalance() {
			console.log(web3React.account);
			await contractx
				.balanceOf(web3React.account)
				.then((response: any) => {
					// console.log(response);
					// console.log(Web3.utils.fromWei(Web3.utils.toBN(response)));
					setTokBalance(Web3.utils.fromWei(Web3.utils.toBN(response)));
					console.log("got balance");
				})
				.catch((error: any) => {
					console.log(error);
				});
		}
		GetTokBalance();
	}, [setVisible]);

	// const tokenInst = new web3.eth.Contract(tokenABI, token.address);
	// const balance = await tokenInst.methods.balanceOf(address).call();

	async function UpgradeToken(values: any) {
		const contract = new Contract(
			bT, //Base Token Address
			ERC20.abi,
			web3React.library.getSigner()
		);

		if (values.Amount > 0) {
			// console.log(values);
			if (typeof contractx !== undefined && typeof contract !== undefined)
				// var tp = await contract
				// 	.allowance(web3React.account, sT)
				// 	.then((response: any) => console.log(response))
				// 	.catch((error: any) => {
				// 		console.log(error);
				// 	});
				await contract
					.approve(
						sT, //Super Token Address
						Web3.utils.toWei((Number(values.Amount) + 1).toString())
					)
					.then(async (response: any) => {
						// console.log(response);
						await contractx
							.upgrade(Web3.utils.toWei(values.Amount))
							.then((response: any) => {
								console.log(response);
								setConfirmLoading(false);
								setVisible(false);
								openNotification();
							})
							.catch((error: any) => {
								console.log(error);
								setConfirmLoading(false);
								setVisible(false);
								openFailNotification();
							});
					})
					.catch((error: any) => {
						console.log(error);
						setConfirmLoading(false);
						setVisible(false);
					});
		}
		setConfirmLoading(false);
		setVisible(false);
	}

	function TokenName(baseToken: string): string {
		switch (baseToken) {
			case "stakePool":
				return "SDT";
			case "stakePoolLP":
				return "sdam3CRV";
			case "blackPool":
				return "BPT";
			case "blackPoolLP":
				return "sdam3CRV";
			case "rektPool":
				return "rekt_salary";
			default:
				return "";
		}
	}
	return (
		<>
			<Space direction="vertical">
				<Button type="primary" onClick={showModal}>
					Upgrade {TokenName(params.vertical)}
				</Button>
				Your {TokenName(params.vertical)}x token balance: {tokBalance}
			</Space>
			<Modal
				title="Upgrade to supertoken"
				visible={visible}
				onOk={onOk}
				onCancel={onCancel}
				confirmLoading={confirmLoading}
			>
				<Form form={form} layout="vertical" name="userForm" onFinish={onFinish}>
					<Form.Item name="Amount" label="Amount" rules={[{ required: true }]}>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}

export default UpgradeToken;
