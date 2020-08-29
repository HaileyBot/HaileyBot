const Command = require("../../base/Command.js");

class Ping extends Command {
	constructor(client) {
		super(client, {
			name: "ping",
			description: "view HaileyBot's current network connection speed and processing latency",
			usage: "{prefix}ping",
			dirname: __dirname,
			enabled: true,
			guildOnly: false,
			global: false,
			aliases: ["pong", "latency"],
			memberPermissions: [],
			botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			nsfw: false,
			ownerOnly: false,
			cooldown: 3000
		});
	}

	async run(msg) {
		const m = await msg.channel.send(`${msg.client.config.emojis.loading} **Pinging. . .**`);
		let i = 0,
			s = Date.now();
		while (Date.now() - s <= 1) i++;
		let embed = {
			color: parseInt(msg.client.config.embed.color.split("#")[1], 16),
			description: "**PONG!**",
			fields: [
				{
					name: "Response ​ ​ ​ ​ ​ ​ ​ ​ ​",
					value: `\`\`\`ini\n[ ${m.createdTimestamp - msg.createdTimestamp}ms ]\`\`\``,
					inline: true
				},
				{
					name: "Websocket ​ ​ ​ ​ ​ ​ ​ ​",
					value: `\`\`\`ini\n [ ${Math.floor(msg.client.ws.ping)}ms ]\`\`\``,
					inline: true
				},
				{
					name: "Server TPS",
					value: `${i.toLocaleString()},000 ​ ​ **[?](https://faq.haileybot.com/#tps 'What's this?')**`
				}
			]
		};
		m.edit("", { embed });
	}
}

module.exports = Ping;
