const {Future} = require("./future");

async function futureCompletion( fn ) {
	const future = new Future();
	fn((v) => future.accept(v));
	return await future.promised;
}

function tracingInit( tracer, context ) {
	const patchContext = ( { parent, subcontext } ) => {
		subcontext.on("subcontext", patchContext);
		subcontext.opentracing = {
			tracer
		};

		const parentSpan = (parent.opentracing || {}).span;
		if( parentSpan ) {
			const childSpan = tracer.startSpan(subcontext.name, { childOf: parentSpan });
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

function traceError(context, err, details = {}){
	const span = context.opentracing.span;
	span.setTag("error",true);
	span.log({'event': 'error', 'error.object': err, 'message': err.message, 'stack': err.stack});
	Object.keys(details).forEach((k) => span.setTag(k,details[k]));
}

module.exports = {
	tracingInit,
	traceRoot,
	traceError
};
