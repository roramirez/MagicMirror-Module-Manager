/* global Module, Log, MM, config */

/* Magic Mirror
 * Module: Manager Module
 *
 * By Rodrigo Ramìrez Norambuena https://rodrigoramirez.com
 * MIT Licensed.
 */

Module.register("MagicMirror-Module-Manager", {

	// Set the minimum MagicMirror module version.
	requiresVersion: "2.1.0",

	// Default module config.
	defaults: {
		baseUrlApi: 'http://beta.magicmirror.builders/api',
		limit: 20
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);
	},

	getStyles: function() {
		return ["module-manager.css"];
	},

});
