from typing import Generic, TypeVar, List, Optional, Any
from pydantic import BaseModel, Field

DataT = TypeVar("DataT")

class ResponseModel(BaseModel, Generic[DataT]):
    success: bool = True
    message: str = "Operation successful"
    data: Optional[DataT] = None

class PaginatedData(BaseModel, Generic[DataT]):
    items: List[DataT]
    total: int
    page: int
    size: int
    pages: int

class PaginatedResponse(ResponseModel[PaginatedData[DataT]], Generic[DataT]):
    pass

class ErrorResponseModel(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[Any] = None
