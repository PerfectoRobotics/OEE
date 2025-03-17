from flask import Flask, render_template, jsonify
from database import engine  # Import the database engine
from plcaccess import fetch_plc_data

# Initialize Flask app
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_oee_data")
def get_oee_data():
    return jsonify(fetch_plc_data())

if __name__ == "__main__":
    app.run(debug=True)
