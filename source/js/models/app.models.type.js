/**
 * Created with JetBrains WebStorm.
 * User: a.demarchi
 * Date: 10/07/13
 * Time: 14.07
 * To change this template use File | Settings | File Templates.
 */
app.models.type = Backbone.Model.extend({
    initialize: function(){
        console.log("initializing report type model");
    },

    sync: function(method, model, options) {
        options = options || {};

        options.crossDomain = true;

        if (options.private) {
            var headers = {
                "X-Requested-With": "XMLHttpRequest",
                "authkey" : app.global.tokensCollection.first().get("auth").authkey,
                "username" : app.global.tokensCollection.first().get("username")
            };
            options.headers = headers;
        }
        else {
            var headers = {
                "X-Requested-With": "XMLHttpRequest"
            };
            options.headers = headers;
        }

        Backbone.sync(method, model, options);
    }
});