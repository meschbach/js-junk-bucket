const {globalTracer, initGlobalTracer} = require("opentracing");
const expressOpenTracing = require("express-opentracing");
const {initTracerFromEnv} = require('jaeger-client');
const {Future} = require("./future");

function tracingMiddleware() {
	const handler = expressOpenTracing.default({tracer: globalTracer()});
	return handler;
}

function tracingInit(processContext) {
	const config = {
		serviceName: process.env.JAEGER_SERVICE,
		sampler: {
			type: "const",
			param: 1,
		}
	};
	const tracer = initTracerFromEnv(config, {});
	initGlobalTracer(tracer);

	processContext.onCleanup(async () => {
		const future = new Future();
		processContext.logger.info("Waiting for tracer to close");
		tracer.close(() =>  future.accept());
		await future.promised;
		processContext.logger.info("Done");
	});
	return tracer;
}

module.exports = {
	tracingInit,
	tracingMiddleware
};