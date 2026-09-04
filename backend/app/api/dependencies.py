from app.db.session import get_db

# Mocks for now, can be implemented with JWT/OAuth later
async def get_current_user():
    return {"id": "test_user_id", "email": "test@example.com"}

async def get_current_admin():
    return {"id": "admin_user_id", "email": "admin@example.com", "role": "admin"}
