export function poolID(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return process.env.REACT_APP_STAKEDAO_POOLID;
			break;
		case "blackPool":
			return process.env.REACT_APP_BLACKPOOL_POOLID;
			break;
		case "rektPool":
			return process.env.REACT_APP_REKT_POOLID;
			break;
		default:
			return "";
			break;
	}
}

export function tokenAddress(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return process.env.REACT_APP_SDT;
			break;
		case "blackPool":
			return process.env.REACT_APP_BPT;
			break;
		case "rektPool":
			return process.env.REACT_APP_REKTT;
			break;
		default:
			return "";
			break;
	}
}

export function salaryToCheck(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return "stake dao salary";
			break;
		case "blackPool":
			return "blackpool salary";
			break;
		case "rektPool":
			return "rekt salary";
			break;
		default:
			return "";
			break;
	}
}

export function addressToCheck(vertical: String): any {
	switch (vertical) {
		case "stakePool":
			return "address contributor superfluid sd for stakedao";
			break;
		case "blackPool":
			return "blackpool salary";
			break;
		case "rektPool":
			return "rekt salary";
			break;
		default:
			return "";
			break;
	}
}
