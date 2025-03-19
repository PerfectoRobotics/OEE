from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from database import engine  # Import the database engine
from dashread import fetch_plc_data  # Import function to fetch PLC data
from sqlalchemy import text

# Initialize Flask app
app = Flask(__name__)
app.secret_key = "your_secret_key"  # Change this to a secure secret key

# User Authentication
def get_user(username):
    """Fetch user details from database"""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT username, password, first_name, last_name FROM users WHERE username = :username"), 
                              {"username": username}).fetchone()
        return result

@app.route("/", methods=["GET", "POST"])
def login():
    """User login"""
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = get_user(username)

        if user:
            stored_password = user[1]  # Ensure this is correct

            if stored_password == password:  # Plain text password comparison
                session["username"] = username
                session["first_name"] = user[2]  # Store first name in session
                session["last_name"] = user[3]  # Store last name in session
                return redirect(url_for("index"))
        flash("Invalid username or password", "error")

    return render_template("login.html")

@app.route("/index")
def index():
    """User index"""
    if "username" not in session:
        return redirect(url_for("login"))
    
    full_name = f"{session.get('first_name', '')} {session.get('last_name', '')}".strip()
    plc_data = fetch_plc_data()  # Get structured PLC data
    
    return render_template("index.html", username=session["username"], full_name=full_name, plc_data=plc_data)

@app.route("/logout")
def logout():
    """Logout user"""
    session.pop("username", None)
    session.pop("first_name", None)
    session.pop("last_name", None)
    return redirect(url_for("login"))

@app.route("/get_oee_data")
def get_oee_data():
    """Fetch and return OEE data"""
    plc_data = fetch_plc_data()  # Fetch data from PLC
    return jsonify(plc_data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
