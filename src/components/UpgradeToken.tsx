import React from "react";
import { Contract } from "@ethersproject/contracts";
import SuperToken from "../abis/SuperToken.json";
import ERC20 from "../abis/ERC20.json";
import { useWeb3React } from "@web3-react/core";
import { Form, Input, InputNumber, Modal, Button, notification } from "antd";
import Web3 from "web3";

function UpgradeToken(params: any) {
	const web3React = useWeb3React();
	const [visible, setVisible] = React.useState(false);
	const [confirmLoading, setConfirmLoading] = React.useState(false);

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
	let sT: any = process.env.REACT_APP_SDAM3CRVX;
	let bT: any = process.env.REACT_APP_SDAM3CRV;
	async function UpgradeToken(values: any) {
		const contractx = new Contract(
			sT, //Super Token Address
			SuperToken.abi,
			web3React.library.getSigner()
		);
		const contract = new Contract(
			bT, //Base Token Address
			ERC20.abi,
			web3React.library.getSigner()
		);

		if (values.Amount > 0) {
			// console.log(values);
			if (typeof contractx !== undefined && typeof contract !== undefined)
				await contract
					.approve(
						sT, //Super Token Address
						Web3.utils.toWei((Number(values.Amount) + 1).toString())
					)
					.then(async (response: any) => {
						await contractx
							.upgrade(Web3.utils.toWei(values.Amount))
							.then((response: any) => {
								setConfirmLoading(false);
								setVisible(false);
								openNotification();
							})
							.catch((error: any) => {
								setConfirmLoading(false);
								setVisible(false);
								openFailNotification();
							});
					})
					.catch((error: any) => {
						setConfirmLoading(false);
						setVisible(false);
					});
		}
		setConfirmLoading(false);
		setVisible(false);
	}
	return (
		<>
			<Button type="primary" onClick={showModal}>
				Upgrade sdam3CRV
			</Button>
			<Modal
				title="Upgrade sdam3CRV to sdam3CRVx"
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
