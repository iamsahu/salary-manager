import Ajv, { JSONSchemaType } from "ajv";
import Web3 from "web3";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);

ajv.addFormat("address", {
	validate: (x: string) => Web3.utils.isAddress(x) || x === "" || x === "0x",
});

ajv.addFormat("num", {
	validate: (x: string) => isFinite(Number(x)) || x === "" || x === "0",
});

export interface Payouts {
	contributor_address?: string;
	sdt_tokens?: string;
	sdt_lp?: string;
	bpt_tokens?: string;
	bpt_lp?: string;
	state?: string;
}

export const schema: JSONSchemaType<Payouts> = {
	type: "object",
	properties: {
		contributor_address: {
			type: "string",
			format: "address",
			nullable: true,
		},
		sdt_tokens: { type: "string", format: "num", nullable: true },
		sdt_lp: { type: "string", format: "num", nullable: true },
		bpt_tokens: { type: "string", format: "num", nullable: true },
		bpt_lp: { type: "string", format: "num", nullable: true },
		state: { type: "string", nullable: true },
	},
	required: [],
	additionalProperties: false,
};

export const validate = ajv.compile(schema);
