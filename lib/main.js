var Module = require("brisk").getHelper("module"),
	_ = require("underscore");

var defaults = require("../config/default");

var Main = Module.extend({
	dir : __dirname,

	// override with config file...
	config : function( options ){

		// get custom config
		options = options || {};

		return _.extend({}, defaults, {

		}, options);

	}

});


module.exports = new Main();