module.exports = {
	// Channels for logging bot events
	// - the bot needs the "Manage Webhooks" perm for "commands" and "dms" channels,
	//   and you will need to manually create a webhook in both those channels
	channel: {
		logging: {
			commands: "655128809363734548",
			dms: "655129087320391726",
			servers: "655129149727309882",
			suggestions: "655129227158487071"
		}
	},
	// The token of your Discord Bot
	token: {
		discord: ""
	},
	// The ID of the support server
	support: {
		id: "413486862175436812"
	},
	// The default prefix for the bot
	prefix: "$-",
	// Embed sidebar colors
	embed: {
		color: "#2c75ff", // default
		red: "#f43e49",
		yellow: "#fea61f",
		green: "#3fb780"
	},
	// Bot owner ID
	owner: {
		id: "306018440639152128"
	},
	// Emojis that the bot uses
	emojis: {
		success: "<:green:498404301560086538>",
		warn: "<:yellow:500980235194466304>",
		error: "<:red:498404302499348481>",

		discord: "<:Discord:661004635225456644>",
		loading: "<a:Loading:644139696699736074>",

		arrow: {
			up: "<:Up:667130796527583262>",
			down: "<:Down:667131240851177492>"
		}
	},
	// Bot status
	status: [
		{
			name: "{serversCount} servers",
			type: "WATCHING"
		},
		{
			name: "{userCount} users",
			type: "LISTENING"
		}
	]
};
