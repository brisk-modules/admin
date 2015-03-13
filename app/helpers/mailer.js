var _ = require('underscore'),
	fs = require("fs"),
	brisk = require("brisk"),
	hbs = require("hbs"),
	nodemailer = require('nodemailer'),
	ses = require('nodemailer-ses-transport'),
	//
	Main = brisk.getClass("main");

var helper = Main.extend({

	options: {
		admin: {}
	},

	data: {}, // convert this to a model?

	init: function( site ){
		// site is not optional in this version...
		this.site = site;
		// load messages (once?)
		this.data.register = {
			text: loadFile( this.site._findFile( "app/views/email-register" ) +".txt" ),
			html: loadFile( this.site._findFile( "app/views/email-register" ) +".html" )
		}
	},

	register: function( admin, cb ){

		var site = this.site.loadConfig('site');

		// check admin details
		admin = admin || {};
		// fallback to options
		admin.name = admin.name || this.options.admin.name || "";
		admin.email = admin.email || this.options.admin.email || false;
		site.url = site.url || this.site.config.url || false;
		// prerequisites
		if( !admin.email || !site.url) return; // all other fields are non-breaking?

		// Create an Amazon SES transport object
		var transport = nodemailer.createTransport(ses({
			accessKeyId: this.site.config.api.aws.key,
			secretAccessKey: this.site.config.api.aws.secret
			//region: "us-east-1" // option?
		}));

		// Message object
		var message = {

			// sender info
			from: site.name +' <'+ site.email +'>',

			// Comma separated list of recipients
			to: '"'+ admin.name +'" <'+ admin.email +'>',

			// Subject of the message
			subject: site.name +': Welcome Admin!', //

			// plaintext body
			text: this.data.register.text({ admin: admin, site: site }),

			// HTML body
			html: this.data.register.html({ admin: admin, site: site }),

			// An array of attachments
			//attachments:[]
		};

		//console.log('Sending Mail', message);

		transport.sendMail(message, function(error, response){
			if(error){
				console.log('Error occured');
				console.log(error.message);
				return cb( error );
			}else{
				//console.log(response);
				//console.log('Message sent successfully!');
				return cb(null, true); // success
			}

		});

	},

	self: function() {
		//return this;
	},


});

// Helpers

function loadFile( file ){
	var string = fs.readFileSync( file, "utf8");
	var template = hbs.compile( string );
	return template;
}


module.exports = helper;
