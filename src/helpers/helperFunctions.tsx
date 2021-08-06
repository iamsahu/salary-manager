export function poolID(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return process.env.REACT_APP_STAKEDAO_POOLID;

		case "blackPool":
			return process.env.REACT_APP_BLACKPOOL_POOLID;

		case "rektPool":
			return process.env.REACT_APP_REKT_POOLID;

		default:
			return "";
	}
}

export function tokenAddress(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return process.env.REACT_APP_SDT;

		case "blackPool":
			return process.env.REACT_APP_BPT;

		case "rektPool":
			return process.env.REACT_APP_REKTT;

		default:
			return "";
	}
}

export function salaryToCheck(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return "stake dao salary";

		case "blackPool":
			return "blackpool salary";

		case "rektPool":
			return "rekt salary";

		default:
			return "";
	}
}

export function addressToCheck(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return "address contributor superfluid sd for stakedao";

		case "blackPool":
			return "blackpool salary";

		case "rektPool":
			return "rekt salary";

		default:
			return "";
	}
}
