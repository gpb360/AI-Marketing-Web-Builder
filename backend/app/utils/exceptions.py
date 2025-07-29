"""
Custom exceptions for the application.
"""

from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AppException(Exception):
    """Base application exception."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(AppException):
    """Validation error exception."""
    pass


class NotFoundError(AppException):
    """Resource not found exception."""
    pass


class PermissionError(AppException):
    """Permission denied exception."""
    pass


class BusinessLogicError(AppException):
    """Business logic violation exception."""
    pass


class ExternalServiceError(AppException):
    """External service error exception."""
    pass


# HTTP Exception helpers
def http_400_bad_request(message: str = "Bad request") -> HTTPException:
    """Create HTTP 400 Bad Request exception."""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message
    )


def http_401_unauthorized(message: str = "Unauthorized") -> HTTPException:
    """Create HTTP 401 Unauthorized exception."""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={"WWW-Authenticate": "Bearer"}
    )


def http_403_forbidden(message: str = "Forbidden") -> HTTPException:
    """Create HTTP 403 Forbidden exception."""
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=message
    )


def http_404_not_found(message: str = "Not found") -> HTTPException:
    """Create HTTP 404 Not Found exception."""
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=message
    )


def http_409_conflict(message: str = "Conflict") -> HTTPException:
    """Create HTTP 409 Conflict exception."""
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=message
    )


def http_422_unprocessable_entity(message: str = "Unprocessable Entity") -> HTTPException:
    """Create HTTP 422 Unprocessable Entity exception."""
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=message
    )


def http_500_internal_server_error(message: str = "Internal server error") -> HTTPException:
    """Create HTTP 500 Internal Server Error exception."""
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=message
    )