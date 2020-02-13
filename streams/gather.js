const {Transform} = require("stream");

/**
 * Groups a specific set of writes together to be dispatched as a single array.
 */
class GatherTransform extends Transform {
	constructor(groupCount, itemTranform = identity ) {
		super({
			objectMode: true
		});
		this.groupCount = groupCount;
		this.pendingGroup = [];
		this.itemTranform = itemTranform;
	}

	_transform(data, encoding, callback){
		const item = this.itemTranform(data);
		this.pendingGroup.push(item);
		if( this.pendingGroup.length >= this.groupCount ){
			this.push(this.pendingGroup);
			this.pendingGroup = [];
		}
		callback(null);
	}

	_flush(callback){
		if( this.pendingGroup.length > 0 ){
			this.push(this.pendingGroup);
			this.pendingGroup = [];
		}
		callback(null);
	}
}

module.exports = {
	GatherTransform
};
