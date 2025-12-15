from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'CIVWATCH ML'})

@app.route('/predict', methods=['POST'])
def predict():
    return jsonify({'message': 'ML prediction endpoint'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
