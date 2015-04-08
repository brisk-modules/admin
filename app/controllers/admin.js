var _ = require('underscore'),
	async = require("async"),
	brisk = require("brisk"),
	bcrypt = require("bcrypt"),
	Parent = brisk.getBaseController("main"),
	Mailer = require("../../index").getHelper("mailer");

var controller = Parent.extend({

	name: "admin",

	options: {
		private: ["isAuthenticated", "onLogin"] // list of inaccessible methods
	},

	// display notifications
	alert: false,

	index: function(req, res){
		// index is accessible only to admins
		if( !this.isAuthenticated(req, res) ) return res.redirect("/");
		// variables
		var config = req.site.config;

		res.locals.admin = req.admin;

		res.view = "admin";
		// support layouts
		if( config.paths.layouts ) res.options = { layout: 'admin' };

		// render the page
		this.render( req, res );
	},

	login: function(req, res){
		// prerequisite
		if( this.isAuthenticated(req, res) ) return res.redirect("/admin");
		// variables
		var self = this;
		var config = req.site.config;

		switch( req.method ){
			case "GET":

				res.view = "admin-login";
				// support layouts
				if( config.paths.layouts ) res.options = { layout: 'admin' };
				//
				this.render( req, res );

			break;
			case "POST":

				this._readAdmin(req, res, function( err, result ){
					if( err ){
						req.flash("error", err);
						return res.redirect("/admin/login");
					}
					// redirect to dashboard
					res.redirect("/admin");
				});

				// trigger onLogin event (with latency, replace with throttling?)
				setTimeout(function(){
					self._onLogin(req, res);
				}, 2000);

			break;
			default:
				// else redirect to the homepage
				return res.redirect('/');
			break;
		}

	},

	config: function(req, res){
		// index is accessible only to admins
		if( !this.isAuthenticated(req, res) ) return res.redirect("/");
		// variables
		var config = req.site.config;

		res.view = "admin-config";
		// support layouts
		if( config.paths.layouts ) res.options = { layout: 'admin' };

		// render the page
		this.render( req, res );
	},

	manage: function(req, res){
		// index is accessible only to admins
		if( !this.isAuthenticated(req, res) ) return res.redirect("/");
		// variables
		var config = req.site.config;

		res.view = "admin-manage";
		// support layouts
		if( config.paths.layouts ) res.options = { layout: 'admin' };

		// render the page
		this.render( req, res );
	},

	register: function(req, res){

		var self = this,
			rendered;
		// this auth state is a bit peculiar  at this page
		// we accept users that are not logged in when there are no admins

		// supporting flash middleware
		this.alert = alerts( req, res );

		var actions = [
			// verify access
			function( done ){
				// if logged in, only masters can register new admins
				if( self.isAuthenticated(req, res) ){
					if( req.admin.role != "master" ){
						return done("not_allowed");
					} else {
						// we're good
						return done();
					}
				}
				// get list of admins
				var db = req.site.models.admin;
				db.findOne({ role: "master" }, function( err, result ){
					// error control?
					if( result ) return done("not_allowed");
					// continue
					done();
				});
			},
			// branch out based on request method
			function( done ){

				switch( req.method ){
					case "GET":

						// variables
						var config = req.site.config;

						res.view = "admin-register";
						// support layouts
						if( config.paths.layouts ) res.options = { layout: 'admin' };
						var db = req.site.models.admin;

						// blanket admin data
						res.locals.admin = new db.schema();

						// render the page
						self.render( req, res );
						rendered = true;
						done();
					break;
					case "POST":
						self._createAdmin(req, res, function( err, result ){
							if( err ) return done( err );
							// continue...
							done();
						});
					break;
					default:
						done("method_not_supported");
					break;
				}

			}
		];

		async.series(actions, function(err, reults){
			if( err ){
				// display error?
				self.alert("error", err);
			}
			if(!rendered) res.redirect("/admin/login");
		});

	},

	logout: function(req, res){
		// delete admin data
		delete req.admin;
		delete req.session.admin;
		// back to the index
		res.redirect("/");
	},

	// delete user account
	"delete" : function(req, res){

		// TBA...

	},

	// Events
	// - when a user has successfullt logged in
	onLogin: function(req, res){

	},

	// Internal

	// - when a user has successfully logged in
	_onLogin: function(req, res){
		// make sure the user is still logged in
		if( !this.isAuthenticated(req, res) ) return;
		// custom events
		this.onLogin(req, res);
	},

	// Private methods

	// admin type authentication lookup
	isAuthenticated: function (req, res){
		// make sure this isPrivate
		// test admin data?
		return ( req.admin && !_.isEmpty( req.admin ) );
	},

	_createAdmin: function(req, res, cb){

		var self = this;
		// (use set() instead)
		var db = req.site.models.admin;
		var admin = _.extend( (new db.schema()), req.body );

		var actions = [

			// validate data
			function( done ){
				// validate response first...
				var valid = self._validateData( admin );
				if( !valid ) return done("not_valid_input");
				// continue...
				done();
			},

			// check if there's an existing admin with that email
			function( done ){
				var db = req.site.models.admin;
				db.findOne({ email: admin.email },
				function( err, result ) {
					// error control?
					if( result ) return done("user_email_exists");
					// continue...
					done();
				});
			},

			// send registration email
			function( done ){
				// re-send verification email
				var mailer = new Mailer( req.site );
				mailer.register(admin, function(err, response){
					if( err ) return done("email_failed");
					// continue...
					done();
				});
			},

			// normalize data
			function( done ){

				// filter data
				delete admin.password_confirm;
				// update the existing user model
				//...
				// update password
				admin.password = self._encryptPassword( admin.password );
				// continue...
				done();

			},

			// create new admin
			function( done ){

				db.create( admin, function( err, result ){
					if( err ) return done("db_create_fail");
					// show alert
					self.alert("success", "Account created. Check your email for the activation link");
					// validate data?
					done();
				});

			}

		];

		// execute
		async.series( actions, function( err, results ){
			if( err ){
				cb( err );
			} else {
				cb( null, admin );
			}
		});

	},

	_readAdmin: function(req, res, cb){

		var self = this;
		var password = req.body.password ,
			admin;

		// get user with that email
		var actions = [
			// get admin with that email
			function( done ){
				var db = req.site.models.admin;
				db.findOne({ email: req.body.email }, function( err, result ){
					// error control?
					if( !result ) return done("admin_not_found");
					admin = result;
					// continue...
					done();
				});
			},

			// compare password
			function( done ){
				// process submitted credentials
				self._comparePassword(password, admin, function(err, response){
					// on error display this
					if( err ) return done( err );
					// continue...
					done();
				});
			},

			// verify data - update session
			function( done ){
				//
				req.session = req.session || {};
				req.session.admin = admin;
				// continue...
				done();
			}
		];

		async.series(actions, function(err, results){
			if( err ) return cb(err);
			//
			cb(null, admin);
		});

	},

	// Internal methods

	_encryptPassword: function( password ){
		// basic password encryption using brypt
		return bcrypt.hashSync( password, 10 );
	},

	_comparePassword: function(password, admin, callback){
		bcrypt.compare(password, admin.password, function(err, result){
			if( result == true ) return callback(null, result);
			return callback("wrong_password" );
		});
	},

	_validateData: function( data ){
		if( _.isEmpty(data.password) || data.password !== data.password_confirm ){
			// show alert
			this.alert("error", "The passwords didn't match");
			return false;
		}
		return true;
	}
});


module.exports = controller;


// Helpers

function alerts( req, res ){
	// this is the method used to alert messages during validation...
	return function( type, message ){
		if( !type ){
			// output
			if( req.flash ){
				res.locals.alerts = req.flash();
			} else{
				// already set...
			}
			return res.locals.alerts;
		} else {
			// support flash middleware
			if( req.flash ){
				req.flash(type, message);
			} else{
				// bare object
				res.locals.alerts = res.locals.alerts || {};
				res.locals.alerts[type] = res.locals.alerts[type] || [];
				res.locals.alerts[type].push(message);
			}
		}
	}
}

module.exports = controller;
