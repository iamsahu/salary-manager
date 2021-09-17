import React, { useEffect, useState, useContext } from "react";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import sfcontext from "../helpers/sfcontext";
import Web3 from "web3";
import {
	addressToCheck,
	poolID,
	salaryToCheck,
	tokenAddress,
	accountAddress,
	superTokenAddress,
} from "../helpers/helperFunctions";
import { Button, Space, notification, Table, Tag } from "antd";
import { dataFormat } from "../helpers/interfaces";
import Column from "antd/lib/table/Column";
import { Content } from "antd/lib/layout/layout";
import UpgradeToken from "./UpgradeToken";
import { Payouts } from "../helpers/validator";

declare let window: any;

function VerticalFlowSalary(params: any) {
	const web3React = useWeb3React();
	// console.log(params);
	const [indexData, setIndexData] = useState<Array<any> | null>([]);
	const [poolExists, setPoolExists] = useState(false);
	const sf = useContext<any>(sfcontext);
	const [progress, setProgress] = useState("loading");
	const [loadingState, setLoadingState] = useState(false);
	const [newUsers, setNewUsers] = useState(0);
	const [modifyUser, setModifyUser] = useState(0);
	const [removeUser, setRemoveUser] = useState(0);
	const [csvData, setcsvData] = useState<Array<any> | null>([]);
	var web3 = new Web3(window.ethereum);

	const openNotification = (msg: string) => {
		notification.open({
			message: "Wohoo!",
			description: msg,
			onClick: () => {
				console.log("Notification Clicked!");
			},
		});
	};

	useEffect(() => {
		async function GetData() {
			//Write code here to get the data
			// console.log(web3React.account);
			if (params.data === null) {
				return;
			} else {
			}
			axios({
				url: process.env.REACT_APP_GRAPHQL_CFA,
				method: "post",
				data: {
					query: `
                        query indexes($owner:Bytes){
                            flows(where:{owner:$owner,flowRate_gt:0}){
                                token{
                                    id
                                }
                                flowRate
                                recipient{
                                    id
                                }
                            }
                        }`,
					variables: {
						owner: web3React.account?.toLowerCase(),
					},
				},
			}).then(async (result) => {
				if (result.data === undefined) return;
				if (result.data.data === undefined) return;
				if (result.data.data["flows"] === undefined) return;
				//Based on count determine whether pool needs to be created or not
				//If pool exists
				// console.log(result);
				if (result.data.data["flows"].length > 0) {
					let parsedData: any[] = [];
					for (
						let index = 0;
						index < result.data.data["flows"].length;
						index++
					) {
						const element = result.data.data["flows"][index];
						if (
							element["token"]["id"] ===
							superTokenAddress(params.vertical).toLowerCase()
						) {
							parsedData.push(element);
						}
					}
					//Set Index Data
					setIndexData(parsedData);
					console.log(parsedData);
					//Calculate whether new members need to be added
					let usersNot: any[] = FindUsersWithNoStream(parsedData);
					console.log(usersNot);
					let temp: any[] = [];
					if (usersNot.length > 0) {
						setProgress("disburseReady");
						for (let index = 0; index < params.data.length; index++) {
							let element = params.data[index];
							let ind = usersNot.findIndex(
								(x: any) =>
									x["address"].toLowerCase() ===
									element[addressToCheck(params.vertical)].toLowerCase()
							);
							if (ind === -1) {
								element["state"] = "good";
							} else {
								element["state"] = usersNot[ind]["state"];
								// if (usersNot[ind]["salary"] === "0") {
								// 	element["state"] = "remove";
								// } else {
								// 	element["state"] = "salaryMod";
								// }
							}
							temp.push(element);
						}
						setcsvData(temp);
					} else {
						for (let index = 0; index < params.data.length; index++) {
							let element = params.data[index];
							element["state"] = "good";
							temp.push(element);
						}
						setcsvData(temp);
						// 						setProgress("disburseReady");
					}
				} else {
					let temp: any[] = [];
					let cnt: number = 0;
					for (let index = 0; index < params.data.length; index++) {
						let element = params.data[index];

						// console.log(element);
						// console.log(salaryToCheck(params.vertical));
						// console.log(
						// 	element[salaryToCheck(params.vertical)].toString().trim()
						// );
						if (element[salaryToCheck(params.vertical)] !== undefined) {
							if (element[salaryToCheck(params.vertical)].toString() == "0") {
								element["state"] = "nope";
							} else {
								element["state"] = "new";
								cnt += 1;
							}
							temp.push(element);
						}
					}
					setcsvData(temp);
					setProgress("disburseReady");
					setNewUsers(cnt);
				}
			});
		}
		if (
			web3React.active
			// &&
			// web3React.account === accountAddress(params.vertical)
		) {
			setcsvData(params.data);
			GetData();
		} else {
		}
	}, [web3React.active, web3React.account, params.data]);

	if (!web3React.active) {
		return <div>Connect Wallet</div>;
	}

	// if (web3React.account !== accountAddress(params.vertical)) {
	// 	return <div>Please connect the {params.vertical} account</div>;
	// }

	// if (indexData === undefined && state[params.vertical] === false) {
	// 	return (
	// 		<div>
	// 			<PoolCreator vertical=params.vertical />
	// 		</div>
	// 	);
	// }

	function FindUsersWithNoStream(_indexData: any): any[] {
		console.log("Finding");
		let users: any[] = [];
		let notIn: number = 0;
		let mod: number = 0;
		let rem: number = 0;

		// if (_indexData.length <= 0) {
		// 	return users;
		// }
		// console.log(_indexData);
		for (let index = 0; index < params.data.length; index++) {
			let element = params.data[index];
			let indexIndex = _indexData.findIndex(
				(x: any) =>
					x["recipient"]["id"] ===
					element[addressToCheck(params.vertical)].toLowerCase()
			);
			// console.log(indexIndex);
			// console.log(params.vertical);
			// console.log(salaryToCheck(params.vertical));
			// console.log(element[salaryToCheck(params.vertical)]);
			//Calculate flow rate
			if (element[salaryToCheck(params.vertical)] == undefined) {
				continue;
			}
			let yearlySalary = element[salaryToCheck(params.vertical)] * 12;
			let csvFlowRate = Web3.utils.toBN(
				Web3.utils.toWei(yearlySalary.toString()).toString()
			);
			csvFlowRate = csvFlowRate.div(Web3.utils.toBN(3600 * 24 * 365));

			if (indexIndex.toString() === "-1") {
				//Not found, means no flow so create a new
				// console.log("New");
				if (csvFlowRate.toString() !== "0") {
					users.push({
						address: element[addressToCheck(params.vertical)].toLowerCase(),
						salary: csvFlowRate,
						state: "new",
					});
					notIn += 1;
				}
			} else {
				//Check if flow rate is same or not
				//If same
				if (csvFlowRate.toString() !== _indexData[indexIndex]["flowRate"]) {
					if (csvFlowRate.toString() === "0") {
						users.push({
							address: element[addressToCheck(params.vertical)].toLowerCase(),
							salary: 0,
							state: "delete",
						});
						rem += 1;
					} else {
						users.push({
							address: element[addressToCheck(params.vertical)].toLowerCase(),
							salary: csvFlowRate,
							state: "salaryMod",
						});
						mod += 1;
					}
				}
			}
		}
		//Delete
		for (let index = 0; index < _indexData.length; index++) {
			const element = _indexData[index];
			//If it is in index & not in csv than it has to be deleted
			let delIndex = params.data.findIndex(
				(x: any) =>
					element["recipient"]["id"] ===
					x[addressToCheck(params.vertical)].toLowerCase()
			);
			if (delIndex.toString() === "-1") {
				console.log("delete");
				users.push({
					address: element["recipient"]["id"].toLowerCase(),
					salary: 0,
					state: "delete",
				});
				rem += 1;
			}
		}
		setModifyUser(mod);
		setNewUsers(notIn);
		setRemoveUser(rem);
		return users;
	}

	async function AddUsersToPool() {
		// if (indexData === undefined) {
		// 	return;
		// }
		setLoadingState(true);
		let usersNot: any[] = FindUsersWithNoStream(indexData);
		if (usersNot.length > 0) {
			let temp: any[] = BatchCallForAddingUsers(usersNot);
			var web3 = new Web3(window.ethereum);
			await sf.host
				.batchCall(temp, { from: web3React.account })
				.then((response: any) => {
					console.log(response);
					setLoadingState(false);
					setProgress("completed");
					openNotification("Flows started successfully!!");
				})
				.catch((error: any) => {
					console.log(error);
					setLoadingState(false);
				});
		}
	}

	function BatchCallForAddingUsers(users: any[]): any[] {
		let temp: any = [];
		if (users.length <= 0) {
			console.log("No users to be added!");
			return [];
		}
		console.log(users);
		for (let index = 0; index < users.length; index++) {
			const element = users[index];
			// console.log(poolID(params.vertical));
			if (element["salary"] == "0") {
				temp.push([
					201,
					sf.agreements.cfa.address,
					web3.eth.abi.encodeParameters(
						["bytes", "bytes"],
						[
							sf.agreements.cfa.contract.methods
								.deleteFlow(
									superTokenAddress(params.vertical),
									web3React.account,
									element["address"],
									"0x"
								)
								.encodeABI(), // callData
							"0x", // userData
						]
					),
				]);
				console.log("Deleting");
			} else {
				if (element["state"] === "new") {
					//Create new flow
					temp.push([
						201,
						sf.agreements.cfa.address,
						web3.eth.abi.encodeParameters(
							["bytes", "bytes"],
							[
								sf.agreements.cfa.contract.methods
									.createFlow(
										superTokenAddress(params.vertical),
										element["address"],
										element["salary"].toString(),
										"0x"
									)
									.encodeABI(), // callData
								"0x", // userData
							]
						),
					]);
				} else {
					//Update flow
					temp.push([
						201,
						sf.agreements.cfa.address,
						web3.eth.abi.encodeParameters(
							["bytes", "bytes"],
							[
								sf.agreements.cfa.contract.methods
									.updateFlow(
										superTokenAddress(params.vertical),
										element["address"],
										element["salary"].toString(),
										"0x"
									)
									.encodeABI(), // callData
								"0x", // userData
							]
						),
					]);
				}

				// console.log("Adding");
			}
		}
		return temp;
		// await sf.host
		// 	.batchCall(temp, { from: web3React.account })
		// 	.then((response: any) => console.log(response))
		// 	.catch((error: any) => console.log(error));
	}

	function AmountToBePaid(): any {
		let payment: number = 0;
		if (params.data === null) return <></>;
		for (let index = 0; index < params.data.length; index++) {
			const element = params.data[index];
			payment += Number(element[salaryToCheck(params.vertical)]);
		}

		return <div>Amount to be streamed/month: {payment}</div>;
	}

	return (
		<Content
			style={{ padding: "20px 20px", background: "#fff", minHeight: "80vh" }}
		>
			<Space direction="vertical">
				<Space direction="horizontal">
					<UpgradeToken vertical={params.vertical} />
					{/* {progress === "createPool" ? (
						<Button onClick={CreateIndex} type="primary" loading={loadingState}>
							Create Pool
						</Button>
					) : (
						<Button onClick={CreateIndex} disabled>
							Create Pool
						</Button>
					)} */}
					{progress === "disburseReady" ? (
						<Space direction="vertical" size="small">
							<Button
								onClick={AddUsersToPool}
								type="primary"
								loading={loadingState}
							>
								Make Changes to flows
							</Button>
							<br />
							<div>New Users: {newUsers}</div>
							<br />
							<div>Modify Users: {modifyUser}</div>
							<br />
							<div>Remove Users: {removeUser}</div>
						</Space>
					) : (
						<Button onClick={AddUsersToPool} disabled>
							Disburse
						</Button>
					)}
					{AmountToBePaid()}
					{/* {progress === "disburseReady" ? (
						<Space direction="vertical" size="small">
							<Button
								onClick={ReleaseThePayment}
								type="primary"
								loading={loadingState}
							>
								Disburse Amount
							</Button>
							<br />
							{AmountToBePaid()}
						</Space>
					) : (
						<Button onClick={ReleaseThePayment} disabled>
							Disburse Amount
						</Button>
					)} */}
				</Space>
				<Table<Payouts> dataSource={params.data}>
					{/* <Column title="Name" dataIndex="name" key="name" /> */}
					<Column
						title="Address"
						dataIndex={addressToCheck(params.vertical)}
						key={addressToCheck(params.vertical)}
					/>
					<Column
						title="Salary"
						dataIndex={salaryToCheck(params.vertical)}
						key={salaryToCheck(params.vertical)}
					/>
					<Column
						title="State"
						dataIndex="state"
						key="state"
						render={(text, record: Payouts) => {
							if (record["state"] === "remove")
								return (
									<>
										<Tag color="red">Remove</Tag>
									</>
								);
							else if (record["state"] === "salaryMod")
								return (
									<>
										<Tag color="orange">Salary Modification</Tag>
									</>
								);
							else if (record["state"] === "new")
								return (
									<>
										<Tag color="yellow">New</Tag>
									</>
								);
							else if (record["state"] === "good")
								return (
									<>
										<Tag color="green">Old Record</Tag>
									</>
								);
							else if (record["state"] === "delete")
								return (
									<>
										<Tag color="red">Delete</Tag>
									</>
								);
							else if (record["state"] === "nope")
								return (
									<>
										<Tag color="red">Won't be added</Tag>
									</>
								);
							else return <></>;
						}}
					/>
				</Table>
			</Space>
		</Content>
	);
}

export default VerticalFlowSalary;
//Parse the results
//Fetch data from the IDA
//If there are people missing from the pool show a prompt to add them
//If all the members are added to the pool provide the option of releasing the payment

// {
//   indexes(where:{indexId:0,token:"0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f",publisher:"0xea1AE04250b3381A0dD7382b69B68B2EbD44dB6c"}){
// activeSubscribers;
//     subscribers{
//       subscriber
//       totalPendingApproval
//       units
//     }
//   }
// }
