/**
 * Created with JetBrains WebStorm.
 * User: a.demarchi
 * Date: 17/04/13
 * Time: 14.55
 * To change this template use File | Settings | File Templates.
 */
app.views.index = Backbone.View.extend({

    /** init view **/
    initialize: function() {
        console.log('initializing index view');
    },

    /** render template **/
    render: function() {
        $(this.el).html(this.template());
        $(document).attr('title', 'darkroom locator - find and share darkrooms | ' + this.language.type + ' | ' + this.language.lang);
        this.$('#mycarousel').carousel({
            interval: 5000
        })

        return this;
    },

    /** destroy view and unbind all event **/
    destroy_view: function() {
        this.undelegateEvents();
        $(this.el).removeData().unbind();
        this.remove();
        Backbone.View.prototype.remove.call(this);
        app.global.indexView = null;
    }

});