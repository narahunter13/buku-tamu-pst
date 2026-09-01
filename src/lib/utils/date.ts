export const getTodayIsoJakarta = (): string =>
	new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Jakarta',
		year: 'numeric',
		month: '2-digit',
		day: 'numeric'
	}).format(new Date());

export const getNowJakartaParts = (): { visit_date: string; created_at: string } => {
	const now = new Date();
	const visit_date = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Jakarta',
		year: 'numeric',
		month: '2-digit',
		day: 'numeric'
	}).format(now);
	const created_at =
		new Intl.DateTimeFormat('sv-SE', {
			timeZone: 'Asia/Jakarta',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		})
			.format(now)
			.replace(' ', 'T') + '.000+07:00';
	return { visit_date, created_at };
};
