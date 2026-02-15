"""
Socket.IO server for real-time vital signs updates
"""

import socketio
from app.auth import decode_token

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",  # Allow all for debugging, or ensure the string matches exactly
    logger=True,
)


@sio.event
async def connect(sid, environ, auth):
    """Handle client connection with JWT auth."""
    token = auth.get("token") if auth else None
    if not token:
        raise socketio.exceptions.ConnectionRefusedError("Authentication required")
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        await sio.save_session(sid, {"user_id": user_id})
        await sio.enter_room(sid, f"user_{user_id}")
        print(f"🔌 User {user_id} connected (sid: {sid})")
    except Exception as e:
        raise socketio.exceptions.ConnectionRefusedError(str(e))


@sio.event
async def disconnect(sid):
    session = await sio.get_session(sid)
    user_id = session.get("user_id", "unknown")
    print(f"🔌 User {user_id} disconnected")


@sio.event
async def vitals_update(sid, data):
    """Receive real-time vitals from client/watch and broadcast."""
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    if user_id:
        # Broadcast to user's room (for family monitoring)
        await sio.emit("vitals_data", data, room=f"user_{user_id}")

        # Check for alerts
        alerts = check_vital_alerts(data)
        if alerts:
            await sio.emit("health_alert", {"alerts": alerts}, room=f"user_{user_id}")


def check_vital_alerts(data: dict) -> list:
    """Check vital signs for concerning values."""
    alerts = []
    hr = data.get("heart_rate")
    spo2 = data.get("spo2")
    stress = data.get("stress_level")
    sys_bp = data.get("blood_pressure_sys")

    if hr and (hr > 120 or hr < 50):
        alerts.append({
            "type": "heart_rate",
            "severity": "high",
            "message": f"Abnormal heart rate: {hr} bpm",
            "message_ar": f"نبض غير طبيعي: {hr} نبضة/دقيقة",
        })
    if spo2 and spo2 < 92:
        alerts.append({
            "type": "spo2",
            "severity": "critical",
            "message": f"Low oxygen saturation: {spo2}%",
            "message_ar": f"انخفاض الأكسجين: {spo2}%",
        })
    if stress and stress > 80:
        alerts.append({
            "type": "stress",
            "severity": "medium",
            "message": f"High stress level: {stress}",
            "message_ar": f"مستوى توتر عالي: {stress}",
        })
    if sys_bp and sys_bp > 160:
        alerts.append({
            "type": "blood_pressure",
            "severity": "high",
            "message": f"High blood pressure: {sys_bp} mmHg",
            "message_ar": f"ضغط دم مرتفع: {sys_bp} ملم زئبق",
        })
    return alerts


def create_socketio_app(fastapi_app):
    """Wrap FastAPI app with Socket.IO."""
    return socketio.ASGIApp(sio, other_asgi_app=fastapi_app)
