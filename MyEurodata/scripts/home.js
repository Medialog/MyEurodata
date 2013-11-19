(function (global, $) {
    var rankingByChannelChart = null;
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
            app.homeViewModel.bindResizeEvent();
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
                            url: "http://localhost/MyEurodata2015WebApi/api/values/GetCountryAudiences?country=FRANCE&json=true",
                            dataType: "json"
                        }
                    }
                },
                title: {
                    position: "top",
                    text: "Share By Channel"
                },
                legend: {
                    position: "bottom"
                },
                chartArea: {
                    background: "",
                    width: $("#ratingsByChannel-chart").width(),
                    margin: app.emToPx(1)
                },
                seriesDefaults: {
                    type: "pie"
                },
                series: [
                    {
                        field: "Share",
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
        },
        
        unbindResizeEvent: function () {
            //unbind the "resize event" to prevent redudntant calculations when the tab is not active
            $(window).off("resize.rankingByChannelChart");
        }
        
    };
})(window, jQuery);