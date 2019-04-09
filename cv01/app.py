from flask import Flask, render_template, request, abort, jsonify
import json
app = Flask(__name__)

with open("static/DOP_PID_ZASTAVKY_B.json",encoding="utf-8") as zastfile:
    zast = json.load(zastfile)
    fs = zast["features"]

lines = None
linedict = {}
with open("static/linky.json", encoding="utf-8") as linesfile:
    lines = json.load(linesfile)
    for f in lines["features"]:
	    linedict[f["properties"]["LIN_ALIAS_WEB"]]=f


@app.route("/")
def hello():
    return render_template("zastavky.html", features=fs)

@app.route("/test")
def test():
    return ""

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

    

app.run(port=5000,debug=True)
