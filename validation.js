
class Validator {
	constructor() {
		this.result = {};
		this.valid = true;
		this.errors = false;
	}

	error( key, message ){
		this.errors = true;
		this.valid = false;
		if(!this.result.errors){
			this.result.errors = {};
		}
		const cell = this.result.errors[key] || [];
		cell.push(message);
		this.result.errors[key] = cell;
	}

	warn( key, message ){
		if(!this.result.warnings){
			this.result.warnings = {};
		}
		const cell = this.result.warnings[key] || [];
		cell.push(message);
		this.result.warnings[key] = cell;
	}
}

module.exports = {
	Validator
};
