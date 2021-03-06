/** app namespace **/
app = {

	    /** namespaces **/
        collections: {},
        models: {},
        routers: {},
        views: {},

        /** app utils **/
        utils: {

            init: function (startup) {
                app.utils.loadTemplate(['index', 'login', 'registration', 'profile', 'dashboard', 'footer', 'navbar', 'sidebar', 'report', 'mapdashboard', 'mapdashboardsingle', 'mapsidebar', 'credits', 'project', 'password', 'resend', 'activate', 'error', 'adlarge', 'admedium', 'adsmall', 'help'], function() {
                    app.utils.loadLanguage(['index', 'login', 'registration', 'profile', 'dashboard', 'footer', 'navbar', 'sidebar', 'report', 'mapdashboard', 'mapdashboardsingle', 'mapsidebar', 'credits', 'project', 'password', 'resend', 'activate', 'error', 'help'], function() {
                        if (startup) {
                            app.router = new app.routers.router();
                            try {Backbone.history.start();} catch(ex) { ; }
                        }
                        else
                            app.routers.router.prototype.index();
                    });
                });
            },

            loadTokens: function() {
                app.global.tokensCollection = new app.collections.tokens();
                app.global.tokensCollection.fetch();
            },

            getLanguage: function() {

                /** get language - local or default **/
                app.global.languagesCollection = new app.collections.languages();
                app.global.languagesCollection.fetch();
                var lang = app.global.default_language();
                if (app.global.languagesCollection.length > 0) {
                    lang = app.global.languagesCollection.at(0).get("lang");
                    if ($.inArray(lang, app.languages) == -1)  {
                        lang = app.global.default_language();
                        this.setLanguage(lang);
                    }
                }
                else {
                    this.setLanguage(lang);
                }
                return lang;
            },

            setLanguage: function(lang){
                /** reset old language **/
                app.global.languagesCollection = new app.collections.languages();
                app.global.languagesCollection.fetch();
                if (app.global.languagesCollection.length > 0) {
                    app.global.languagesCollection.each(function(model) { model.destroy(); } );
                }
                /** set new language **/
                if (!(_.contains(app.languages, lang))){
                    lang = app.global.default_language();
                }
                var _model = new app.models.language({lang: lang});
                app.global.languagesCollection.add(_model);
                _model.save();
            },

            loadTemplate: function(views, callback) {
                var lang = app.utils.getLanguage();

                var deferreds = [];
                $.each(views, function(index, view) {
                    if (app.views[view]) {

                        /** load template **/
                        deferreds.push($.get('js/templates/' + lang + '/app.templates.' + view + '.html', function(data) {
                            app.views[view].prototype.template = _.template(data);
                        }));

                    } else {
                        alert(view + " not found");
                    }
                });
                $.when.apply(null, deferreds).done(callback);
            },

            loadLanguage: function(views, callback) {
                var lang = app.utils.getLanguage();

                var deferredLanguages = [];
                $.each(views, function(index, view) {
                    if (app.views[view]) {

                        /** load language const **/
                        deferredLanguages.push($.getJSON('js/languages/' + lang + '/app.languages.' + view + '.json', function(dataLang) {
                            app.views[view].prototype.language = dataLang;
                        }));

                    } else {
                        alert(view + " not found");
                    }
                });
                $.when.apply(null, deferredLanguages).done(callback);
            },

            destroyViews: function(){
                /** public view **/
                if (app.global.indexView) { app.global.indexView.destroy_view(); }
                if (app.global.navbarView) { app.global.navbarView.destroy_view();}
                if (app.global.footerView) { app.global.footerView.destroy_view();  }
                if (app.global.loginView) { app.global.loginView.destroy_view(); }
                if (app.global.registrationView) { app.global.registrationView.destroy_view(); }
                if (app.global.mapdashboardView) { app.global.mapdashboardView.destroy_view(); }
                if (app.global.mapdashboardsingleView) { app.global.mapdashboardsingleView.destroy_view(); }
                if (app.global.mapsidebarView) { app.global.mapsidebarView.destroy_view(); }
                if (app.global.creditsView) { app.global.creditsView.destroy_view(); }
                if (app.global.helpView) { app.global.helpView.destroy_view(); }
                if (app.global.projectView) { app.global.projectView.destroy_view(); }
                if (app.global.activateView) { app.global.activateView.destroy_view(); }
                if (app.global.resendView) { app.global.resendView.destroy_view(); }
                if (app.global.errorView) { app.global.errorView.destroy_view(); }
                /** private view **/
                if (app.global.dashboardView) { app.global.dashboardView.destroy_view(); }
                if (app.global.sidebarView) { app.global.sidebarView.destroy_view(); }
                if (app.global.profileView) { app.global.profileView.destroy_view();  }
                if (app.global.reportView) { app.global.reportView.destroy_view();  }
                if (app.global.passwordView) { app.global.passwordView.destroy_view();  }
            }
        },

        /** app config **/
        const: {
            //env : 'development',
            //env : 'test',
            env : 'production',
            weburl : function() {
                var url;
                switch(this.env) {
                    case'development':
                        url = 'http://your_dev_server/'
                        break;
                    case 'test':
                        url = 'http://your_test_server/'
                        break;
                    default:
                        url = 'http://your_production_server/''
                }
                return url;
            },
            apiurl : function() {
                return this.weburl() + 'api/';
            },
            version : '1.0.0'
        },

        /** app global var **/
        global: {
            /** public map - mapdashboard **/
            map : null,
            markers_array : [],
            init_zoom: 6,
            type_value : '1',
            lat_txt : 0,
            lng_txt : 0,
            slider: null,
            default_language : function(){
                var lang = window.navigator.userLanguage || window.navigator.language;
                lang = lang.substring(0,2);
                if ($.inArray(lang, app.languages) == -1)  {
                    lang = "en";
                }
                return lang;
            }
        },

        /** languages **/
        languages: ["en", "it", "de"]

};
