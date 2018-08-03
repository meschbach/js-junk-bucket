const {defaultNullLogger} = require("../logging");

describe("Null Logger", function(){
	beforeEach(function(){
		this.logger = defaultNullLogger;
	});

	it( "able to log info", function(){
		this.logger.info("Logs nothing");
	});

	it( "able to log error", function(){
		this.logger.error("because there are use cases (tests)", new Error());
	});

	it( "able to log debug", function(){
		this.logger.debug("Where this is helpful");
	} );

	describe("for a child logger", function(){
		beforeEach( function(){
			this.logger = this.logger.child({some:"stuff"});
		});

		it( "able to log info" , function(){
			this.logger.info("because children");
		});

		it( "able to log error" , function(){
			this.logger.error("are");
		});

		it( "able to log debug", function(){
			this.logger.debug("useful");
		} );
	});
});
