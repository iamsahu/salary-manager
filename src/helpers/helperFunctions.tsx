export function poolID(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return process.env.REACT_APP_STAKEDAO_POOLID;
		case "stakePoolLP":
			return process.env.REACT_APP_STAKEDAOLP_POOLID;
		case "blackPool":
			return process.env.REACT_APP_BLACKPOOL_POOLID;
		case "blackPoolLP":
			return process.env.REACT_APP_BLACKPOOLLP_POOLID;
		case "rektPool":
			return process.env.REACT_APP_REKT_POOLID;

		default:
			return "";
	}
}

export function accountAddress(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return process.env.REACT_APP_STAKEDAO_ACCOUNT;
		case "stakePoolLP":
			return process.env.REACT_APP_STAKEDAOLP_ACCOUNT;
		case "blackPool":
			return process.env.REACT_APP_BLACKPOOL_ACCOUNT;
		case "blackPoolLP":
			return process.env.REACT_APP_BLACKPOOLLP_ACCOUNT;
		case "rektPool":
			return process.env.REACT_APP_REKT_ACCOUNT;

		default:
			return "";
	}
}

export function tokenAddress(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return process.env.REACT_APP_RINKEBY_BASE;
		case "stakePoolLP":
			return process.env.REACT_APP_RINKEBY_BASE;
		case "blackPool":
			return process.env.REACT_APP_RINKEBY_BASE;
		case "blackPoolLP":
			return process.env.REACT_APP_RINKEBY_BASE;
		case "rektPool":
			return process.env.REACT_APP_RINKEBY_BASE;

		default:
			return "";
	}
}

export function superTokenAddress(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return process.env.REACT_APP_RINKEBY_SUPER;
		case "stakePoolLP":
			return process.env.REACT_APP_RINKEBY_SUPER;
		case "blackPool":
			return process.env.REACT_APP_RINKEBY_SUPER;
		case "blackPoolLP":
			return process.env.REACT_APP_RINKEBY_SUPER;
		case "rektPool":
			return process.env.REACT_APP_RINKEBY_SUPER;

		default:
			return "";
	}
}

export function salaryToCheck(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return "sdt_tokens";
		case "stakePoolLP":
			return "sdt_lp";
		case "blackPool":
			return "bpt_tokens";
		case "blackPoolLP":
			return "bpt_lp";
		case "rektPool":
			return "rekt_salary";

		default:
			return "";
	}
}

export function addressToCheck(vertical: String): any {
	switch (vertical) {
		case "stakePool":
		case "stakePoolLP":
		case "blackPool":
		case "blackPoolLP":
			return "contributor_address";
		case "rektPool":
			return "rekt_salary";
		default:
			return "yo";
	}
}
