"""Orders API — global order history."""
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("")
async def list_orders(active_only: bool = False, user=Depends(get_current_user)):
    """Returns a bare array — the frontend's orderService.list() expects
    BuyerOrderListItem[] directly, not wrapped in an {"orders": [...]} envelope."""
    docs = await order_service.get_user_orders(user["_id"], active_only=active_only)
    return [_fmt(d) for d in docs]


@router.get("/{order_id}")
async def get_order(order_id: str, user=Depends(get_current_user)):
    doc = await order_service.get_order(order_id)
    if not doc or doc.get("user_id") != user["_id"]:
        raise HTTPException(status_code=404, detail="Order not found")
    return _fmt(doc, include_sub_orders=True)


def _fmt(d: dict, include_sub_orders: bool = False) -> dict:
    out = {
        "order_id": d.get("_id", ""),
        "user_id": d.get("user_id", ""),
        "thread_id": d.get("thread_id", ""),
        "items": d.get("items", []),
        "delivery_address": d.get("delivery_address", {}),
        "subtotal": d.get("subtotal", 0),
        "total": d.get("total", 0),
        "currency": d.get("currency", "INR"),
        "status": d.get("status", ""),
        "razorpay_order_id": d.get("razorpay_order_id"),
        "created_at": str(d.get("created_at", "")),
    }
    if include_sub_orders:
        # order_service.get_order() attaches "seller_sub_orders" to the doc —
        # surface it so the frontend's BuyerOrderDetail.seller_sub_orders
        # (fulfillment-by-seller panel) is actually populated.
        out["seller_sub_orders"] = [
            {
                "order_id": s.get("_id", ""),
                "seller_id": s.get("seller_id"),
                "status": s.get("status", ""),
                "items": s.get("items", []),
                "total": s.get("total", 0),
                "currency": s.get("currency", "INR"),
                "created_at": str(s.get("created_at", "")),
            }
            for s in d.get("seller_sub_orders", [])
        ]
    return out
