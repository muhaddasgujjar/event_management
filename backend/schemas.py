from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import Optional, List, Any
from datetime import datetime
from models import (
    UserRole, QuoteStatus, EventStatus, EquipmentCategory, EquipmentStatus,
    InquiryType, PortfolioCategory, ServiceCategory, NotificationType,
    PaymentStatus, PaymentMethod, StaffExpenseCategory,
)


# ─────────────────────────────── AUTH / USER ────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.CLIENT


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# ─────────────────────────────── CLIENT ─────────────────────────────────────

class ClientCreate(BaseModel):
    company_name: str
    contact_person: str
    phone: str
    email: EmailStr
    industry: Optional[str] = None


class ClientUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None


class ClientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    company_name: str
    contact_person: str
    phone: str
    email: str
    industry: Optional[str]
    created_at: datetime


class ClientWithQuotes(ClientResponse):
    quotes: List["QuoteResponse"] = []


# ─────────────────────────────── QUOTE ──────────────────────────────────────

class QuoteCreate(BaseModel):
    company_name: str
    contact_person: str
    phone: str
    email: EmailStr
    event_type: Optional[str] = None
    event_date: Optional[str] = None
    venue_details: Optional[str] = None
    requires_stall: bool = False
    stall_requirements: Optional[str] = None
    requires_smd: bool = False
    smd_requirements: Optional[str] = None
    requires_sound: bool = False
    sound_requirements: Optional[str] = None
    estimated_budget: Optional[float] = None
    notes: Optional[str] = None


class QuoteAdminUpdate(BaseModel):
    status: Optional[QuoteStatus] = None
    internal_notes: Optional[str] = None
    final_price: Optional[float] = None
    rejection_reason: Optional[str] = None


class QuoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    client_id: int
    event_type: Optional[str]
    event_date: Optional[datetime]
    venue_details: Optional[str]
    status: QuoteStatus
    requires_stall: bool
    stall_requirements: Optional[str]
    requires_smd: bool
    smd_requirements: Optional[str]
    requires_sound: bool
    sound_requirements: Optional[str]
    estimated_budget: Optional[float]
    final_price: Optional[float]
    notes: Optional[str]
    internal_notes: Optional[str]
    rejection_reason: Optional[str]
    file_attachments_json: Optional[str]
    created_at: datetime


class QuoteListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    client_id: int
    event_type: Optional[str]
    event_date: Optional[datetime]
    status: QuoteStatus
    estimated_budget: Optional[float]
    final_price: Optional[float]
    created_at: datetime
    client: Optional[ClientResponse] = None


# ─────────────────────────────── EVENT ──────────────────────────────────────

class EventCreate(BaseModel):
    quote_id: Optional[int] = None
    title: str
    start_date: datetime
    end_date: Optional[datetime] = None
    venue_address: Optional[str] = None
    client_contact: Optional[str] = None
    is_internal: bool = False
    notes: Optional[str] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    venue_address: Optional[str] = None
    client_contact: Optional[str] = None
    is_internal: Optional[bool] = None
    notes: Optional[str] = None


class EventStatusUpdate(BaseModel):
    status: EventStatus


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    quote_id: Optional[int]
    title: str
    start_date: datetime
    end_date: Optional[datetime]
    status: EventStatus
    venue_address: Optional[str]
    client_contact: Optional[str]
    is_internal: bool
    notes: Optional[str]


class EventCalendarItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    start_date: datetime
    end_date: Optional[datetime]
    status: EventStatus
    color: str


# ─────────────────────────────── EQUIPMENT ──────────────────────────────────

class EquipmentCreate(BaseModel):
    name: str
    category: EquipmentCategory
    total_quantity: int = 1
    description: Optional[str] = None
    serial_number: Optional[str] = None


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[EquipmentCategory] = None
    total_quantity: Optional[int] = None
    status: Optional[EquipmentStatus] = None
    description: Optional[str] = None
    serial_number: Optional[str] = None


class EquipmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    category: EquipmentCategory
    total_quantity: int
    status: EquipmentStatus
    description: Optional[str]
    serial_number: Optional[str]
    created_at: datetime


class EquipmentAvailability(BaseModel):
    equipment_id: int
    total_quantity: int
    allocated_quantity: int
    available_quantity: int
    is_available: bool


# ─────────────────────────────── WORKER ASSIGNMENT ──────────────────────────

class WorkerAssignmentCreate(BaseModel):
    user_id: int
    role_description: Optional[str] = None


class WorkerAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event_id: int
    user_id: int
    role_description: Optional[str]
    user: Optional[UserResponse] = None


# ─────────────────────────────── CONTACT ────────────────────────────────────

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    message: str
    inquiry_type: InquiryType = InquiryType.GENERAL


class ContactUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_archived: Optional[bool] = None


class ContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    phone: Optional[str]
    company: Optional[str]
    message: str
    inquiry_type: InquiryType
    is_read: bool
    is_archived: bool
    ip_address: Optional[str]
    created_at: datetime


# ─────────────────────────────── SUBSCRIBER ─────────────────────────────────

class SubscriberCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class SubscriberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    name: Optional[str]
    is_active: bool
    subscribed_at: datetime


# ─────────────────────────────── PORTFOLIO ──────────────────────────────────

class PortfolioCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: PortfolioCategory
    event_type: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_featured: bool = False
    display_order: int = 0
    tags_json: Optional[str] = None


class PortfolioUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[PortfolioCategory] = None
    event_type: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None
    tags_json: Optional[str] = None


class PortfolioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: Optional[str]
    category: PortfolioCategory
    event_type: Optional[str]
    image_url: Optional[str]
    video_url: Optional[str]
    thumbnail_url: Optional[str]
    is_featured: bool
    display_order: int
    tags_json: Optional[str]
    created_at: datetime


# ─────────────────────────────── TESTIMONIAL ────────────────────────────────

class TestimonialCreate(BaseModel):
    client_name: str
    company: Optional[str] = None
    designation: Optional[str] = None
    quote_text: str
    rating: int = 5
    source: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: int) -> int:
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class TestimonialUpdate(BaseModel):
    client_name: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    quote_text: Optional[str] = None
    rating: Optional[int] = None
    is_approved: Optional[bool] = None
    is_featured: Optional[bool] = None


class TestimonialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    client_name: str
    company: Optional[str]
    designation: Optional[str]
    quote_text: str
    rating: int
    is_approved: bool
    is_featured: bool
    source: Optional[str]
    created_at: datetime


# ─────────────────────────────── SERVICE CATALOG ────────────────────────────

class ServiceCreate(BaseModel):
    name: str
    slug: str
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    icon_name: Optional[str] = None
    category: ServiceCategory
    price_range: Optional[str] = None
    features_json: Optional[str] = None
    is_active: bool = True
    display_order: int = 0


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    icon_name: Optional[str] = None
    price_range: Optional[str] = None
    features_json: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class ServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    short_description: Optional[str]
    full_description: Optional[str]
    icon_name: Optional[str]
    category: ServiceCategory
    price_range: Optional[str]
    features_json: Optional[str]
    is_active: bool
    display_order: int
    created_at: datetime


# ─────────────────────────────── FAQ ────────────────────────────────────────

class FAQCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = None
    display_order: int = 0
    is_active: bool = True


class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class FAQReorder(BaseModel):
    display_order: int


class FAQResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    question: str
    answer: str
    category: Optional[str]
    display_order: int
    is_active: bool
    created_at: datetime


# ─────────────────────────────── CHATBOT ────────────────────────────────────

class ChatStartResponse(BaseModel):
    session_token: str
    message: str


class ChatMessageCreate(BaseModel):
    session_token: str
    content: str
    visitor_name: Optional[str] = None
    visitor_email: Optional[str] = None


class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    session_id: int
    content: str
    is_bot: bool
    intent: Optional[str]
    created_at: datetime


class ChatBotReply(BaseModel):
    user_message: ChatMessageResponse
    bot_message: ChatMessageResponse
    is_escalated: bool


class ChatSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    session_token: str
    visitor_name: Optional[str]
    visitor_email: Optional[str]
    started_at: datetime
    last_activity: datetime
    is_escalated: bool
    messages: List[ChatMessageResponse] = []


# ─────────────────────────────── NOTIFICATION ───────────────────────────────

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    message: str
    type: NotificationType
    is_read: bool
    related_id: Optional[int]
    related_type: Optional[str]
    created_at: datetime


class UnreadCount(BaseModel):
    unread: int


# ─────────────────────────────── ADMIN ──────────────────────────────────────

class UserAdminCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.CLIENT


class UserAdminUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class AdminPasswordReset(BaseModel):
    new_password: str


# ─────────────────────────────── EVENT EQUIPMENT ─────────────────────────────

class EventEquipmentCreate(BaseModel):
    equipment_id: int
    quantity_allocated: int = 1


class EventEquipmentUpdate(BaseModel):
    quantity_allocated: int


class EventEquipmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event_id: int
    equipment_id: int
    quantity_allocated: int
    equipment: Optional[EquipmentResponse] = None


# ─────────────────────────────── DASHBOARD ──────────────────────────────────

class DashboardStats(BaseModel):
    total_quotes: int
    pending_quotes: int
    reviewing_quotes: int
    approved_quotes: int
    rejected_quotes: int
    total_events: int
    upcoming_events: int
    active_events: int
    completed_events: int
    total_clients: int
    new_clients_this_month: int
    unread_contacts: int
    total_equipment: int
    revenue_this_month: float
    revenue_total: float
    recent_quotes: List[QuoteListResponse] = []
    upcoming_events_list: List[EventResponse] = []


# ─────────────────────────────── FINANCE ────────────────────────────────────

class TransportRecordCreate(BaseModel):
    driver_name: str
    vehicle_type: Optional[str] = None
    route: Optional[str] = None
    days_count: int = 1
    daily_rate: float
    total_amount: float
    event_ref: Optional[str] = None
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    record_date: datetime
    notes: Optional[str] = None


class TransportRecordUpdate(BaseModel):
    driver_name: Optional[str] = None
    vehicle_type: Optional[str] = None
    route: Optional[str] = None
    days_count: Optional[int] = None
    daily_rate: Optional[float] = None
    total_amount: Optional[float] = None
    event_ref: Optional[str] = None
    payment_status: Optional[PaymentStatus] = None
    payment_method: Optional[PaymentMethod] = None
    record_date: Optional[datetime] = None
    notes: Optional[str] = None


class TransportRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    driver_name: str
    vehicle_type: Optional[str]
    route: Optional[str]
    days_count: int
    daily_rate: float
    total_amount: float
    event_ref: Optional[str]
    payment_status: PaymentStatus
    payment_method: Optional[PaymentMethod]
    record_date: datetime
    notes: Optional[str]
    created_at: datetime


class SmdFinanceRecordCreate(BaseModel):
    screen_description: str
    setup_location: Optional[str] = None
    rental_days: int = 1
    daily_rate: float
    total_amount: float
    event_ref: Optional[str] = None
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    record_date: datetime
    notes: Optional[str] = None


class SmdFinanceRecordUpdate(BaseModel):
    screen_description: Optional[str] = None
    setup_location: Optional[str] = None
    rental_days: Optional[int] = None
    daily_rate: Optional[float] = None
    total_amount: Optional[float] = None
    event_ref: Optional[str] = None
    payment_status: Optional[PaymentStatus] = None
    payment_method: Optional[PaymentMethod] = None
    record_date: Optional[datetime] = None
    notes: Optional[str] = None


class SmdFinanceRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    screen_description: str
    setup_location: Optional[str]
    rental_days: int
    daily_rate: float
    total_amount: float
    event_ref: Optional[str]
    payment_status: PaymentStatus
    payment_method: Optional[PaymentMethod]
    record_date: datetime
    notes: Optional[str]
    created_at: datetime


class StallPaymentCreate(BaseModel):
    payer_name: str
    organization: Optional[str] = None
    amount: float
    payment_method: PaymentMethod = PaymentMethod.CASH
    paid_date: datetime
    notes: Optional[str] = None


class StallPaymentUpdate(BaseModel):
    payer_name: Optional[str] = None
    organization: Optional[str] = None
    amount: Optional[float] = None
    payment_method: Optional[PaymentMethod] = None
    paid_date: Optional[datetime] = None
    notes: Optional[str] = None


class StallPaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    record_id: int
    payer_name: str
    organization: Optional[str]
    amount: float
    payment_method: PaymentMethod
    paid_date: datetime
    notes: Optional[str]


class StallFabricationRecordCreate(BaseModel):
    project_name: str
    total_budget: float
    event_ref: Optional[str] = None
    record_date: datetime
    notes: Optional[str] = None


class StallFabricationRecordUpdate(BaseModel):
    project_name: Optional[str] = None
    total_budget: Optional[float] = None
    event_ref: Optional[str] = None
    record_date: Optional[datetime] = None
    notes: Optional[str] = None


class StallFabricationRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_name: str
    total_budget: float
    event_ref: Optional[str]
    record_date: datetime
    notes: Optional[str]
    created_at: datetime
    payments: List[StallPaymentResponse] = []


class StaffExpenseCreate(BaseModel):
    staff_name: str
    expense_category: StaffExpenseCategory
    amount: float
    event_ref: Optional[str] = None
    expense_date: datetime
    description: Optional[str] = None


class StaffExpenseUpdate(BaseModel):
    staff_name: Optional[str] = None
    expense_category: Optional[StaffExpenseCategory] = None
    amount: Optional[float] = None
    event_ref: Optional[str] = None
    expense_date: Optional[datetime] = None
    description: Optional[str] = None


class StaffExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    staff_name: str
    expense_category: StaffExpenseCategory
    amount: float
    event_ref: Optional[str]
    expense_date: datetime
    description: Optional[str]
    created_at: datetime


class FinanceSummary(BaseModel):
    transport_count: int
    transport_total: float
    transport_paid: float
    transport_pending: float
    smd_count: int
    smd_total: float
    smd_paid: float
    smd_pending: float
    stall_count: int
    stall_budget_total: float
    stall_collected_total: float
    stall_shortfall: float
    staff_count: int
    staff_total: float
