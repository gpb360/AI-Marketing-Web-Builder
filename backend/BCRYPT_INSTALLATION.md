# Bcrypt Installation Guide

## Issue
The bcrypt warning you're seeing:
```
(trapped) error reading bcrypt version
AttributeError: module 'bcrypt' has no attribute '__about__'
```

This is a version compatibility issue between bcrypt and Python 3.13. While it doesn't prevent the application from working, it can be resolved by installing the Rust toolchain which is required for pydantic-core.

## Solution: Install Rust Toolchain

1. **Install Rust**:
   - Visit https://www.rust-lang.org/tools/install
   - Download and run rustup-init.exe for Windows
   - Follow the installation prompts
   - Restart your terminal/command prompt

2. **Verify Rust Installation**:
   ```bash
   rustc --version
   cargo --version
   ```

3. **Reinstall bcrypt** (optional, as it may work without this):
   ```bash
   pip uninstall bcrypt
   pip install bcrypt
   ```

## Alternative Solution (if Rust installation is not desired)

If you prefer not to install Rust, you can ignore the warning as it doesn't affect functionality. The bcrypt library still works correctly despite the warning message.

## Why This Happens

- Python 3.13 changed some internal structures that older versions of bcrypt rely on
- The Rust toolchain allows for proper compilation of native extensions
- Pydantic-core (a dependency) requires Rust for optimal performance