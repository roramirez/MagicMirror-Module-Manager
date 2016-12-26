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
		this.config.urlApiModule = 'http://beta.magicmirror.builders/api/module';
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
	},


	// get modules from API config
	getModulesAvailables: function(req, res) {
		var query = url.parse(req.url, true).query;
		var urlApi = this.config.urlApiModule;
		if (Object.keys(query).length > 0) {
			urlApi += "?" + querystring.stringify(query);
		}
		request({uri: urlApi, encoding: null, headers: this.getHeaderRequest()}).pipe(res);
	},


	getHeaderRequest: function() {
		nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
		headers =  {"User-Agent": "Mozilla/5.0 (Node.js "+ nodeVersion + ") MagicMirror/"  + global.version +  " (https://github.com/MichMich/MagicMirror/)"}
		return headers;
	}

});
