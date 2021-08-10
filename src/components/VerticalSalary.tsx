import React, { useEffect, useState, useContext } from "react";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import sfcontext from "../helpers/sfcontext";
import statecontext from "../helpers/statecontext";
import PoolCreator from "./PoolCreator";
import Web3 from "web3";
import {
	addressToCheck,
	poolID,
	salaryToCheck,
	tokenAddress,
	accountAddress,
} from "../helpers/helperFunctions";
import { Button, Space, notification, Table } from "antd";
import { dataFormat } from "../helpers/interfaces";
import Column from "antd/lib/table/Column";
import { number } from "yargs";
import { Content } from "antd/lib/layout/layout";
import UpgradeToken from "./UpgradeToken";
declare let window: any;

function VerticalSalary(params: any) {
	const web3React = useWeb3React();

	const [indexData, setIndexData] = useState<Array<any> | null>();
	const [poolExists, setPoolExists] = useState(false);
	const sf = useContext<any>(sfcontext);
	const [state, setState] = useContext(statecontext);
	const [progress, setProgress] = useState("loading");
	const [loadingState, setLoadingState] = useState(false);
	const [newUsers, setNewUsers] = useState(0);
	const [modifyUser, setModifyUser] = useState(0);
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
			axios({
				url: process.env.REACT_APP_GRAPHQL_IDA,
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
						token: tokenAddress(params.vertical),
						indexId: poolID(params.vertical),
					},
				},
			}).then(async (result) => {
				// console.log(result.data.data["indexes"][0]);
				//Based on count determine whether pool needs to be created or not
				//If pool exists
				if (result.data.data["indexes"].length > 0) {
					//Set Index Data
					setIndexData(result.data.data.indexes[0]);
					//Calculate whether new members need to be added
					let usersNot: any[] = FindUsersNotInPool(
						result.data.data.indexes[0],
						true
					);
					console.log(usersNot);
					if (usersNot.length > 0) {
						setProgress("modifyPoolMembers");
					} else {
						setProgress("disburseReady");
					}
				} else {
					setProgress("createPool");
				}
			});
		}
		if (
			web3React.active
			// &&
			// web3React.account === accountAddress(params.vertical)
		) {
			GetData();
		} else {
		}
	}, [web3React.active, web3React.account, poolExists]);

	if (!web3React.active) {
		return <div>Connect Wallet</div>;
	}

	// if (web3React.account !== accountAddress(params.vertical)) {
	// 	return <div>Please connect the stake dao account</div>;
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
		// 	return;
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
								tokenAddress(params.vertical),
								poolID(params.vertical),
								"0x"
							)
							.encodeABI(), // callData
						"0x", // userData
					]
				),
			]);
			// console.log(temp);
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

	function FindUsersNotInPool(_indexData: any, firstLoad = false): any[] {
		let users: any[] = [];
		let notIn: number = 0;
		let mod: number = 0;
		// if (firstLoad) {
		// 	return users;
		// }
		// if (_indexData) {
		// 	for (let index = 0; index < params.data.length; index++) {
		// 		const element = params.data[index];
		// 		users.push({
		// 			address: element[addressToCheck(params.vertical)].toLowerCase(),
		// 			salary: element[salaryToCheck(params.vertical)],
		// 		});
		// 		notIn += 1;
		// 	}
		// 	return users;
		// }

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
					});
					mod += 1;
				}
			}
		}
		setModifyUser(mod);
		setNewUsers(notIn);
		//TODO: Code for finding if any users were removed from the pool
		// console.log(users);
		return users;
	}

	function BatchCallForAddingUsers(users: any[]): any[] {
		let temp: any = [];
		if (users.length <= 0) {
			console.log("Hogaya!");
			return [];
		}
		for (let index = 0; index < users.length; index++) {
			const element = users[index];
			// console.log(poolID(params.vertical));
			temp.push([
				201,
				sf.agreements.ida.address,
				web3.eth.abi.encodeParameters(
					["bytes", "bytes"],
					[
						sf.agreements.ida.contract.methods
							.updateSubscription(
								tokenAddress(params.vertical),
								poolID(params.vertical),
								element["address"],
								element["salary"],
								"0x"
							)
							.encodeABI(), // callData
						"0x", // userData
					]
				),
			]);
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

	async function ReleaseThePayment() {
		let payment: number = 0;
		setLoadingState(true);
		for (let index = 0; index < params.data.length; index++) {
			const element = params.data[index];
			payment += Number(element[salaryToCheck(params.vertical)]);
		}
		// console.log(payment);
		// console.log(web3.utils.toWei(payment.toString(), "ether"));
		const bob = sf.user({
			address: web3React.account,
			token: tokenAddress(params.vertical),
		});
		await bob
			.distributeToPool({
				poolId: poolID(params.vertical),
				amount: web3.utils.toWei(payment.toString(), "ether"),
			})
			.then((response: any) => {
				// console.log(response);
				setProgress("completed");
				setLoadingState(false);
				openNotification("Amount disbursed!");
			})
			.catch((error: any) => {
				console.log(error);
				setLoadingState(false);
			});
		// await sf.ida
		// 	.distribute({
		// 		superToken: tokenAddress(params.vertical),
		// 		indexId: poolID("stalePool"),
		// 		amount: web3.utils.toBN(web3.utils.toWei(payment.toString(), "ether")), // amount to distribute
		// 		publisher: web3React.account, // the Publisher
		// 	})
		// 	.then((response: any) => {
		// 		console.log(response);
		// 		setProgress("completed");
		// 	})
		// 	.catch((error: any) => {
		// 		console.log(error);
		// 	});
	}

	return (
		<Content
			style={{ padding: "20px 20px", background: "#fff", minHeight: "80vh" }}
		>
			<Space direction="vertical">
				<Space direction="horizontal">
					<UpgradeToken />
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
				<Table<dataFormat> dataSource={params.data}>
					<Column title="Name" dataIndex="name" key="name" />
					<Column
						title="Salary"
						dataIndex={salaryToCheck(params.vertical)}
						key={salaryToCheck(params.vertical)}
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
//   indexes(where:{indexId:3,token:"0x0F1D7C55A2B133E000eA10EeC03c774e0d6796e8",publisher:"0xDa1495EBD7573D8E7f860862BaA3aBecebfa02E0"}){
//     subscribers{
//       subscriber
//       totalPendingApproval
//       units
//     }
//   }
// }
