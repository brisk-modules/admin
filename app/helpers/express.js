var _ = require("underscore"),
	Parent = require("brisk").getClass("main");

helper = Parent.extend({

	admin: function( req, res, next ){
		// check if there's admin data in the session
		if( !req.session || !req.session.admin ){
			// nothing to do...
		} else {
			// mirror admin data
			req.admin = req.admin || {};
			req.admin = _.extend( req.admin, req.session.admin );
			// broadcast to the user object (for view logic)
			res.locals.user = res.locals.user || {};
			res.locals.user.admin = true;
		}
		// add methods
		req.isAuthenticated = req.isAuthenticated || function(){
			return ( req.admin && !_.isEmpty( req.admin ) );
		};
		// continue...
		next();
	}

});

module.exports = helper;