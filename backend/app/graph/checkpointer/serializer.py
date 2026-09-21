"""State serializer/deserializer for MongoDB checkpointer."""
import json
from datetime import datetime
from typing import Any

from langchain_core.messages import BaseMessage, messages_from_dict, messages_to_dict


def _default(obj: Any) -> Any:
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, BaseMessage):
        # Fallback for any BaseMessage that slips through outside the
        # top-level "messages" key (which is handled explicitly below).
        return messages_to_dict([obj])[0]
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def serialize_state(state: dict) -> str:
    """
    Serialize graph state to a JSON string.

    `state["messages"]` holds LangChain `BaseMessage` instances (HumanMessage,
    AIMessage, SystemMessage, ...) because LangGraph's `add_messages` reducer
    stores real message objects, not plain dicts. Plain `json.dumps` can't
    serialize those directly, so we convert them with `messages_to_dict`
    before dumping.
    """
    payload = dict(state)
    messages = payload.get("messages")
    if messages:
        payload["messages"] = messages_to_dict(messages)
    return json.dumps(payload, default=_default)


def deserialize_state(raw: str) -> dict:
    """
    Deserialize a JSON string back into graph state, restoring
    `state["messages"]` to real `BaseMessage` instances so downstream graph
    nodes (which call `.content`, isinstance checks, etc.) work as expected.
    """
    payload = json.loads(raw)
    messages = payload.get("messages")
    if messages:
        payload["messages"] = messages_from_dict(messages)
    return payload
