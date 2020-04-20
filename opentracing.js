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

	context.onCleanup(futureCompletion((cb) => {
		tracer.close(cb);
	}));
}

function traceRoot( context, name ){
	const spanName = name || context.name;
	const tracer = context.opentracing.tracer;

	const span = tracer.startSpan(spanName);
	context.opentracing.span = span;
	context.onCleanup(() => {
		contxt.opentracing.span.finish();
	});
}

module.exports = {
	tracingInit,
	traceRoot
};
