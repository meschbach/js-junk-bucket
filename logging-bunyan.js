const bunyan = require("bunyan");

//TODO: When not attached to a TTY color should be disabled.
function formattedConsoleLog(appName, opts = {}, env = process.env ) {
	const bunyanFormat = require("bunyan-format");


	const logOutputMode = env["BUNYAN_OUTPUT_MODE"] || env["LOG_OUTPUT_MODE"] || "short";
	const formattedLogger = bunyanFormat({outputMode: logOutputMode});

	const internalLogLevel = env["BUNYAN_LOG_LEVEL"] || env["LOG_LEVEL"] || "info";
	const bunyanOptions = Object.assign({
		name: appName,
		stream: formattedLogger,
		level: internalLogLevel
	}, opts);
	const rootLogger = bunyan.createLogger(bunyanOptions);
	return rootLogger;
}

module.exports = {
	formattedConsoleLog
};
