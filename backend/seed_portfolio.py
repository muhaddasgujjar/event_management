from database import SessionLocal, engine, Base
from models import Portfolio, PortfolioCategory
from datetime import datetime, timezone

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Clear existing portfolio items first (optional, only if table is empty)
existing = db.query(Portfolio).count()

if existing == 0:
    items = [
        Portfolio(
            title="LED Wall Setup — GSK Annual Conference",
            description="Full SMD P3.91 LED wall installation for GlaxoSmithKline's 500-person annual conference at Expo Centre Lahore. 12×6m seamless display.",
            category=PortfolioCategory.SMD,
            event_type="Corporate Conference",
            image_url="/images/smd.png",
            is_featured=True,
            display_order=1,
        ),
        Portfolio(
            title="Concert Sound System — Lahore Music Festival",
            description="Professional line-array sound system with 32-channel mixing board. Coverage for 2,000+ attendees across 3 stages.",
            category=PortfolioCategory.SOUND,
            event_type="Concert",
            image_url="/images/sound.png",
            is_featured=True,
            display_order=2,
        ),
        Portfolio(
            title="3D Brand Stall — Pharma Expo 2024",
            description="Fully custom 3D fabricated exhibition stall for a leading pharmaceutical company. Includes backlit panels, product display counters, and meeting area.",
            category=PortfolioCategory.STALL,
            event_type="Exhibition",
            image_url="/images/stall.png",
            is_featured=True,
            display_order=3,
        ),
        Portfolio(
            title="Full Production — Corporate Gala Night",
            description="Complete event production package: SMD backdrop, premium sound, and custom branded stall installations for 300-person corporate gala.",
            category=PortfolioCategory.FULL_SETUP,
            event_type="Gala Dinner",
            image_url="/images/hero.png",
            is_featured=False,
            display_order=4,
        ),
        Portfolio(
            title="SMD Outdoor Screen — Product Launch",
            description="High-brightness outdoor P6 LED screen for daylight product launch event. 8×5m visible from 150m distance.",
            category=PortfolioCategory.SMD,
            event_type="Product Launch",
            image_url="/images/smd.png",
            is_featured=False,
            display_order=5,
        ),
        Portfolio(
            title="Exhibition Stall — Medica Pakistan",
            description="Premium medical equipment exhibition stall with clinical aesthetic. White laminate, spotlighting, and digital display integration.",
            category=PortfolioCategory.STALL,
            event_type="Medical Exhibition",
            image_url="/images/stall.png",
            is_featured=False,
            display_order=6,
        ),
    ]
    db.add_all(items)
    db.commit()
    print(f"✓ Seeded {len(items)} portfolio items")
else:
    print(f"Portfolio already has {existing} items, skipping seed")

db.close()
