"""
Run this script once after setting up the PostgreSQL database to seed initial data.
Usage: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base, SessionLocal, settings
from models import (
    User, UserRole, Equipment, EquipmentCategory,
    Portfolio, PortfolioCategory, Testimonial,
    FAQ, ServiceCatalog, ServiceCategory,
)
from auth import get_password_hash

Base.metadata.create_all(bind=engine)

db = SessionLocal()


def seed(label: str, fn):
    try:
        fn()
        print(f"  [OK] {label}")
    except Exception as e:
        print(f"  [FAIL] {label}: {e}")
        db.rollback()


print("\n=== H&B Event Solution — Database Seeding ===\n")

# ── Admin User ──────────────────────────────────────────────────────────────
def seed_admin():
    if db.query(User).filter(User.email == "admin@hbeventsolution.com").first():
        print("  [SKIP] Admin user already exists")
        return
    db.add(User(
        email="admin@hbeventsolution.com",
        hashed_password=get_password_hash("HBAdmin@2024"),
        full_name="H&B Administrator",
        role=UserRole.ADMIN,
        is_active=True,
    ))
    db.commit()

seed("Admin user (admin@hbeventsolution.com / HBAdmin@2024)", seed_admin)


# ── Sales User ───────────────────────────────────────────────────────────────
def seed_sales():
    if db.query(User).filter(User.email == "sales@hbeventsolution.com").first():
        print("  [SKIP] Sales user already exists")
        return
    db.add(User(
        email="sales@hbeventsolution.com",
        hashed_password=get_password_hash("HBSales@2024"),
        full_name="Sales Manager",
        role=UserRole.SALES,
        is_active=True,
    ))
    db.commit()

seed("Sales user (sales@hbeventsolution.com / HBSales@2024)", seed_sales)


# ── Equipment ────────────────────────────────────────────────────────────────
equipment_items = [
    Equipment(
        name="SMD Screen P3 Indoor (12x9 ft)",
        category=EquipmentCategory.SMD,
        total_quantity=4,
        description="High-resolution P3 pixel-pitch indoor SMD screen, ideal for corporate events and pharma conferences.",
        serial_number="SMD-P3-001",
    ),
    Equipment(
        name="SMD Screen P6 Outdoor (16x10 ft)",
        category=EquipmentCategory.SMD,
        total_quantity=2,
        description="High-brightness P6 outdoor SMD screen with weatherproof casing. Perfect for concerts and open-air events.",
        serial_number="SMD-P6-001",
    ),
    Equipment(
        name="JBL Line Array System (8-box + sub)",
        category=EquipmentCategory.SOUND,
        total_quantity=3,
        description="Professional JBL VTX line-array system. 8 top boxes + 2 subwoofers per rig. Covers venues up to 2,000 persons.",
        serial_number="SOUND-JBL-001",
    ),
    Equipment(
        name="Shure Wireless Microphone Kit (4-channel)",
        category=EquipmentCategory.SOUND,
        total_quantity=6,
        description="Shure QLX-D 4-channel wireless system with handheld, lapel, and headset options.",
        serial_number="MIC-SHURE-001",
    ),
    Equipment(
        name="Exhibition Stall Material Kit (10x10 ft)",
        category=EquipmentCategory.STALL_MATERIAL,
        total_quantity=10,
        description="Complete stall material kit including aluminum frame, acrylic panels, LED strip lighting, and branded fascia components.",
        serial_number="STALL-KIT-001",
    ),
]

def seed_equipment():
    if db.query(Equipment).count() > 0:
        print("  [SKIP] Equipment already seeded")
        return
    db.add_all(equipment_items)
    db.commit()

seed("5 equipment items", seed_equipment)


# ── Portfolio ────────────────────────────────────────────────────────────────
portfolio_items = [
    Portfolio(
        title="Novartis Pharmaceutical Annual Conference — Lahore",
        description="Complete production setup for a 500-person pharmaceutical conference. Included custom 16x10 SMD screen, JBL line-array sound, and a branded 3D stall for exhibitors.",
        category=PortfolioCategory.FULL_SETUP,
        event_type="Pharmaceutical Conference",
        is_featured=True,
        display_order=1,
        tags_json='["pharmaceutical","corporate","smd","sound","stall"]',
    ),
    Portfolio(
        title="Lahore Music Festival — Main Stage Production",
        description="Main stage production for 5,000+ attendees. Dual P6 outdoor SMD screens, full concert-grade line-array system with 40kW output, stage monitoring, and live engineer team.",
        category=PortfolioCategory.SMD,
        event_type="Concert",
        is_featured=True,
        display_order=2,
        tags_json='["concert","outdoor","smd","sound"]',
    ),
    Portfolio(
        title="Custom 3D Stall — Healthcare Expo Pakistan",
        description="Fully custom 3D stall fabrication for a leading healthcare brand at Healthcare Expo Pakistan. 20x15 ft double-decker design with integrated LED lighting and product display counters.",
        category=PortfolioCategory.STALL,
        event_type="Exhibition",
        is_featured=True,
        display_order=3,
        tags_json='["stall","fabrication","pharmaceutical","exhibition"]',
    ),
]

def seed_portfolio():
    if db.query(Portfolio).count() > 0:
        print("  [SKIP] Portfolio already seeded")
        return
    db.add_all(portfolio_items)
    db.commit()

seed("3 portfolio items", seed_portfolio)


# ── Testimonials ─────────────────────────────────────────────────────────────
testimonials = [
    Testimonial(
        client_name="Dr. Asif Mehmood",
        company="PharmaVista Pakistan",
        designation="Head of Medical Affairs",
        quote_text="H&B transformed our annual medical conference into a world-class production. The 3D stall was built exactly to the render they showed us, and the 12x9 SMD screen was flawless. Not a single technical issue in two days.",
        rating=5,
        is_approved=True,
        is_featured=True,
        source="Direct",
    ),
    Testimonial(
        client_name="Zubair Ahmed",
        company="Lahore Events Company",
        designation="CEO",
        quote_text="We've worked with H&B for concert productions three years in a row. Their outdoor SMD screens and line-array sound systems are the best in Lahore. They know what they're doing — 30 years of experience shows in every detail.",
        rating=5,
        is_approved=True,
        is_featured=True,
        source="Direct",
    ),
    Testimonial(
        client_name="Sana Iqbal",
        company="MedPak Pharmaceuticals",
        designation="Brand Manager",
        quote_text="Our exhibition stall at HealthExpo was the most visited booth on the floor. H&B's team delivered the stall on time, exactly as designed, with beautiful lighting and a strong physical presence. Highly recommended for pharma events.",
        rating=5,
        is_approved=True,
        is_featured=False,
        source="Direct",
    ),
]

def seed_testimonials():
    if db.query(Testimonial).count() > 0:
        print("  [SKIP] Testimonials already seeded")
        return
    db.add_all(testimonials)
    db.commit()

seed("3 testimonials", seed_testimonials)


# ── FAQs ─────────────────────────────────────────────────────────────────────
faqs = [
    FAQ(
        question="Do you provide on-site technical support during the event?",
        answer="Yes, absolutely. Our technical crew remains on-site from setup through complete teardown for every event. We also carry backup equipment for critical components like screens and microphones, so your event is never at risk.",
        category="Support",
        display_order=1,
        is_active=True,
    ),
    FAQ(
        question="Can you fabricate a fully custom 3D stall to our design?",
        answer="Yes. Custom 3D stall fabrication is one of our core specialties. We begin with a detailed digital 3D render for your approval before any material is cut. You get exactly what you approved — on time and on budget.",
        category="Services",
        display_order=2,
        is_active=True,
    ),
    FAQ(
        question="How far in advance should I book?",
        answer="We recommend booking at least 2–4 weeks in advance for standard events. For large-scale concerts, pharmaceutical exhibitions, or events requiring custom fabrication, 6–8 weeks notice is ideal. Popular dates fill quickly, especially weekends.",
        category="Booking",
        display_order=3,
        is_active=True,
    ),
    FAQ(
        question="Do you serve outdoor events as well as indoor?",
        answer="Yes. We have extensive outdoor production experience including concerts, open-air corporate events, and outdoor exhibitions. Our outdoor SMD screens are high-brightness and weatherproof-rated. We handle all power distribution and logistics.",
        category="Services",
        display_order=4,
        is_active=True,
    ),
    FAQ(
        question="Are there any hidden charges in your pricing?",
        answer="No. Unlike middlemen or agencies, H&B Event Solution owns all its equipment and employs its own fabricators and crew. This means no hidden markups, no subcontracting surprises, and complete pricing transparency. Your quote is your final price.",
        category="Pricing",
        display_order=5,
        is_active=True,
    ),
]

def seed_faqs():
    if db.query(FAQ).count() > 0:
        print("  [SKIP] FAQs already seeded")
        return
    db.add_all(faqs)
    db.commit()

seed("5 FAQs", seed_faqs)


# ── Service Catalog ──────────────────────────────────────────────────────────
services = [
    ServiceCatalog(
        name="High-Definition SMD Screen Rentals",
        slug="smd-screen-rental",
        short_description="Scalable indoor and outdoor SMD displays with zero dead pixels and seamless playback.",
        full_description=(
            "Deliver your message with uncompromising clarity. We provide scalable, high-brightness SMD screens "
            "perfectly calibrated for both indoor ballrooms and outdoor arenas. Whether it's a standard 12x9 setup "
            "or a massive custom stage backdrop, our technicians ensure zero dead pixels and seamless playback. "
            "Certified engineers remain on-site for the entire event duration."
        ),
        icon_name="Monitor",
        category=ServiceCategory.SMD,
        price_range="Contact for quote",
        features_json='["Indoor P3 & Outdoor P6 screens","Custom sizes available","Zero dead-pixel guarantee","On-site technician included","Backup equipment on standby"]',
        is_active=True,
        display_order=1,
    ),
    ServiceCatalog(
        name="Concert-Grade Sound System Engineering",
        slug="sound-system-rental",
        short_description="Professional line-array systems and wireless microphone setups engineered for your venue acoustics.",
        full_description=(
            "Bad audio ruins great events. We supply and engineer premium line-array sound systems, "
            "mixing consoles, and wireless microphone setups tailored to the acoustics of your specific venue. "
            "Our sound engineers remain on-site to ensure crisp, clear audio from the first speech to the final performance. "
            "Suitable for intimate corporate conferences and 5,000-person concerts alike."
        ),
        icon_name="Speaker",
        category=ServiceCategory.SOUND,
        price_range="Contact for quote",
        features_json='["JBL professional line-array systems","Digital mixing consoles","4-channel wireless microphone kits","Acoustic venue assessment included","On-site sound engineer"]',
        is_active=True,
        display_order=2,
    ),
    ServiceCatalog(
        name="Custom 3D Stall Fabrication",
        slug="3d-stall-fabrication",
        short_description="From digital 3D render to physical build — premium exhibition stalls that command attention.",
        full_description=(
            "We turn standard floor space into an immersive brand experience. From the initial 3D digital render "
            "to the final wood and acrylic fabrication, we handle everything. You get a striking, sturdy, and visually "
            "commanding physical presence that physically draws attendees to your team. Ideal for pharmaceutical "
            "companies and corporate exhibitors. We own all materials and employ our own fabricators — "
            "no middlemen, no hidden markups."
        ),
        icon_name="Building2",
        category=ServiceCategory.STALL,
        price_range="Contact for quote",
        features_json='["3D digital render before fabrication","Premium wood, acrylic & metal materials","Custom branding & LED lighting","On-time delivery guaranteed","Full setup and teardown included"]',
        is_active=True,
        display_order=3,
    ),
]

def seed_services():
    if db.query(ServiceCatalog).count() > 0:
        print("  [SKIP] Services already seeded")
        return
    db.add_all(services)
    db.commit()

seed("3 service catalog entries", seed_services)


db.close()
print("\n=== Seeding complete ===\n")
print("Admin login:  admin@hbeventsolution.com / HBAdmin@2024")
print("Sales login:  sales@hbeventsolution.com / HBSales@2024")
print("\nStart the server:  uvicorn main:app --reload --port 8000")
print("API docs:          http://localhost:8000/api/docs\n")
