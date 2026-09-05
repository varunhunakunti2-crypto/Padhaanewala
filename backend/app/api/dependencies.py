# Re-export everything from deps.py for compatibility
from app.api.deps import *  # noqa: F401,F403
from app.api.deps import get_current_user, get_current_active_user, RoleChecker  # noqa: F401
from app.db.session import get_db  # noqa: F401
