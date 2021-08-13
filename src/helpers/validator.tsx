import Ajv, { JSONSchemaType } from "ajv";
import Web3 from "web3";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);

ajv.addFormat("address", {
	validate: (x: string) => Web3.utils.isAddress(x) || x === "",
});

ajv.addFormat("num", {
	validate: (x: string) => isFinite(Number(x)) || x === "" || x === "0",
});

export interface Payouts {
	address_contributor_superfluid_rekt?: string;
	address_contributor_superfluid_sd_for_blackpool?: string;
	address_contributor_superfluid_sd_for_stakedao?: string;
	allocation?: string;
	base_address?: string;
	blackpool_allocation?: string;
	blackpool_salary?: string;
	field_of_activity?: string;
	future_rekt_allocation?: string;
	monthly_escrow_vesting_in_sdt?: string;
	monthly_escrow_vesting_in_usd?: string;
	monthly_stakedao_superfluid_in_sdt?: string;
	monthly_stakedao_superfluid_in_usd?: string;
	monthly_vesting_bpt_in_usd?: string;
	monthly_vesting_in_bpt?: string;
	name?: string;
	nda_signature_date?: string;
	rekt_allocation?: string;
	rekt_salary?: string;
	sdt_sent_back_to_the_foundation?: string;
	stake_dao_salary?: string;
	start_date?: string;
	superfluid_amound?: string;
	superfluid_duration?: string;
	tg_handle?: string;
	total_compensation?: string;
	total_equity_bonus_usd_month?: string;
	total_equity_sdt?: string;
	total_rewards?: string;
	total_stakedao_equity_in_usd?: string;
	type_of_activity?: string;
	vesting_period__months_?: string;
	vesting_period__months__for_blackpool?: string;
	vesting_period__months__for_rekt?: string;
}

export const schema: JSONSchemaType<Payouts> = {
	type: "object",
	properties: {
		address_contributor_superfluid_rekt: {
			type: "string",
			format: "address",
			nullable: true,
		},
		address_contributor_superfluid_sd_for_blackpool: {
			type: "string",
			format: "address",
			nullable: true,
		},
		address_contributor_superfluid_sd_for_stakedao: {
			type: "string",
			format: "address",
			nullable: true,
		},
		allocation: { type: "string", nullable: true },
		base_address: { type: "string", format: "address", nullable: true },
		blackpool_allocation: { type: "string", format: "num", nullable: true },
		blackpool_salary: { type: "string", format: "num", nullable: true },
		field_of_activity: { type: "string", nullable: true },
		future_rekt_allocation: { type: "string", format: "num", nullable: true },
		monthly_escrow_vesting_in_sdt: {
			type: "string",
			format: "num",
			nullable: true,
		},
		monthly_escrow_vesting_in_usd: {
			type: "string",
			format: "num",
			nullable: true,
		},
		monthly_stakedao_superfluid_in_sdt: {
			type: "string",
			format: "num",
			nullable: true,
		},
		monthly_stakedao_superfluid_in_usd: {
			type: "string",
			format: "num",
			nullable: true,
		},
		monthly_vesting_bpt_in_usd: {
			type: "string",
			format: "num",
			nullable: true,
		},
		monthly_vesting_in_bpt: { type: "string", format: "num", nullable: true },
		name: { type: "string", nullable: true },
		nda_signature_date: { type: "string", nullable: true },
		rekt_allocation: { type: "string", format: "num", nullable: true },
		rekt_salary: { type: "string", format: "num", nullable: true },
		sdt_sent_back_to_the_foundation: {
			type: "string",
			format: "num",
			nullable: true,
		},
		stake_dao_salary: { type: "string", format: "num", nullable: true },
		start_date: { type: "string", nullable: true },
		superfluid_amound: { type: "string", format: "num", nullable: true },
		superfluid_duration: { type: "string", nullable: true },
		tg_handle: { type: "string", nullable: true },
		total_compensation: { type: "string", format: "num", nullable: true },
		total_equity_bonus_usd_month: {
			type: "string",
			format: "num",
			nullable: true,
		},
		total_equity_sdt: { type: "string", format: "num", nullable: true },
		total_rewards: { type: "string", format: "num", nullable: true },
		total_stakedao_equity_in_usd: {
			type: "string",
			format: "num",
			nullable: true,
		},
		type_of_activity: { type: "string", nullable: true },
		vesting_period__months_: { type: "string", format: "num", nullable: true },
		vesting_period__months__for_blackpool: {
			type: "string",
			format: "num",
			nullable: true,
		},
		vesting_period__months__for_rekt: {
			type: "string",
			format: "num",
			nullable: true,
		},
	},
	required: [],
	additionalProperties: false,
};

export const validate = ajv.compile(schema);
