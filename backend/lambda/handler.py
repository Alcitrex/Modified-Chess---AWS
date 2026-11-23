import json
import os
import time

import boto3

table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])


def _response(status, body=None):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body) if body is not None else "",
    }


def lambda_handler(event, context):
    # API Gateway JWT authorizer has already validated the Cognito token.
    user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
    method = event["requestContext"]["http"]["method"]

    if method == "GET":
        item = table.get_item(Key={"user_id": user_id}).get("Item")
        if not item:
            return _response(404, {"error": "no saved game"})
        return _response(200, {"state": item["state"], "updated_at": int(item["updated_at"])})

    if method == "PUT":
        try:
            body = json.loads(event.get("body") or "{}")
            state = body["state"]
        except (ValueError, KeyError):
            return _response(400, {"error": "body must be JSON with a 'state' field"})
        table.put_item(
            Item={
                "user_id": user_id,
                "state": state,
                "updated_at": int(time.time()),
            }
        )
        return _response(200, {"ok": True})

    if method == "DELETE":
        table.delete_item(Key={"user_id": user_id})
        return _response(200, {"ok": True})

    return _response(405, {"error": "method not allowed"})
