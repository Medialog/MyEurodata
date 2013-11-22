(function (global, $) {
    
    var countryChannelFilterLoaded = false;
    
    function GetProgramDateFilter() {
        switch (app.programPeriod)
        {
            case "August":
                return "&fromDate=2013-08-01&toDate=2013-08-31";
            case "September":
                return "&fromDate=2013-09-01&toDate=2013-09-30";
            case "October":
                return "&fromDate=2013-10-01&toDate=2013-10-31";
            default:
                return "&fromDate=2013-08-01&toDate=2013-10-31";
        }
    };
    
    app = global.app = global.app || {};
    
    app.programsViewModel = {
        
        initializeViewDesign: function() {     
            $(".km-scroll-header").css("display", "none");
            
            app.programsViewModel.getCountryChannelFilter();
            
        },
        
        updateMenu: function(){
        },
        
        getProgramsByFilter: function(){
            var channels = $("#countriesChannelsPanelBar .channel").find(".km-selected").map(function() {
              return $(this).parent().data().id;
            }).get().join(',');
            var period = GetProgramDateFilter();
            
            var tmpl = kendo.template($("#programListContainerTmpl").html());
            
            var dataSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: app.myEurodataAPIUrl + "values/GetProgramsDataByChannelsTargetsAndPeriod?channels="+ channels + "&targets=1" + GetProgramDateFilter(),
                        dataType: "json"
                    }
                },
                change: function() {
                    var result = tmpl(dataSource.view());
                    $("#programListContainer").html(result);
                }
            });
            dataSource.read();
            
        },
        
        onPeriodClick: function() {
            var period = this.selectedIndex == 0 ? "All" : (this.selectedIndex == 1 ? "August" : (this.selectedIndex == 2 ? "September" : "October"));
            app.programPeriod = period;
            app.programsViewModel.initializeViewDesign();
            app.programsViewModel.getProgramsByFilter();
        },
               
        getCountryChannelFilter: function(){
            if(app.programsViewModel.countryChannelFilterLoaded) return;
            $("#countriesChannelsPanelBar").kendoMobileListView({
                dataSource: {
                    transport: {
                        read: {
                            url: app.myEurodataAPIUrl + "values/GetCountriesAndChannels",
                            dataType: "json"
                        }
                    },
                    group: {field: "Region"},
                    sort: { field: "Channel", dir: "asc" }
                },
                type: "group",
                fixedHeaders: true,
                headerTemplate: $("#countryChannelFilterHeaderTmpl").html(),
                template: $("#countryChannelFilterTmpl").html(),
                dataBound: function(e) {
                    $("#countriesChannelsPanelBar .country").on("click", function(){
                        if($(this).find("span").hasClass("km-selected"))
                        {
                            $(this).find("span").removeClass("km-selected");
                            $(this).parent().parent().next().find("li span").removeClass("km-selected");
                        }
                        else
                        {
                            $(this).find("span").addClass("km-selected");
                            $(this).parent().parent().next().find("li span").addClass("km-selected");    
                        }
                        app.programsViewModel.getProgramsByFilter();
                    });
            
                    $("#countriesChannelsPanelBar .channel").on("click", function(){
                        if($(this).find("span").hasClass("km-selected"))
                            $(this).find("span").removeClass("km-selected");
                        else
                            $(this).find("span").addClass("km-selected");
                        var active = 0;
                        var inactive = 0;
                        $(this).parent().find("li span").each(function( index ) {
                            if($(this).hasClass("km-selected"))
                                active++;
                            else
                                inactive++;
                        });
                        if(active > 0 && inactive == 0)
                           $(this).parent().prev().find("span").addClass("km-selected");
                        if(active == 0 && inactive > 0)
                            $(this).parent().prev().find("span").removeClass("km-selected");
                        app.programsViewModel.getProgramsByFilter();
                    });
                    
                    app.programsViewModel.getProgramsByFilter();
                }
            });
            app.programsViewModel.countryChannelFilterLoaded = true;
        }
    };

})(window, jQuery);