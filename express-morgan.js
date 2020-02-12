const morgan = require("morgan");

function logMorganToContext(context, format, option = {}) {
	return morgan( format, Object.assign(option, {
		stream: {write: (msg) => {
				context.logger.info(msg.trim());
			} }
	} ) );
}

module.exports = {
	logMorganToContext
};
