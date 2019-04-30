from flask import Flask, render_template, request, abort, jsonify
import json
import psycopg2

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

with open("static/DOP_PID_ZASTAVKY_B.json",encoding="utf-8") as zastfile:
    zast = json.load(zastfile)
    stops = zast["features"]

lines = None
linedict = {}
with open("static/linky.json", encoding="utf-8") as linesfile:
    lines = json.load(linesfile)
    for f in lines["features"]:
	    linedict[f["properties"]["LIN_ALIAS_WEB"]]=f

conn = psycopg2.connect("SECRET!")
cur = conn.cursor()

@app.route("/")
def hello():
    return render_template("zastavky.html", features=stops)

@app.route("/test")
def test():
    cur.execute("SELECT other_tags->'surface' AS surface,* FROM lines WHERE highway='primary' AND other_tags->'maxspeed' = '50' LIMIT 1000;")
    lines = []
    for line in cur:
	    lines.append(line)
    return str(lines)

@app.route("/map")
def mapPage():
    return render_template("map.html")

def get_attribute(request,name,convert=None,default=None):
    attr = request.args.get(name,None)
    if not attr:
        return (default,"Attribute '{}' undefined".format(name))
    if convert:
        try:
            attr = convert(attr)
        except:
            return (default,"Attribute '{}' in wrong format".format(name))
    return (attr,None)

@app.route("/lines")
def getLine():
    (lname,error) = get_attribute(request,"name")
    if not lname:
	    abort(404)
    
    line = linedict.get(lname,None)
    if not line:
	    abort(404)
	    # return "Line '{}' does not exist".format(lname)
    res = {"type" : "FeatureCollection",
    	   "features": [line]}
    return jsonify(res)

@app.route("/search")
def searchStop():
    (search_str, error) = get_attribute(request,"stop",str)
    search_str = search_str.lower()
    stopsout = []
    for stop in stops:
	    if stop["properties"]["ZAST_NAZEV"].lower().startswith(search_str):
		    stopsout.append(stop) 
    outjson = {"type" : "FeatureCollection", "features": stopsout} 
    return jsonify(outjson)


@app.route("/stops")
def getStops():
    (minlon, error) = get_attribute(request,"minlon",float)
    if minlon is None:
	    abort(404)
    (minlat, error) = get_attribute(request,"minlat",float)
    if minlat is None:
	    abort(404)
    (maxlon, error) = get_attribute(request,"maxlon",float)
    if maxlon is None:
	    abort(404)
    (maxlat, error) = get_attribute(request,"maxlat",float)
    if maxlat is None:
	    abort(404)
    
    stopsout = []
    for stop in stops:
	    (lon,lat) = stop["geometry"]["coordinates"]
	    if minlon <= lon and lon <= maxlon and minlat <= lat and lat <= maxlat:
		    stopsout.append(stop)
    outjson = {"type" : "FeatureCollection", "features": stopsout} 
    return jsonify(outjson)

    


    

app.run(port=5000,debug=True)
cur.close()
conn.close()
