
class MemoryEventStore {
	constructor( ){
		this._events = [];
	}

	currentVersion(){
		return this._events.length - 1;
	}

	async countRecords(){
		return this._events.length;
	}

	async publish( event ){
		const momento = this._events.length;
		const eventCopy = Object.assign({}, event);
		const immtuableEvent = Object.freeze(eventCopy);
		this._events.push(immtuableEvent);
		return momento;
	}

	async byMomento( momento ){
		return this._events[momento];
	}

	async replay( consumer, fromMomento ){
		if( fromMomento < 0 ){ throw new Error("This will not work on real event stores"); }
		const end = this.currentVersion();
		for( let i = 0; i <= end; i++ ){
			await consumer( i, this._events[i] );
		}
		return this.currentVersion();
	}
}

module.exports = {
	MemoryEventStore
};