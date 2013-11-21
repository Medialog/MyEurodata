(function (global) {
    var application,
        mobileSkin = "",
        defaultChartTheme = 'silver',
        app = global.app = global.app || {};
    
    app.myEurodataAPIUrl = "http://localhost/MyEurodata2015WebApi/api/";
    
    app.selectedCountry = "France";
    
    app.period = "All";

    app.chartsTheme = defaultChartTheme;

    document.addEventListener("deviceready", function () {
        var os = kendo.support.mobileOS;
        var statusBarStyle = os.ios && os.flatVersion >= 700 ? "black-translucent" : "black";

        navigator.splashscreen.hide();
        application = new kendo.mobile.Application(document.body, { transition: "slide", layout: "mobile-tabstrip", statusBarStyle : statusBarStyle, skin: 'flat' });
    }, false);

    //Skin change function is for the demo. On real project only one theme should be chosen.
    app.changeSkin = function (e) {
        /*if (e.sender.element.text() === "Flat") {
            e.sender.element.text("Native");
            global.app.chartsTheme = 'flat';
            mobileSkin = "flat";
        }
        else {
            e.sender.element.text("Flat");
            global.app.chartsTheme = defaultChartTheme;
            mobileSkin = "";
        }

        application.skin(mobileSkin);
        application.view().show();*/
    };

    app.emToPx = function (input) {
        var emSize = parseFloat($("body").css("font-size"));
        return (emSize * input);
    }
})(window);