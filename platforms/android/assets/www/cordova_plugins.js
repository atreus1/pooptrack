cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "id": "cordova-plugin-whitelist.whitelist",
        "pluginId": "cordova-plugin-whitelist",
        "runs": true
    },
    {
        "file": "plugins/org.pbernasconi.progressindicator/www/progressIndicator.js",
        "id": "org.pbernasconi.progressindicator.ProgressIndicator",
        "pluginId": "org.pbernasconi.progressindicator",
        "clobbers": [
            "ProgressIndicator"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.pbernasconi.progressindicator": "1.1.0"
}
// BOTTOM OF METADATA
});