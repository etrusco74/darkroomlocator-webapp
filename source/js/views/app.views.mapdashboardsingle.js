/**
 * Created with JetBrains WebStorm.
 * User: a.demarchi
 * Date: 08/07/13
 * Time: 14.55
 * To change this template use File | Settings | File Templates.
 */
app.views.mapdashboardsingle = Backbone.View.extend({

    /** init view **/
    initialize: function() {
        console.log('initializing mapdashboardsingle view');
    },

    /** render template **/
    render: function() {
        $(this.el).html(this.template());
        $(document).attr('title', 'darkroom locator - find and share darkrooms | ' + this.language.type + ' | ' + this.language.lang);
        return this;
    },

    /** resize google maps div - important: after template rendering **/
    resize_map: function () {

        /** set css dim **/
        var divWidth = $('#map_canvas_div').width();
        this.$el.find('#map_canvas').height( 250 );
        this.$el.find('#map_canvas').width( divWidth );

    },

    /** init google maps - important: after template rendering **/
    init_map: function (id) {
        var that = this;
        that.resize_map();
        $.getJSON(app.const.apiurl() + "report/id/" + id , this.refreshMapUI);
        $("#slider_div").hide();
        that.renderImagesCollectionToUl(id);
    },

    /** refresh map UI **/
    refreshMapUI: function (jsonObj) {

        var that = app.views.mapdashboardsingle.prototype;

        /** set moment date **/
        moment.lang(that.language.lang);
        var reg_date = moment(jsonObj.report_date ).fromNow();

        /** permalink **/
        var login       = that.language.bitly_login,
            api_key     = that.language.bitly_apikey,
            long_url    = that.language.bitly_long_url + jsonObj._id;

        that.get_short_url(long_url, login, api_key, function(short_url) {

            /** set infoBubble content **/
            var tag = [];
            tag =jsonObj.keywords;
            var tag_str = '', j;
            for( j = 0; j < tag.length; j++) {
                tag_str += '<span class=\"label label-info\">' + tag[j] + '</span> ';
            }

            var description_lang = '';
            switch (that.language.lang){
                case 'it':
                    description_lang = jsonObj.type_id.description_it;
                    break;
                case 'en':
                    description_lang = jsonObj.type_id.description_en;
                    break;
                case 'de':
                    description_lang = jsonObj.type_id.description_de;
                    break;
                case 'es':
                    description_lang = jsonObj.type_id.description_es;
                    break;
                case 'fr':
                    description_lang = jsonObj.type_id.description_fr;
                    break;
                default:
                    description_lang = jsonObj.type_id.description_en;
                    break;
            }

            var headerHTMLright = that.language.html_header_panel_right;
            var headerHTMLbottom = that.language.html_header_panel_bottom;

            var contentHTMLright = 	"<p>" +
                that.language.html_user + " : <span class='label label-success'>" + jsonObj.username + "</span><br />" +
                that.language.html_type + " : <span class='text-primary'>" + description_lang + "</span><br />" +
                that.language.html_location + " : <span class='text-muted'>" + jsonObj.region + " ("+ jsonObj.province +")</span><br />" +
                that.language.html_description + " : <span class='text-danger'>" + jsonObj.description + "</span><br />" +
                that.language.html_note + " : <span class='text-success'>" + jsonObj.note + "</span></p>";

            var contentHTMLbottom = 	"<p>" +
                tag_str + "<br /><br />" +
                that.language.html_date + " : <span class='text-danger'>" + reg_date + "</span>";

            if ((typeof jsonObj.website !== 'undefined') && (jsonObj.website != '')) {
                contentHTMLbottom += "<br />" + that.language.html_website_pre + " <a href='" + jsonObj.website + "' target='_blank'>" + that.language.html_website_in + "</a>";
            }
            if ((typeof jsonObj.contact_email !== 'undefined') && (jsonObj.contact_email != '')) {
                contentHTMLbottom += "<br />" + that.language.html_email_pre + " <a href='mailto:" + jsonObj.contact_email + "'>" + that.language.html_email_in + "</a>";
            }
            contentHTMLbottom += "<br /> <b>permalink</b> <input type='text' value='"+short_url+"' onClick='this.focus();this.select();' />" +
            " </p>";


            $("#map_sidebar_single_header_right").html(headerHTMLright);
            $("#map_sidebar_single_header_bottom").html(headerHTMLbottom);

            $("#map_sidebar_single_content_right").html(contentHTMLright);
            $("#map_sidebar_single_content_bottom").html(contentHTMLbottom);


            /** set map opt **/
            var myLatlng = new google.maps.LatLng(jsonObj.lat,jsonObj.lng);
            var mapOptions = {
                zoom: 12,
                center: myLatlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            app.global.map = new google.maps.Map($('#map_canvas').get(0), mapOptions);

            /** Add marker on Google Maps **/
            var marker = new google.maps.Marker({
                position: myLatlng,
                icon : 'css/img/' + jsonObj.type_id.value + '.png',
                title:description_lang
            });
            marker.setMap(app.global.map);

        });
    },

    /** create a bit.ly url **/
    get_short_url: function(long_url, login, api_key, func) {
        $.getJSON(
            "http://api.bitly.com/v3/shorten?callback=?",
            {
                "format": "json",
                "apiKey": api_key,
                "login": login,
                "longUrl": long_url
            },
            function(response)
            {
                func(response.data.url);
            }
        );
    },

    /** render images model data to ul **/
    renderImagesCollectionToUl: function (id) {

        var that = this;
        var _imagesCollection = new app.collections.images();

        /** GET IMAGES **/
        _imagesCollection.fetch({
            success : function(){
                console.log(_imagesCollection.models); // => collection have been populated

                /** manage images **/
                $("#slider").empty();
                var imgArr = _imagesCollection.models[0].get("data").resources;
                if (imgArr.length > 0 ) $("#slider_div").show();
                imgArr.forEach(function(image) {
                    console.log(image);
                    $("#slider").append( '<li><img src="'+image.url+'"></li>' );
                });

                $("#slider").responsiveSlides({
                    maxwidth: 350,
                    speed: 800
                });

            },
            error: function(model, response){
                bootbox.dialog({
                    title: that.language.error_message,
                    message: that.language.error_message,
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
            url: app.const.apiurl() + "images/dir/" + id
        });

    },

    /** destroy view and unbind all event **/
    destroy_view: function() {
        this.undelegateEvents();
        $(this.el).removeData().unbind();
        this.remove();
        Backbone.View.prototype.remove.call(this);
        app.global.mapdashboardsingleView = null;
    }

});
