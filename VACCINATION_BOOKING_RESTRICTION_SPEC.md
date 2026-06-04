# Functional Specification: Vaccination Booking Restriction (Slot-Specific)

## 1. Overview
In the Humal platform, a farmer can book vaccination services for their livestock. During the initial booking phase, the booking request is broadcasted to find available veterinarians. While the system is actively searching for a vet (which constitutes a booking "in progress"), it is critical to prevent the farmer from submitting duplicate vaccination requests for the same date and time slot. Doing so leads to scheduling conflicts and poor resource utilization.

This specification describes the system constraints enforced at both the slot selection layer and the backend transactional layer.

---

## 2. Problem Statement
Previously, a farmer could book vaccinations for different slots on the same day. However, when we implemented a general warning blocking *any* new vaccination booking if one was in progress, it restricted farmers from booking vaccinations for different time slots (even when the existing pending booking was for a completely different hour). 

The goal of this revised constraint is to:
1. Block a farmer from booking a vaccination only if they already have an active/pending vaccination booking *for that particular time slot*.
2. Ensure that any time slot with a vaccination booking (including those under `PENDING` or `PENDING_REASSIGNMENT` status) is marked as unavailable/booked in the veterinarian's slot selection interface, preventing selectability in the first place.

---

## 3. Solution & Business Rules

### Rule 1: Slot Picker Disabling
When a farmer is picking a slot for a veterinarian, any slot that is occupied by an active booking—including `PENDING` (searching for vet) and `PENDING_REASSIGNMENT` (reassigning)—must be rendered as **booked/unavailable**. This prevents the user from selecting the slot.

### Rule 2: Transactional Double-Booking Block
If a farmer somehow attempts to submit a booking for a slot where they already have a vaccination booking in `PENDING`, `PENDING_REASSIGNMENT`, `CONFIRMED`, `IN_PROGRESS`, or `AWAITING_PAYMENT` status, the backend will reject the request with a descriptive error.

---

## 4. Technical Architecture

### 4.1 Slot Disabling (`get_available_slots` Endpoint)
- **Location**: `BookingService.get_available_slots` in [booking_service.py](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-backend/app/services/booking_service.py)
- **Implementation**:
  The query fetching existing bookings for a veterinarian on the chosen date is updated to include `PENDING_REASSIGNMENT`:
  ```python
  existing_bookings = db.query(Booking).filter(
      Booking.vet_id == vet_id,
      Booking.booking_date == query_date,
      Booking.status.in_([
          BookingStatus.PENDING, 
          BookingStatus.PENDING_REASSIGNMENT, # Enforces slot disabling during search reassignment
          BookingStatus.CONFIRMED, 
          BookingStatus.BLOCKED, 
          BookingStatus.AWAITING_PAYMENT,
          BookingStatus.IN_PROGRESS
      ])
  ).all()
  ```
  Slots overlapping with these bookings are returned with status `BOOKED`, which makes them unselectable on the mobile frontend.

### 4.2 Backend Check (`create_booking` Endpoint)
- **Location**: `BookingService.create_booking` in [booking_service.py](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-backend/app/services/booking_service.py)
- **Implementation**:
  When a booking request is made, if the category is `VACCINATION`, the backend verifies if the farmer already has a vaccination booking for the *exact same date and time slot* in an active state:
  ```python
  if booking_data.service_category == ServiceCategory.VACCINATION:
      existing_vaccination = db.query(Booking).filter(
          Booking.farmer_id == farmer_user.id,
          Booking.booking_date == booking_data.booking_date,
          Booking.booking_time == booking_data.booking_time,
          Booking.service_category == ServiceCategory.VACCINATION,
          Booking.status.in_([
              BookingStatus.PENDING, 
              BookingStatus.PENDING_REASSIGNMENT,
              BookingStatus.CONFIRMED,
              BookingStatus.IN_PROGRESS,
              BookingStatus.AWAITING_PAYMENT
          ])
      ).first()
      if existing_vaccination:
          raise HTTPException(
              status_code=status.HTTP_400_BAD_REQUEST,
              detail="You already have a vaccination booking in progress or confirmed for this time slot."
          )
  ```

### 4.3 Mobile Frontend Behavior
- **Screen-level navigation block removed**: The check inside `VaccineDetailScreen.tsx` is completely reverted. Farmers can navigate freely to book vaccinations for other time slots.
- **Handling validation error**: When the backend throws the `HTTP 400` validation error, the frontend catches the error and displays the message dynamically:
  `"You already have a vaccination booking for this time slot."`

---

## 5. Localization & UX

To support the bilingual nature of the application (English and Hindi), the warnings are localized.

### 5.1 English Context (`en.json`)
- **Key**: `vaccination_in_progress_msg`
- **Value**: `"You already have a vaccination booking for this time slot."`

### 5.2 Hindi Context (`hi.json`)
- **Key**: `vaccination_in_progress_msg`
- **Value**: `"आपके पास पहले से ही इस समय स्लॉट के लिए टीकाकरण बुकिंग है।"`
