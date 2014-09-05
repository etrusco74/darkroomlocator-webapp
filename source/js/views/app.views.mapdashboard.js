/**
 * Created with JetBrains WebStorm.
 * User: a.demarchi
 * Date: 08/07/13
 * Time: 14.55
 * To change this template use File | Settings | File Templates.
 */
app.views.mapdashboard = Backbone.View.extend({

    /** init view **/
    initialize: function() {
        console.log('initializing mapdashboard view');
        $(window).on("resize", _.bind(this.resize_map, this));
    },

    /** event for mapdashboard **/
    events: {
        'click #reportList':       'moveToLocation'
    },

    /** render template **/
    render: function() {
        $(this.el).html(this.template());
        $(document).attr('title', 'darkroom locator - find and share darkrooms | ' + this.language.type + ' | ' + this.language.lang);
        return this;
    },

    /** resize google maps div - important: after template rendering **/
    resize_map: function () {

        /** set css heigth **/
        var windowHeight = $(window).height();
        var headerHeight = $('#navbar_content').height();
        var footerHeight = $('#footer_content').height();
        this.$el.find('#map_canvas').height( windowHeight - headerHeight - footerHeight - 50 );
        this.$el.find('#map_sidebar_right_content').height( windowHeight - headerHeight - footerHeight - 50 );

    },

    /** init google maps - important: after template rendering **/
    init_map: function (id) {

        var that = this;
        that.resize_map();

        /** set map opt **/
        var mapOptions = {
            zoom: app.global.init_zoom,
            center: new google.maps.LatLng(that.language.init_lat, that.language.init_lng),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        app.global.map = new google.maps.Map(that.$('#map_canvas').get(0), mapOptions);

        if (typeof id !== 'undefined')
            /** call web service for single report **/
            $.getJSON(app.const.apiurl() + "report/id/" + id , this.refreshMapUI);
        else
            /** call web service for all reports **/
            $.getJSON(app.const.apiurl() + "reports" , this.refreshMapUI);
    },

    /** render report model data to map **/
    renderReportsCollectionToMaps: function (jsonObj) {

        var geocoder = new google.maps.Geocoder();
        var location = jsonObj.lat+','+jsonObj.lng;
        geocoder.geocode( { 'address': location }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                app.global.map.setCenter(results[0].geometry.location);
                switch (jsonObj.km)
                {
                    case "1":
                        app.global.map.setZoom(12);
                        break;
                    case "10":
                        app.global.map.setZoom(10);
                        break;
                    case "50":
                        app.global.map.setZoom(8);
                        break;
                    case "100":
                        app.global.map.setZoom(6);
                        break;
                    case "500":
                        app.global.map.setZoom(5);
                        break;
                    case "1000":
                        app.global.map.setZoom(4);
                        break;
                    case "0":
                        app.global.map.setZoom(2);
                        break;
                    default:
                        app.global.map.setZoom(10);
                        break;
                }
            }
        });

        /** call web service **/
        $.getJSON(app.const.apiurl() + "reports/params/"+jsonObj.lat+"/"+jsonObj.lng+"/"+jsonObj.km+"/"+jsonObj.text+"/"+jsonObj.id , this.refreshMapUI);

    },

    /** refresh map UI **/
    refreshMapUI: function (jsonObj) {

        var that = app.views.mapdashboard.prototype;
        /** clear all markers **/
        app.views.mapdashboard.prototype.clearMarkers();

        var num_reports;

        if (typeof jsonObj === 'undefined') {
            num_reports = 0;
        }
        else{
            if ($.isArray(jsonObj)) {
                num_reports = jsonObj.length;
            }
            else {
                if (typeof jsonObj._id === 'undefined') {
                    num_reports = 0;
                }
                else {
                    var singleObj = jsonObj;
                    var jsonObj =  [singleObj];
                    num_reports = jsonObj.length;
                }
            }
        }

        //(typeof jsonObj.length !== 'undefined') ? num_reports = jsonObj.length : num_reports = 0;
        $('#res_txt').text(num_reports);

        var contentHTMLsidebar = "<div class='accordion' id='accordion1'>";

        /** create all new marker and infoBubble **/
        for(var i=0; i < num_reports; i++) {

            /** set momento date **/
            moment.lang(that.language.lang);
            var reg_date = moment(jsonObj[i].report_date ).fromNow();

            /** set infoBubble content **/
            var tag = [];
            tag =jsonObj[i].keywords;
            var tag_str = '', j;
            for( j = 0; j < tag.length; j++) {
                tag_str += '<span class=\"label label-info\">' + tag[j] + '</span> ';
            }

            var description_lang = '';
            switch (that.language.lang){
                case 'it':
                    description_lang = jsonObj[i].type_id.description_it;
                    break;
                case 'en':
                    description_lang = jsonObj[i].type_id.description_en;
                    break;
                case 'de':
                    description_lang = jsonObj[i].type_id.description_de;
                    break;
                case 'es':
                    description_lang = jsonObj[i].type_id.description_es;
                    break;
                case 'fr':
                    description_lang = jsonObj[i].type_id.description_fr;
                    break;
                default:
                    description_lang = jsonObj[i].type_id.description_en;
                    break;
            }

            var contentHTML = 	"<div id='infoBubble' class='col-lg-12'>" +
                that.language.html_user + " : <span class='label label-success'>" + jsonObj[i].username + "</span><br />" +
                that.language.html_type + " : <span class='label label-info'>" + description_lang + "</span><br />" +
                "<img src='css/img/arrow-left_16.png'> <a href='#" + that.language.lang + "/mapdashboard/id/" + jsonObj[i]._id + "'>" + that.language.html_detail + "</a><br />" +
                that.language.html_location + " : <span class='text-muted'>" + jsonObj[i].region + " ("+ jsonObj[i].province +")</span><br />" +
                that.language.html_description + " : <span class='text-danger'>" + jsonObj[i].description + "</span><br />" +
                that.language.html_note + " : <span class='text-success'>" + jsonObj[i].note + "</span><br />" +
                that.language.html_tag + " : " + tag_str + "<br />" +
                that.language.html_date + " : <span class='text-danger'>" + reg_date + "</span>";

            if ((typeof jsonObj[i].website !== 'undefined') && (jsonObj[i].website != '')) {
                contentHTML += "<br />" + that.language.html_website_pre + " <a href='" + jsonObj[i].website + "' target='_blank'>" + that.language.html_website_in + "</a>";
            }
            if ((typeof jsonObj[i].contact_email !== 'undefined') && (jsonObj[i].contact_email != '')) {
                contentHTML += "<br />" + that.language.html_email_pre + " <a href='mailto:" + jsonObj[i].contact_email + "'>" + that.language.html_email_in + "</a>";
            }
            contentHTML += " </div>";

            /** Add infoBubble on Google Maps **/
            /*
            var infoBubble = new InfoBubble({
                maxWidth: 350,
                minHeight: 200,
                backgroundColor: '#F2F2F2',
                content: contentHTML
            });
            */

            /** Add marker on Google Maps **/
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(jsonObj[i].lat,jsonObj[i].lng),
                map: app.global.map,
                icon : 'css/img/' + jsonObj[i].type_id.value + '.png',
                title: description_lang,
                animation: google.maps.Animation.DROP
            });

            app.global.markers_array.push(marker);

            /** add click on marker event **/
            google.maps.event.addListener(marker, 'click', app.views.mapdashboard.prototype.onMarkerClick(app.views.mapdashboard.prototype.infoBubble, marker, contentHTML));

            /** render sidebar right **/
            var region = jsonObj[i].region;
            if (jsonObj[i].region == '')
                region =  jsonObj[i].province;

            contentHTMLsidebar += "<div class='accordion-group'>"+
                                "      <div class='accordion-heading'>"+
                                "          <a class='accordion-toggle' data-toggle='collapse' data-parent='#accordion1' href='#collapse"+i+"'>"+
                                "         " + jsonObj[i].description + " (" + jsonObj[i].country_short + " - " + region + ")" +
                                "          </a>"+
                                "      </div>"+
                                "      <div id='collapse"+i+"' class='accordion-body collapse'>"+
                                "          <div class='accordion-inner'>" +
                                "<span class='label label-success'>" + jsonObj[i].username + "</span><br />" +
                                "<span class='label label-info'>" + description_lang + "</span><br />" +
                                "<img src='css/img/arrow-left_16.png'> <a href='#' id='reportList' data-lat='"+jsonObj[i].lat+"' data-lon='"+jsonObj[i].lng+"'>" + that.language.html_find + "</a><br />" +
                                "<img src='css/img/arrow-left_16.png'> <a href='#" + that.language.lang + "/mapdashboard/id/" + jsonObj[i]._id + "'>" + that.language.html_detail + "</a><br />" +
                                "<span class='text-muted'>" + jsonObj[i].region + " ("+ jsonObj[i].province +")</span><br />" +
                                "<span class='text-success'>" + jsonObj[i].note + "</span><br />" +
                                "<span class='text-danger'>" + reg_date + "</span>";
                                if ((typeof jsonObj[i].website !== 'undefined') && (jsonObj[i].website != '')) {
                                    contentHTMLsidebar += "<br />" + that.language.html_website_pre + " <a href='" + jsonObj[i].website + "' target='_blank'>" + that.language.html_website_in + "</a> <img src='css/img/arrow-right_16.png'> ";
                                }
                                if ((typeof jsonObj[i].contact_email !== 'undefined') && (jsonObj[i].contact_email != '')) {
                                    contentHTMLsidebar += "<br />" + that.language.html_email_pre + " <a href='mailto:" + jsonObj[i].contact_email + "'>" + that.language.html_email_in + "</a> <img src='css/img/arrow-right_16.png'>";
                                }
            contentHTMLsidebar += "         </div>"+
                                "     </div>"+
                                "</div>";
        }
        contentHTMLsidebar += "</div>";
        $("#map_sidebar_right_content").html(contentHTMLsidebar);
    },

    moveToLocation: function (event){
        event.preventDefault();
        var lat = $(event.target).data('lat');
        var lng = $(event.target).data('lon');
        var center = new google.maps.LatLng(lat, lng);
        app.global.map.panTo(center);
        app.global.map.setZoom(12);
    },

    /** clean all marker **/
    clearMarkers: function() {
        if (app.global.markers_array) {
            for (var i = 0; i < app.global.markers_array.length; i++ ) {
                app.global.markers_array[i].setMap(null);
            }
        }
    },

    /** onMarkerClick event - show infoBubble **/
    onMarkerClick: function(infoBubble, marker, contentHTML) {
        return function() {
            infoBubble.setContent(contentHTML);
            infoBubble.open(app.global.map, marker);
        };
    },

    /** destroy view and unbind all event **/
    destroy_view: function() {
        $(window).off("resize");
        this.undelegateEvents();
        $(this.el).removeData().unbind();
        this.remove();
        Backbone.View.prototype.remove.call(this);
        app.global.dashboardView = null;
    },

    infoBubble : new InfoBubble({
        maxWidth: 350,
        minHeight: 200,
        backgroundColor: '#F2F2F2'
    })

});
