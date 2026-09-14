document.addEventListener("DOMContentLoaded", () => {
    const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz_SAMPLE_REPLACE_WITH_YOUR_ACTUAL_DEPL_URL/exec";

    const propertyDatabase = {
        studio: {
            name: "Premium Studio Suite (Candolim)",
            price: 3500,
            type: "short",
            location: "Candolim, North Goa",
            desc: "A stunning, contemporary studio space located in the vibrant heart of Candolim. Perfectly configured for leisure travelers, this premium property offers direct access to top-tier dining hubs alongside high-end domestic comforts.",
            amenities: [
                { icon: "fa-bell-concierge", label: "24/7 Room Service" },
                { icon: "fa-swimming-pool", label: "Swimming Pool" },
                { icon: "fa-wifi", label: "High-Speed Wi-Fi" },
                { icon: "fa-snowflake", label: "Air Conditioning" },
                { icon: "fa-shirt", label: "Laundry Service" }
            ],
            images: [
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=750&q=80",
                "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=750&q=80",
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=750&q=80"
            ]
        },
        apartment: {
            name: "Coastal 1BHK Apartment (Calangute)",
            price: 28000,
            type: "long",
            location: "Calangute, North Goa",
            desc: "An upscale, fully furnished 1BHK residential apartment setup designed intentionally for remote executives, digital nomads, and corporate professionals. Includes separate workspaces and complete modular kitchen infrastructure.",
            amenities: [
                { icon: "fa-couch", label: "Fully Furnished" },
                { icon: "fa-kitchen-set", label: "Modular Kitchen" },
                { icon: "fa-bolt", label: "100% Power Backup" },
                { icon: "fa-shield-halved", label: "24/7 Security" },
                { icon: "fa-square-parking", label: "Reserved Parking" }
            ],
            images: [
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=750&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=750&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=750&q=80"
            ]
        },
        guesthouse: {
            name: "Heritage Guest House (Anjuna)",
            price: 4200,
            type: "short",
            location: "Anjuna, North Goa",
            desc: "Immerse yourself in authentic Portuguese-Goan architectural design elements combined with modern resort elements. Situated steps away from the iconic Anjuna coast, offering gourmet daily breakfast menus.",
            amenities: [
                { icon: "fa-mug-saucer", label: "Complimentary Breakfast" },
                { icon: "fa-umbrella-beach", label: "Immediate Beach Access" },
                { icon: "fa-utensils", label: "In-House Restaurant" },
                { icon: "fa-tree", label: "Private Garden Area" },
                { icon: "fa-car-side", label: "Airport Shuttle" }
            ],
            images: [
                "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=750&q=80",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=750&q=80",
                "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=750&q=80"
            ]
        }
    };

    let selectedPropertyName = propertyDatabase.studio.name;
    let selectedPropertyPrice = propertyDatabase.studio.price;
    let stayClassification = propertyDatabase.studio.type;
    let activeImageIndex = 0;
    let activeImageArray = [];

    const checkInDate = document.getElementById("checkInDate");
    const checkOutDate = document.getElementById("checkOutDate");
    const roomsCount = document.getElementById("roomsCount");
    const guestsCount = document.getElementById("guestsCount");
    const guestNameInput = document.getElementById("guestNameInput");
    const activePropertyName = document.getElementById("activePropertyName");
    const calculatedDays = document.getElementById("calculatedDays");
    const submitBookingBtn = document.getElementById("submitBookingBtn");

    const receiptBase = document.getElementById("receiptBase");
    const receiptTax = document.getElementById("receiptTax");
    const receiptService = document.getElementById("receiptService");
    const receiptTotal = document.getElementById("receiptTotal");

    const dynamicPropertyModal = document.getElementById("dynamicPropertyModal");
    const sliderImageWindow = document.getElementById("sliderImageWindow");
    const modalPropertyTitle = document.getElementById("modalPropertyTitle");
    const modalPropertyLocation = document.getElementById("modalPropertyLocation");
    const modalPropertyLongDesc = document.getElementById("modalPropertyLongDesc");
    const modalAmenitiesGrid = document.getElementById("modalAmenitiesGrid");

    window.openPropertyGalleryModal = function(key) {
        const item = propertyDatabase[key];
        if (!item) return;

        activeImageArray = item.images;
        activeImageIndex = 0;

        selectedPropertyName = item.name;
        selectedPropertyPrice = item.price;
        stayClassification = item.type;

        modalPropertyTitle.innerText = item.name;
        modalPropertyLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${item.location}`;
        modalPropertyLongDesc.innerText = item.desc;
        
        modalAmenitiesGrid.innerHTML = "";
        item.amenities.forEach(am => {
            modalAmenitiesGrid.innerHTML += `<span class="amenity-tag"><i class="fa-solid ${am.icon}"></i> ${am.label}</span>`;
        });

        updateModalImageDisplay();
        dynamicPropertyModal.style.display = "flex";
    };

    window.closePropertyGalleryModal = function() {
        dynamicPropertyModal.style.display = "none";
    };

    function updateModalImageDisplay() {
        if (activeImageArray.length > 0) {
            sliderImageWindow.style.backgroundImage = `url('${activeImageArray[activeImageIndex]}')`;
        }
    }

    window.shiftModalImage = function(direction) {
        activeImageIndex += direction;
        if (activeImageIndex >= activeImageArray.length) activeImageIndex = 0;
        if (activeImageIndex < 0) activeImageIndex = activeImageArray.length - 1;
        updateModalImageDisplay();
    };

    window.bindPropertyToBookingForm = function() {
        if (activePropertyName) activePropertyName.innerText = selectedPropertyName;
        closePropertyGalleryModal();
        evaluateCalendarInvoice();
        
        const bookingSection = document.getElementById("booking-section");
        if (bookingSection) bookingSection.scrollIntoView({ behavior: "smooth" });
    };

    function evaluateCalendarInvoice() {
        if (!checkInDate || !checkOutDate) return;

        const start = new Date(checkInDate.value);
        const end = new Date(checkOutDate.value);
        let unitsOfTime = 0;

        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
            const differenceInTime = end.getTime() - start.getTime();
            const totalNightsCalculated = Math.ceil(differenceInTime / (1000 * 3600 * 24));
            
            unitsOfTime = (stayClassification === "long") ? 
                Math.max(1, Math.round(totalNightsCalculated / 30)) : totalNightsCalculated;
        }

        let dynamicRooms = parseInt(roomsCount.value) || 1;
        if (dynamicRooms < 1) { dynamicRooms = 1; roomsCount.value = 1; }

        const aggregateBaseSum = selectedPropertyPrice * unitsOfTime * dynamicRooms;
        const computedTaxSum = Math.round(aggregateBaseSum * 0.12); 
        const standardServiceFee = (stayClassification === "long") ? 2500 : (500 * dynamicRooms);
        const grossFinalSum = aggregateBaseSum > 0 ? (aggregateBaseSum + computedTaxSum + standardServiceFee) : 0;

        if (calculatedDays) {
            calculatedDays.innerText = `${unitsOfTime} ${stayClassification === 'long' ? 'Month(s)' : 'Night(s)'}`;
        }
        if (receiptBase) receiptBase.innerText = "₹" + aggregateBaseSum.toLocaleString('en-IN');
        if (receiptTax) receiptTax.innerText = "₹" + computedTaxSum.toLocaleString('en-IN');
        if (receiptService) receiptService.innerText = aggregateBaseSum > 0 ? "₹" + standardServiceFee.toLocaleString('en-IN') : "₹0";
        if (receiptTotal) receiptTotal.innerText = "₹" + grossFinalSum.toLocaleString('en-IN');
    }

    window.executeDualBookingWorkflow = function() {
        if (!guestNameInput.value.trim()) {
            alert("Please input the Primary Guest Full Name before booking confirmation.");
            return;
        }
        if (!checkInDate.value || !checkOutDate.value || new Date(checkOutDate.value) <= new Date(checkInDate.value)) {
            alert("Please input valid Check-In and Check-Out calendar date periods.");
            return;
        }

        submitBookingBtn.disabled = true;
        submitBookingBtn.innerText = "Syncing...";

        const payloadPackage = {
            guestName: guestNameInput.value,
            propertyName: selectedPropertyName,
            checkIn: checkInDate.value,
            checkOut: checkOutDate.value,
            roomsCount: roomsCount.value,
            stayClassification: stayClassification,
            totalAmount: receiptTotal.innerText
        };

        fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadPackage)
        })
        .then(() => {
            const outMessage = `Hello Dream Destination Hospitality Team!

` +
                               `I have processed a website booking reservation:
` +
                               `• Guest Name: ${payloadPackage.guestName}
` +
                               `• Property: ${selectedPropertyName}
` +
                               `• Check-In: ${checkInDate.value}
` +
                               `• Check-Out: ${checkOutDate.value}
` +
                               `• Rooms: ${roomsCount.value}
` +
                               `• Invoice Value: ${payloadPackage.totalAmount}

` +
                               `Records have been pushed to the booking sheet. Please approve room allocation keys.`;

            window.open(`https://wa.me/910000000000?text=${encodeURIComponent(outMessage)}`, '_blank');
            submitBookingBtn.disabled = false;
            submitBookingBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Finalize Booking`;
        })
        .catch(err => {
            console.error("Sheets automation log failure: ", err);
            submitBookingBtn.disabled = false;
            submitBookingBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Finalize Booking`;
        });
    };

    if (checkInDate && checkOutDate) {
        checkInDate.addEventListener("change", evaluateCalendarInvoice);
        checkOutDate.addEventListener("change", evaluateCalendarInvoice);
        roomsCount.addEventListener("input", evaluateCalendarInvoice);
        guestsCount.addEventListener("input", evaluateCalendarInvoice);
        
        const today = new Date().toISOString().split('T');
        checkInDate.min = today;
        evaluateCalendarInvoice();
    }

    window.verifyAdminAccessGate = function() {
        const passwordInput = document.getElementById("adminSecretKeyField").value;
        const errorLabel = document.getElementById("authErrorMsg");
        const lockScreen = document.getElementById("adminAuthLockscreen");
        const operationalDashboard = document.getElementById("adminProtectedContent");

        if (passwordInput === "Goa2026") {
            lockScreen.style.display = "none";
            operationalDashboard.style.display = "block";
        } else {
            errorLabel.innerText = "Invalid Operational Pass Code. Access Denied.";
        }
    };

    window.adminModifyHousekeeping = function(unitId) {
        const label = document.getElementById(`labelStatus${unitId}`);
        const row = document.getElementById(`adminUnit${unitId}`);
        const actionBtn = row.querySelector("button");
        const counter = document.getElementById("adminDirtyCounter");
        let dirtyCount = parseInt(counter.innerText) || 0;

        if (label.classList.contains("pending")) {
            label.classList.replace("pending", "completed");
            label.innerHTML = `<i class="fa-solid fa-check-double"></i> Ready / Active Inspected`;
            actionBtn.className = "action-btn-danger";
            actionBtn.innerText = "Flag Vacated / Dirty";
            if (dirtyCount > 0) counter.innerText = dirtyCount - 1;
        } else {
            label.classList.replace("completed", "pending");
            label.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> Dirty / Pending Turnover`;
            actionBtn.className = "action-btn-success";
            actionBtn.innerText = "Approve Clean";
            counter.innerText = dirtyCount + 1;
        }
    };
});