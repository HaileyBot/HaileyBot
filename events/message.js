const xpCooldown = {},
	cmdCooldown = {};

module.exports = class {
	constructor(client) {
		this.client = client;
	}

	async run(msg) {
		if (msg.author.bot) return;

		const client = this.client,
			e = client.config.emojis;

		const data = {};
		data.config = client.config;
		data.userData = await client.findOrCreateUser(msg.author.id);

		if (msg.guild) {
			data.guild = await client.findOrCreateGuild(msg.guild.id);
			// If the member on a guild is invisible or not cached, fetch them.
			if (!msg.member) await msg.guild.members.fetch(msg.author.id);
			data.memberData = await client.findOrCreateMember(msg.guild.id, msg.author.id);

			await updateXp(msg, data);
		} else {
			(await client.channels.cache.get(client.config.channel.logging.dms).fetchWebhooks()).first().send(msg.content, {
				username: msg.author.tag,
				avatarURL: msg.author.displayAvatarURL({ format: "png" })
			});
		}

		// Check if the bot was mentionned
		if (msg.channel.permissionsFor(client.user.id).has("SEND_MESSAGES")) {
			if (msg.content.match(new RegExp(`^<@!?${client.user.id}>$`))) return msg.reply(`the prefix in this server is ${data.guild?.prefix || client.config.prefix}`);
		}

		// Gets the prefix
		let prefix = client.functions.getPrefix(msg, data);
		if (!prefix) return;

		let args = msg.content
			.slice(typeof prefix === "string" ? prefix.length : 0)
			.trim()
			.split(/ +/g);
		let command = args.shift().toLowerCase();
		let cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

		if (!cmd) return;

		if (cmd.conf.guildOnly && !msg.guild) return msg.channel.send(`${e.error} | This command is only available on a server!`).catch(() => {});

		if (msg.guild) {
			let neededPermission = [];
			for (const perm of cmd.conf.botPermissions) {
				if (!msg.channel.permissionsFor(msg.guild.me).has(perm)) neededPermission.push(perm);
			}
			if (neededPermission.length > 0)
				return msg.channel
					.send(`${e.error} | I need the following permissions to perform this command: \`${neededPermission.map(p => `\`${p}\``).join(", ")}\``)
					.catch(() => {});

			neededPermission = [];
			for (const perm of cmd.conf.memberPermissions) {
				if (!msg.channel.permissionsFor(msg.member).has(perm)) neededPermission.push(perm);
			}
			if (neededPermission.length > 0)
				return msg.channel
					.send(`${e.error} | You do not have the necessary permissions to perform this command (\`${neededPermission.map(p => `\`${p}\``).join(", ")}\`)`)
					.catch(() => {});

			if (data.guild.ignoredChannels?.includes(msg.channel.id))
				return msg.delete() && msg.author.send(`${e.error} | Commands are disabled in ${msg.channel}`).catch(() => {});

			if (!msg.channel.nsfw && cmd.conf.nsfw) return msg.channel.send(`${e.error} | This command can only be executed in NSFW channels!`).catch(() => {});
		}

		if (cmd.conf.ownerOnly && msg.author.id !== client.config.owner.id) return;

		let uCooldown = cmdCooldown[msg.author.id];
		if (!uCooldown) {
			cmdCooldown[msg.author.id] = {};
			uCooldown = cmdCooldown[msg.author.id];
		}
		let time = uCooldown[cmd.help.name] || 0;
		if (time && time > Date.now())
			return msg.channel.send(`${e.error} | You must wait **${Math.ceil((time - Date.now()) / 1000)}** second(s) to be able to run this command again!`).catch(() => {});
		cmdCooldown[msg.author.id][cmd.help.name] = Date.now() + cmd.conf.cooldown;

		client.logger.cmd(
			`${client.functions.capitalize(cmd.help.name)} Command Executed\n\t${msg.author.id}\t${msg.author.tag}\n\t${msg.channel.id}\t#${msg.channel.name}${
				msg.guild ? `\n\t${msg.guild.id}\t${msg.guild.name}` : ""
			}${client.debug >= 2 ? `\n\t${msg.id}\t${msg.content.replace(/\n/g, "\n\t\t\t\t")}` : ""}`,
			{ shard: msg.guild?.shard.id ?? 0 }
		);

		(await client.channels.cache.get(client.config.channel.logging.commands).fetchWebhooks()).first().send(msg.content, {
			username: msg.author.tag,
			avatarURL: msg.author.displayAvatarURL({ format: "png" })
		});

		try {
			await cmd.run(msg, args, data);
		} catch (e) {
			client.logger.error(e, { shard: msg.guild?.shard.id ?? 0 });
			return msg.channel.send(`${e.error} | An error has occurred, please try again later.`);
		}
	}
};

async function updateXp(msg, data) {
	// Gets the user informations
	let points = parseInt(data.memberData.exp);
	let level = parseInt(data.memberData.level);

	// if the member is already in the cooldown db
	let isInCooldown = xpCooldown[msg.author.id];
	if (isInCooldown && isInCooldown > Date.now()) return;
	// Records in the database the time when the member will be able to win xp again (3min)
	let toWait = Date.now() + 60000;
	xpCooldown[msg.author.id] = toWait;

	// Gets a random number between 10 and 5
	let won = Math.floor(Math.random() * 5) + 5;
	let newXp = parseInt(points + won, 10);

	// calculation how many xp it takes for the next new one
	let neededXp = 5 * (level * level) + 80 * level + 100;

	// check if the member up to the next level
	if (newXp > neededXp) data.memberData.level = parseInt(level + 1, 10);

	// Update user data
	data.memberData.exp = parseInt(newXp, 10);
	await data.memberData.save();
}
