
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
		const targetTerm = this.term + terms;
		this.notifications.push(new LogicalTimerAlarm(targetTerm, alarm));
	}
}

module.exports.LogicalTimer = LogicalTimer