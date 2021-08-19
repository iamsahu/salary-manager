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
	sdt?: string;
	0x361a5a4993493ce00f61c32d4ecca5512b82ce90?: string;
	bpt?: string;
	0x6863bd30c9e313b264657b107352ba246f8af8e0?: string;
	sdam3crv?: string;
	0x7d60f21072b585351dfd5e8b17109458d97ec120?: string;
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
		sdt: {
			type: "string",
			format: "address",
			nullable: true,
		},
		0x361a5a4993493ce00f61c32d4ecca5512b82ce90: {
			type: "string",
			format: "num",
			nullable: true,
		},
		bpt: {
			type: "string",
			format: "address",
			nullable: true,
		},
		0x6863bd30c9e313b264657b107352ba246f8af8e0: {
			type: "string",
			format: "num",
			nullable: true,
		},
		sdam3crv: {
			type: "string",
			format: "address",
			nullable: true,
		},
		0x7d60f21072b585351dfd5e8b17109458d97ec120: {
			type: "string",
			format: "num",
			nullable: true,
		},
	},
	required: [],
	additionalProperties: true,
};

export const validate = ajv.compile(schema);
