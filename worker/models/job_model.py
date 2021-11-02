from typing import TypedDict

from bson import ObjectId


class JobModel(TypedDict):
    _id: ObjectId
    completed: bool
    filename: str
    key: str
