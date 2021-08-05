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
declare let window: any;
function StakeDAOSalary(params: any) {
	const web3React = useWeb3React();

	const [indexData, setIndexData] = useState<Array<any> | null>();
	const [poolExists, setPoolExists] = useState(false);
	const sf = useContext<any>(sfcontext);
	const [state, setState] = useContext(statecontext);

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
					if (usersNot.length > 0) {
						await BatchCallForAddingUsers(usersNot);
					}
				} else {
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

	if (indexData === undefined && state["stakePool"] === false) {
		return (
			<div>
				<PoolCreator vertical="stakePool" />
			</div>
		);
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
			}
		}
		// console.log(users);
		return users;
	}

	function CompareUnitAllotment(_indexData: any): any[] {
		let users: String[] = [];
		let subscribers = _indexData["subscribers"];
		let temp = [];
		for (let index = 0; index < subscribers.length; index++) {
			const element = subscribers[index];
			let _index = params.data.findIndex(
				(x: any) => x[addressToCheck("stakePool")] === element["subscriber"]
			);
			//If salary not equal
			if (
				params.data[_index][salaryToCheck("stakePool")] !== element["units"]
			) {
				temp.push({
					address: element["subscriber"],
					salary: params.data[_index][salaryToCheck("stakePool")],
				});
			}
		}
		return temp;
	}

	async function BatchCallForAddingUsers(users: any[]) {
		var web3 = new Web3(window.ethereum);
		let temp: any = [];
		if (users.length <= 0) {
			console.log("Hogaya!");
			return;
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

		await sf.host
			.batchCall(temp, { from: web3React.account })
			.then((response: any) => console.log(response))
			.catch((error: any) => console.log(error));
	}

	function ReleaseThePayment() {}

	return <div>StakeDAO!</div>;
}

export default StakeDAOSalary;
//Parse the results
//Fetch data from the IDA
//If there are people missing from the pool show a prompt to add them
//If all the members are added to the pool provide the option of releasing the payment
