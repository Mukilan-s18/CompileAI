"""Database schema models.

Stage 3 output (part 3): Complete relational database specification including
tables, columns, constraints, indexes, and foreign keys.
"""

from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class ColumnType(str, Enum):
    """SQL column data types."""
    UUID = "uuid"
    SERIAL = "serial"
    VARCHAR = "varchar"
    TEXT = "text"
    INTEGER = "integer"
    BIGINT = "bigint"
    DECIMAL = "decimal"
    BOOLEAN = "boolean"
    TIMESTAMP = "timestamp"
    DATE = "date"
    JSONB = "jsonb"
    ENUM = "enum"


class Column(BaseModel):
    """A column in a database table."""
    name: str = Field(..., description="Column name in snake_case")
    column_type: ColumnType = Field(..., description="SQL data type")
    primary_key: bool = Field(default=False, description="Whether column is primary key")
    nullable: bool = Field(default=True, description="Whether column can be NULL")
    unique: bool = Field(default=False, description="Whether column has unique constraint")
    default_value: str | None = Field(
        default=None, description="Default value expression, e.g. 'NOW()', 'gen_random_uuid()'"
    )
    max_length: int | None = Field(
        default=None, description="Max length for varchar columns"
    )
    description: str = Field(default="", description="Column description")
    enum_values: list[str] = Field(
        default_factory=list, description="Enum values (when column_type is enum)"
    )


class ForeignKey(BaseModel):
    """A foreign key constraint between tables."""
    column: str = Field(..., description="Column in this table")
    references_table: str = Field(..., description="Referenced table name")
    references_column: str = Field(default="id", description="Referenced column name")
    on_delete: str = Field(
        default="CASCADE", description="ON DELETE behavior: CASCADE, SET NULL, RESTRICT"
    )
    on_update: str = Field(
        default="CASCADE", description="ON UPDATE behavior: CASCADE, SET NULL, RESTRICT"
    )


class Index(BaseModel):
    """A database index."""
    name: str = Field(..., description="Index name")
    columns: list[str] = Field(..., min_length=1, description="Indexed columns")
    unique: bool = Field(default=False, description="Whether index is unique")
    index_type: str = Field(
        default="btree", description="Index type: btree, hash, gin, gist"
    )


class CheckConstraint(BaseModel):
    """A CHECK constraint on a table."""
    name: str = Field(..., description="Constraint name")
    expression: str = Field(..., description="SQL CHECK expression")


class DBTable(BaseModel):
    """A database table specification."""
    name: str = Field(..., description="Table name in snake_case plural, e.g. 'users', 'contacts'")
    description: str = Field(default="", description="Table description")
    columns: list[Column] = Field(..., min_length=1, description="Table columns")
    foreign_keys: list[ForeignKey] = Field(
        default_factory=list, description="Foreign key constraints"
    )
    indexes: list[Index] = Field(
        default_factory=list, description="Table indexes"
    )
    check_constraints: list[CheckConstraint] = Field(
        default_factory=list, description="CHECK constraints"
    )


class DatabaseSchema(BaseModel):
    """Complete database specification for the application.

    Stage 3 output (DB portion).
    """
    database_name: str = Field(..., description="Database name")
    tables: list[DBTable] = Field(..., min_length=1, description="All database tables")
    enums: list[dict[str, list[str]]] = Field(
        default_factory=list,
        description="Custom PostgreSQL enum types: [{name: [values]}]",
    )
