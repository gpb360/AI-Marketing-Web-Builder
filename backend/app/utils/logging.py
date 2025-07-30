"""
Logging utilities and configuration.
"""

import logging
import sys
from typing import Any, Dict
from app.core.config import settings


def setup_logging() -> None:
    """Setup application logging configuration."""
    
    # Configure logging level
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    # Create formatter
    formatter = logging.Formatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Add console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Configure specific loggers
    loggers_config = {
        "sqlalchemy.engine": logging.WARNING,
        "sqlalchemy.pool": logging.WARNING,
        "alembic": logging.INFO,
        "uvicorn": logging.INFO,
        "uvicorn.access": logging.WARNING if not settings.DEBUG else logging.INFO,
    }
    
    for logger_name, level in loggers_config.items():
        logger = logging.getLogger(logger_name)
        logger.setLevel(level)


def get_logger(name: str) -> logging.Logger:
    """Get a configured logger instance."""
    return logging.getLogger(name)


class StructuredLogger:
    """Structured logging helper for consistent log formatting."""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
    
    def _log(self, level: int, message: str, **kwargs: Any) -> None:
        """Log with structured data."""
        extra_data = " | ".join([f"{k}={v}" for k, v in kwargs.items()])
        full_message = f"{message} | {extra_data}" if extra_data else message
        self.logger.log(level, full_message)
    
    def info(self, message: str, **kwargs: Any) -> None:
        """Log info level message."""
        self._log(logging.INFO, message, **kwargs)
    
    def warning(self, message: str, **kwargs: Any) -> None:
        """Log warning level message."""
        self._log(logging.WARNING, message, **kwargs)
    
    def error(self, message: str, **kwargs: Any) -> None:
        """Log error level message."""
        self._log(logging.ERROR, message, **kwargs)
    
    def debug(self, message: str, **kwargs: Any) -> None:
        """Log debug level message."""
        self._log(logging.DEBUG, message, **kwargs)