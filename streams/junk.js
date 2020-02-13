const {Writable} = require("stream");

class DiscardingWritable extends Writable {
	constructor() {
		super({objectMode:true});
	}
	_write(chunk, encoding, callback) {
		callback();
	}
}

class GatedTransform extends Transform {
	constructor( fn = identity, options ) {
		super(Object.assign({objectMode:true}, options));
		this.gate = fn;
	}

	_transform(data, encoding, callback) {
		if( this.gate(data) ){
			this.push(data);
		}
		callback();
	}
}

class MappingTransform extends Transform {
	constructor( fn = identity, options ) {
		super(Object.assign({objectMode:true}, options));
		this.mapping = fn;
	}

	_transform(data, encoding, callback) {
		const next = this.mapping(data);
		callback(null,next);
	}
}


class FutureMappingTransform extends Transform {
	constructor( fn = identity, options ) {
		super(Object.assign({objectMode:true}, options));
		this.mapping = fn;
	}

	_transform(data, encoding, callback) {
		const next = this.mapping(data);
		next.then((r) => callback(null,r), (e) => callback(e));
	}
}

function expandStream(fn) {
	return new ExpandTransform(fn);
}

class ExpandTransform extends Transform {
	constructor( fn = identity, options ) {
		super(Object.assign({objectMode:true}, options));
		this.expander = fn;
	}

	_transform(data, encoding, callback) {
		Promise.resolve(this.expander(data, (e) => {
			this.push(e);
		})).then(() => callback(), (e) => callback(e));
	}
}

class Top extends Writable {
	constructor() {
		super({objectMode:true});
		this.rank = (o) => o.desire;
		this.limit = 10;
		this.bucket = [];
	}

	_write(chunk, encoding, callback) {
		this.bucket.push(chunk);
		this.bucket.sort((l,r) => r.desire - l.desire );
		this.bucket = this.bucket.slice(0,this.limit);
		callback();
	}
}

module.exports = {
	DiscardingWritable,
	expandStream,
	ExpandTransform,
	FutureMappingTransform,
	GatedTransform,
	MappingTransform,
	Top
};
