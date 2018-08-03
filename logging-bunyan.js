const bunyan = require("bunyan");

function formattedConsoleLog( opts = {} ){
	const bunyanFormat = require("bunyan-format");
	const formattedLogger = bunyanFormat({outputMode: 'short'});

	const bunyanOptions = Object.assign({
		stream: formattedLogger,
		level: debug
	}, opts );
	const rootLogger = bunyan.createLogger(bunyanOptions);
	return rootLogger;
}

module.exports = {
	formattedConsoleLog
}
