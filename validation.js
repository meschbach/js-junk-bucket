

const {identity} = require("./fn");

function validate( graph ){
	const validator = new Validator();
	if( !graph ){
		validator.error(".", "Given undefined");
	}

	function extractValue(key, keyError, internalize){
		const value = graph[key];
		if( !value ){
			validator.error(key,keyError);
			return;
		}

		let hadError = false;
		const internalized = internalize(value, function (error) {
			validator.error(key, error);
			hadError = true;
		});

		if( hadError ){
			return;
		}
		return internalized;
	}

	return {
		numeric: function(key) {
			return extractValue(key, "numeric", function (value, onError) {
				const parsed = parseInt(value);
				if( isNaN(parsed) ){
					return onError("numeric");
				}
				return parsed
			});
		},
		string: function(key){
			return extractValue(key, "string", identity);
		},
		done: function () {
			return validator;
		}
	};
}

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
	validate,
	Validator
};
