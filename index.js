require("@haileybot/sanitize-role-mentions")();

const fs = require("fs"),
	readdir = fs.readdirSync;

if (!fs.existsSync("./users")) fs.mkdirSync("./users");
if (!fs.existsSync("./members")) fs.mkdirSync("./members");
if (!fs.existsSync("./guilds")) fs.mkdirSync("./guilds");

// Load HaileyBot class (extends Discord.Client)
const HaileyBot = require("./base/HaileyBot");
const client = new HaileyBot({
	disableMentions: "everyone"
});

client.debug = 1;

// Load Commands
const commandDirs = readdir("./commands/");
for (const dir of commandDirs) {
	const commands = readdir(`./commands/${dir}/`).filter(file => file.endsWith(".js"));
	for (const cmd of commands) client.loadCommand(`./commands/${dir}`, cmd);
}

// Load events
const events = readdir("./events/").filter(file => file.endsWith(".js"));
for (const file of events) {
	const eventName = file.split(".")[0];
	const event = new (require(`./events/${file}`))(client);
	client.on(eventName, (...args) => event.run(...args));
	delete require.cache[require.resolve(`./events/${file}`)];
}

// Log Errors and info
client
	.on("disconnect", () => client.logger.warn("Bot is disconnecting . . ."))
	.on("reconnecting", () => client.logger.log("Bot reconnecting . . ."))
	.on("rateLimit", info => client.logger.warn(info))
	.on("error", e => client.logger.error(e))
	.on("shardError", (e, id) => {
		client.logger.error(`Error on shard ${id}:`);
		client.logger.error(e);
	})
	.on("debug", info => {
		const loading = info.match(/\[WS => Shard (\d+)] \[CONNECT]/),
			sessions = info.match(/Remaining: (\d+)$/);
		if (loading) return client.logger.log(`Loading . . .`, { shard: loading[1] });
		if (sessions) return client.logger.debug(`Session ${1000 - parseInt(sessions[1], 10)} of 1000`, { shard: "Manager" });
		if (info.match(/\[WS => Shard \d+] (?:\[HeartbeatTimer] Sending a heartbeat\.|Heartbeat acknowledged, latency of \d+ms\.)/)) return;
		if (info.startsWith("429 hit on route")) return;
		if (client.debug >= 6) client.logger.debug(info);
	})
	.on("warn", info => client.logger.warn(info, { shard: "Manager" }))
	.on("shardReady", id => client.logger.ready("Connected!", { shard: id }))
	.on("shardResume", id => client.logger.ready("Connected!", { shard: id }));

// Log in to Discord
client.login(client.config.token.discord);

process.on("unhandledRejection", err => client.logger.error(err));
