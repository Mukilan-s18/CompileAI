"""UI schema models.

Stage 3 output (part 1): Complete UI specification including pages, layouts,
forms, tables, navigation, and component definitions.
"""

from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class ComponentType(str, Enum):
    """Types of UI components."""
    FORM = "form"
    TABLE = "table"
    CHART = "chart"
    CARD = "card"
    LIST = "list"
    DETAIL_VIEW = "detail_view"
    STATS_GRID = "stats_grid"
    CALENDAR = "calendar"
    MODAL = "modal"


class InputType(str, Enum):
    """Types of form inputs."""
    TEXT = "text"
    EMAIL = "email"
    PASSWORD = "password"
    NUMBER = "number"
    TEXTAREA = "textarea"
    SELECT = "select"
    MULTISELECT = "multiselect"
    CHECKBOX = "checkbox"
    RADIO = "radio"
    DATE = "date"
    DATETIME = "datetime"
    FILE = "file"
    TOGGLE = "toggle"
    CURRENCY = "currency"
    PHONE = "phone"
    URL = "url"


class FormField(BaseModel):
    """A field in a form component."""
    name: str = Field(..., description="Field name in snake_case")
    label: str = Field(..., description="Display label")
    input_type: InputType = Field(..., description="Input type")
    required: bool = Field(default=True, description="Whether field is required")
    placeholder: str = Field(default="", description="Input placeholder text")
    validation_rules: list[str] = Field(
        default_factory=list,
        description="Validation rules: min_length, max_length, pattern, min, max",
    )
    options: list[str] = Field(
        default_factory=list, description="Options for select/radio inputs"
    )
    default_value: str | None = Field(default=None, description="Default value")


class Form(BaseModel):
    """A form component specification."""
    name: str = Field(..., description="Form identifier")
    title: str = Field(..., description="Form display title")
    fields: list[FormField] = Field(..., min_length=1, description="Form fields")
    submit_endpoint: str = Field(..., description="API endpoint for form submission")
    submit_method: str = Field(default="POST", description="HTTP method")


class TableColumn(BaseModel):
    """A column in a table component."""
    key: str = Field(..., description="Data key in snake_case")
    label: str = Field(..., description="Column header label")
    sortable: bool = Field(default=True, description="Whether column is sortable")
    filterable: bool = Field(default=False, description="Whether column is filterable")
    data_type: str = Field(
        default="string", description="Display type: string, number, date, badge, avatar, actions"
    )


class Table(BaseModel):
    """A table/data-grid component specification."""
    name: str = Field(..., description="Table identifier")
    title: str = Field(..., description="Table display title")
    columns: list[TableColumn] = Field(..., min_length=1, description="Table columns")
    data_endpoint: str = Field(..., description="API endpoint for fetching data")
    row_actions: list[str] = Field(
        default_factory=list, description="Per-row actions: view, edit, delete"
    )
    supports_pagination: bool = Field(default=True, description="Whether table supports pagination")
    supports_search: bool = Field(default=True, description="Whether table supports search")


class Button(BaseModel):
    """A button/action component."""
    label: str = Field(..., description="Button text")
    action: str = Field(..., description="Action: navigate, submit, api_call, modal_open")
    target: str = Field(..., description="Action target: URL path, endpoint, or modal ID")
    variant: str = Field(
        default="primary", description="Visual variant: primary, secondary, danger, outline, ghost"
    )
    requires_role: str | None = Field(
        default=None, description="Role required to see this button"
    )


class StatCard(BaseModel):
    """A statistics card for dashboards."""
    title: str = Field(..., description="Stat title")
    value_endpoint: str = Field(..., description="API endpoint to fetch the value")
    icon: str = Field(default="chart", description="Icon name")
    color: str = Field(default="blue", description="Accent color")


class ChartConfig(BaseModel):
    """Configuration for a chart component."""
    chart_type: str = Field(
        ..., description="Chart type: line, bar, pie, area, donut"
    )
    title: str = Field(..., description="Chart title")
    data_endpoint: str = Field(..., description="API endpoint for chart data")
    x_axis: str = Field(default="", description="X-axis field key")
    y_axis: str = Field(default="", description="Y-axis field key")


class PageComponent(BaseModel):
    """A component instance placed on a page."""
    component_type: ComponentType = Field(..., description="Type of component")
    component_id: str = Field(..., description="Unique component identifier")
    form: Form | None = Field(default=None, description="Form spec (when type is form)")
    table: Table | None = Field(default=None, description="Table spec (when type is table)")
    chart: ChartConfig | None = Field(default=None, description="Chart spec (when type is chart)")
    stat_cards: list[StatCard] = Field(
        default_factory=list, description="Stat cards (when type is stats_grid)"
    )
    grid_column_span: int = Field(
        default=12, description="Grid column span (out of 12)"
    )


class Page(BaseModel):
    """A page in the application."""
    name: str = Field(..., description="Page name in kebab-case, e.g. 'contact-list'")
    title: str = Field(..., description="Page display title")
    route: str = Field(..., description="URL path, e.g. '/contacts'")
    layout: str = Field(
        default="dashboard", description="Layout template: dashboard, auth, landing, settings"
    )
    components: list[PageComponent] = Field(
        default_factory=list, description="Components on this page"
    )
    buttons: list[Button] = Field(
        default_factory=list, description="Page-level action buttons"
    )
    requires_auth: bool = Field(default=True, description="Whether page requires authentication")
    allowed_roles: list[str] = Field(
        default_factory=list, description="Roles allowed to view this page (empty = all)"
    )


class NavigationItem(BaseModel):
    """An item in the application navigation."""
    label: str = Field(..., description="Navigation label")
    route: str = Field(..., description="Target route")
    icon: str = Field(default="", description="Icon name")
    parent: str | None = Field(default=None, description="Parent nav item for nesting")
    requires_role: str | None = Field(
        default=None, description="Role required to see this nav item"
    )


class UISchema(BaseModel):
    """Complete UI specification for the application.

    Stage 3 output (UI portion).
    """
    app_name: str = Field(..., description="Application name")
    theme: str = Field(default="dark", description="Default theme: dark, light")
    pages: list[Page] = Field(..., min_length=1, description="Application pages")
    navigation: list[NavigationItem] = Field(
        ..., min_length=1, description="Main navigation items"
    )
