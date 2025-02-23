from flask import Flask, request, jsonify, send_from_directory
import json
import random

app = Flask(__name__, static_folder='frontend', static_url_path='/frontend')

def load_words():
    try:
        with open('words.json', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

# FRONTEND
@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory('.', 'favicon.ico', mimetype='image/x-icon')

@app.route('/frontend/<path:filename>')
def static_files(filename):
    return send_from_directory('frontend', filename)


# BACKEND
@app.route('/quiz', methods=['GET'])
def get_quiz():
    category = request.args.get('category')
    words_data = load_words()

    if category not in words_data:
        return jsonify({"error": "Wrong category"}), 400

    words_list = words_data[category]
    selected_words = words_list if len(words_list) < 20 else random.sample(words_list, 20)

    for idx, word in enumerate(selected_words):
        word["id"] = idx

    return jsonify(selected_words)


@app.route('/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.json

    if not data or 'quiz' not in data or 'answers' not in data:
        return jsonify({"error": "Wrong data submitted"}), 400

    quiz_words = data['quiz']
    answers = data['answers']
    correct_count = sum(
        1 for answer in answers
        if next((word for word in quiz_words if word["id"] == answer["id"]), {}).get("translation", "").strip().lower() 
        == answer["translation"].strip().lower()
    )

    return jsonify({"result": correct_count, "total": len(quiz_words)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
