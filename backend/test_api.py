"""
H&B Event Solution — Full API Test Suite
Run with: python test_api.py
Requires: pip install requests
The FastAPI server must be running at http://localhost:8000
"""

import sys
import json
import requests

BASE = "http://localhost:8000"
PASS = "\033[92m[PASS]\033[0m"
FAIL = "\033[91m[FAIL]\033[0m"
SKIP = "\033[93m[SKIP]\033[0m"
INFO = "\033[94m[INFO]\033[0m"

results = {"passed": 0, "failed": 0, "skipped": 0}

# ── State shared across tests ─────────────────────────────────────────────────
state = {
    "admin_token": None,
    "sales_token": None,
    "client_id": None,
    "quote_id": None,
    "event_id": None,
    "equipment_id": None,
    "eq_assignment_id": None,
    "worker_user_id": None,
    "worker_assignment_id": None,
    "portfolio_id": None,
    "testimonial_id": None,
    "faq_id": None,
    "service_id": None,
    "contact_id": None,
    "chat_token": None,
    "new_user_id": None,
}


def check(name, condition, detail=""):
    if condition:
        print(f"  {PASS} {name}")
        results["passed"] += 1
    else:
        print(f"  {FAIL} {name}" + (f" — {detail}" if detail else ""))
        results["failed"] += 1


def info(msg):
    print(f"  {INFO} {msg}")


def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


def admin_headers():
    return {"Authorization": f"Bearer {state['admin_token']}"}


def sales_headers():
    return {"Authorization": f"Bearer {state['sales_token']}"}


# ═══════════════════════════════════════════════════════════════════════════════
# 1. HEALTH & ROOT
# ═══════════════════════════════════════════════════════════════════════════════
section("1. HEALTH CHECK & ROOT")

r = requests.get(f"{BASE}/")
check("GET / returns 200", r.status_code == 200)
check("Root has company name", "H&B" in r.json().get("company", ""))

r = requests.get(f"{BASE}/api/health")
check("GET /api/health returns healthy", r.status_code == 200 and r.json().get("status") == "healthy")


# ═══════════════════════════════════════════════════════════════════════════════
# 2. AUTHENTICATION
# ═══════════════════════════════════════════════════════════════════════════════
section("2. AUTHENTICATION")

# Admin login
r = requests.post(f"{BASE}/api/auth/login", data={
    "username": "admin@hbeventsolution.com",
    "password": "HBAdmin@2024",
})
check("Admin login returns 200", r.status_code == 200, r.text)
if r.status_code == 200:
    state["admin_token"] = r.json()["access_token"]
    check("Admin token received", bool(state["admin_token"]))

# Sales login
r = requests.post(f"{BASE}/api/auth/login", data={
    "username": "sales@hbeventsolution.com",
    "password": "HBSales@2024",
})
check("Sales login returns 200", r.status_code == 200, r.text)
if r.status_code == 200:
    state["sales_token"] = r.json()["access_token"]

# Bad credentials
r = requests.post(f"{BASE}/api/auth/login", data={"username": "bad@email.com", "password": "wrong"})
check("Bad login returns 401", r.status_code == 401)

# GET /me
r = requests.get(f"{BASE}/api/auth/me", headers=admin_headers())
check("GET /me (admin) returns user", r.status_code == 200 and r.json()["role"] == "ADMIN")

r = requests.get(f"{BASE}/api/auth/me", headers=sales_headers())
check("GET /me (sales) returns SALES role", r.status_code == 200 and r.json()["role"] == "SALES")

# Public register forces CLIENT role even if ADMIN passed
r = requests.post(f"{BASE}/api/auth/register", json={
    "email": "testclient_auto@example.com",
    "password": "TestPass123",
    "full_name": "Test Client",
    "role": "ADMIN",
})
if r.status_code == 201:
    check("Register forces CLIENT role (security fix)", r.json()["role"] == "CLIENT")
elif r.status_code == 400:
    info("Register: email already exists (re-run skipped)")
    results["skipped"] += 1


# ═══════════════════════════════════════════════════════════════════════════════
# 3. ADMIN USER MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════
section("3. ADMIN — USER MANAGEMENT")

# List users
r = requests.get(f"{BASE}/api/admin/users", headers=admin_headers())
check("GET /admin/users returns list", r.status_code == 200 and isinstance(r.json(), list))
check("List contains at least admin + sales", len(r.json()) >= 2)

# Filter by role
r = requests.get(f"{BASE}/api/admin/users?role=ADMIN", headers=admin_headers())
check("Filter users by ADMIN role", r.status_code == 200 and all(u["role"] == "ADMIN" for u in r.json()))

# Create a CREW user
r = requests.post(f"{BASE}/api/admin/users", headers=admin_headers(), json={
    "email": "crew.test@hbeventsolution.com",
    "password": "CrewPass@2024",
    "full_name": "Test Crew Member",
    "role": "CREW",
})
if r.status_code == 201:
    state["new_user_id"] = r.json()["id"]
    state["worker_user_id"] = r.json()["id"]
    check("Admin creates CREW user", r.json()["role"] == "CREW")
elif r.status_code == 400:
    info("Crew user already exists, fetching id")
    users = requests.get(f"{BASE}/api/admin/users?role=CREW", headers=admin_headers()).json()
    if users:
        state["new_user_id"] = users[0]["id"]
        state["worker_user_id"] = users[0]["id"]
    results["skipped"] += 1

# Sales cannot access admin users endpoint
r = requests.get(f"{BASE}/api/admin/users", headers=sales_headers())
check("Sales cannot access admin users (403)", r.status_code == 403)

# Get user by id
if state["new_user_id"]:
    r = requests.get(f"{BASE}/api/admin/users/{state['new_user_id']}", headers=admin_headers())
    check("GET /admin/users/{id} returns user", r.status_code == 200)

    # Update user
    r = requests.put(f"{BASE}/api/admin/users/{state['new_user_id']}", headers=admin_headers(), json={
        "full_name": "Updated Crew Name",
    })
    check("Admin updates user name", r.status_code == 200 and r.json()["full_name"] == "Updated Crew Name")

    # Deactivate
    r = requests.put(f"{BASE}/api/admin/users/{state['new_user_id']}", headers=admin_headers(), json={"is_active": False})
    check("Admin deactivates user", r.status_code == 200 and r.json()["is_active"] == False)

    # Reactivate
    r = requests.put(f"{BASE}/api/admin/users/{state['new_user_id']}", headers=admin_headers(), json={"is_active": True})
    check("Admin reactivates user", r.status_code == 200 and r.json()["is_active"] == True)

    # Reset password
    r = requests.post(f"{BASE}/api/admin/users/{state['new_user_id']}/reset-password",
                      headers=admin_headers(), json={"new_password": "NewPass@2024"})
    check("Admin resets user password", r.status_code == 200)

# System overview
r = requests.get(f"{BASE}/api/admin/overview", headers=admin_headers())
check("GET /admin/overview returns dict", r.status_code == 200)
if r.status_code == 200:
    data = r.json()
    check("Overview has users key", "users" in data)
    check("Overview has quotes key", "quotes" in data)
    check("Overview has events key", "events" in data)

# Revenue chart
r = requests.get(f"{BASE}/api/admin/revenue-chart?months=6", headers=admin_headers())
check("GET /admin/revenue-chart (6 months)", r.status_code == 200)
if r.status_code == 200:
    check("Revenue chart has 6 data points", len(r.json()["data"]) == 6)


# ═══════════════════════════════════════════════════════════════════════════════
# 4. CLIENTS
# ═══════════════════════════════════════════════════════════════════════════════
section("4. CLIENTS")

r = requests.post(f"{BASE}/api/clients/", headers=admin_headers(), json={
    "company_name": "Test Pharma Corp",
    "contact_person": "Ali Khan",
    "phone": "+92-300-1234567",
    "email": "testpharma@example.com",
    "industry": "Pharmaceutical",
})
if r.status_code == 201:
    state["client_id"] = r.json()["id"]
    check("Admin creates client", r.status_code == 201)
elif r.status_code == 400:
    info("Client already exists, listing to get id")
    cl = requests.get(f"{BASE}/api/clients/", headers=admin_headers()).json()
    if cl:
        state["client_id"] = cl[0]["id"]
    results["skipped"] += 1

r = requests.get(f"{BASE}/api/clients/", headers=admin_headers())
check("Admin lists clients", r.status_code == 200 and isinstance(r.json(), list))

r = requests.get(f"{BASE}/api/clients/", headers=sales_headers())
check("Sales can list clients", r.status_code == 200)

r = requests.get(f"{BASE}/api/clients/", headers={})
check("Unauthenticated cannot list clients (401)", r.status_code == 401)

if state["client_id"]:
    r = requests.get(f"{BASE}/api/clients/{state['client_id']}", headers=admin_headers())
    check("Get client by id", r.status_code == 200)

    r = requests.put(f"{BASE}/api/clients/{state['client_id']}", headers=admin_headers(), json={
        "company_name": "Updated Pharma Corp",
    })
    check("Admin updates client", r.status_code == 200 and r.json()["company_name"] == "Updated Pharma Corp")


# ═══════════════════════════════════════════════════════════════════════════════
# 5. QUOTES
# ═══════════════════════════════════════════════════════════════════════════════
section("5. QUOTES")

r = requests.post(f"{BASE}/api/quotes/", json={
    "company_name": "API Test Corp",
    "contact_person": "Test Contact",
    "phone": "+92-321-0000001",
    "email": "apitest.quote@example.com",
    "event_type": "Corporate Conference",
    "event_date": "2026-08-15",
    "venue_details": "Pearl Continental Lahore",
    "requires_smd": True,
    "smd_requirements": "12x9 indoor screen",
    "requires_sound": True,
    "estimated_budget": 250000.0,
    "notes": "Test quote from API test suite",
})
check("Public creates quote (201)", r.status_code == 201, r.text)
if r.status_code == 201:
    state["quote_id"] = r.json()["id"]

r = requests.get(f"{BASE}/api/quotes/", headers=admin_headers())
check("Admin lists quotes", r.status_code == 200 and isinstance(r.json(), list))

r = requests.get(f"{BASE}/api/quotes/", headers=sales_headers())
check("Sales lists quotes", r.status_code == 200)

r = requests.get(f"{BASE}/api/quotes/", headers={})
check("Unauthenticated cannot list quotes (401)", r.status_code == 401)

if state["quote_id"]:
    r = requests.get(f"{BASE}/api/quotes/{state['quote_id']}", headers=admin_headers())
    check("Get quote by id", r.status_code == 200)

    r = requests.put(f"{BASE}/api/quotes/{state['quote_id']}/status", headers=admin_headers(), json={
        "status": "REVIEWING",
        "internal_notes": "Looks like a solid lead",
    })
    check("Admin updates quote status to REVIEWING", r.status_code == 200 and r.json()["status"] == "REVIEWING")

    r = requests.put(f"{BASE}/api/quotes/{state['quote_id']}/status", headers=admin_headers(), json={
        "status": "APPROVED",
        "final_price": 280000.0,
    })
    check("Admin approves quote with final price", r.status_code == 200 and r.json()["status"] == "APPROVED")

# Filter quotes
r = requests.get(f"{BASE}/api/quotes/?status=APPROVED", headers=admin_headers())
check("Filter quotes by APPROVED status", r.status_code == 200)


# ═══════════════════════════════════════════════════════════════════════════════
# 6. EVENTS
# ═══════════════════════════════════════════════════════════════════════════════
section("6. EVENTS")

r = requests.post(f"{BASE}/api/events/", headers=admin_headers(), json={
    "title": "API Test Event — Pharma Conference",
    "start_date": "2026-08-15T09:00:00Z",
    "end_date": "2026-08-15T18:00:00Z",
    "venue_address": "Pearl Continental, Lahore",
    "client_contact": "Ali Khan +92-300-1234567",
    "is_internal": False,
    "notes": "Test event created by API test suite",
})
check("Admin creates event (201)", r.status_code == 201, r.text)
if r.status_code == 201:
    state["event_id"] = r.json()["id"]

r = requests.get(f"{BASE}/api/events/", headers=admin_headers())
check("Admin lists events", r.status_code == 200 and isinstance(r.json(), list))

r = requests.get(f"{BASE}/api/events/calendar", headers=admin_headers())
check("Admin gets calendar events", r.status_code == 200 and isinstance(r.json(), list))

r = requests.get(f"{BASE}/api/events/", headers={})
check("Unauthenticated cannot list events (401)", r.status_code == 401)

if state["event_id"]:
    r = requests.get(f"{BASE}/api/events/{state['event_id']}", headers=admin_headers())
    check("Get event by id", r.status_code == 200)

    r = requests.put(f"{BASE}/api/events/{state['event_id']}", headers=admin_headers(), json={
        "notes": "Updated notes from test suite",
    })
    check("Admin updates event", r.status_code == 200)

    r = requests.put(f"{BASE}/api/events/{state['event_id']}/status", headers=admin_headers(), json={
        "status": "IN_PROGRESS"
    })
    check("Admin updates event status to IN_PROGRESS", r.status_code == 200 and r.json()["status"] == "IN_PROGRESS")


# ═══════════════════════════════════════════════════════════════════════════════
# 7. EQUIPMENT
# ═══════════════════════════════════════════════════════════════════════════════
section("7. EQUIPMENT")

r = requests.get(f"{BASE}/api/equipment/", headers=admin_headers())
check("Admin lists equipment", r.status_code == 200 and isinstance(r.json(), list))
if r.status_code == 200 and r.json():
    state["equipment_id"] = r.json()[0]["id"]
    info(f"Using equipment id={state['equipment_id']}")

r = requests.post(f"{BASE}/api/equipment/", headers=admin_headers(), json={
    "name": "Test LED Panel 4K",
    "category": "SMD",
    "total_quantity": 2,
    "description": "Test equipment for API test suite",
    "serial_number": "TEST-LED-001",
})
check("Admin creates equipment (201)", r.status_code == 201, r.text)
if r.status_code == 201:
    state["equipment_id"] = r.json()["id"]

if state["equipment_id"]:
    r = requests.get(f"{BASE}/api/equipment/{state['equipment_id']}", headers=admin_headers())
    check("Get equipment by id", r.status_code == 200)

    r = requests.put(f"{BASE}/api/equipment/{state['equipment_id']}", headers=admin_headers(), json={
        "description": "Updated test equipment",
        "status": "AVAILABLE",
    })
    check("Admin updates equipment", r.status_code == 200)

    # Availability check
    r = requests.get(
        f"{BASE}/api/equipment/{state['equipment_id']}/availability",
        headers=admin_headers(),
        params={"start_date": "2026-08-15T09:00:00Z", "end_date": "2026-08-15T18:00:00Z"},
    )
    check("Availability check works", r.status_code == 200 and "is_available" in r.json())

# Only admin can create equipment
r = requests.post(f"{BASE}/api/equipment/", headers=sales_headers(), json={
    "name": "Unauthorized Equipment",
    "category": "SMD",
    "total_quantity": 1,
})
check("Sales cannot create equipment (403)", r.status_code == 403)


# ═══════════════════════════════════════════════════════════════════════════════
# 8. EVENT EQUIPMENT ASSIGNMENT
# ═══════════════════════════════════════════════════════════════════════════════
section("8. EVENT EQUIPMENT ASSIGNMENT")

if state["event_id"] and state["equipment_id"]:
    r = requests.post(
        f"{BASE}/api/events/{state['event_id']}/equipment",
        headers=admin_headers(),
        json={"equipment_id": state["equipment_id"], "quantity_allocated": 1},
    )
    check("Assign equipment to event (201)", r.status_code == 201, r.text)
    if r.status_code == 201:
        state["eq_assignment_id"] = r.json()["id"]

    # Duplicate assignment rejected
    r = requests.post(
        f"{BASE}/api/events/{state['event_id']}/equipment",
        headers=admin_headers(),
        json={"equipment_id": state["equipment_id"], "quantity_allocated": 1},
    )
    check("Duplicate assignment rejected (400)", r.status_code == 400)

    r = requests.get(f"{BASE}/api/events/{state['event_id']}/equipment", headers=admin_headers())
    check("List event equipment", r.status_code == 200 and isinstance(r.json(), list))

    if state["eq_assignment_id"]:
        r = requests.put(
            f"{BASE}/api/events/{state['event_id']}/equipment/{state['eq_assignment_id']}",
            headers=admin_headers(),
            json={"quantity_allocated": 2},
        )
        check("Update equipment quantity", r.status_code == 200 and r.json()["quantity_allocated"] == 2)

        r = requests.delete(
            f"{BASE}/api/events/{state['event_id']}/equipment/{state['eq_assignment_id']}",
            headers=admin_headers(),
        )
        check("Remove equipment from event (204)", r.status_code == 204)
else:
    print(f"  {SKIP} Event/equipment not available, skipping assignment tests")
    results["skipped"] += 3


# ═══════════════════════════════════════════════════════════════════════════════
# 9. WORKERS
# ═══════════════════════════════════════════════════════════════════════════════
section("9. WORKERS")

r = requests.get(f"{BASE}/api/workers/", headers=admin_headers())
check("Admin lists crew workers", r.status_code == 200 and isinstance(r.json(), list))

if state["event_id"] and state["worker_user_id"]:
    r = requests.post(
        f"{BASE}/api/events/{state['event_id']}/workers",
        headers=admin_headers(),
        json={"user_id": state["worker_user_id"], "role_description": "Audio Technician"},
    )
    if r.status_code == 201:
        state["worker_assignment_id"] = r.json()["id"]
        check("Assign worker to event (201)", True)
    elif r.status_code == 400:
        info("Worker already assigned")
        results["skipped"] += 1

    r = requests.get(f"{BASE}/api/events/{state['event_id']}/workers", headers=admin_headers())
    check("List event workers", r.status_code == 200 and isinstance(r.json(), list))

    if state["worker_assignment_id"]:
        r = requests.delete(
            f"{BASE}/api/events/{state['event_id']}/workers/{state['worker_assignment_id']}",
            headers=admin_headers(),
        )
        check("Remove worker from event (204)", r.status_code == 204)


# ═══════════════════════════════════════════════════════════════════════════════
# 10. DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════
section("10. DASHBOARD")

r = requests.get(f"{BASE}/api/dashboard/stats", headers=admin_headers())
check("Admin gets dashboard stats", r.status_code == 200)
if r.status_code == 200:
    d = r.json()
    required_keys = ["total_quotes", "total_events", "total_clients", "total_equipment",
                     "revenue_total", "revenue_this_month", "recent_quotes", "upcoming_events_list"]
    for key in required_keys:
        check(f"Dashboard has '{key}'", key in d)

r = requests.get(f"{BASE}/api/dashboard/stats", headers=sales_headers())
check("Sales can access dashboard stats", r.status_code == 200)

r = requests.get(f"{BASE}/api/dashboard/stats", headers={})
check("Unauthenticated cannot access dashboard (401)", r.status_code == 401)


# ═══════════════════════════════════════════════════════════════════════════════
# 11. CONTACT & SUBSCRIBERS
# ═══════════════════════════════════════════════════════════════════════════════
section("11. CONTACT & SUBSCRIBERS")

r = requests.post(f"{BASE}/api/contact/", json={
    "name": "Test Inquirer",
    "email": "test.inquirer@example.com",
    "phone": "+92-333-1234567",
    "company": "TestCo",
    "message": "We need a full production setup for a corporate event in August.",
    "inquiry_type": "GENERAL",
})
check("Public submits contact form (201)", r.status_code == 201, r.text)
if r.status_code == 201:
    state["contact_id"] = r.json()["id"]

r = requests.post(f"{BASE}/api/contact/subscribe", json={
    "email": "newsletter.test@example.com",
    "name": "Newsletter Test",
})
check("Public subscribes to newsletter", r.status_code in [200, 201])

r = requests.get(f"{BASE}/api/contact/subscribers", headers=admin_headers())
check("Admin lists subscribers", r.status_code == 200 and isinstance(r.json(), list))

r = requests.get(f"{BASE}/api/contact/", headers=admin_headers())
check("Admin lists contacts", r.status_code == 200 and isinstance(r.json(), list))

r = requests.get(f"{BASE}/api/contact/", headers={})
check("Unauthenticated cannot list contacts (401)", r.status_code == 401)

if state["contact_id"]:
    r = requests.get(f"{BASE}/api/contact/{state['contact_id']}", headers=admin_headers())
    check("Admin gets contact by id", r.status_code == 200 and r.json()["is_read"] == False)

    r = requests.put(f"{BASE}/api/contact/{state['contact_id']}/read", headers=admin_headers())
    check("Admin marks contact as read", r.status_code == 200 and r.json()["is_read"] == True)

    r = requests.put(f"{BASE}/api/contact/{state['contact_id']}/archive", headers=admin_headers())
    check("Admin archives contact", r.status_code == 200 and r.json()["is_archived"] == True)

# Admin subscribers endpoint
r = requests.get(f"{BASE}/api/admin/subscribers", headers=admin_headers())
check("Admin lists all subscribers (admin route)", r.status_code == 200)


# ═══════════════════════════════════════════════════════════════════════════════
# 12. PORTFOLIO
# ═══════════════════════════════════════════════════════════════════════════════
section("12. PORTFOLIO")

r = requests.get(f"{BASE}/api/portfolio/")
check("Public lists portfolio (no auth)", r.status_code == 200 and isinstance(r.json(), list))

r = requests.get(f"{BASE}/api/portfolio/featured")
check("Public lists featured portfolio", r.status_code == 200)

r = requests.post(f"{BASE}/api/portfolio/", headers=admin_headers(), json={
    "title": "Test Portfolio — API Test Event",
    "description": "Test portfolio item created by API test suite",
    "category": "FULL_SETUP",
    "event_type": "Corporate",
    "is_featured": False,
    "display_order": 99,
})
check("Admin creates portfolio item (201)", r.status_code == 201, r.text)
if r.status_code == 201:
    state["portfolio_id"] = r.json()["id"]

r = requests.post(f"{BASE}/api/portfolio/", headers=sales_headers(), json={
    "title": "Unauthorized Portfolio",
    "category": "SMD",
})
check("Sales cannot create portfolio (403)", r.status_code == 403)

if state["portfolio_id"]:
    r = requests.put(f"{BASE}/api/portfolio/{state['portfolio_id']}", headers=admin_headers(), json={
        "description": "Updated description",
    })
    check("Admin updates portfolio item", r.status_code == 200)

    r = requests.put(f"{BASE}/api/portfolio/{state['portfolio_id']}/feature", headers=admin_headers())
    check("Admin toggles featured status", r.status_code == 200)


# ═══════════════════════════════════════════════════════════════════════════════
# 13. TESTIMONIALS
# ═══════════════════════════════════════════════════════════════════════════════
section("13. TESTIMONIALS")

r = requests.get(f"{BASE}/api/testimonials/")
check("Public lists approved testimonials", r.status_code == 200 and isinstance(r.json(), list))

r = requests.post(f"{BASE}/api/testimonials/", json={
    "client_name": "Test Client",
    "company": "Test Corp",
    "quote_text": "Excellent service from H&B. Highly recommend!",
    "rating": 5,
    "source": "Direct",
})
check("Public submits testimonial (201)", r.status_code == 201, r.text)
if r.status_code == 201:
    state["testimonial_id"] = r.json()["id"]
    check("Submitted testimonial starts unapproved", r.json()["is_approved"] == False)

r = requests.get(f"{BASE}/api/testimonials/all", headers=admin_headers())
check("Admin lists all testimonials", r.status_code == 200 and isinstance(r.json(), list))

r = requests.get(f"{BASE}/api/testimonials/all", headers=sales_headers())
check("Sales cannot access all testimonials (403)", r.status_code == 403)

if state["testimonial_id"]:
    r = requests.put(f"{BASE}/api/testimonials/{state['testimonial_id']}/approve",
                     headers=admin_headers(), params={"approved": True})
    check("Admin approves testimonial", r.status_code == 200 and r.json()["is_approved"] == True)

    r = requests.put(f"{BASE}/api/testimonials/{state['testimonial_id']}/feature", headers=admin_headers())
    check("Admin toggles testimonial featured", r.status_code == 200)


# ═══════════════════════════════════════════════════════════════════════════════
# 14. FAQ
# ═══════════════════════════════════════════════════════════════════════════════
section("14. FAQ")

r = requests.get(f"{BASE}/api/faq/")
check("Public lists active FAQs", r.status_code == 200 and isinstance(r.json(), list))

r = requests.post(f"{BASE}/api/faq/", headers=admin_headers(), json={
    "question": "Is this a test FAQ question?",
    "answer": "Yes, this is a test FAQ answer created by the API test suite.",
    "category": "Testing",
    "display_order": 99,
    "is_active": True,
})
check("Admin creates FAQ (201)", r.status_code == 201, r.text)
if r.status_code == 201:
    state["faq_id"] = r.json()["id"]

r = requests.post(f"{BASE}/api/faq/", headers=sales_headers(), json={
    "question": "Unauthorized FAQ?",
    "answer": "This should fail.",
})
check("Sales cannot create FAQ (403)", r.status_code == 403)

if state["faq_id"]:
    r = requests.put(f"{BASE}/api/faq/{state['faq_id']}", headers=admin_headers(), json={
        "answer": "Updated test FAQ answer",
        "is_active": False,
    })
    check("Admin updates FAQ", r.status_code == 200 and r.json()["is_active"] == False)

    r = requests.put(f"{BASE}/api/faq/{state['faq_id']}/reorder", headers=admin_headers(), json={
        "display_order": 50,
    })
    check("Admin reorders FAQ", r.status_code == 200 and r.json()["display_order"] == 50)


# ═══════════════════════════════════════════════════════════════════════════════
# 15. SERVICES (ServiceCatalog)
# ═══════════════════════════════════════════════════════════════════════════════
section("15. SERVICES (Service Catalog)")

r = requests.get(f"{BASE}/api/services/")
check("Public lists active services", r.status_code == 200 and isinstance(r.json(), list))

r = requests.get(f"{BASE}/api/services/smd-screen-rental")
check("Public gets service by slug", r.status_code == 200 and r.json()["slug"] == "smd-screen-rental")

r = requests.get(f"{BASE}/api/services/nonexistent-slug")
check("Non-existent slug returns 404", r.status_code == 404)

r = requests.get(f"{BASE}/api/services/all", headers=admin_headers())
check("Admin lists all services", r.status_code == 200)

r = requests.post(f"{BASE}/api/services/", headers=admin_headers(), json={
    "name": "Test Service",
    "slug": "test-service-api",
    "short_description": "A test service",
    "category": "SMD",
    "is_active": True,
    "display_order": 99,
})
if r.status_code == 201:
    state["service_id"] = r.json()["id"]
    check("Admin creates service (201)", True)
elif r.status_code == 400:
    info("Service slug already exists")
    svc = requests.get(f"{BASE}/api/services/test-service-api").json()
    if svc:
        state["service_id"] = svc.get("id")
    results["skipped"] += 1

r = requests.post(f"{BASE}/api/services/", headers=sales_headers(), json={
    "name": "Unauthorized Service",
    "slug": "unauthorized-service",
    "category": "SMD",
})
check("Sales cannot create service (403)", r.status_code == 403)

if state["service_id"]:
    r = requests.put(f"{BASE}/api/services/{state['service_id']}", headers=admin_headers(), json={
        "short_description": "Updated test service",
        "is_active": False,
    })
    check("Admin updates service", r.status_code == 200)

    r = requests.put(f"{BASE}/api/services/{state['service_id']}/toggle", headers=admin_headers())
    check("Admin toggles service active status", r.status_code == 200)


# ═══════════════════════════════════════════════════════════════════════════════
# 16. NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════════
section("16. NOTIFICATIONS")

r = requests.get(f"{BASE}/api/notifications/count", headers=admin_headers())
check("Admin gets unread notification count", r.status_code == 200 and "unread" in r.json())

r = requests.get(f"{BASE}/api/notifications/", headers=admin_headers())
check("Admin lists notifications", r.status_code == 200 and isinstance(r.json(), list))

r = requests.get(f"{BASE}/api/notifications/?unread_only=true", headers=admin_headers())
check("Admin filters unread notifications", r.status_code == 200)

r = requests.put(f"{BASE}/api/notifications/read-all", headers=admin_headers())
check("Admin marks all notifications read", r.status_code == 200)

r = requests.get(f"{BASE}/api/notifications/count", headers=admin_headers())
check("Unread count is 0 after mark-all-read", r.status_code == 200 and r.json()["unread"] == 0)

r = requests.get(f"{BASE}/api/notifications/", headers={})
check("Unauthenticated cannot list notifications (401)", r.status_code == 401)


# ═══════════════════════════════════════════════════════════════════════════════
# 17. CHATBOT
# ═══════════════════════════════════════════════════════════════════════════════
section("17. CHATBOT")

r = requests.post(f"{BASE}/api/chatbot/start")
check("Start chat session (201)", r.status_code == 201, r.text)
if r.status_code == 201:
    state["chat_token"] = r.json()["session_token"]
    check("Chat session token received", bool(state["chat_token"]))
    check("Chat greeting message present", bool(r.json().get("message")))

if state["chat_token"]:
    r = requests.post(f"{BASE}/api/chatbot/message", json={
        "session_token": state["chat_token"],
        "content": "What SMD screen sizes do you offer?",
        "visitor_name": "Test Visitor",
    })
    check("Send message to chatbot", r.status_code == 200, r.text[:200] if r.status_code != 200 else "")
    if r.status_code == 200:
        reply = r.json()
        check("Chatbot reply has user_message", "user_message" in reply)
        check("Chatbot reply has bot_message", "bot_message" in reply)
        check("Bot message is not empty", bool(reply["bot_message"]["content"]))

    # Invalid session token
    r = requests.post(f"{BASE}/api/chatbot/message", json={
        "session_token": "invalid-token-xyz",
        "content": "Hello",
    })
    check("Invalid session token returns 404", r.status_code == 404)

    # Admin lists chat sessions
    r = requests.get(f"{BASE}/api/chatbot/sessions", headers=admin_headers())
    check("Admin lists chat sessions", r.status_code == 200 and isinstance(r.json(), list))

    r = requests.get(f"{BASE}/api/chatbot/sessions/{state['chat_token']}", headers=admin_headers())
    check("Admin gets specific chat session", r.status_code == 200)

    r = requests.get(f"{BASE}/api/chatbot/sessions", headers=sales_headers())
    check("Sales can list chat sessions", r.status_code == 200)


# ═══════════════════════════════════════════════════════════════════════════════
# 18. ROLE-BASED ACCESS SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
section("18. ROLE-BASED ACCESS CONTROL — SUMMARY")

rbac_tests = [
    # (description, method, path, headers, expected_status)
    ("Admin can delete quote", "DELETE", f"/api/quotes/{state['quote_id'] or 9999}", admin_headers(), [204, 404]),
    ("Sales cannot delete quote", "DELETE", f"/api/quotes/{state['quote_id'] or 9999}", sales_headers(), [403]),
    ("Admin can delete event", "DELETE", f"/api/events/{state['event_id'] or 9999}", admin_headers(), [204, 404]),
    ("Sales cannot delete event", "DELETE", f"/api/events/{state['event_id'] or 9999}", sales_headers(), [403]),
    ("Admin can delete equipment", "DELETE", f"/api/equipment/{state['equipment_id'] or 9999}", admin_headers(), [204, 404]),
    ("Sales cannot delete equipment", "DELETE", f"/api/equipment/{state['equipment_id'] or 9999}", sales_headers(), [403]),
    ("Admin can delete client", "DELETE", f"/api/clients/{state['client_id'] or 9999}", admin_headers(), [204, 404]),
    ("Sales cannot delete client", "DELETE", f"/api/clients/{state['client_id'] or 9999}", sales_headers(), [403]),
    ("Admin can delete portfolio", "DELETE", f"/api/portfolio/{state['portfolio_id'] or 9999}", admin_headers(), [204, 404]),
    ("Admin can delete testimonial", "DELETE", f"/api/testimonials/{state['testimonial_id'] or 9999}", admin_headers(), [204, 404]),
    ("Admin can delete FAQ", "DELETE", f"/api/faq/{state['faq_id'] or 9999}", admin_headers(), [204, 404]),
    ("Admin can delete service", "DELETE", f"/api/services/{state['service_id'] or 9999}", admin_headers(), [204, 404]),
]

for desc, method, path, headers, expected in rbac_tests:
    r = getattr(requests, method.lower())(f"{BASE}{path}", headers=headers)
    check(desc, r.status_code in expected, f"Got {r.status_code}")


# ═══════════════════════════════════════════════════════════════════════════════
# RESULTS SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
section("RESULTS SUMMARY")
total = results["passed"] + results["failed"] + results["skipped"]
print(f"\n  Total : {total}")
print(f"  {PASS} Passed  : {results['passed']}")
print(f"  {FAIL} Failed  : {results['failed']}")
print(f"  {SKIP} Skipped : {results['skipped']}")

if results["failed"] == 0:
    print(f"\n  \033[92mAll tests passed! The API is fully functional.\033[0m\n")
else:
    print(f"\n  \033[91m{results['failed']} test(s) failed. Check output above.\033[0m\n")
    sys.exit(1)
