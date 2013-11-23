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
                  return ($(this).find("input").attr("data-check")=="1") ? $(this).find("input").data().id : "-1";
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
                    }
                }).kendoTouch({
                    filter: ">li",
                    enableSwipe: false,
                    tap: function(e){
                        if($(e.touch.currentTarget).find("input").attr("data-check") == "1")
                            $(e.touch.currentTarget).find("input").attr("data-check", "0");
                        else
                            $(e.touch.currentTarget).find("input").attr("data-check", "1");
                        app.programsViewModel.getProgramsByFilter();
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
                    app.programsViewModel.bindProgramListTargets();
                }
            }).kendoTouch({
                filter: ">li",
                enableSwipe: false,
                tap: function(e){
                    console.log(e);
                    if($(e.event.target).hasClass("country"))
                    {
                        var c = $(e.event.target);
                        if($(c).find("span").hasClass("km-selected"))
                        {
                            $(c).find("span").removeClass("km-selected");
                            $(c).parent().parent().next().find("li span").removeClass("km-selected");
                        }
                        else
                        {
                            $(c).find("span").addClass("km-selected");
                            $(c).parent().parent().next().find("li span").addClass("km-selected");    
                        }
                        app.programsViewModel.bindProgramListTargets();
                    }
                    else
                    {
                        var c = $(e.event.target);
                        if($(c).find("span").hasClass("km-selected"))
                            $(c).find("span").removeClass("km-selected");
                        else
                            $(c).find("span").addClass("km-selected");
                        var active = 0;
                        var inactive = 0;
                        $(c).parent().find("li span").each(function( index ) {
                            if($(c).hasClass("km-selected"))
                                active++;
                            else
                                inactive++;
                        });
                        if(active > 0)
                           $(c).parent().prev().find("span").addClass("km-selected");
                        if(active == 0 && inactive > 0)
                            $(c).parent().prev().find("span").removeClass("km-selected");
                        app.programsViewModel.bindProgramListTargets();
                    }
                }
            });
            app.programsViewModel.countryChannelFilterLoaded = true;
        },
                
        onOpenProgram: function(e){
            var idx =  $(e.target.context).find(".program-tile").data().id;
            var elem = app.programsViewModel.programData[idx];
            $(e.sender.header).find(".km-view-title span").text(elem.Program);
            if(elem.NOTAData.Summary.length > 0)
                $(e.sender.element).find(".span-summary").text("Summary:" + elem.NOTAData.Summary);
            
            var chart = $(e.sender.element).find("#program-chart");
            if(elem.FacebookMetrics.length < 2)
            {
                $(chart).data("kendoChart").destroy();
                $(chart).css("display", "none");
                return;    
            }
            $(chart).css("display", "block");
            $(window).resize(function() 
            {    
                var chart = $(chart).data("kendoChart");
                chart.refresh();
            });
            $(chart).kendoChart({
                theme: global.app.chartsTheme,
                renderAs: "svg",
                dataSource: elem.FacebookMetrics,
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
                        visible: true
                    },
                    majorGridLines: { visible: false }
                },
                chartArea: {
                    background: "",
                    width: $(chart).width(),
                    height: $(chart).height(),
                    margin: app.emToPx(1)
                },
                series: [
                    {
                        type: "line",
                        name: "Likes",
                        field: "Likes",
                        color: "#73c100",
                    },
                    {
                        type: "line",
                        name: "TalkingAbout",
                        field: "TalkingAbout",
                        color: "#007eff",
                    }
                ],
                tooltip: {
                    visible: true
                }
            }).data("kendoChart");
        }
    };

})(window, jQuery);