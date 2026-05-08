from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum, Text, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime, timezone


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    SALES = "SALES"
    CREW = "CREW"
    CLIENT = "CLIENT"


class QuoteStatus(str, enum.Enum):
    PENDING = "PENDING"
    REVIEWING = "REVIEWING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class EventStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class EquipmentCategory(str, enum.Enum):
    SMD = "SMD"
    SOUND = "SOUND"
    STALL_MATERIAL = "STALL_MATERIAL"


class EquipmentStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    MAINTENANCE = "MAINTENANCE"


class InquiryType(str, enum.Enum):
    GENERAL = "GENERAL"
    QUOTE_REQUEST = "QUOTE_REQUEST"
    SUPPORT = "SUPPORT"
    PARTNERSHIP = "PARTNERSHIP"


class PortfolioCategory(str, enum.Enum):
    SMD = "SMD"
    SOUND = "SOUND"
    STALL = "STALL"
    FULL_SETUP = "FULL_SETUP"


class ServiceCategory(str, enum.Enum):
    SMD = "SMD"
    SOUND = "SOUND"
    STALL = "STALL"


class NotificationType(str, enum.Enum):
    QUOTE = "QUOTE"
    EVENT = "EVENT"
    CONTACT = "CONTACT"
    SYSTEM = "SYSTEM"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PARTIAL = "PARTIAL"
    PAID = "PAID"


class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    BANK_TRANSFER = "BANK_TRANSFER"
    CHEQUE = "CHEQUE"
    OTHER = "OTHER"


class StaffExpenseCategory(str, enum.Enum):
    FOOD = "FOOD"
    TRANSPORT = "TRANSPORT"
    ACCOMMODATION = "ACCOMMODATION"
    MISCELLANEOUS = "MISCELLANEOUS"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CLIENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    worker_assignments = relationship("WorkerAssignment", back_populates="user")


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), index=True, nullable=False)
    contact_person = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    industry = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    quotes = relationship("Quote", back_populates="client")


class Quote(Base):
    __tablename__ = "quotes"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    event_type = Column(String(100), nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=True)
    venue_details = Column(String(500), nullable=True)
    status = Column(Enum(QuoteStatus), default=QuoteStatus.PENDING)

    requires_stall = Column(Boolean, default=False)
    stall_requirements = Column(Text, nullable=True)

    requires_smd = Column(Boolean, default=False)
    smd_requirements = Column(Text, nullable=True)

    requires_sound = Column(Boolean, default=False)
    sound_requirements = Column(Text, nullable=True)

    estimated_budget = Column(Float, nullable=True)
    final_price = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    file_attachments_json = Column(Text, nullable=True)
    rejection_reason = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    client = relationship("Client", back_populates="quotes")
    event = relationship("Event", back_populates="quote", uselist=False)


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), unique=True, nullable=True)
    title = Column(String(255), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(EventStatus), default=EventStatus.SCHEDULED)
    venue_address = Column(String(500), nullable=True)
    client_contact = Column(String(255), nullable=True)
    is_internal = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)

    quote = relationship("Quote", back_populates="event")
    equipment = relationship("EventEquipment", back_populates="event")
    workers = relationship("WorkerAssignment", back_populates="event")


class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    category = Column(Enum(EquipmentCategory), nullable=False)
    total_quantity = Column(Integer, default=1)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.AVAILABLE)
    description = Column(Text, nullable=True)
    serial_number = Column(String(100), nullable=True)
    purchase_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class EventEquipment(Base):
    __tablename__ = "event_equipment"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    quantity_allocated = Column(Integer, default=1)

    event = relationship("Event", back_populates="equipment")
    equipment = relationship("Equipment")


class WorkerAssignment(Base):
    __tablename__ = "worker_assignments"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role_description = Column(String(255), nullable=True)

    event = relationship("Event", back_populates="workers")
    user = relationship("User", back_populates="worker_assignments")


class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    inquiry_type = Column(Enum(InquiryType), default=InquiryType.GENERAL)
    is_read = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Portfolio(Base):
    __tablename__ = "portfolio"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(PortfolioCategory), nullable=False)
    event_type = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    tags_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Testimonial(Base):
    __tablename__ = "testimonials"
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    designation = Column(String(255), nullable=True)
    quote_text = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    is_approved = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    source = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ServiceCatalog(Base):
    __tablename__ = "service_catalog"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    short_description = Column(String(500), nullable=True)
    full_description = Column(Text, nullable=True)
    icon_name = Column(String(100), nullable=True)
    category = Column(Enum(ServiceCategory), nullable=False)
    price_range = Column(String(100), nullable=True)
    features_json = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Subscriber(Base):
    __tablename__ = "subscribers"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    subscribed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    unsubscribed_at = Column(DateTime(timezone=True), nullable=True)


class FAQ(Base):
    __tablename__ = "faqs"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_token = Column(String(100), unique=True, nullable=False, index=True)
    visitor_name = Column(String(255), nullable=True)
    visitor_email = Column(String(255), nullable=True)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_activity = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_escalated = Column(Boolean, default=False)
    escalated_to_contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)

    messages = relationship("ChatMessage", back_populates="session")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_bot = Column(Boolean, default=False)
    intent = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    session = relationship("ChatSession", back_populates="messages")


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.SYSTEM)
    is_read = Column(Boolean, default=False)
    related_id = Column(Integer, nullable=True)
    related_type = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


# ─────────────────────────────── FINANCE ────────────────────────────────────

class TransportRecord(Base):
    __tablename__ = "transport_records"
    id = Column(Integer, primary_key=True, index=True)
    driver_name = Column(String(255), nullable=False)
    vehicle_type = Column(String(100), nullable=True)
    route = Column(String(500), nullable=True)
    days_count = Column(Integer, nullable=False, default=1)
    daily_rate = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    event_ref = Column(String(255), nullable=True)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_method = Column(Enum(PaymentMethod), nullable=True)
    record_date = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SmdFinanceRecord(Base):
    __tablename__ = "smd_finance_records"
    id = Column(Integer, primary_key=True, index=True)
    screen_description = Column(String(255), nullable=False)
    setup_location = Column(String(500), nullable=True)
    rental_days = Column(Integer, nullable=False, default=1)
    daily_rate = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    event_ref = Column(String(255), nullable=True)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_method = Column(Enum(PaymentMethod), nullable=True)
    record_date = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class StallFabricationRecord(Base):
    __tablename__ = "stall_fabrication_records"
    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(255), nullable=False)
    total_budget = Column(Float, nullable=False)
    event_ref = Column(String(255), nullable=True)
    record_date = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    payments = relationship("StallPayment", back_populates="record", cascade="all, delete-orphan")


class StallPayment(Base):
    __tablename__ = "stall_payments"
    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("stall_fabrication_records.id"), nullable=False)
    payer_name = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.CASH)
    paid_date = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text, nullable=True)

    record = relationship("StallFabricationRecord", back_populates="payments")


class StaffExpense(Base):
    __tablename__ = "staff_expenses"
    id = Column(Integer, primary_key=True, index=True)
    staff_name = Column(String(255), nullable=False)
    expense_category = Column(Enum(StaffExpenseCategory), nullable=False)
    amount = Column(Float, nullable=False)
    event_ref = Column(String(255), nullable=True)
    expense_date = Column(DateTime(timezone=True), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
