import json


def lambda_handler(event, context):
    name = event.get("name", "World")

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": f"Hello, {name}!",
            "source": "AWS Lambda running locally with SAM"
        })
    }
