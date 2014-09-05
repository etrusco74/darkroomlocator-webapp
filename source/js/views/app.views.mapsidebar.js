/**
 * Created with JetBrains WebStorm.
 * User: a.demarchi
 * Date: 08/07/13
 * Time: 14.55
 * To change this template use File | Settings | File Templates.
 */
app.views.mapsidebar = Backbone.View.extend({

    /** init view **/
    initialize: function() {
        console.log('initializing map sidebar view');
    },

    /** event for mapsidebar **/
    events: {
        'submit':                   'search',
        'click #btnReset':          'reset'
    },

    /** render template **/
    render: function() {
        $(this.el).html(this.template());

        this.renderTypesCollectionToSelect();

        /** validate form **/
        this.$("#mapsidebarForm").validate({
            rules: {
                geocomplete: "required"
            },
            messages: this.language.form_messages
        });

        return this;
    },

    /** init geocoder **/
    init_geo: function () {

        /** set map for geocomplete **/
        this.$("#geocomplete").geocomplete();

        this.$("#geocomplete").bind("geocode:result", function(event, result){
            console.log(result);
            app.global.lng_txt = result.geometry.location.lng();
            app.global.lat_txt = result.geometry.location.lat();
        });

    },

    /** get JSON obj from geo response elements and report form data  **/
    formToJson: function () {

        var jsonObj = {};

        var lng = app.global.lng_txt;
        var lat = app.global.lat_txt;

        jsonObj.lng = lng;
        jsonObj.lat = lat;
        jsonObj.km = $('#km').val();
        ($('#search').val() == '') ? jsonObj.text = 'null' : jsonObj.text = $('#search').val().replace(' ', '|');
        jsonObj.id = $('#reportTypes').val();

        return jsonObj;
    },

    /** search report **/
    search: function(event) {
        console.log(event);
        event.preventDefault();

        var jsonObj = this.formToJson();

        /** debug **/
        /*
        $('#lat_txt').text('lat: '      + jsonObj.lat);
        $('#lng_txt').text('lng: '      + jsonObj.lng);
        $('#km_txt').text('km: '        + jsonObj.km);
        $('#search_txt').text('key: '   + jsonObj.text);
        $('#type_txt').text('type: '    + jsonObj.id);
        */
        app.global.mapdashboardView.renderReportsCollectionToMaps(jsonObj);
    },

    /** reset form and call all report function **/
    reset: function() {

        /** reset form **/
        app.global.lat_txt = 0;
        app.global.lng_txt = 0;
        $('#geocomplete').val('');
        $('#km').val(0).attr('selected',true);
        $('#reportTypes').val(0).attr('selected',true);
        $('#search').val('');

        /** debug **/
        /*
        var jsonObj = this.formToJson();
        $('#lat_txt').text('lat: '      + jsonObj.lat);
        $('#lng_txt').text('lng: '      + jsonObj.lng);
        $('#km_txt').text('km: '        + jsonObj.km);
        $('#search_txt').text('key: '   + jsonObj.text);
        $('#type_txt').text('type: '    + jsonObj.id);
        */

        /** init map and call all reports **/
        app.global.mapdashboardView.init_map();
    },

    /** render types report model data to select **/
    renderTypesCollectionToSelect: function () {

        var that = this;
        var _typesCollection = new app.collections.types();
        /** GET REPORT TYPE **/
        _typesCollection.fetch({
            success : function(){
                console.log(_typesCollection.models); // => collection have been populated
                for( var i=0 in _typesCollection.models ) {
                    $('#reportTypes')
                        .append($("<option></option>")
                            .attr("value",_typesCollection.models[i].get("_id"))
                            .text(_typesCollection.models[i].get("description_" + that.language.lang).trim())
                        );
                }
            },
            error: function(model, response){
                bootbox.dialog({
                    title: that.language.error_message_type,
                    message: that.language.error_message_type,
                    buttons: {
                        main: {
                            label: that.language.label_button,
                            className: "btn btn-danger",
                            callback: function() {
                                $("body").removeClass("modal-open");
                            }
                        }
                    }
                });
            },
            url: app.const.apiurl() + "types"
        });

    },

    /** destroy view and unbind all event **/
    destroy_view: function() {
        this.undelegateEvents();
        $(this.el).removeData().unbind();
        this.remove();
        Backbone.View.prototype.remove.call(this);
        app.global.mapsidebarView = null;
    }

});
