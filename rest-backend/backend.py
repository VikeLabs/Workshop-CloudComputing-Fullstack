import json

from flask import Flask
from flask_cors import CORS, cross_origin

from mockdata import data as mock_data

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


def get_data(id: int): 
    return mock_data[id]


@app.route("/")
def slash():
    return "hello, world"


@app.route("/product/<id>")
@cross_origin()
def product(id):
    try:
        data = get_data(id)
        return json.dumps({
            "nam": data["name"],
            "img": data["imageUrl"],
            "pri": data["price"],
            "sel": data["sellerName"]
        }), 200
    except:
        print(f"An error occurred while trying to get product information, id: {id}")
        return json.dumps({}), 400