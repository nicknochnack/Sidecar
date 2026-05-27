from fastapi import FastAPI, UploadFile, File, Form
import subprocess
import tempfile
import os
from pathlib import Path

app = FastAPI()

def run(cmd, timeout):
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    return {
        "status": "success" if r.returncode == 0 else "error",
        "output": r.stdout,
        "error": r.stderr if r.returncode != 0 else None,
    }

@app.post("/agents/import")
async def import_agent(yaml_content: str = Form(...)):
    with tempfile.NamedTemporaryFile("w", suffix=".yaml", delete=False) as f:
        f.write(yaml_content)
        f.flush()
        p = f.name
    try:
        return run(["uv", "run", "orchestrate", "agents", "import", "-f", p], 30)
    finally:
        os.unlink(p)

@app.post("/tools/import")
async def import_tool(tool_file: UploadFile = File(...), requirements_file: UploadFile = File(...)):
    with tempfile.TemporaryDirectory() as d:
        tp = Path(d) / tool_file.filename
        rp = Path(d) / requirements_file.filename
        tp.write_bytes(await tool_file.read())
        rp.write_bytes(await requirements_file.read())
        return run(["uv", "run", "orchestrate", "tools", "import",
                    "-k", "python", "-f", str(tp), "-r", str(rp)], 60)

@app.post("/models/configure")
async def configure_model(provider: str = Form(...), yaml_content: str = Form(...)):
    with tempfile.NamedTemporaryFile("w", suffix=".yaml", delete=False) as f:
        f.write(yaml_content)
        f.flush()
        p = f.name
    try:
        return run(["uv", "run", "orchestrate", "models", "import", "-f", p], 30)
    finally:
        os.unlink(p)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "orchestrate-worker"}

# Made with Bob
