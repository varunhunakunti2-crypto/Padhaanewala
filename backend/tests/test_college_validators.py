"""Unit tests for college validation and slugging that do not require a database."""

import pytest
from pydantic import ValidationError

from app.schemas.college import CollegeCreate, CollegeUpdate
from app.services.college_service import slugify, normalize_name


def valid_payload(**overrides):
    payload = {
        "name": "Test College",
        "college_code": "TEST-0001",
    }
    payload.update(overrides)
    return payload


def test_create_requires_name_and_code():
    with pytest.raises(ValidationError):
        CollegeCreate()

    with pytest.raises(ValidationError):
        CollegeCreate(name="X", college_code="AB")  # name too short


def test_valid_create_passes():
    c = CollegeCreate(**valid_payload())
    assert c.name == "Test College"
    assert c.verification_status is None  # service sets default later


def test_email_validation():
    with pytest.raises(ValidationError):
        CollegeCreate(**valid_payload(email="not-an-email"))
    c = CollegeCreate(**valid_payload(email="admin@example.com"))
    assert c.email == "admin@example.com"


def test_phone_validation():
    with pytest.raises(ValidationError):
        CollegeCreate(**valid_payload(phone="12345"))
    c = CollegeCreate(**valid_payload(phone="+91 98765 43210"))
    assert c.phone == "919876543210"


def test_pincode_validation():
    with pytest.raises(ValidationError):
        CollegeCreate(**valid_payload(pincode="56010"))
    with pytest.raises(ValidationError):
        CollegeCreate(**valid_payload(pincode="abcd10"))
    c = CollegeCreate(**valid_payload(pincode="560100"))
    assert c.pincode == "560100"


def test_lat_lng_bounds():
    with pytest.raises(ValidationError):
        CollegeCreate(**valid_payload(latitude=95))
    with pytest.raises(ValidationError):
        CollegeCreate(**valid_payload(longitude=-200))
    CollegeCreate(**valid_payload(latitude=-90, longitude=180))


def test_url_validation():
    with pytest.raises(ValidationError):
        CollegeCreate(**valid_payload(website="example.com"))
    with pytest.raises(ValidationError):
        CollegeCreate(**valid_payload(google_maps_url="maps.google.com/x"))
    c = CollegeCreate(**valid_payload(website="https://example.com"))
    assert c.website == "https://example.com"


def test_established_year_bounds():
    import datetime
    with pytest.raises(ValidationError):
        CollegeCreate(**valid_payload(established_year=999))
    with pytest.raises(ValidationError):
        CollegeCreate(**valid_payload(established_year=datetime.datetime.now().year + 5))
    CollegeCreate(**valid_payload(established_year=2005))


def test_enum_status_fields():
    with pytest.raises(ValidationError):
        CollegeCreate(**valid_payload(verification_status="random"))
    with pytest.raises(ValidationError):
        CollegeCreate(**valid_payload(admission_status="maybe"))
    c = CollegeCreate(**valid_payload(verification_status="PENDING", admission_status="OPEN"))
    assert c.verification_status == "pending"
    assert c.admission_status == "open"


def test_state_city_university_fields_accepted():
    c = CollegeCreate(
        **valid_payload(state="Karnataka", district="Bengaluru", city="Bengaluru", university_name="ICU")
    )
    assert c.state == "Karnataka"
    assert c.university_name == "ICU"


def test_update_accepts_partial():
    u = CollegeUpdate(name="Renamed College", pincode="560100")
    assert u.name == "Renamed College"
    assert u.is_private is None


def test_slugify_ascii():
    assert slugify("Sri Ram College & Institute") == "sri-ram-college-and-institute"
    assert slugify("  Oxford Medical   College  ") == "oxford-medical-college"
    assert slugify("IIT-Bombay") == "iit-bombay"


def test_slugify_devnagari_empty():
    # Non-ASCII names yield an empty slug; the service falls back to a uuid slug.
    assert slugify("श्री राम कॉलेज") == ""


def test_normalize_name_strips_common_words():
    assert normalize_name("The Institute of Technology") == "the of technology"


def test_bulk_schemas_require_ids():
    from app.schemas.college import CollegeBulkPublish, CollegeBulkVerify
    from uuid import uuid4

    with pytest.raises(ValidationError):
        CollegeBulkPublish(ids=[], is_published=True)

    b = CollegeBulkVerify(ids=[uuid4()], verification_status="Verified")
    assert b.verification_status == "verified"