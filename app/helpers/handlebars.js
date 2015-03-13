var _ = require("underscore"),
	hbs = require('hbs'),
	//gravatar = require("gravatar"),
	Parent = require("brisk").getClass("main");

var helper = Parent.extend({

	setup: function(){
		var Handlebars = this.hbs;

		Handlebars.registerHelper('eq', this.eq);

		if( Parent.prototype.setup ) return Parent.prototype.setup.call( this );
	},
	/*
	gravatar: function(email, size) {
		if(typeof email == "undefined" || typeof size == "undefined") return "";
		return gravatar.url(email, {s: size}, true);
	},
	*/
	eq: function( a, b ){
		return (a === b) ? arguments[arguments.length-1].fn() : "";
	}
});


module.exports = helper;
