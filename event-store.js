const EventEmitter = require("events");
const {nope} = require("./index");

/**
 * Delays physical event storage operations for a specific period of time.  This creates deterministic timing for
 * low to no delay stores such as the in-memory stored which is useful for testing purposes.
 *
 * @type EventStore.ClockDelayStore
 */
class ClockDelayStore {
	/**
	 * Wraps the target to respond to operations in the given time frame
	 *
	 * @param {EventStore.Storage} target actual implementation to be invoked
	 * @param {Timers.Timer} clock logical clock to be used to meter events
	 * @param {number} saveDelay number of terms to delay save operation
	 * @param {number} allDelay number of terms to delay all query operation
	 */
	constructor( target, clock, saveDelay = 1, allDelay = 15 ){
		this.target = target;
		this.clock = clock;
		this.saveDelay = saveDelay;
		this.allDelay = allDelay;
	}

	async save( record ){
		await this.clock.promiseIn( this.saveDelay, nope );
		return await this.target.save( record );
	}

	async all( ){
		await this.clock.promiseIn( this.allDelay, nope );
		return await this.target.all();
	}

	advanceSave(){
		this.clock.advance(this.saveDelay);
	}
	advanceAll() {
		this.clock.advance(this.allDelay);
	}
}

/**
 * Stores all events in memory and responds to requests immediately.  This was primarily intended for testing and
 * probably not what you want in production.
 *
 * @type EventStore.MemoryStore
 */
class MemoryStore {
	constructor(){
		this.events = [];
	}

	async save( record ) {
		this.events.push( record );
	}

	async all(){
		return [].concat(this.events);
	}
}

/**
 * Provides Event Store semantics around storage and retrieval.
 *
 * @type EventStore.EventStore
 */
class EventStore extends EventEmitter {
	constructor( store ){
		super();
		this.backingStore = store;
	}

	async store( event ) {
		const envelope = Object.freeze({
			v: 0,
			event: event
		});
		await this.backingStore.save( envelope );
		this.emit('stored', envelope);
		return envelope;
	}

	//TODO: This will probably not scale well, especially with disk latency
	async all(){
		return (await this.backingStore.all()).map( (envelope) => envelope.event );
	}

	/**
	 * An interface to create materialized views of the evented data through both filtering and rendering the data.
	 *
	 * @param filter evaluates event envelopes and will only be passed to the view if it's value is `true`
	 * @param view a mechanism to process relevant events
	 * @returns {Promise<void>}
	 */
	async materialized( filter, view ){
		function feedEvent( envelope ){
			if( filter( envelope ) ){
				view( envelope );
			}
		}

		const pastEvents =  await this.backingStore.all();
		pastEvents.forEach( feedEvent );

		this.on('stored', feedEvent);
	}
}

function projector( filter, reducer, state ){
	return function( event ){
		if( filter( event )){
			state = reducer( state, event );
		}
	}
}

module.exports = {
	ClockDelayStore,
	MemoryStore,
	EventStore,
	projector
};
