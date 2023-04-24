var mymap = L.map('mapa', {zoomControl: false}).setView([49.4415564, 15.8721311], 7); 
            
//vytvoří skupinu s basemapou
var basemapa = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Podkladová mapa &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, © <a href="https://www.mapbox.com/">Mapbox</a> | Data <a href="https://www.ustrcr.cz/">ÚSTR</a>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/outdoors-v11',
    accessToken: 'pk.eyJ1IjoibWFydGludXN2YW51cyIsImEiOiJjaWs4aDFzbDcwMDFqdzNrb3plNHJoZ3F2In0.yPRyLafZLoDiq_jV4lM-cg'
});
var basemapaGroup = L.layerGroup([basemapa]);
basemapaGroup.addTo(mymap);

//dá do pravého rohu zoomovací tlačítka
if(window.innerWidth>768) {
    L.control.zoom({
        position:'topright'
    }).addTo(mymap);

    L.control.defaultExtent({
        position:'topright'
    }).addTo(mymap);
}

if(window.innerWidth<=768) {
    L.control.zoom({
        position:'topright'
    }).addTo(mymap);
    
    L.control.defaultExtent({
        position:'topright'
    }).addTo(mymap);
}

//vytvoří proměnou s daty 
var obeti = geojsonFeature;

//Formátuje ikony
var zakladniIkona = L.icon({
    iconUrl: 'css/images/marker-icon.png',
    iconAnchor: [16, 30],
});
var aktivniIkona = L.icon({
    iconUrl: 'css/images/marker-icon-aktivni.png',
    iconAnchor: [16, 30],
});
var aktivniMarker;

//chování markerů
function onEachFeature(feature, layer) {
    layer.on('click', function () {
        //formátuje popupy
        document.getElementById("popupcontent").innerHTML = "<dl><dt>Name</dt><dd>" + feature.properties.vlastni_jmeno + " " + feature.properties.prijmeni_ini + "</dd><dt>Citizenship</dt><dd>" + feature.properties.statni_prislusnost + "</dd><dt>Year of the incident</dt><dd>" + feature.properties.rok + "</dd><dt>Division responsible</dt><dd>" + feature.properties.utvar_incidentu + "</dd></dl><dl style='margin-left: 15px;'><dt>Age</dt><dd>" + feature.properties.vek_h + "</dd><dt>Home District</dt><dd>" + feature.properties.okres_bydliste_cz + "</dd><dt>Direction of Crossing</dt><dd>" + feature.properties.smer_prechodu + "</dd><dt>Cause of Death</dt><dd>" + feature.properties.umrti + "</dd></dl>";
        $("#popup").stop();
        $("#popup").fadeIn("fast");

        $("#zavripopup").click(function() {
            $("#popup").fadeOut("fast")
            layer.setIcon(zakladniIkona);
        });

        //přepíná ikony
        if(aktivniMarker) {
            aktivniMarker.setIcon(zakladniIkona);
        }
        layer.setIcon(aktivniIkona);
        aktivniMarker = layer

        //centruje mapu
        mymap.setView([layer.getLatLng().lat, layer.getLatLng().lng]);
    });
}

//vytvoří proměnou s nejvyšší hodnotou clusteru
var maxCluster = Math.max.apply(Math, obeti.map(function(o) {return o.properties.cluster;}));

//vytvoří skupinu s vrstvou obeti bez klastrů
var vrstvaObeti = L.geoJSON(obeti.filter(obet=>obet.properties.cluster===0), {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {icon: zakladniIkona});
    },
    onEachFeature: onEachFeature
});
var obetiGroup = L.layerGroup([vrstvaObeti]);
obetiGroup.addTo(mymap);

//vytvoří skupinu s vrstvou obeti v klastrech
var i;
var obetiGroupCluster = [];
for(i=1; i<=maxCluster; i++) {
    var vrstvaObeti = L.geoJSON((obeti.filter(obet=>obet.properties.cluster===i)), {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: zakladniIkona});
        },
        onEachFeature: onEachFeature,
    });
    var markers = L.markerClusterGroup();
    markers.addLayer(vrstvaObeti);
    obetiGroupCluster.push(L.layerGroup([markers]));
    obetiGroupCluster[i-1].addTo(mymap);

    //zoomuje na vybraný klaster
    markers.on('clusterclick', function (a) {
        a.layer.zoomToBounds({padding: [20, 20]});
    });
};

//filtrovací parametry
var obdobiValue = 0;

var vekOdValue = 0;
var vekDoValue = 90;

var muziValue = 1;
var zenyValue = 1;
var neurcenepohlavyValue = 1;

var statniprislusnostValue = 12;
var okresbydlisteValue = 97;
var utvarValue = 12;
var pricinaumrtiValue = 10;

var smervenValue = 1;
var smerdovnitrValue = 1;
var neurcenysmerValue = 1;

//filtorvací funkce
var filterObeti = function (){
    //vymaže všechny vrstvy ze skupin (krome basemapy)
    mymap.eachLayer(function (layer) {
        obetiGroup.removeLayer(layer);
    });
    for(i=1; i<=maxCluster; i++) {  
        mymap.eachLayer(function (layer) {
            obetiGroupCluster[i-1].removeLayer(layer);
        });
    };
    
    //resetuje předchozí filtry
    obeti = [];
    var obetiCache = geojsonFeature;
    var filterChache = [];

    //filtr obdobi
    if (obdobiValue == 0) {
        filterChache = obetiCache;
        filterChache.forEach(element => {
            obeti.push(element)
        }); 
    } if (obdobiValue == 1) {
        filterChache = obetiCache.filter(obet=>obet.properties.rok>=1948 && obet.properties.rok<=1950);
        filterChache.forEach(element => {
            obeti.push(element)
        });
    } if (obdobiValue == 2) {
        filterChache = obetiCache.filter(obet=>obet.properties.rok>=1951 && obet.properties.rok<=1965);
        filterChache.forEach(element => {
            obeti.push(element)
        });
    } if (obdobiValue == 3) {
        filterChache = obetiCache.filter(obet=>obet.properties.rok>=1966 && obet.properties.rok<=1971);
        filterChache.forEach(element => {
            obeti.push(element)
        });
    } if (obdobiValue == 4) {
        filterChache = obetiCache.filter(obet=>obet.properties.rok>=1972 && obet.properties.rok<=1989);
        filterChache.forEach(element => {
            obeti.push(element)
        });
    }

    obetiCache = obeti;
    obeti = [];

    //filtr veku
    obeti = obetiCache.filter(obet=>obet.properties.vek_h>=vekOdValue);
    obetiCache = obeti;
    obeti = obetiCache.filter(obet=>obet.properties.vek_h<=vekDoValue);

    obetiCache = obeti;
    obeti = [];

    //filtr pohlavy
    if (muziValue == 1) {
        filterChache = obetiCache.filter(obet=>obet.properties.pohlavi_cislo===0);
        filterChache.forEach(element => {
            obeti.push(element)
        });
    } if (zenyValue == 1) {
        filterChache = obetiCache.filter(obet=>obet.properties.pohlavi_cislo===1);
        filterChache.forEach(element => {
            obeti.push(element)
        });
    } if (neurcenepohlavyValue == 1) {
        filterChache = obetiCache.filter(obet=>obet.properties.pohlavi_cislo===2);
        filterChache.forEach(element => {
            obeti.push(element)
        });
    }

    obetiCache = obeti;
    obeti = [];

    //filtr statni prislusnost
    if (statniprislusnostValue == 12) {
        filterChache = obetiCache;
        filterChache.forEach(element => {
            obeti.push(element)
        });
    } else { 
        filterChache = obetiCache.filter(obet=>obet.properties.statni_prislusnost_cislo==statniprislusnostValue);
        filterChache.forEach(element => {
            obeti.push(element)
        });   
    }

    obetiCache = obeti;
    obeti = [];

    //filtr okres bydliste
    if (okresbydlisteValue == 97) {
        filterChache = obetiCache;
        filterChache.forEach(element => {
            obeti.push(element)
        });
    } else {   
        filterChache = obetiCache.filter(obet=>obet.properties.okres_bydliste_cislo==okresbydlisteValue);
        filterChache.forEach(element => {
            obeti.push(element)
        });   
    }  

    obetiCache = obeti;
    obeti = [];

    //filtr utvar
    if (utvarValue == 12) {
        filterChache = obetiCache;
        filterChache.forEach(element => {
            obeti.push(element)
        });
    } else { 
        filterChache = obetiCache.filter(obet=>obet.properties.utvar_incidentu_cislo==utvarValue);
        filterChache.forEach(element => {
            obeti.push(element)
        });    
    }  

    obetiCache = obeti;
    obeti = [];

    //filtr pricina umrti
    if (pricinaumrtiValue == 10) {
        filterChache = obetiCache;
        filterChache.forEach(element => {
            obeti.push(element)
        });
    } else {    
        filterChache = obetiCache.filter(obet=>obet.properties.umrti_cislo==pricinaumrtiValue);
        filterChache.forEach(element => {
            obeti.push(element)
        });   
    } 
    
    obetiCache = obeti;
    obeti = [];

    //filtr smer
    if (smervenValue == 1) {
        filterChache = obetiCache.filter(obet=>obet.properties.smer_prechodu_cislo===1 || obet.properties.smer_prechodu_cislo===2 || obet.properties.smer_prechodu_cislo===3);
        filterChache.forEach(element => {
            obeti.push(element)
        });
    } if (smerdovnitrValue == 1) {
        filterChache = obetiCache.filter(obet=>obet.properties.smer_prechodu_cislo===4 || obet.properties.smer_prechodu_cislo===5 || obet.properties.smer_prechodu_cislo===6);
        filterChache.forEach(element => {
            obeti.push(element)
        });
    } if (neurcenysmerValue == 1) {
        filterChache = obetiCache.filter(obet=>obet.properties.smer_prechodu_cislo===0);
        filterChache.forEach(element => {
            obeti.push(element)
        });
    }

    //přidá filtrovanou vrstvu obeti bez klastru
    var vrstvaObeti = L.geoJSON(obeti.filter(obet=>obet.properties.cluster===0), {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: zakladniIkona});
        },
        onEachFeature: onEachFeature,
    });
    obetiGroup.addLayer(vrstvaObeti);

    //přidá filtrovanou vrstvu obeti s klastry
    for(i=1; i<=maxCluster; i++) { 
        var vrstvaObeti = L.geoJSON(obeti.filter(obet=>obet.properties.cluster===i), {
            onEachFeature: onEachFeature,
        });
        var markers = L.markerClusterGroup();
        markers.addLayer(vrstvaObeti);
        obetiGroup.addLayer(markers);

        //zoomuje na vybraný klaster
        markers.on('clusterclick', function (a) {
            a.layer.zoomToBounds({padding: [20, 20]});
        });
    };

    //upraví počet obětí
    document.getElementById("pocet-obeti").innerHTML = obeti.length + " killed";

    //vypne popup
    $("#popup").hide()
};

//ovládání tlačítek
$(".hornimenuitem").click(function(){
    $(".hornimenuitem").removeClass("hornimenuitemactive");
    $(this).addClass("hornimenuitemactive");
    obdobiValue = $(this).attr("value");
    filterObeti();
})

var sliderValue = [0];
var krokyvpoli;
for (krokyvpoli = 5; krokyvpoli <91; krokyvpoli++) {
    sliderValue.push(krokyvpoli)
};
$("#slider-vek").slider({
    range: true,
    min: 0,
    max: 90,
    values: [ 0, 90 ],
    step: 1,
    slide: function( event, ui ) {
        if( sliderValue.indexOf(ui.value)===-1 ) return false;
        if(ui.values[ 0 ] == 0) {
            $("#vekOd").val("undetermined"); 
        } else {
            $("#vekOd").val("from " + ui.values[ 0 ] + " years");
        };
        if(ui.values[ 1 ] == 0) {
            $("#vekDo").val("undetermined"); 
        } else {
            $("#vekDo").val("to " + ui.values[ 1 ] + " years");
        };   
    },
    change: function(event, ui) {
        vekOdValue = $("#slider-vek").slider("values", 0);
        vekDoValue = $("#slider-vek").slider("values", 1);
        filterObeti();
    }
});
$("#vekOd").val("undetermined");
$("#vekDo").val("to " + $("#slider-vek").slider("values", 1) + " years");

$("#muzi").click(function(){
    if (muziValue == 1) {
        muziValue = 0;
    } else {
        muziValue = 1;
    }
    filterObeti();
    $("#muzi").toggleClass("aktivni");
});

$("#zeny").click(function(){
    if (zenyValue == 1) {
        zenyValue = 0;
    } else {
        zenyValue = 1;
    }
    filterObeti();
    $("#zeny").toggleClass("aktivni");
});

$("#neurcenepohlavy").click(function(){
    if (neurcenepohlavyValue == 1) {
        neurcenepohlavyValue = 0;
    } else {
        neurcenepohlavyValue = 1;
    }
    filterObeti();
    $("#neurcenepohlavy").toggleClass("aktivni");
});

$("#statniprislusnost").change(function() {
    statniprislusnostValue = $("#statniprislusnost").val();
    filterObeti();
});

$("#okresbydliste").change(function() {
    okresbydlisteValue = $("#okresbydliste").val();
    filterObeti();
});

$("#utvar").change(function() {
    utvarValue = $("#utvar").val();
    filterObeti();
});

$("#pricinaumrti").change(function() {
    pricinaumrtiValue = $("#pricinaumrti").val();
    filterObeti();
});

$("#ven").click(function(){
    if (smervenValue == 1) {
        smervenValue = 0;
    } else {
        smervenValue = 1;
    }
    filterObeti();
    $("#ven").toggleClass("aktivni");
});

$("#dovnitr").click(function(){
    if (smerdovnitrValue == 1) {
        smerdovnitrValue = 0;
    } else {
        smerdovnitrValue = 1;
    }
    filterObeti();
    $("#dovnitr").toggleClass("aktivni");
});

$("#neurcenysmer").click(function(){
    if (neurcenysmerValue == 1) {
        neurcenysmerValue = 0;
    } else {
        neurcenysmerValue = 1;
    }
    filterObeti();
    $("#neurcenysmer").toggleClass("aktivni");
});


document.getElementById("pocet-obeti").innerHTML = obeti.length + " killed";

$("#reset").click(function(){
    obdobiValue = 0;  
    muziValue = 1;
    zenyValue = 1;
    neurcenepohlavyValue = 1;
    statniprislusnostValue = 12;
    okresbydlisteValue = 97;
    utvarValue = 12;
    pricinaumrtiValue = 10;
    smervenValue = 1;
    smerdovnitrValue = 1;
    neurcenysmerValue = 1;
    $("#slider-vek").slider({values: [0, 90],});

    filterObeti();

    $(".hornimenuitem").removeClass("hornimenuitemactive");
    $(".hornimenuitem:first").addClass("hornimenuitemactive");   
    $("button").removeClass("aktivni");
    $("#statniprislusnost").val(12);
    $("#okresbydliste").val(97);
    $("#utvar").val(12);
    $("#pricinaumrti").val(10);
    $("#muzi").addClass("aktivni");
    $("#zeny").addClass("aktivni");
    $("#neurcenepohlavy").addClass("aktivni");
    $("#ven").addClass("aktivni");
    $("#dovnitr").addClass("aktivni");
    $("#neurcenysmer").addClass("aktivni");
    $("#vekOd").val("undetermined");
    $("#vekDo").val("to " + $("#slider-vek").slider("values", 1) + " years");
});

/*napoveda horni menu*/
$(".hornimenuitem").hover(function() {
        if ($(window).width() >= 1100) {
            $(this).find(".hornimenutip").css("display", "block");
        }
    }, function() {
        $(this).find(".hornimenutip").css("display", "none")
    }
)

/*bocni menu*/
$("#bocnimenutop").click(function() {
    $(".bocnimenucontent").slideToggle("fast");
    if ($("#bocnimenubottom:visible").length) {
        $("#bocnimenubottom").hide()
    } else {
        $("#bocnimenubottom").show()
    }   
})

$("#bocnimenubottom").click(function() {
    $(".bocnimenucontent").slideToggle("fast");
    $("#bocnimenubottom").hide()
})

/*napoveda menu*/
$("#napovedamenu").click(function() {
    $(this).animate({height:45},300);
    $("#napovedaicon").hide();
    $(".napovedaitem").fadeIn()
}/*, function() {
    $(".napovedaitem").fadeOut();
    $(this).animate({height:25},300);
    setTimeout(function(){$("#napovedaicon").show()},400);
     
}*/)

$("#napovedamenu").mouseleave(function() {
    setTimeout(function() {$(".napovedaitem").fadeOut()}, 400);
    setTimeout(function() {$("#napovedamenu").animate({height:25},300)}, 400);
    setTimeout(function(){$("#napovedaicon").show()},850);
})

$("#napovedabutton").click(function() {
    $("#napoveda").slideDown("slow");  
})

$(".napovedabutton1").click(function() {
    $("#napoveda").slideUp();  
})
