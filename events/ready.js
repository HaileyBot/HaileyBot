module.exports = class {
	constructor(client) {
		this.client = client;
	}

	async run() {
		let client = this.client;

		// Set client main guild
		client.guild = client.guilds.cache.get(client.config.support.id);

		// Update client status every 15 seconds
		let i = 0;
		client.setInterval(async () => {
			let toDisplay = {
				text: client.config.status[i].name
					.replace("{serversCount}", client.guilds.cache.size.toLocaleString())
					.replace("{userCount}", client.guilds.cache.reduce((p, g) => p + g.memberCount, 0).toLocaleString()),
				type: client.config.status[i].type
			};
			client.user.setActivity(toDisplay.text, { type: toDisplay.type });
			if (client.config.status[i + 1]) i++;
			else i = 0;
		}, 1000 * 15);

		// Logs some information
		client.logger.ready(
			`Connected to ${client.guilds.cache.size.toLocaleString()} servers with ${client.guilds.cache.reduce((p, g) => p + g.memberCount, 0).toLocaleString()} members`,
			{ shard: "Manager" }
		);
	}
};
