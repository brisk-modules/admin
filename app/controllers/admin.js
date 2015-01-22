var Main = require('brisk').getBaseController("main");

var controller = Main.extend({

	index: function(req, res){
		var self = this;

		// data is saved in the client...
		res.data = req.session.client || {};

		// render the page
		this.render( req, res );
	},

	login: function(req, res){
		var self = this;

		// data is saved in the admin...
		res.data = req.session.admin || {};

		// render the page
		this.render( req, res );
	},

	logout: function(req, res){
		var self = this;

		// data is saved in the admin...
		res.data = req.session.admin || {};

		// render the page
		this.render( req, res );
	}

});


module.exports = controller;
