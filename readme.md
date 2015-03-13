# Brisk: Admin

Grant admin access to an application running [Brisk](http://github.com/makesites/brisk/)


## Features

* Plug & play
* Role assignement


## Dependencies

* [Brisk](https://github.com/makesites/brisk)
* [Nodemailer](https://github.com/andris9/Nodemailer)
* [AWS SES](https://aws.amazon.com/ses/)


## Install

Using npm:
```
npm install brisk-admin
```


## Usage

Firstly, sessions need to be already activated in your applications, to allow admin login. Also your AWS credentials need to be loaded in the expected location:
```
req.site.config.api.aws
```

1. Create an admin model that extends the plugin's model
```
var Parent = require("brisk-admin").getModel("admin");

var model = Parent.extend({
	...
});

module.exports = model;

````

2. Initiate the admin middleware in the express config at ```/config/express.js```

```
...
default: {
	...
	use: {
		admin: false // the negative boolean will not execute the function or pass any setup options
		...
	}
	...
}
```

3. Extend your express & handlebars helpers with the ```brisk-admin``` helpers. For example:
```
var Main = require("brisk").getClass("main"),
	Admin = require("brisk-admin").getHelper("handlebars"),
	Parent = Main.inherit(Main, Admin);
```



## Credits

Initiated by [Makis Tracend](http://github.com/tracend)

Distributed through [Makesites](http://makesites.org/)

Released under the [MIT license](http://makesites.org/licenses/MIT)
