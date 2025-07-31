#!/usr/bin/env python3
"""
Structure Validation for Backend - Works without dependencies
"""

import sys
import os
import ast
from pathlib import Path

def print_status(status, message):
    """Print colored status message."""
    colors = {
        'PASS': '✅',
        'FAIL': '❌', 
        'INFO': 'ℹ️',
        'WARN': '⚠️'
    }
    print(f"{colors.get(status, '')} {message}")

def check_file_structure():
    """Check all required files exist."""
    print("\n🔍 Checking file structure...")
    
    required_files = [
        "src/main.py",
        "src/core/config.py",
        "src/core/database.py",
        "src/core/__init__.py",
        "src/models/__init__.py", 
        "src/models/base.py",
        "src/models/users.py",
        "src/models/workflows.py",
        "src/models/crm.py",
        "src/models/sites.py",
        "requirements.txt",
        ".env.example"
    ]
    
    missing = []
    for file_path in required_files:
        if os.path.exists(file_path):
            print_status('PASS', f"Found: {file_path}")
        else:
            print_status('FAIL', f"Missing: {file_path}")
            missing.append(file_path)
    
    return len(missing) == 0

def check_python_syntax():
    """Check Python syntax for all source files."""
    print("\n🔍 Checking Python syntax...")
    
    python_files = []
    src_dir = Path("src")
    
    if src_dir.exists():
        python_files.extend(src_dir.rglob("*.py"))
    
    syntax_errors = []
    for file_path in python_files:
        try:
            with open(file_path, 'r') as f:
                ast.parse(f.read())
            print_status('PASS', f"Syntax OK: {file_path}")
        except SyntaxError as e:
            print_status('FAIL', f"Syntax Error in {file_path}: {e}")
            syntax_errors.append(str(file_path))
        except Exception as e:
            print_status('WARN', f"Could not parse {file_path}: {e}")
    
    return len(syntax_errors) == 0

def check_requirements():
    """Check requirements.txt content."""
    print("\n🔍 Checking requirements.txt...")
    
    if not os.path.exists("requirements.txt"):
        print_status('FAIL', "requirements.txt not found")
        return False
    
    try:
        with open("requirements.txt", 'r') as f:
            lines = f.readlines()
        
        # Check for essential packages
        required = ['fastapi', 'uvicorn', 'pydantic', 'sqlalchemy', 'asyncpg']
        content = '\n'.join(lines).lower()
        
        missing = []
        for package in required:
            if package in content:
                print_status('PASS', f"Found package: {package}")
            else:
                missing.append(package)
                print_status('FAIL', f"Missing package: {package}")
        
        # Check for development packages
        dev_packages = ['pytest', 'black', 'mypy']
        for package in dev_packages:
            if package in content:
                print_status('PASS', f"Found dev package: {package}")
            else:
                print_status('WARN', f"Missing dev package: {package}")
        
        return len(missing) == 0
        
    except Exception as e:
        print_status('FAIL', f"Error reading requirements.txt: {e}")
        return False

def check_configuration_structure():
    """Check configuration file structure without imports."""
    print("\n🔍 Checking configuration structure...")
    
    config_file = "src/core/config.py"
    if not os.path.exists(config_file):
        print_status('FAIL', f"Missing {config_file}")
        return False
    
    try:
        with open(config_file, 'r') as f:
            content = f.read()
        
        # Check for key components
        required_elements = [
            'class Settings',
            'BaseSettings',
            'app_name',
            'version',
            'environment',
            'database_url',
            'secret_key'
        ]
        
        missing = []
        for element in required_elements:
            if element in content:
                print_status('PASS', f"Found config element: {element}")
            else:
                missing.append(element)
                print_status('FAIL', f"Missing config element: {element}")
        
        return len(missing) == 0
        
    except Exception as e:
        print_status('FAIL', f"Error reading config file: {e}")
        return False

def check_main_app_structure():
    """Check main.py structure."""
    print("\n🔍 Checking main.py structure...")
    
    main_file = "src/main.py"
    if not os.path.exists(main_file):
        print_status('FAIL', f"Missing {main_file}")
        return False
    
    try:
        with open(main_file, 'r') as f:
            content = f.read()
        
        required_elements = [
            'FastAPI',
            'app = FastAPI',
            'CORSMiddleware',
            '@app.get("/")',
            '@app.get("/health")',
            '@app.get("/api/status")',
            'lifespan'
        ]
        
        missing = []
        for element in required_elements:
            if element in content:
                print_status('PASS', f"Found app element: {element}")
            else:
                missing.append(element)
                print_status('FAIL', f"Missing app element: {element}")
        
        return len(missing) == 0
        
    except Exception as e:
        print_status('FAIL', f"Error reading main.py: {e}")
        return False

def check_database_structure():
    """Check database configuration structure."""
    print("\n🔍 Checking database structure...")
    
    db_file = "src/core/database.py"
    if not os.path.exists(db_file):
        print_status('FAIL', f"Missing {db_file}")
        return False
    
    try:
        with open(db_file, 'r') as f:
            content = f.read()
        
        required_elements = [
            'create_async_engine',
            'AsyncSession',
            'declarative_base',
            'async def',
            'sessionmaker'
        ]
        
        missing = []
        for element in required_elements:
            if element in content:
                print_status('PASS', f"Found db element: {element}")
            else:
                missing.append(element)
                print_status('WARN', f"Missing db element: {element}")
        
        return True  # Non-critical for structure validation
        
    except Exception as e:
        print_status('FAIL', f"Error reading database.py: {e}")
        return False

def main():
    """Run structure validation."""
    print("🛠️ Backend Structure Validation")
    print("=" * 40)
    print("Validating backend without dependencies")
    print("=" * 40)
    
    checks = [
        ("File Structure", check_file_structure),
        ("Python Syntax", check_python_syntax),
        ("Requirements Content", check_requirements),
        ("Configuration Structure", check_configuration_structure),
        ("Main App Structure", check_main_app_structure),
        ("Database Structure", check_database_structure),
    ]
    
    passed = 0
    total = len(checks)
    failed_checks = []
    
    for check_name, check_func in checks:
        print(f"\n📋 {check_name}")
        print("-" * 30)
        if check_func():
            passed += 1
        else:
            failed_checks.append(check_name)
    
    # Summary
    print("\n" + "=" * 40)
    print("🎯 STRUCTURE VALIDATION SUMMARY")
    print("=" * 40)
    print(f"Total Checks: {total}")
    print_status('PASS' if passed == total else 'INFO', f"Passed: {passed}")
    print_status('FAIL' if failed_checks else 'PASS', f"Failed: {len(failed_checks)}")
    
    if failed_checks:
        print("\n❌ FAILED STRUCTURE CHECKS:")
        for check in failed_checks:
            print(f"  - {check}")
        print("\n🔧 Fix structure issues before dependency installation")
        return False
    else:
        print("\n🎉 STRUCTURE VALIDATION PASSED!")
        print("✅ Backend structure is ready")
        print("✅ Ready for dependency installation")
        print("✅ Ready for FastAPI server startup")
        return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)