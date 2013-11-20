(function (global, $) {
    var rankingByChannelChart = null;
    var rankingByGenreChart = null;
    var channelAudienceInTimeChart = null;
    app = global.app = global.app || {};
    
    function getData(pageSize, url, dataSourceToSet, viewModel){
        var that = this;
        var dataSource = new kendo.data.DataSource({
            pageSize: pageSize,
            transport: {
                read: {
                    url: url,
                    dataType: "json"
                }
            }
        });
        viewModel.set(dataSourceToSet, dataSource);
    };

    app.homeViewModel = {
        
        initializeViewDesign: function() {
            app.homeViewModel.createRankingByChannelChart();
            
            app.homeViewModel.bindTopProgramsList();
            
            app.homeViewModel.createRankingByGenreChart();
            
            app.homeViewModel.createChannelAudienceInTimeChart();
            
            app.homeViewModel.bindResizeEvent();
            
            $(".km-scroll-header").css("display", "none");
        },
        
        bindTopProgramsList: function() {
            $("#topProgramsList").kendoMobileListView({
                dataSource: {
                    transport: {
                        read: {
                            url: app.myEurodataAPIUrl + "values/GetTopProgramsAudiences?country=" + app.selectedCountry,
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
            
            channelAudienceInTimeChart = $channelAudienceInTimeChart.kendoChart({
                theme: global.app.chartsTheme,
                renderAs: "svg",
                dataSource: {
                    transport: {
                        read: {
                            url: app.myEurodataAPIUrl + "values/GetCountryChannelsWeeksAudiences?country=" + app.selectedCountry,
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
                    /*labels: {
                        format: "N0"
                    },*/
                    line: {
                        visible: false
                    },
                    minorGridLines: {
                        visible: false
                    }
                },/*,
                categoryAxis: {
                    field: "Week",
                    labels: {
                        rotation: -90
                    },
                    majorGridLines: {
                        visible: false
                    }
                },*/
                chartArea: {
                    background: "",
                    width: $("#channelAudienceInTime-chart").width(),
                    height: 300,
                    margin: app.emToPx(1)
                },
                seriesDefaults: {
                    type: "line"
                },
                series: [
                    {
                        field: "ShrPercentage",
                        categoryField: "Week",
                        name: "#= Channel #"
                    }/*,
                    {
                        field: "Value2",
                        name: "#= Channel2 #"
                    },
                    {
                        field: "Value2",
                        name: "#= Channel2 #"
                    }*/
                ],
                tooltip: {
                    visible: true,
                    format: "{0}%"
                }
            }).data("kendoChart");
            
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
                            url: app.myEurodataAPIUrl + "values/GetCountryGenresAudiences?country=" + app.selectedCountry,
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
                    height: 300,
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
                            url: app.myEurodataAPIUrl + "values/GetCountryChannelsAudiences?country=" + app.selectedCountry,
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
                    height: 300,
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
        
        onCountryClick: function(e){
            var dataId = e.button.data().id;
            app.selectedCountry = dataId;
            app.homeViewModel.initializeViewDesign();
        }
    };
})(window, jQuery);