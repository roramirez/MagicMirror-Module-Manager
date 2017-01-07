/* Magic Mirror
 * Node Helper: MagicMirror-Moduler-Manager
 *
 * By Rodrigo Ramìrez Norambuena https://rodrigoramirez.com
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require("request");
var url = require("url");
var querystring = require('querystring');
var simpleGit = require("simple-git");
var path = require("path");
var fs = require("fs");
var async = require("async");


module.exports = NodeHelper.create({
	// Override start method.
	start: function() {
		var self = this;

		console.log("Starting node helper for: " + this.name);
		this.extraRoutes();
		this.setConfig();
	},

	setConfig: function() {
		this.config = {};
		this.config.baseUrlApi = 'http://beta.magicmirror.builders/api';
		this.config.limit = 20;
	},

	// Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {
	},

	// create routes for module manager.
	// recive request and send response
	extraRoutes: function() {
		var self = this;

		this.expressApp.get("/module-manager/modules/availables", function(req, res) {
			self.getModulesAvailables(req, res);
		});

		this.expressApp.get("/module-manager/categories", function(req, res) {
			self.getCategories(req, res);
		});

		this.expressApp.get("/module-manager/modules/installed", function(req, res) {
			self.getModulesInstalled(req, res);
		});

		this.expressApp.get("/module-manager/uninstall/:module_name", function(req, res) {
			if (self.removeModule(req.params.module_name)) {
				res.send({status: true});
			} else {
				res.statusCode = 400; //maybe will be good use other HTTP code :)
				res.send({status: false});
			}
		});

		this.expressApp.get("/module-manager/install/:module_id", function(req, res) {

			urlApi = self.config.baseUrlApi + "/module/" + req.params.module_id;

			request({url: urlApi, headers: self.getHeaderRequest()}, function (error, response, body) {
				res.contentType("application/json");
				if (!error && response.statusCode == 200) {
					moduleInfo = JSON.parse(body);
					if (self.cloneRepository(moduleInfo.github_url, moduleInfo.github_name)) {
						// write description file module
						// may is good idea separate into a function this part
						file_description = path.resolve(global.root_path + "/modules/third/" + moduleInfo.github_name + ".json");						var content = JSON.stringify(moduleInfo);
						fs.writeFile(file_description, content, function(err) {
							console.log("here");
							if (err) {
								throw err;
							}
						});
						res.send({status: true});
					} else {
						res.statusCode = 400;
						res.send({status: false});
					}
				} else {
					res.statusCode = response.statusCode;
					res.send({status: false});
				}
			})
		});
	},

	// get modules from API config
	getModulesAvailables: function(req, res) {
		var query = url.parse(req.url, true).query;
		var urlApi = this.config.baseUrlApi + '/module';
		if (Object.keys(query).length > 0) {
			urlApi += "?" + querystring.stringify(query);
		}
		request({uri: urlApi, encoding: null, headers: this.getHeaderRequest()}).pipe(res);
	},

	// get modules from API config
	getCategories: function(req, res) {
		var urlApi = this.config.baseUrlApi + '/category';
		request({uri: urlApi, encoding: null, headers: this.getHeaderRequest()}).pipe(res);
	},

	// list by response the modules installed by MagicMirror-Module-Manager
	// return by response in JSON format.
	getModulesInstalled: function(req, res) {
		directory_third_modules = path.resolve(global.root_path + "/modules/third/");
		var define_modules = this.getDirectories(directory_third_modules).map(function (d) {
		    return directory_third_modules + '/' + d + '.json';
		})

		async.map(define_modules, this.readAsync, function(err, results) {
			var result_json = results.map(function (v) {
				return JSON.parse(v);
			});
			res.send(result_json);
		});
    },

	getHeaderRequest: function() {
		nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
		headers =  {"User-Agent": "Mozilla/5.0 (Node.js "+ nodeVersion + ") MagicMirror/"  + global.version +  " (https://github.com/MichMich/MagicMirror/)"}
		return headers;
	},

	// clone repository pass by params into Third modules directory
	cloneRepository: function(url, name) {
		path_to_clone = path.resolve(global.root_path + "/modules/third/" + name);
		var git = simpleGit();
		git.clone(url, path_to_clone);
		return true;
	},

	// remove directory module
	removeModule: function(name) {
		path_to_remove = path.resolve(global.root_path + "/modules/third/" + name);
		try {
			this.rmDir(path_to_remove);
			fs.unlinkSync(path_to_remove + ".json");
			return true;
		} catch(err) {
			return;
		}
	},

	// code: https://gist.github.com/tkihira/2367067
	rmDir: function(dir) {
		var list = fs.readdirSync(dir);
		for(var i = 0; i < list.length; i++) {
			var filename = path.join(dir, list[i]);
			var stat = fs.statSync(filename);

			if(filename == "." || filename == "..") {
				// pass these files
			} else if(stat.isDirectory()) {
				// rmdir recursively
				this.rmDir(filename);
			} else {
				// rm fiilename
				fs.unlinkSync(filename);
			}
		}
		fs.rmdirSync(dir);
	},

	getDirectories: function(path) {
		return fs.readdirSync(path).filter(function (file) {
			return fs.statSync(path + '/' + file).isDirectory();
		});
	},

	readAsync: function(file, callback) {
	    fs.readFile(file, 'utf8', callback);
	}

});
