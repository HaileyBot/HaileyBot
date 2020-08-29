module.exports = {
	getPrefix(msg, data) {
		// prettier-ignore
		const prefixes = [
			`<@${msg.client.user.id}> `,
			`<@!${msg.client.user.id}> `,
			msg.client.user.username,
			data.guild?.prefix || msg.client.config.prefix
		];
		let prefix;
		for (const p of prefixes) {
			if (msg.content.startsWith(p)) prefix = p;
		}
		return prefix;
	},

	capitalize(text, all) {
		let r = all ? text.replace(/(?<=\s)\w/g, c => c.toUpperCase()) : text;
		return r.replace(/^\w/, c => c.toUpperCase());
	}
};
