import os
from pathlib import Path

# List of modules to scaffold
MODULES = [
    "users", "courses", "universities", "locations", "facilities", 
    "scholarships", "exams", "mock_tests", "reviews", "blogs", 
    "faqs", "banners", "notifications", "enquiries", "leads", 
    "counsellors", "predictor", "ai", "comparison", "media", 
    "analytics", "dashboard"
]

BACKEND_DIR = Path("backend")
ENDPOINTS_DIR = BACKEND_DIR / "app" / "api" / "v1" / "endpoints"
SCHEMAS_DIR = BACKEND_DIR / "app" / "schemas"
API_FILE = BACKEND_DIR / "app" / "api" / "v1" / "api.py"

def create_router_file(module_name: str):
    file_path = ENDPOINTS_DIR / f"{module_name}.py"
    if not file_path.exists():
        content = f"""from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_{module_name}():
    return {{"success": True, "message": "{module_name.capitalize()} endpoint scaffolded", "data": []}}
"""
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Created router: {file_path}")

def create_schema_file(module_name: str):
    # Some schemas might already exist like user.py, so don't overwrite
    # Make schema name singular if plural (rudimentary)
    singular = module_name[:-1] if module_name.endswith('s') else module_name
    file_path = SCHEMAS_DIR / f"{singular}.py"
    if not file_path.exists():
        content = f"""from pydantic import BaseModel
from typing import Optional

class {singular.capitalize()}Base(BaseModel):
    pass

class {singular.capitalize()}Create({singular.capitalize()}Base):
    pass

class {singular.capitalize()}Update({singular.capitalize()}Base):
    pass

class {singular.capitalize()}Response({singular.capitalize()}Base):
    id: str
    
    class Config:
        from_attributes = True
"""
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Created schema: {file_path}")

def update_api_file():
    if not API_FILE.exists():
        print("api.py not found!")
        return
        
    with open(API_FILE, "r") as f:
        content = f.read()
        
    # Generate imports and includes
    imports_to_add = []
    includes_to_add = []
    
    for module in MODULES:
        if f"from app.api.v1.endpoints import {module}" not in content and f"endpoints import " not in content or module not in content:
            # We'll just append includes at the end
            if f"api_router.include_router({module}.router" not in content:
                includes_to_add.append(module)
                
    if not includes_to_add:
        print("No new modules to register in api.py")
        return
        
    # Modify api.py lines
    lines = content.split('\n')
    
    # Add imports (just adding a new line for simplicity if we can't find a clean place, but let's append to existing imports)
    import_line = f"from app.api.v1.endpoints import {', '.join(includes_to_add)}"
    # insert at line 2
    lines.insert(2, import_line)
    
    # Add includes
    for module in includes_to_add:
        lines.append(f'api_router.include_router({module}.router, prefix="/{module.replace("_", "-")}", tags=["{module.replace("_", " ").title()}"])')
        
    with open(API_FILE, "w") as f:
        f.write("\n".join(lines))
    print("Updated api.py with new routers.")

if __name__ == "__main__":
    for module in MODULES:
        create_router_file(module)
        create_schema_file(module)
        
    update_api_file()
    print("Scaffolding complete.")
