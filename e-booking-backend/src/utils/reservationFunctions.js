export function isRoomOccupied(room) {
	const initialArray = [];

	for (const reservation of room.Reservations) {
		if (!reservation.roomStatus !== "checked-out") {
			for (const el of reservation.DatesIns[reservation.DatesIns.length - 1]
				.datesIn) {
				initialArray.push(new Date(el).toLocaleDateString("fr-FR"));
			}
		} else {
			return {};
		}
	}

	const uniqueDates = [...new Set(initialArray)];
	const today = new Date().toLocaleDateString("fr-FR");
	const yesterday = new Date(
		new Date().getTime() - 24 * 60 * 60 * 1000
	).toLocaleDateString("fr-FR");

	if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
		const occupiedReservation = room.Reservations.find((reservation) => {
			const datesInArray = reservation.DatesIns.flatMap((date) =>
				date.datesIn.map((el) => new Date(el).toLocaleDateString("fr-FR"))
			);

			return datesInArray.includes(today) || datesInArray.includes(yesterday);
		});

		return {
			reservation: occupiedReservation,
			room: room,
		};
	} else {
		return {};
	}
}

export function availableRooms(rooms) {
	let availableRooms = [];

	for (room in rooms) {
		availableRooms.push(isRoomOccupied(room));
	}

	return availableRooms.filter((value) => value !== null);
}
