from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from datetime import datetime
import os

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = os.urandom(24)

@app.route('/')
def index():
    return render_template('index.html', user_is_logged_in='username' in session)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if data and 'username' in data:
        session['username'] = data['username']
        return jsonify({"success": True})
    return jsonify({"success": False}), 400

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({"success": True})

@app.route('/age', methods=['GET'])
def calculate_age():
    birthdate_str = request.args.get('birthdate')
    if not birthdate_str:
        return jsonify({"error": "birthdate query parameter is required"}), 400

    try:
        birthdate = datetime.strptime(birthdate_str, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD"}), 400

    today = datetime.today()
    age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
    
    return jsonify({"age": age})

if __name__ == '__main__':
    app.run(debug=True)