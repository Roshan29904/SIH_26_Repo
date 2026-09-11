import os
import sys
from pathlib import Path

# Ensure AI-Backend and repo root are always on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
REPO_DIR = BASE_DIR.parent

for path_entry in [str(BASE_DIR), str(REPO_DIR)]:
    if path_entry not in sys.path:
        sys.path.insert(0, path_entry)

# Ensure spawned subprocesses (such as Uvicorn reload workers) inherit AI-Backend in PYTHONPATH
existing_pythonpath = os.environ.get("PYTHONPATH", "")
if str(BASE_DIR) not in existing_pythonpath:
    os.environ["PYTHONPATH"] = (
        f"{BASE_DIR}{os.pathsep}{existing_pythonpath}"
        if existing_pythonpath
        else str(BASE_DIR)
    )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Support both 'fast_api.routes' and local 'routes' imports
try:
    from fast_api.routes import router, WindowsPathJsonRoute
except (ImportError, ModuleNotFoundError):
    from routes import router, WindowsPathJsonRoute

app = FastAPI(
    title="Sovereign Industrial AI Workbench API",
    description="On-premise confidential AI workbench using local open-weight models (SIH PS #117)",
    version="1.0.0"
)
app.router.route_class = WindowsPathJsonRoute

# Enable CORS for local frontends (React, Vue, Streamlit, etc.) and Java backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints
app.include_router(router)



if __name__ == "__main__":
    import uvicorn
    # app_dir ensures uvicorn reloader subprocess finds fast_api regardless of current working directory
    uvicorn.run(
        "fast_api.app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        app_dir=str(BASE_DIR)
    )