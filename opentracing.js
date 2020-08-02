const {Future} = require("./future");

async function futureCompletion( fn ) {
	const future = new Future();
	fn((v) => future.accept(v));
	return await future.promised;
}

function tracingInit( tracer, context ) {
	const patchContext = ( { name, parent, subcontext } ) => {
		subcontext.on("subcontext", patchContext);
		subcontext.opentracing = {
			tracer
		};

		const parentSpan = (parent.opentracing || {}).span;
		if( parentSpan ) {
			const childSpan = tracer.startSpan(name, { childOf: parentSpan });
			subcontext.opentracing.span = childSpan;
			subcontext.onCleanup(() => {
				childSpan.finish();
			});
		}
	};

	patchContext({ parent: {}, subcontext: context });

	context.onCleanup(() => futureCompletion((cb) => {
		tracer.close(cb);
	}));
}

function traceRoot( context, name ){
	const spanName = name || context.name;
	const tracer = context.opentracing.tracer;

	const span = tracer.startSpan(spanName);
	context.opentracing.span = span;
	context.onCleanup(() => span.finish() );
	return span;
}

/**
 * Logs an error against the traced context in the standard OepnTracing format.
 *
 * @param context {Context} context to log too
 * @param err {Error} the error to be logged
 * @param details {any} any additional details to be added to the trace.
 */
function traceError(context, err, details = {}){
	const span = context.opentracing.span;
	traceErrorSpan(span, err, details)
}

/**
 * Logs the given Error in the standard format for OpenTracing
 *
 * @param span {Span} OpenTracing span to record against
 * @param err {Error} error to be logged
 * @param details {any} additional fields to be logged
 */
function traceErrorSpan( span, err, details = {} ) {
	span.setTag("error",true);
	span.log(Object.assign({
		'event': 'error',
		'error.object': err,
		'message': err.message,
		'stack': err.stack
	}, details));
}

module.exports = {
	tracingInit,
	traceRoot,
	traceError,
	traceErrorSpan
};
