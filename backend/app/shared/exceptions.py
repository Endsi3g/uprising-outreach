from fastapi import HTTPException, status


class AppError(Exception):
    code: str = "INTERNAL_ERROR"
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    message: str = "An unexpected error occurred"

    def __init__(self, message: str | None = None, details: dict | None = None) -> None:
        self.message = message or self.__class__.message
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(AppError):
    code = "NOT_FOUND"
    status_code = status.HTTP_404_NOT_FOUND
    message = "Resource not found"


class ForbiddenError(AppError):
    code = "FORBIDDEN"
    status_code = status.HTTP_403_FORBIDDEN
    message = "You do not have permission to perform this action"


class UnauthorizedError(AppError):
    code = "UNAUTHORIZED"
    status_code = status.HTTP_401_UNAUTHORIZED
    message = "Authentication required"


class ValidationError(AppError):
    code = "VALIDATION_ERROR"
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    message = "Validation failed"


class ConflictError(AppError):
    code = "CONFLICT"
    status_code = status.HTTP_409_CONFLICT
    message = "Resource already exists"


class BusinessRuleError(AppError):
    code = "BUSINESS_RULE_VIOLATION"
    status_code = status.HTTP_400_BAD_REQUEST
    message = "Operation not allowed"


def raise_not_found(resource: str, id: str | None = None) -> None:
    msg = f"{resource} not found"
    if id:
        msg = f"{resource} '{id}' not found"
    raise NotFoundError(msg)


def to_http_exception(error: AppError) -> HTTPException:
    return HTTPException(
        status_code=error.status_code,
        detail={"error": {"code": error.code, "message": error.message, "details": error.details}},
    )
