(function (global, $) {
    
    app = global.app = global.app || {};
    
    app.programsViewModel = {
        initializeViewDesign: function() {        
            $(".km-scroll-header").css("display", "none");
        },
        
        updateMenu: function(){
            /*$("#CurrentViewAnchor").prop("href", "#tabstrip-programs");
            $("#CurrentViewAnchor").text("By Program");
            $("#SecondaryViewAnchor").text("By Country");
            $("#SecondaryViewAnchor").prop("href", "#tabstrip-general");*/
        }
    };

})(window, jQuery);