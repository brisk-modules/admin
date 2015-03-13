var _ = require("underscore"),
	Parent = require("brisk").getClass("main");

helper = Parent.extend({

	admin: function( req, res, next ){
		// check if there's admin data in the session
		if( !req.session ) return next();
		if( !req.session.admin ) return next();
		// mirror admin data
		req.admin = req.admin || {};
		req.admin = _.extend( req.admin, req.session.admin );
		// continue...
		next();
	}

});

module.exports = helper;