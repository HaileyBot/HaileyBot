const { Client, Collection } = require("discord.js"),
	fs = require("fs"),
	util = require("util"),
	path = require("path");

// Creates HaileyBot class
class HaileyBot extends Client {
	constructor(options) {
		super(options);
		this.config = require("../config"); // Load the config file
		this.commands = new Collection(); // Creates new commands collection
		this.aliases = new Collection(); // Creates new command aliases collection
		this.logger = require("../helpers/logger"); // Load the logger file
		this.wait = util.promisify(setTimeout); // client.wait(1000) - Wait 1 second
		this.functions = require("../helpers/functions"); // Load the functions file
	}

	// This function is used to load a command and add it to the collection
	loadCommand(commandPath, commandName) {
		try {
			const props = new (require(`.${commandPath}${path.sep}${commandName}`))(this);
			props.conf.location = commandPath;
			if (props.init) props.init(this);
			this.commands.set(props.help.name, props);
			props.conf.aliases.forEach(alias => this.aliases.set(alias, props.help.name));
			return;
		} catch (e) {
			this.logger.error(e);
		}
	}

	// This function is used to unload a command
	async unloadCommand(commandPath, commandName) {
		let command;
		if (this.commands.has(commandName)) command = this.commands.get(commandName);
		else if (this.aliases.has(commandName)) command = this.commands.get(this.aliases.get(commandName));
		if (!command) return this.logger.warn(`\`${commandName}\` is not a valid command or alias`);
		// if the command has a "shutdown" script it needs to run before being unloaded
		if (command.shutdown) await command.shutdown(this);
		delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
		return;
	}

	// This function is used to find user data or create it
	async findOrCreateUser(user) {
		let path = `./users/${user}.json`;
		if (!fs.existsSync(path)) path = "./base/User.json";
		let data = JSON.parse(await fs.promises.readFile(path, "utf8"));
		if (!data.id) data.id = user;
		data.save = async function () {
			await fs.promises.writeFile(`./users/${this.id}.json`, JSON.stringify(this, null, "\t"), "utf8");
		};
		if (path === "./base/User.json") await data.save();
		return data;
	}

	// This function is used to find member data or create it
	async findOrCreateMember(guild, user) {
		if (!fs.existsSync(`./members/${guild}`)) await fs.promises.mkdir(`./members/${guild}`);
		let path = `./members/${guild}/${user}.json`;
		if (!fs.existsSync(path)) path = "./base/Member.json";
		let data = JSON.parse(await fs.promises.readFile(path, "utf8"));
		if (!data.gid) data.gid = guild;
		if (!data.id) data.id = user;
		data.save = async function () {
			await fs.promises.writeFile(`./members/${this.gid}/${this.id}.json`, JSON.stringify(this, null, "\t"), "utf8");
		};
		if (path === "./base/Member.json") await data.save();
		return data;
	}

	// This function is used to find guild data or create it
	async findOrCreateGuild(guild) {
		let path = `./guilds/${guild}.json`;
		if (!fs.existsSync(path)) path = "./base/Guild.json";
		let data = JSON.parse(await fs.promises.readFile(path, "utf8"));
		if (!data.id) data.id = guild;
		data.save = async function () {
			await fs.promises.writeFile(`./guilds/${this.id}.json`, JSON.stringify(this, null, "\t"), "utf8");
		};
		if (path === "./base/Guild.json") await data.save();
		return data;
	}

	// This function is used to resolve a user from a string
	async resolveUser(search) {
		let user;
		if (!search || typeof search !== "string") return;
		// Try mention
		if (search.match(/^<@!?(\d+)>$/)) {
			let id = search.match(/^<@!?(\d+)>$/)[1];
			user = this.users.fetch(id).catch(() => {});
			if (user) return user;
		}
		// Try username
		user = this.users.cache.find(u => u.tag === search);
		if (user) return await this.users.fetch(user.id);
		// Try ID
		user = await this.users.fetch(search).catch(() => {});
		return user;
	}

	async resolveMember(search, guild) {
		let member;
		if (!search || typeof search !== "string") return;
		// Try mention
		if (search.match(/^<@!?(\d+)>$/)) {
			let id = search.match(/^<@!?(\d+)>$/)[1];
			member = await guild.members.fetch(id).catch(() => {});
			if (member) return member;
		}
		// Try username
		guild = await guild.fetch();
		member = guild.members.cache.find(m => m.user.tag === search);
		if (member) return member;
		// Try ID
		member = await guild.members.fetch(search).catch(() => {});
		return member;
	}

	async resolveRole(search, guild) {
		let role;
		if (!search || typeof search !== "string") return;
		// Try mention
		if (search.match(/^<@&!?(\d+)>$/)) {
			let id = search.match(/^<@&!?(\d+)>$/)[1];
			role = guild.roles.cache.get(id);
			if (role) return role;
		}
		// Try name
		role = guild.roles.find(r => search === r.name);
		if (role) return role;
		// Try ID
		role = guild.roles.cache.get(search);
		return role;
	}
}

module.exports = HaileyBot;
