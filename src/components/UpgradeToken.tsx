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
	const [upgrade, setUpgrade] = useState(false);
	const [upgradeValue, setUpgradeValue] = useState(0);
	const [upgradeLoading, setUpgradeLoading] = useState(false);
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
		setUpgradeValue(0);
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
		setUpgradeValue(values.Amount);
		await ApproveToken(values);
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
	const contract = new Contract(
		bT, //Base Token Address
		ERC20.abi,
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

	async function ApproveToken(values: any) {
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
						Web3.utils.toWei((Number(values.Amount)).toString())
					)
					.then(async (response: any) => {
						// console.log(response);
						setUpgrade(true);
						setConfirmLoading(false);
						// UpgradeToken();
						setVisible(false);
						// await contractx
						// 	.upgrade(Web3.utils.toWei(values.Amount))
						// 	.then((response: any) => {
						// 		console.log(response);
						// 		setConfirmLoading(false);
						// 		setVisible(false);
						// 		openNotification();
						// 	})
						// 	.catch((error: any) => {
						// 		console.log(error);
						// 		setConfirmLoading(false);
						// 		setVisible(false);
						// 		openFailNotification();
						// 	});
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

	async function UpgradeToken() {
		if (upgradeValue > 0) {
			// console.log(values);
			if (typeof contractx !== undefined && typeof contract !== undefined)
				// var tp = await contract
				// 	.allowance(web3React.account, sT)
				// 	.then((response: any) => console.log(response))
				// 	.catch((error: any) => {
				// 		console.log(error);
				// 	});
				setUpgradeLoading(true);
			await contractx
				.upgrade(Web3.utils.toWei(upgradeValue.toString()))
				.then((response: any) => {
					console.log(response);
					setConfirmLoading(false);
					setVisible(false);
					setUpgrade(false);
					setUpgradeLoading(false);
					openNotification();
				})
				.catch((error: any) => {
					console.log(error);
					setConfirmLoading(false);
					setVisible(false);
					setUpgrade(false);
					setUpgradeLoading(false);
					openFailNotification();
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
				{upgrade ? (
					<Button
						type="primary"
						onClick={UpgradeToken}
						loading={upgradeLoading}
					>
						Upgrade {TokenName(params.vertical)}
					</Button>
				) : (
					<Button type="primary" onClick={showModal}>
						Approve {TokenName(params.vertical)}
					</Button>
				)}
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
