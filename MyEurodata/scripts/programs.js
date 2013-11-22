(function (global, $) {
    
    var countryChannelFilterLoaded = false;
    var programTargetsLoaded = false;
    
    var programData = null;
    
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
        
        initializeViewDesign: function(e) {     
            $(".km-scroll-header").css("display", "none");
            
            //app.programsViewModel.bindProgramListTargets();
            app.programsViewModel.getCountryChannelFilter();
            
        },
        
        updateMenu: function(){
        },
        
        createSocialChart: function(data){
            for(var idx=0; idx<data.length; idx++)
            {
                if(data[idx].FacebookMetrics.length < 2)
                    continue;
                var chart = $(".program-tile[data-id="+idx+"]").find(".social-chart");
                $(chart).kendoChart({
                    theme: global.app.chartsTheme,
                    /*renderAs: "svg",*/
                    dataSource: data[idx].FacebookMetrics,
                        title: {
                            visible: false,
                            position: "top",
                            text: ""
                        },
                        legend: {
                            visible: true,
                            position: "bottom"
                        },
                        valueAxis: {
                            line: { visible: false },
                            minorGridLines: { visible: false }
                        },
                        categoryAxis: {
                            field: "Timestamp",
                             labels:{
                                 template: '#: data.value.substring(0,10) #',
                                 rotation: -90,
                                 visible: false
                            },
                            majorGridLines: { visible: false }
                        },
                        chartArea: {
                            background: "",
                            width: $(chart).width(),
                            height: $(chart).height(),
                            margin: app.emToPx(1)
                        },
                        /*seriesDefaults: {
                            type: "area"
                        },*/
                        series: [
                            {
                                type: "area",
                                name: "Likes",
                                field: "Likes",
                                color: "#73c100",
                            }/*,
                            {
                                type: "area",
                                field: "TalkingAbout",
                                color: "#007eff",
                            }*/
                        ],
                        tooltip: {
                            visible: true
                        }
                    }).data("kendoChart");
            }
        },
        
        getProgramsByFilter: function(){
            try{
                $(".km-loader").show();
                var channels = $("#countriesChannelsPanelBar .channel").find(".km-selected").map(function() {
                  return $(this).parent().data().id;
                }).get().join(',');
                if(channels.length == 0) channels = "none";
                var period = GetProgramDateFilter();
                var targets = $("#programListTargetsListView").data("kendoMobileListView").items().map(function() {
                  return $(this).find("input").data().id;
                }).get().join(',');
                if(targets.length == 0) targets = "-1";
                var tmpl = kendo.template($("#programListContainerTmpl").html());
            
                var dataSource = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: app.myEurodataAPIUrl + "values/GetProgramsDataByChannelsTargetsAndPeriod?channels="+ channels + "&targets=" + targets + GetProgramDateFilter(),
                            dataType: "json"
                        }
                    },
                    change: function() {
                        app.programsViewModel.programData = dataSource.view();
                        var result = tmpl(app.programsViewModel.programData);
                        $("#programListContainer").html(result);
                        /*$(".program-tile").kendoTouch({
                            enableSwipe: false,
                            tap: function(e){
                                app.programsViewModel.openProgram(e);
                            }
                        });*/
                        $(".km-loader").hide();
                    }
                });
                dataSource.read();
            }
            catch(exc){
                $(".km-loader").hide();
            }
            finally{
                
            }
            
        },
        
        bindProgramListTargets: function() {
            
            var countries = $("#countriesChannelsPanelBar .country").find(".km-selected").map(function() {
                  return $(this).parent().data().id;
                }).get().join(',');
            
            var dataSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: app.myEurodataAPIUrl + "values/GetMainTargets?countriesNames=" + countries,
                        dataType: "json"
                    }
                },
                change: function(){
                    var d = dataSource.view();
                    if(app.programsViewModel.programTargetsLoaded && d.length > 0){
                        $("#programListTargetsListView").data("kendoMobileListView").items().each(function(index){
                            $(this).find("input").attr("data-id", d[index].Codes);
                        });
                    }
                    app.programsViewModel.getProgramsByFilter();
                }
            });
            
            var selected = [];
            if(app.programsViewModel.programTargetsLoaded){
                $("#programListTargetsListView").data("kendoMobileListView").items().each(function(){
                    selected.push($(this).find("input").attr("checked"))
                });
            } else
                selected = ["checked", "checked", "checked"];
            
            if(app.programsViewModel.programTargetsLoaded){
                dataSource.read();
                return;
            }
            
            $("#programListTargetsListView").kendoMobileListView({
                    dataSource: dataSource,
                    template: $("#programListTargetsListViewTmpl").html(),
                    dataBound: function(e) {
                        app.programsViewModel.programTargetsLoaded = true;
                        app.programsViewModel.getProgramsByFilter();
                    },
                    click: function(e) {
                        app.programsViewModel.getProgramsByFilter();
                    }
                }).kendoTouch({
                    filter: ">li",
                    enableSwipe: false,
                    tap: function(e){
                        //app.homeViewModel.closeFilterPopover(e);
                        //var vendorName = $(e.touch.currentTarget).find("label").text();
                        //kendo.mobile.application.navigate("#tabstrip-vendor?uid=" + vendorName);
                    }
                });
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
                        app.programsViewModel.bindProgramListTargets();
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
                        if(active > 0)
                           $(this).parent().prev().find("span").addClass("km-selected");
                        if(active == 0 && inactive > 0)
                            $(this).parent().prev().find("span").removeClass("km-selected");
                        app.programsViewModel.bindProgramListTargets();
                    });
                    app.programsViewModel.bindProgramListTargets();
                }
            });
            app.programsViewModel.countryChannelFilterLoaded = true;
        },
        
        onOpenProgram: function(e){
            //alert("aa");
            var idx =  $(e.target.context).find(".program-tile").data().id;
            var elem = app.programsViewModel.programData[idx];
            $(e.sender.header).find(".km-view-title span").text(elem.Program);
            
        }
    };

})(window, jQuery);