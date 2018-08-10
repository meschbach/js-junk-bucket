const yargs = require("yargs");
const {formattedConsoleLog} = require("./logging-bunyan");
const {main} = require("./index");

async function doServiceStart( factory, logger ){
	const instance = factory.launch(logger);

	function stopInstance(){
		instance.stop();
	}

	process.on("SIGINT", stopInstance);
	process.on("SIGTERM", stopInstance);
}

function service( factory ){
	const logger = formattedConsoleLog();
	main( () => doServiceStart(factory, logger), logger );
}

module.exports = {
	service
};
