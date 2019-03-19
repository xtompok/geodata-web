from flask import Flask, render_template
import json
app = Flask(__name__)

with open("static/DOP_PID_ZASTAVKY_B.json",encoding="utf-8") as zastfile:
    zast = json.load(zastfile)
    fs = zast["features"]

@app.route("/")
def hello():
    return render_template("zastavky.html", features=fs)

@app.route("/test")
def test():
    return ""

@app.route("/map")
def mapPage():
    return render_template("map.html")

app.run(port=5000,debug=True)