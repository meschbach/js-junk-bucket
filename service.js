const yargs = require("yargs");
const {formattedConsoleLog} = require("./logging-bunyan");
const {main} = require("./index");

async function doServiceStart( factory, logger ){
	const instance = await factory.launch(logger);

	function stopInstance(){
		instance.stop();
	}

	process.on("SIGINT", stopInstance);
	process.on("SIGTERM", stopInstance);
}

function service( name, factory ){
	const logger = formattedConsoleLog( name );
	main( () => doServiceStart(factory, logger), logger );
}

module.exports = {
	service
};
