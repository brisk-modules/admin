var _ = require("underscore"),
	crypto = require("crypto"),
	Model = require("brisk").getBaseModel("model");

var model = Model.extend({

	options: {
		archive: true, // by default data is archived and not deleted
		backend: false // customize with your db table
	},

	schema : function(){

		return {
			active: 1,
			cid: (new Model()).createCID(), // common id (publically available)
			email: "", // email is used for authentication
			name: "",
			password: (new model()).autoPassword(),
			role: "master" // options: master, editor, observer
		};

	},

	sync: function(req, res){
		//
	},

	// automatically generate a password
	autoPassword: function(){

		var creds = {};

		// create a seed based on the date and a random number
		var seed = "" + Math.floor( Math.random()*1000000 ) + (new Date()).getTime();
		// create a unique key based on the date (and a random number)
		var password = crypto.createHash('md5').update( seed ).digest("hex");

		return password;
	}

});

module.exports = model;