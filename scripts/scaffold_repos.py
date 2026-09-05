import os
from pathlib import Path

MODULES = ["course", "university", "scholarship", "exam", "enquiry", "review", "blog"]

BACKEND_DIR = Path("backend")
REPOS_DIR = BACKEND_DIR / "app" / "repositories"
SERVICES_DIR = BACKEND_DIR / "app" / "services"

def create_repo(module: str):
    file_path = REPOS_DIR / f"{module}_repository.py"
    if not file_path.exists():
        content = f"""from app.repositories.base import BaseRepository
from app.models import {module.capitalize()}
from app.schemas.{module} import {module.capitalize()}Create, {module.capitalize()}Update

class {module.capitalize()}Repository(BaseRepository[{module.capitalize()}, {module.capitalize()}Create, {module.capitalize()}Update]):
    pass

{module}_repo = {module.capitalize()}Repository({module.capitalize()})
"""
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Created {file_path}")

def create_service(module: str):
    file_path = SERVICES_DIR / f"{module}_service.py"
    if not file_path.exists():
        content = f"""from app.services.base import BaseService
from app.repositories.{module}_repository import {module}_repo

class {module.capitalize()}Service(BaseService):
    def __init__(self):
        super().__init__({module}_repo)

{module}_service = {module.capitalize()}Service()
"""
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Created {file_path}")

for m in MODULES:
    create_repo(m)
    create_service(m)
