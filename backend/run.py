"""
Healix Server Entry Point
Run: uvicorn run:application --host 0.0.0.0 --port 8000 --reload
"""

from main import app
from app.socket_server import create_socketio_app

# Wrap FastAPI with Socket.IO
application = create_socketio_app(app)
