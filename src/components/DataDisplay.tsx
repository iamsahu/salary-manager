// import { useFilePicker } from "use-file-picker";
import React, { useEffect, useState } from "react";
// import { Button } from "antd";
import CSVReader from "react-csv-reader";
// import axios from "axios";
import StakeDAOSalary from "./StakeDAOSalary";

function DataDisplay(params: any) {
	const [data, setdata] = useState<Array<any> | null>(null);

	// const [openFileSelector, { filesContent, loading, errors }] = useFilePicker({
	// 	accept: ".json",
	// });
	// useEffect(() => {
	// 	function hh() {
	// 		if (filesContent.length > 0) {
	// 			// console.log(filesContent);
	// 			// let test: Payout[] = JSON.parse(filesContent[0]["content"]);
	// 			// console.log(test);
	// 			// let obj: Payouts[] = JSON.parse(filesContent[0]["content"]);
	// 			// let obj2: Payout[] = [];
	// 			// for (let index = 0; index < test.length; index++) {
	// 			// 	const element = test[index];
	// 			// 	if (validate(element)) {
	// 			// 		obj2.push(element);
	// 			// 	}
	// 			// }
	// 			// if (obj2.length === 0) {
	// 			// 	openFailNotification();
	// 			// }
	// 			// setState(obj2);
	// 		}
	// 	}
	// 	hh();
	// }, [filesContent]);

	// if (loading) {
	// 	return <div>Loading...</div>;
	// }

	// if (errors.length) {
	// 	return <div>Some error</div>;
	// }

	function handleForce(params: any) {
		console.log(params);
		setdata(params);
	}
	function handleDarkSideForce(params: any) {
		console.log(params);
	}
	const papaparseOptions = {
		header: true,
		// dynamicTyping: true,
		// skipEmptyLines: true,
		transformHeader: (header: string) => header.toLowerCase(),
	};

	return (
		<div>
			{/* <Button onClick={() => openFileSelector()}>Open the Payout File</Button> */}
			{/* <CSVReader
				onFileLoaded={(data, fileInfo) => console.dir(data, fileInfo)}
			/> */}

			{data === null ? (
				<CSVReader
					cssClass="csv-reader-input"
					label="Select CSV with secret Death Star statistics"
					onFileLoaded={handleForce}
					onError={handleDarkSideForce}
					parserOptions={papaparseOptions}
					inputId="ObiWan"
					inputName="ObiWan"
					inputStyle={{ color: "red" }}
				/>
			) : (
				<>
					<div>Total {data.length} records detected</div> <br />
					<StakeDAOSalary data={data} />
				</>
			)}
		</div>
	);
}

export default DataDisplay;
