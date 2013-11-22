(function (global, $) {
    
    app = global.app = global.app || {};
    
    app.programsViewModel = {
        initializeViewDesign: function() {        
            $(".km-scroll-header").css("display", "none");
            
            app.programsViewModel.getCountryChannelFilter();
        },
        
        updateMenu: function(){
        },
        
        updateSelection: function(s){
            alert(s.data().id);
        },
               
        getCountryChannelFilter: function(){
            
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
                    });
                }
            });  
        }
    };

})(window, jQuery);