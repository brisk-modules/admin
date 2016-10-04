var _ = require("underscore"),
	hbs = require('hbs'),
	//gravatar = require("gravatar"),
	Parent = require("brisk").getClass("main");

var helper = Parent.extend({

	setup: function(){
		var Handlebars = this.hbs;

		Handlebars.registerHelper('eq', this.eq);
		Handlebars.registerHelper('formatDate', this.formatDate);

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
	},

	formatDate: function (time) {
		// prerequisites
		if( !time ) return "";
		// variables
		var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var months_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		var date = new Date(time);
		var text = date.getDate() +" "+ months[ date.getMonth() ] +" "+ date.getFullYear();
		return text;
	}

});


module.exports = helper;
