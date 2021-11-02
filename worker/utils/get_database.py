from pymongo import MongoClient
from pymongo.database import Database
from settings.settings import MONGO_CONNECTION_STRING


def get_database() -> Database:

    # Create a connection using MongoClient. You can import MongoClient or use pymongo.MongoClient
    client = MongoClient(MONGO_CONNECTION_STRING)

    # Create the database for our example (we will use the same database throughout the tutorial
    return client['ref']
