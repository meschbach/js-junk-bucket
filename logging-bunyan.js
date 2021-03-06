const bunyan = require("bunyan");

function useColor( env ){
	if( ["false","no","disabled"].includes( env["BUNYAN_COLOR"] ) ) {
		return false;
	}
	return process.stdout.isTTY;
}

function formattedConsoleLog(appName, opts = {}, env = process.env ) {
	const bunyanFormat = require("bunyan-format");


	const logOutputMode = env["BUNYAN_OUTPUT_MODE"] || env["LOG_OUTPUT_MODE"] || "short";
	const maybeUseColor = useColor(env);
	const formattedLogger = bunyanFormat({outputMode: logOutputMode, color: maybeUseColor});

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
