(function (global, $) {
    var rankingByChannelChart = null;
    var rankingByGenreChart = null;
    var channelAudienceInTimeChart = null;
    var targetsLoaded = false;
    app = global.app = global.app || {};
       
    function GetDataForSeries(items, displayFeld, valueField) {
        var dataArray = [];
        for (var i = 0; i < items.length; i++) {
            dataArray.push([items[i][displayFeld], items[i][valueField]]);
        }
        return dataArray;
    };
    
    function GetDateFilter() {
        switch (app.period)
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
    
    app.homeViewModel = {
        
        initializeViewDesign: function() {
            app.homeViewModel.createRankingByChannelChart();
            
            app.homeViewModel.bindTopProgramsList();
            
            app.homeViewModel.createRankingByGenreChart();
            
            app.homeViewModel.createChannelAudienceInTimeChart();
            
            app.homeViewModel.bindTargets();
            
            app.homeViewModel.bindResizeEvent();
            
            $(".km-scroll-header").css("display", "none");
            
        },
        
        updateMenu: function(){
        },
        
        bindTargets: function() {
            //if(app.homeViewModel.targetsLoaded) return;
            var dataSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: app.myEurodataAPIUrl + "values/GetCountryTargets?country=" + app.selectedCountry,
                        dataType: "json"
                    }
                } 
            });
            dataSource.read();
            $("#targetsListView").kendoMobileListView({
                    dataSource: dataSource,
                    template: $("#targetsListViewTmpl").html()
                }).kendoTouch({
                    filter: ">li",
                    enableSwipe: false,
                    tap: function(e){
                        app.homeViewModel.closeFilterPopover(e);
                        //var vendorName = $(e.touch.currentTarget).find("label").text();
                        //kendo.mobile.application.navigate("#tabstrip-vendor?uid=" + vendorName);
                    }
                });
            //app.homeViewModel.targetsLoaded = true;
        },
        
        closeFilterPopover: function(e) {
            var popover = e.sender.element.closest('[data-role=popover]').data('kendoMobilePopOver');
            popover.close();
        },
        
        bindTopProgramsList: function() {
            $("#topProgramsList").kendoMobileListView({
                dataSource: {
                    transport: {
                        read: {
                            url: app.myEurodataAPIUrl + "values/GetTopProgramsAudiences?country=" + app.selectedCountry + GetDateFilter(),
                            dataType: "json"
                        }
                    },
                    group: {field: "Region"},
                    sort: { field: "RatPercentage", dir: "desc" }
                },
                type: "group",
                fixedHeaders: true,
                headerTemplate: $("#topProgramsListHeaderTemplate").html(),
                template: $("#topProgramsListTemplate").html()
            });  
        },
        
        createChannelAudienceInTimeChart: function() {
            var $channelAudienceInTimeChart;

            if (channelAudienceInTimeChart !== null) {
                channelAudienceInTimeChart.destroy();
            }
            
            $channelAudienceInTimeChart = $("#channelAudienceInTime-chart").empty();
            
            var dataSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: app.myEurodataAPIUrl + "values/GetCountryChannelsWeeksAudiences?country=" + app.selectedCountry + GetDateFilter(),
                        dataType: "json"
                    }
                },
                change: function() {
                    var view = dataSource.view();
                    var chartSeries = [];
                    
                    for (var i = 1; i < 7; i++) {
                        chartSeries.push({
                            data: GetDataForSeries(view, ("ShrPercentage" + i), ("ShrPercentage" + i)),
                            name: view[0][("Channel" + i)]
                        });
                    }
                    
                    channelAudienceInTimeChart = $channelAudienceInTimeChart.kendoChart({
                        theme: global.app.chartsTheme,
                        renderAs: "svg",
                        dataSource: view,
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
                            field: "Week",
                            majorGridLines: { visible: false }
                        },
                        chartArea: {
                            background: "",
                            width: $("#channelAudienceInTime-chart").width(),
                            //height: 300,
                            margin: app.emToPx(1)
                        },
                        seriesDefaults: {
                            type: "line"
                        },
                        series: chartSeries,
                        tooltip: {
                            visible: true,
                            format: "{0}%"
                        }
                    }).data("kendoChart");
                }
            });
            dataSource.read();
            
        },
        
        createRankingByGenreChart: function() {
            var $rankingByGenreChart;

            if (rankingByGenreChart !== null) {
                rankingByGenreChart.destroy();
            }
            
            $rankingByGenreChart = $("#ratingsByGenre-chart").empty();
            
            rankingByGenreChart = $rankingByGenreChart.kendoChart({
                theme: global.app.chartsTheme,
                renderAs: "svg",
                dataSource: {
                    transport: {
                        read: {
                            url: app.myEurodataAPIUrl + "values/GetCountryGenresAudiences?country=" + app.selectedCountry + GetDateFilter(),
                            dataType: "json"
                        }
                    }
                },
                title: {
                    visible: false,
                    position: "top",
                    text: ""
                },
                legend: {
                    visible: false
                },
                valueAxis: {
                    line: {
                        visible: false
                    },
                    minorGridLines: {
                        visible: false
                    }
                },
                categoryAxis: {
                    majorGridLines: {
                        visible: false
                    }
                },
                chartArea: {
                    background: "",
                    width: $("#ratingsByGenre-chart").width(),
                    //height: 300,
                    margin: app.emToPx(1)
                },
                seriesDefaults: {
                    type: "bar"
                },
                series: [
                    {
                        field: "RatPercentage",
                        categoryField: "Genre",
                        padding: 0
                    }
                ],
                tooltip: {
                    visible: true,
                    format: "{0}%"
                }
            }).data("kendoChart");
            
        },        
        
        createRankingByChannelChart: function() {
            var $rankingByChannelChart;

            if (rankingByChannelChart !== null) {
                rankingByChannelChart.destroy();
            }
            
            $rankingByChannelChart = $("#ratingsByChannel-chart").empty();
            
            rankingByChannelChart = $rankingByChannelChart.kendoChart({
                theme: global.app.chartsTheme,
                renderAs: "svg",
                dataSource: {
                    transport: {
                        read: {
                            url: app.myEurodataAPIUrl + "values/GetCountryChannelsAudiences?country=" + app.selectedCountry + GetDateFilter(),
                            dataType: "json"
                        }
                    }
                },
                title: {
                    visible: false,
                    position: "top",
                    text: ""
                },
                legend: {
                    position: "bottom"
                },
                chartArea: {
                    background: "",
                    width: $("#ratingsByChannel-chart").width(),
                    //height: 300,
                    margin: app.emToPx(1)
                },
                seriesDefaults: {
                    type: "pie"
                },
                series: [
                    {
                        field: "ShrPercentage",
                        categoryField: "Channel",
                        padding: 0
                    }
                ],
                tooltip: {
                    visible: true,
                    format: "{0}%"
                }
            }).data("kendoChart");
        },
        
        bindResizeEvent: function () {
            //as the dataviz-s are complex elements they need redrow after window resize 
            //in order to position themselve on the right place and right size
            $(window).on("resize.rankingByChannelChart", $.proxy(app.homeViewModel.createRankingByChannelChart, app.homeViewModel));
            $(window).on("resize.rankingByGenreChart", $.proxy(app.homeViewModel.createRankingByGenreChart, app.homeViewModel));
            $(window).on("resize.channelAudienceInTimeChart", $.proxy(app.homeViewModel.createChannelAudienceInTimeChart, app.homeViewModel));
        },
        
        unbindResizeEvent: function () {
            //unbind the "resize event" to prevent redudntant calculations when the tab is not active
            $(window).off("resize.rankingByChannelChart");
            $(window).off("resize.rankingByGenreChart");
            $(window).off("resize.channelAudienceInTimeChart");
        },
        
        onCountryClick: function(){
            var dataId = this.selectedIndex == 0 ? "France" : (this.selectedIndex == 1 ? "USA" : "Japan");
            app.selectedCountry = dataId;
            app.homeViewModel.initializeViewDesign();
        },
        
        onPeriodClick: function() {
            var period = this.selectedIndex == 0 ? "All" : (this.selectedIndex == 1 ? "August" : (this.selectedIndex == 2 ? "September" : "October"));
            app.period = period;
            app.homeViewModel.initializeViewDesign();
        }
        
    };
})(window, jQuery);