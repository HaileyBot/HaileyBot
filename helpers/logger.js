const chalk = require("chalk"),
	{ black, blueBright, cyanBright, greenBright, grey, magenta, redBright, yellow } = chalk;

chalk.level = 1;

function splice(string, i, r, s) {
	return string.slice(0, i) + s + string.slice(i + Math.abs(r));
}

function pad(value, digits) {
	while (value.toString().length < digits) value = `0${value}`;
	return value;
}

function format(d) {
	return (
		splice(d.getFullYear().toString(), 0, 2, "") +
		"-" +
		pad(d.getMonth() + 1, 2) +
		"-" +
		pad(d.getDate(), 2) +
		" " +
		pad(d.getHours(), 2) +
		":" +
		pad(d.getMinutes(), 2) +
		":" +
		pad(d.getSeconds(), 2) +
		"." +
		pad(d.getMilliseconds(), 3)
	);
}

function typeName(type, color) {
	switch (type) {
		case "warn":
			if (color) return yellow("WRN");
			return "WRN";
		case "error":
			if (color) return redBright("ERR");
			return "ERR";
		case "debug":
			if (color) return magenta("DBG");
			return "DBG";
		case "cmd":
			if (color) return cyanBright("CMD");
			return "CMD";
		case "ready":
			if (color) return greenBright("RDY");
			return "RDY";
		default:
			if (color) return blueBright("LOG");
			return "LOG";
	}
}

class Logger {
	static log(content, options = {}) {
		if (typeof options === "string") options = { type: options };
		if (!options.type) options.type = "log";
		if (!options.shard) options.shard = "Manager";
		if (typeof options.shard === "number" || !isNaN(parseInt(options.shard, 10))) options.shard = `Shard ${options.shard}`;
		if (typeof content !== "string") {
			if (typeof content === "object" && Object.prototype.toString.call(content).match(/\[object (.+)]/)[1] === "Error") {
				content = content.stack;
				options.type = "error";
			} else content = require("util").inspect(content, { depth: 1 });
		}

		let shard = content.match(/^\[(Manager|Shard \d)] /);
		if (shard) {
			content = content.replace(shard[0], "");
			options.shard = shard[1];
		}

		content = content.replace(new RegExp(process.env.PWD, "g"), ".");
		content.split("\n").forEach(sub => {
			// if (sub.length > process.stdout.columns - 28) sub = sub.splice(process.stdout.columns - 28, sub.length, "");
			const date = `[${format(new Date(Date.now()))}]`;
			const m = `${black(date)} ${grey(`[${options.shard}]`)} ${typeName(options.type, true)}\t${sub}`;
			console.log(m);
		});
		// TODO: add code to send logMessage.join("\n") to log channel on Discord
	}

	static error(log, options = {}) {
		options.type = "error";
		this.log(log, options);
	}

	static warn(log, options = {}) {
		options.type = "warn";
		this.log(log, options);
	}

	static debug(log, options = {}) {
		options.type = "debug";
		this.log(log, options);
	}

	static cmd(log, options = {}) {
		options.type = "cmd";
		this.log(log, options);
	}

	static ready(log, options = {}) {
		options.type = "ready";
		this.log(log, options);
	}
}

module.exports = Logger;
