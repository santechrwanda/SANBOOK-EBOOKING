import { asyncWrapper } from "./handlingTryCatchBlocks";
module.exports = async function (x) {
	let firstPart = 0;
	const currentYear = new Date().getFullYear();
	let lastPart = currentYear;
	const lastRecord = await x.findOne({
		order: [["createdAt", "DESC"]],
	});
	if (Object.keys(x.getAttributes()).includes("invoiceGenerated")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.invoiceGenerated.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("proformaGenerated")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.proformaGenerated.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("POGenerated")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.POGenerated.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("cbId")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.cbId.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("salesId")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.salesId.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("serviceSellId")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.serviceSellId.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("bookingId")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.bookingId.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("BonCommandeId")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.BonCommandeId.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("stockRequesitionId")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.stockRequesitionId.split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("enventGenerated")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.enventGenerated.split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("purchaseOrderId")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.purchaseOrderId.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("receiveVOucherID")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.receiveVOucherID.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("transactionId")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.transactionId.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	} else if (Object.keys(x.getAttributes()).includes("vaucherId")) {
		if (lastRecord !== null) {
			firstPart = lastRecord.vaucherId.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	} else {
		if (lastRecord !== null) {
			firstPart = lastRecord.deliveryNoteId.split("_")[1].split("/")[0];
		} else {
			firstPart = 1;
		}
	}
	// Check if the model's year matches the current year
	if (
		lastRecord !== null &&
		new Date(lastRecord.createdAt).getFullYear() === currentYear
	) {
		// If the year is the same, increment the ID by 1
		firstPart = Number(firstPart) + 1;
	} else {
		// If it's a new year, reset the ID to 0
		firstPart = 1;
	}

	const idFormat = `${firstPart.toString().padStart(4, "0")}/${lastPart
		.toString()
		.slice(-2)}`;

	return idFormat;
};
