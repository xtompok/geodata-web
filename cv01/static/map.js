function zastToLayer(feature,latlng){
	var linky = feature.properties["VSTUPY_LINKA"];
	if (linky === "A"){
		var color = "green";
	} else if (linky === "B") {
		var color = "yellow";			
	} else if (linky === "C") {
		var color = "red";		
	}
	var zastMarkerOptions = {
		radius: 8,
		fillColor: color,
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	};

	if (linky === "A,B"){
		zastMarkerOptions.fillColor = "green";
		zastMarkerOptions.color = "yellow";
		zastMarkerOptions.weight = "4";		
	}
	return L.circleMarker(latlng,zastMarkerOptions);
}
function zastToImgLayer(feature,latlng){
	var linky = feature.properties["VSTUPY_LINKA"];
	if (linky === "A"){
		var url="/static/znak-a.gif"
	} else if (linky === "B") {
		var url = "/static/znak-b.gif"			
	} else if (linky === "C") {
		var url = "/static/znak-c.gif";
	} else {
		var zastMarkerOptions = {
			radius: 8,
			fillColor: "blue",
			color: "#000",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
		};
		return L.circleMarker(latlng,zastMarkerOptions);
	}
	var icon = new L.icon({
		iconUrl: url,
		iconSize: [40,50],
		iconAnchor: [20,25]
		});

	return L.marker(latlng,{icon: icon});
}


function zastEachFeature(feature,layer){
	var props = feature.properties;

	var elem = $("<div>",{});
	elem.addClass("column");
	elem.append($("<h2>",{text: feature.properties["VSTUPY_UZEL_NAZEV"]}));
	elem.append($("<i>",{text: feature.properties["VSTUPY_POPIS"]}));
	var span = $("<span>");
	if (props["VSTUPY_LINKA"].indexOf("A") != -1){
		span.append($("<img>",{src: "/static/znak-a.gif"}));
	}
	if (props["VSTUPY_LINKA"].indexOf("B") != -1){
		span.append($("<img>",{src: "/static/znak-b.gif"}));
	}
	if (props["VSTUPY_LINKA"].indexOf("C") != -1){
		span.append($("<img>",{src: "/static/znak-c.gif"}));
	}
	elem.append(span);

	if (props["VSTUPY_VAZBA_TRAM"] === "1"){
		elem.append($("<span>",{text: "Přestup na tram"}));	
	}
	if (props["VSTUPY_VAZBA_BUS"] === "1"){
		elem.append($("<span>",{text: "Přestup na bus"}));	
	}
	if (props["VSTUPY_VAZBA_VLAK"] === "1"){
		elem.append($("<span>",{text: "Přestup na vlak"}));	
	}

	layer.bindPopup(elem.prop('outerHTML')); 
}

function zastLoaded(data){
	console.log("Loaded");
	var zastLayer = new L.GeoJSON(data,{
		pointToLayer: zastToImgLayer,
		onEachFeature: zastEachFeature
		}); 
	zastLayer.addTo(mymap);
}

function clusteredZastLoaded(data){
	var clusterZastLayer = L.markerClusterGroup();
	for (var i = 0; i<data.features.length; i++){
		var f = data.features[i];
		var coords = L.latLng(f.geometry.coordinates[1],f.geometry.coordinates[0]);
		var layer = zastToImgLayer(f,coords);
		zastEachFeature(f,layer);
		clusterZastLayer.addLayer(layer);
	}
	clusterZastLayer.addTo(entriesLG);
}
function genLineStyle(feature){
	switch (feature.properties["LIN_ALIAS_WEB"]){
		case "A":
			return {color: "green"};
		case "B":
			return {color: "yellow"};
		case "C":
			return {color: "red"};	
	}
	return {opacity: 0};
}

function linesLoaded(data){
	var linesLayer = new L.GeoJSON(data,{
		style: genLineStyle});
	linesLayer.addTo(mymap);
}

function lineALoaded(data){
	new L.GeoJSON(data,
			{style: function(feature){ return {color: "green"};}
			}).addTo(linesLG);
}

function lineBLoaded(data){
	new L.GeoJSON(data,
			{style: function(feature){ return {color: "yellow"};}
			}).addTo(linesLG);
}

function lineCLoaded(data){
	new L.GeoJSON(data,
			{style: function(feature){ return {color: "red"};}
			}).addTo(linesLG);
}

function stopToLayer(feature,latlng){
	var zastMarkerOptions = {
		radius: 8,
		fillColor: "blue",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	};
	return L.circleMarker(latlng,zastMarkerOptions);
}

function stopEachFeature(feature,layer){
	var props = feature.properties;

	var elem = $("<div>",{});
	elem.addClass("column");
	elem.append($("<h2>",{text: feature.properties["ZAST_NAZEV"]}));
	layer.bindPopup(elem.prop('outerHTML')); 
}

function stopsLoaded(data){
	var stopsLayer = new L.GeoJSON(data,{
		pointToLayer: stopToLayer,
		onEachFeature: stopEachFeature
		}); 
	stopsLayer.addTo(stopsLG);
}

function loadStops(zastCheckbox){
	if (!zastCheckbox.checked){
		return;
	}
	var bbox = mymap.getBounds();
	$.getJSON("/stops?minlon="+bbox.getWest()+
	     	"&minlat="+bbox.getSouth()+
		"&maxlon="+bbox.getEast()+
		"&maxlat="+bbox.getNorth(),stopsLoaded);
	     
}

function loadLines(linesCheckbox){
	$.getJSON("/lines?name=A",lineALoaded);
	$.getJSON("/lines?name=B",lineBLoaded);
	$.getJSON("/lines?name=C",lineCLoaded);
}

function loadEntries(entriesCheckbox){
     	$.getJSON("/static/DOP_PID_VSTUPY_B.json",clusteredZastLoaded);
}
function entriesChanged(e){
	if (e.target.checked) {
		loadEntries(e.target);
	} else {
		entriesLG.clearLayers();			
	}
}
function linesChanged(e){
	if (e.target.checked) {
		loadLines(e.target);
	} else {
		linesLG.clearLayers();			
	}
}

function zastChanged(e){
	if (e.target.checked) {
		loadStops(e.target);
	} else {
		stopsLG.clearLayers();			
	}
}
