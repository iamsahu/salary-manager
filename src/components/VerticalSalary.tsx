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

function VerticalSalary(params: any) {
	const web3React = useWeb3React();
	// console.log(params);
	const [indexData, setIndexData] = useState<Array<any> | null>();
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

			if (params.data === null) {
				return;
			} else {
			}
			axios({
				url: process.env.REACT_APP_GRAPHQL_IDA_RINKEBY,
				method: "post",
				data: {
					query: `
                        query indexes($publisher:Bytes,$token:Bytes,$indexId:BigInt){
                            indexes(where:{publisher:$publisher,token:$token,indexId:$indexId}){
                                publisher
                                activeSubscribers
                                subscribers{
                                    id
                                    units
                                    subscriber
                                }
                            }
                        }`,
					variables: {
						publisher: web3React.account,
						token: superTokenAddress(params.vertical),
						indexId: poolID(params.vertical),
					},
				},
			}).then(async (result) => {
				if (result.data === undefined) return;
				if (result.data.data === undefined) return;
				if (result.data.data["indexes"] === undefined) return;
				//Based on count determine whether pool needs to be created or not
				//If pool exists
				if (result.data.data["indexes"].length > 0) {
					//Set Index Data
					setIndexData(result.data.data.indexes[0]);
					//Calculate whether new members need to be added
					let usersNot: any[] = FindUsersNotInPool(result.data.data.indexes[0]);
					// console.log(usersNot);
					let temp: any[] = [];
					if (usersNot.length > 0) {
						setProgress("modifyPoolMembers");
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
						setProgress("disburseReady");
					}
				} else {
					let temp: any[] = [];
					for (let index = 0; index < params.data.length; index++) {
						let element = params.data[index];
						element["state"] = "new";
						temp.push(element);
					}
					setcsvData(temp);
					setProgress("createPool");
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
	}, [web3React.active, web3React.account, poolExists, params.data]);

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

	async function CreateIndex() {
		if (sf === null) return;

		// if (indexData === undefined) {
		// 	return
		// }

		setLoadingState(true);
		let usersNot: any[] = [];
		for (let index = 0; index < params.data.length; index++) {
			const element = params.data[index];
			usersNot.push({
				address: element[addressToCheck(params.vertical)].toLowerCase(),
				salary: element[salaryToCheck(params.vertical)],
			});
		}

		if (usersNot.length > 0) {
			let temp: any[] = BatchCallForAddingUsers(usersNot);

			temp.unshift([
				201, // create constant flow (10/mo)
				sf.agreements.ida.address,
				web3.eth.abi.encodeParameters(
					["bytes", "bytes"],
					[
						sf.agreements.ida.contract.methods
							.createIndex(
								superTokenAddress(params.vertical),
								poolID(params.vertical),
								"0x"
							)
							.encodeABI(), // callData
						"0x", // userData
					]
				),
			]);
			console.log(temp);
			console.log("Address: " + web3React.account);
			await sf.host
				.batchCall(temp, { from: web3React.account })
				.then((response: any) => {
					console.log(response);
					// setVisible(false);
					// setConfirmLoading(false);
					setLoadingState(false);
					setProgress("disburseReady");
					openNotification("Index created successfully!");
				})
				.catch((error: any) => {
					console.log(error);
					setLoadingState(false);
				});
		}
	}

	async function AddUsersToPool() {
		if (indexData === undefined) {
			return;
		}
		setLoadingState(true);
		let usersNot: any[] = FindUsersNotInPool(indexData);
		if (usersNot.length > 0) {
			let temp: any[] = BatchCallForAddingUsers(usersNot);
			var web3 = new Web3(window.ethereum);
			await sf.host
				.batchCall(temp, { from: web3React.account })
				.then((response: any) => {
					console.log(response);
					setLoadingState(false);
					setProgress("disburseReady");
					openNotification("Users added successfully!!");
				})
				.catch((error: any) => {
					console.log(error);
					setLoadingState(false);
				});
		}
	}

	function FindUsersNotInPool(_indexData: any): any[] {
		let users: any[] = [];
		let notIn: number = 0;
		let mod: number = 0;

		let activeSubscribers = _indexData["activeSubscribers"];

		for (let index = 0; index < params.data.length; index++) {
			const element = params.data[index];
			if (
				!activeSubscribers.includes(
					element[addressToCheck(params.vertical)].toLowerCase()
				)
			) {
				// console.log("Including");
				users.push({
					address: element[addressToCheck(params.vertical)].toLowerCase(),
					salary: element[salaryToCheck(params.vertical)],
					state: "new",
				});
				notIn += 1;
			} else {
				//Check if the salary is different from what is present in the IDA
				// console.log(element[addressToCheck(params.vertical)].toLowerCase());

				let _indexCSV = params.data.findIndex(
					(x: any) =>
						x[addressToCheck(params.vertical)].toLowerCase() ===
						element[addressToCheck(params.vertical)].toLowerCase()
				);

				let _index = _indexData["subscribers"].findIndex(
					(x: any) =>
						x["subscriber"] ===
						element[addressToCheck(params.vertical)].toLowerCase()
				);

				// console.log(_indexCSV);
				// console.log(params.data[_indexCSV][salaryToCheck(params.vertical)]);
				// console.log(_indexData["subscribers"][_index]["units"]);
				if (
					params.data[_indexCSV][salaryToCheck(params.vertical)] !==
					_indexData["subscribers"][_index]["units"]
				) {
					users.push({
						address: element[addressToCheck(params.vertical)],
						salary: params.data[_indexCSV][salaryToCheck(params.vertical)],
						state: "salaryMod",
						oldSal: _indexData["subscribers"][_index]["units"],
					});
					mod += 1;
				}
			}
		}
		setModifyUser(mod);
		setNewUsers(notIn);
		// console.log(users);
		//TODO: Code for finding if any users were removed from the pool
		let id = -1;
		let rem = 0;
		for (let index = 0; index < activeSubscribers.length; index++) {
			const element = activeSubscribers[index];
			id = params.data.findIndex(
				(x: any) =>
					x[addressToCheck(params.vertical)].toLowerCase() ===
					element.toLowerCase()
			);
			if (id === -1) {
				//We found a user who is present in the pool but not in the csv
				users.push({
					address: element,
					salary: "0",
					state: "remove",
				});
				rem += 1;
				// console.log("Removing: " + element);
			}
			id = -1;
		}
		setRemoveUser(rem);
		// console.log(users);
		return users;
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
					sf.agreements.ida.address,
					web3.eth.abi.encodeParameters(
						["bytes", "bytes"],
						[
							sf.agreements.ida.contract.methods
								.deleteSubscription(
									superTokenAddress(params.vertical),
									web3React.account,
									poolID(params.vertical),
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
				temp.push([
					201,
					sf.agreements.ida.address,
					web3.eth.abi.encodeParameters(
						["bytes", "bytes"],
						[
							sf.agreements.ida.contract.methods
								.updateSubscription(
									superTokenAddress(params.vertical),
									poolID(params.vertical),
									element["address"],
									element["salary"].trim(),
									"0x"
								)
								.encodeABI(), // callData
							"0x", // userData
						]
					),
				]);
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

		for (let index = 0; index < params.data.length; index++) {
			const element = params.data[index];
			payment += Number(element[salaryToCheck(params.vertical)]);
		}

		return <div>Amount to be paid {payment}</div>;
	}

	async function del() {
		const bob = sf.user({
			address: web3React.account,
			token: superTokenAddress(params.vertical),
		});
		await sf.ida
			.deleteSubscription({
				superToken: superTokenAddress(params.vertical),
				indexId: poolID(params.vertical),
				publisher: web3React.account,
				subscriber: "0x16fb96a5fa0427af0c8f7cf1eb4870231c8154b6",
				sender: web3React.account,
			})
			.then((response: any) => {
				console.log(response);
				setProgress("completed");
				setLoadingState(false);
				openNotification("Amount disbursed!");
			})
			.catch((error: any) => {
				console.log(error);
				setLoadingState(false);
			});
	}

	async function ReleaseThePayment() {
		let payment: number = 0;
		setLoadingState(true);
		for (let index = 0; index < params.data.length; index++) {
			const element = params.data[index];
			payment += Number(element[salaryToCheck(params.vertical)].trim());
		}

		// console.log(payment);
		// console.log(web3.utils.toWei(payment.toString(), "ether"));
		// const bob = sf.user({
		// 	address: web3React.account,
		// 	token: superTokenAddress(params.vertical),
		// });
		// await bob
		// 	.distributeToPool({
		// 		poolId: poolID(params.vertical),
		// 		amount: payment * 1e18,
		// 	})
		// 	.then((response: any) => {
		// 		// console.log(response);
		// 		setProgress("completed");
		// 		setLoadingState(false);
		// 		openNotification("Amount disbursed!");
		// 	})
		// 	.catch((error: any) => {
		// 		console.log(error);
		// 		setLoadingState(false);
		// 	});
		// console.log("Payyy " + payment * 1e18);
		// console.log(
		// 	"Payment: " +
		// 		web3.utils.toBN(web3.utils.toWei(payment.toString(), "ether"))
		// );
		var payVal = web3.utils.toBN(web3.utils.toWei(payment.toString(), "ether"));
		await sf.ida
			.distribute({
				superToken: superTokenAddress(params.vertical),
				indexId: poolID(params.vertical),
				amount: payVal.toString(), // amount to distribute
				publisher: web3React.account, // the Publisher
			})
			.then((response: any) => {
				console.log(response);
				setProgress("completed");
				setLoadingState(false);
				openNotification("Amount disbursed!");
			})
			.catch((error: any) => {
				console.log(error);
				setLoadingState(false);
			});
	}

	return (
		<Content
			style={{ padding: "20px 20px", background: "#fff", minHeight: "80vh" }}
		>
			<Space direction="vertical">
				<Space direction="horizontal">
					<UpgradeToken vertical={params.vertical} />
					{progress === "createPool" ? (
						<Button onClick={CreateIndex} type="primary" loading={loadingState}>
							Create Pool
						</Button>
					) : (
						<Button onClick={CreateIndex} disabled>
							Create Pool
						</Button>
					)}
					{progress === "modifyPoolMembers" ? (
						<Space direction="vertical" size="small">
							<Button
								onClick={AddUsersToPool}
								type="primary"
								loading={loadingState}
							>
								Modify Pool Members
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
							Modify Pool Members
						</Button>
					)}

					{progress === "disburseReady" ? (
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
					)}
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
							else return <></>;
						}}
					/>
				</Table>
			</Space>
		</Content>
	);
}

export default VerticalSalary;
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
