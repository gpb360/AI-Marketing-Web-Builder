#!/usr/bin/env python3
"""Basic backend test to verify FastAPI works"""

from fastapi import FastAPI
import uvicorn

app = FastAPI(title="AI Marketing Web Builder - Backend Test")

@app.get("/")
def root():
    return {"message": "✅ Backend is working!", "status": "healthy"}

@app.get("/health")
def health():
    return {"status": "healthy", "backend": "operational"}

if __name__ == "__main__":
    print("✅ Backend test app created successfully!")
    print("✅ FastAPI imports working!")
    print("✅ Basic endpoints defined!")