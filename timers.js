const Future = require('./future')

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
		alarm.cancel();
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

module.exports.LogicalTimer = LogicalTimer