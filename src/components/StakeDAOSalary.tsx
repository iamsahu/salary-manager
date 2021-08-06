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
} from "../helpers/helperFunctions";
import { Button, Space } from "antd";
declare let window: any;
function StakeDAOSalary(params: any) {
	const web3React = useWeb3React();

	const [indexData, setIndexData] = useState<Array<any> | null>();
	const [poolExists, setPoolExists] = useState(false);
	const sf = useContext<any>(sfcontext);
	const [state, setState] = useContext(statecontext);
	const [progress, setProgress] = useState("loading");
	const [loadingState, setLoadingState] = useState(false);
	var web3 = new Web3(window.ethereum);
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
						token: process.env.REACT_APP_SDT,
						indexId: process.env.REACT_APP_STAKEDAO_POOLID,
					},
				},
			}).then(async (result) => {
				console.log(result.data.data["indexes"][0]);
				//Based on count determine whether pool needs to be created or not
				//If pool exists
				if (result.data.data["indexes"].length > 0) {
					//Set Index Data
					setIndexData(result.data.data.indexes[0]);
					//Calculate whether new members need to be added
					let usersNot: any[] = FindUsersNotInPool(result.data.data.indexes[0]);
					console.log(usersNot.length);
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
			web3React.active &&
			web3React.account === process.env.REACT_APP_STAKEDAO_ACCOUNT
		) {
			GetData();
		} else {
		}
	}, [web3React.active, web3React.account, poolExists]);

	if (!web3React.active) {
		return <div>Connect Wallet</div>;
	}

	if (web3React.account !== process.env.REACT_APP_STAKEDAO_ACCOUNT) {
		return <div>Please connect the stake dao account</div>;
	}

	// if (indexData === undefined && state["stakePool"] === false) {
	// 	return (
	// 		<div>
	// 			<PoolCreator vertical="stakePool" />
	// 		</div>
	// 	);
	// }

	async function CreateIndex() {
		if (sf === null) return;

		if (indexData === undefined) {
			return;
		}
		let usersNot: any[] = FindUsersNotInPool(indexData);
		if (usersNot.length > 0) {
			let temp: any[] = BatchCallForAddingUsers(usersNot);

			temp.unshift([
				201, // create constant flow (10/mo)
				sf.agreements.cfa.address,
				web3.eth.abi.encodeParameters(
					["bytes", "bytes"],
					[
						sf.agreements.ida.contract.methods
							.createIndex(tokenAddress("stakePool"), poolID("stakePool"), "0x")
							.encodeABI(), // callData
						"0x", // userData
					]
				),
			]);
			await sf.host
				.batchCall(temp, { from: web3React.account })
				.then((response: any) => {
					console.log(response);
					// setVisible(false);
					// setConfirmLoading(false);
					setLoadingState(false);
					setProgress("disburseReady");
				})
				.catch((error: any) => {
					console.log(error);
					setLoadingState(false);
				});
		}
		// await sf.ida
		// 	.createIndex({
		// 		superToken: tokenAddress("stakePool"),
		// 		indexId: poolID("stakePool"),
		// 		publisher: web3React.account,
		// 	})
		// 	.then((response: any) => {
		// 		console.log(response);
		// 		// setVisible(false);
		// 		// setConfirmLoading(false);
		// 		setLoadingState(false);
		// 		setProgress("disburseReady");
		// 	})
		// 	.catch((error: any) => {
		// 		console.log(error);
		// 		setLoadingState(false);
		// 	});
	}

	async function AddUsersToPool() {
		if (indexData === undefined) {
			return;
		}
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
				})
				.catch((error: any) => console.log(error));
		}
	}

	function FindUsersNotInPool(_indexData: any): any[] {
		let users: any[] = [];
		let activeSubscribers = _indexData["activeSubscribers"];
		for (let index = 0; index < params.data.length; index++) {
			const element = params.data[index];
			if (
				!activeSubscribers.includes(
					element[addressToCheck("stakePool")].toLowerCase()
				)
			) {
				// console.log("Including");
				users.push({
					address: element[addressToCheck("stakePool")].toLowerCase(),
					salary: element[salaryToCheck("stakePool")],
				});
			} else {
				//Check if the salary is different from what is present in the IDA
				// console.log(element[addressToCheck("stakePool")].toLowerCase());

				let _indexCSV = params.data.findIndex(
					(x: any) =>
						x[addressToCheck("stakePool")].toLowerCase() ===
						element[addressToCheck("stakePool")].toLowerCase()
				);

				let _index = _indexData["subscribers"].findIndex(
					(x: any) =>
						x["subscriber"] ===
						element[addressToCheck("stakePool")].toLowerCase()
				);

				// console.log(_indexCSV);
				// console.log(params.data[_indexCSV][salaryToCheck("stakePool")]);
				// console.log(_indexData["subscribers"][_index]["units"]);
				if (
					params.data[_indexCSV][salaryToCheck("stakePool")] !==
					_indexData["subscribers"][_index]["units"]
				) {
					users.push({
						address: element["subscriber"],
						salary: params.data[_indexCSV][salaryToCheck("stakePool")],
					});
				}
			}
		}
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
			// console.log(poolID("stakePool"));
			temp.push([
				201, // create constant flow (10/mo)
				sf.agreements.ida.address,
				web3.eth.abi.encodeParameters(
					["bytes", "bytes"],
					[
						sf.agreements.ida.contract.methods
							.updateSubscription(
								tokenAddress("stakePool"),
								poolID("stakePool"),
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

	async function ReleaseThePayment() {
		let payment: number = 0;
		for (let index = 0; index < params.data.length; index++) {
			const element = params.data[index];
			payment += Number(element[salaryToCheck("stakePool")]);
		}
		console.log(payment);
		console.log(web3.utils.toWei(payment.toString(), "ether"));
		const bob = sf.user({
			address: web3React.account,
			token: tokenAddress("stakePool"),
		});
		await bob
			.distributeToPool({
				poolId: poolID("stakePool"),
				amount: web3.utils.toWei(payment.toString(), "ether"),
			})
			.then((response: any) => {
				// console.log(response);
				setProgress("completed");
			})
			.catch((error: any) => {
				console.log(error);
			});
		// await sf.ida
		// 	.distribute({
		// 		superToken: tokenAddress("stakePool"),
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
		<div>
			<Space direction="vertical">
				{progress === "createPool" ? (
					<Button onClick={CreateIndex} type="primary">
						Create Pool
					</Button>
				) : (
					<Button onClick={CreateIndex} disabled>
						Create Pool
					</Button>
				)}
				{progress === "modifyPoolMembers" ? (
					<Button onClick={AddUsersToPool} type="primary">
						Modify Pool Members
					</Button>
				) : (
					<Button onClick={AddUsersToPool} disabled>
						Modify Pool Members
					</Button>
				)}
				{progress === "disburseReady" ? (
					<Button onClick={ReleaseThePayment} type="primary">
						Disburse Amount
					</Button>
				) : (
					<Button onClick={ReleaseThePayment} disabled>
						Disburse Amount
					</Button>
				)}
			</Space>
		</div>
	);
}

export default StakeDAOSalary;
//Parse the results
//Fetch data from the IDA
//If there are people missing from the pool show a prompt to add them
//If all the members are added to the pool provide the option of releasing the payment
