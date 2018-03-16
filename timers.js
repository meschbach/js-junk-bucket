const Future = require('./future')
const assert = require('assert')

class LogicalTimerAlarm {
	constructor( when, perform ){
		this.when = when;
		this.perform = perform;
	}

	check( current_term ) {
		return current_term >= this.when;
	}

	handle(){
		this.perform();
	}
}

class LogicalTimer {
	constructor() {
		this.term = 0;
		this.notifications = [];
	}

	//Move forward
	advance( terms = 1 ){
		while( terms >  0 ){
			terms--;
			this.term = this.term + 1;
			const {past,remaining} = this.notifications.reduce( (divide, alarm) => {
				if( alarm.check( this.term )) {
					divide.past.push( alarm )
				} else {
					divide.remaining.push(alarm)
				}
				return divide;
			}, {past: [], remaining: []});

			this.notifications = remaining;
			past.forEach((alarm) => {
				alarm.handle();
			});
		}
	}

	//Client
	notifyIn( terms, alarm ){
		if( terms === undefined ){ throw new Error("Terms must be defined"); }
		const targetTerm = this.term + terms;
		const token = new LogicalTimerAlarm(targetTerm, alarm);
		this.notifications.push( token );
		return token;
	}

	cancel( alarm ){
		this.notifications = this.notifications.filter( item => item != alarm );
	}

	promiseIn( terms, what ) {
		const result = new Future();
		this.notifyIn( terms, () => {
			try {
				const output = what();
				result.accept( output );
			}catch(e){
				result.reject( e );
			}
		});
		return result.promised;
	}
}

class WatchDog {
	constructor( period, expiration, clock ) {
		assert( clock );
		this.clock = clock;
		this.period = period;
		this.expiration = expiration;
		this._set();
	}

	_set(){
		this.alarm = this.clock.notifyIn( this.period, () => {
			this._periodElapsed()
		});
	}

	_periodElapsed(){
		this.expiration();
	}

	reset(){
		this.clock.cancel( this.alarm );
		this._set()
	}

	end() {
		this.clock.cancel( this.alarm );
	}
}

class NodeTimer {
	constructor() {}
	notifyIn( ms, alarm ){
		assert(ms, "ms must be defined");
		const token = setTimeout(alarm, ms);
		return token;
	}

	cancel( alarm ){
		cancelTimeout(alarm);
	}

	promiseIn( terms, what ) {
		const result = new Future();
		this.notifyIn( terms, () => {
			try {
				const output = what();
				result.accept( output );
			}catch(e){
				result.reject( e );
			}
		});
		return result.promised;
	}
}

const defaultNodeTimer = new NodeTimer();
module.exports = {
	defaultNodeTimer,
	defaultTimer: defaultNodeTimer,
	LogicalTimer,
	WatchDog
}
