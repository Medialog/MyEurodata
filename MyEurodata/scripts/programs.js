(function (global, $) {
    
    app = global.app = global.app || {};
    
    app.programsViewModel = {
        initializeViewDesign: function() {        
            $(".km-scroll-header").css("display", "none");
            
            /*$("#countriesChannelsPanelBar").kendoPanelBar({
                expandMode: "multiple"
            });*/
        },
        
        updateMenu: function(){
        },
        
        updateSelection: function(){
            alert(s.data().id);
        }
    };

})(window, jQuery);