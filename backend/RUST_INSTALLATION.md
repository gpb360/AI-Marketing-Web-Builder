# Rust Installation Guide for Pydantic-core

The pydantic-core package requires Rust to compile extensions. Follow these steps to install Rust:

## Windows Installation

1. **Download Rustup**:
   - Visit https://www.rust-lang.org/tools/install
   - Download rustup-init.exe for Windows

2. **Install Rust**:
   - Run the downloaded rustup-init.exe
   - Follow the installation prompts
   - Choose the default options (1) unless you have specific requirements

3. **Restart your terminal/command prompt** to reload the PATH environment variables

4. **Verify installation**:
   ```bash
   rustc --version
   cargo --version
   ```

## Alternative: Install via Chocolatey (Windows)

If you have Chocolatey installed:
```bash
choco install rust
```

## Alternative: Install via Scoop (Windows)

If you have Scoop installed:
```bash
scoop install rustup
```

## After Installing Rust

Once Rust is installed, you should be able to install pydantic-core:
```bash
cd backend
pip install pydantic-core
```

Or install all backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

## Troubleshooting

If you still encounter issues:
1. Make sure to restart your terminal after installing Rust
2. Check that the Rust binaries are in your PATH
3. Try running `rustup default stable` to ensure you have a stable toolchain