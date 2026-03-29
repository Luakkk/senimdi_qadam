from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
import uuid
from .database import Base

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source      = Column(String(255))       # название организации / документа
    content     = Column(Text, nullable=False)
    embedding   = Column(Vector(1536))      # text-embedding-3-small = 1536 dims
    category    = Column(String(100))       # rehabilitation, medical, legal...
    language    = Column(String(10), default="ru")
    created_at  = Column(DateTime, server_default=func.now())
