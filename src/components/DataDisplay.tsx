// import { useFilePicker } from "use-file-picker";
import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import CSVReader from "react-csv-reader";
// import axios from "axios";
import VerticalSalary from "./VerticalSalary";
import { Content } from "antd/lib/layout/layout";
import { Payouts, validate } from "../helpers/validator";

const { TabPane } = Tabs;

function DataDisplay(params: any) {
	const [data, setdata] = useState<Array<any> | null>(null);

	function handleForce(params: any) {
		console.log(params);
		let obj2: Payouts[] = [];
		let obj: Payouts[] = params;
		for (let index = 0; index < obj.length; index++) {
			const element = obj[index];
			if (validate(element)) {
				obj2.push(element);
			} else {
				console.log("hello");
				console.log(validate.errors);
			}
		}
		setdata(obj2);
	}
	function handleDarkSideForce(params: any) {
		console.log(params);
	}
	const papaparseOptions = {
		header: true,
		// dynamicTyping: true,
		// skipEmptyLines: true,
		transformHeader: (header: string) =>
			header.toLowerCase().replace(/\W/g, "_"),
	};
	function callback(key: string) {
		console.log(key);
	}
	return (
		<Content
			style={{
				padding: "20px 20px",
				background: "#fff",
			}}
		>
			{/* {data === null ? ( */}
			<>
				<CSVReader
					cssClass="csv-reader-input"
					label="Select CSV"
					onFileLoaded={handleForce}
					onError={handleDarkSideForce}
					parserOptions={papaparseOptions}
					inputId="ObiWan"
					inputName="ObiWan"
					inputStyle={{ color: "red" }}
				/>
				<div>Total {data === null ? "" : data.length} records detected</div>{" "}
				<br />
				<Tabs defaultActiveKey="1" onChange={callback}>
					<TabPane tab="StakeDAO" key="1">
						<VerticalSalary data={data} vertical={"stakePool"} />
					</TabPane>
					<TabPane tab="BlackPool" key="2">
						Coming soon!
					</TabPane>
					<TabPane tab="rekt" key="3">
						Coming soon!
					</TabPane>
				</Tabs>
			</>
		</Content>
	);
}

export default DataDisplay;
