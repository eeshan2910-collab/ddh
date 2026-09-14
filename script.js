document.addEventListener("DOMContentLoaded", () => {
    
    // --- GOOGLE SCRIPT INTEGRATION GATEWAY (ALWAYS SECURE HTTPS FOR GITHUB) ---
    const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz_SAMPLE_REPLACE_WITH_YOUR_ACTUAL_DEPL_URL/exec";

    let selectedPropertyName = "Premium Studio Suite (Candolim)";
    let selectedPropertyPrice = 3500;
    let stayClassification = "short"; 

    // DOM Handles
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

    window.selectProperty = function(name, basePrice, classification) {
        selectedPropertyName = name;
        selectedPropertyPrice = basePrice;
        stayClassification = classification;

        if (activePropertyName) activePropertyName.innerText = name;
        
        const bookingSection = document.getElementById("booking-section");
        if(bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });
        evaluateCalendarInvoice();
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

        if(calculatedDays) {
            calculatedDays.innerText = `${unitsOfTime} ${stayClassification === 'long' ? 'Month(s)' : 'Night(s)'}`;
        }
        if(receiptBase) receiptBase.innerText = "₹" + aggregateBaseSum.toLocaleString('en-IN');
        if(receiptTax) receiptTax.innerText = "₹" + computedTaxSum.toLocaleString('en-IN');
        if(receiptService) receiptService.innerText = aggregateBaseSum > 0 ? "₹" + standardServiceFee.toLocaleString('en-IN') : "₹0";
        if(receiptTotal) receiptTotal.innerText = "₹" + grossFinalSum.toLocaleString('en-IN');
    }

    // --- DUAL AUTOMATION WORKFLOW (GOOGLE SHEETS FETCH LOG + WHATSAPP SPARK) ---
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
        submitBookingBtn.innerText = "Processing Sheets Sync...";

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
            const outMessage = `Hello Dream Destination Hospitality Team!\n\n` +
                               `I have processed a website booking reservation:\n` +
                               `• Guest Name: ${payloadPackage.guestName}\n` +
                               `• Property: ${selectedPropertyName}\n` +
                               `• Check-In: ${checkInDate.value}\n` +
                               `• Check-Out: ${checkOutDate.value}\n` +
                               `• Rooms: ${roomsCount.value}\n` +
                               `• Invoice Value: ${payloadPackage.totalAmount}\n\n` +
                               `Records have been pushed to the booking sheet. Please approve room allocation keys.`;

            window.open(`https://wa.me/910000000000?text=${encodeURIComponent(outMessage)}`, '_blank');
            submitBookingBtn.disabled = false;
            submitBookingBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Finalize & Confirm Booking`;
        })
        .catch(err => {
            console.error("Sheets automation fail link: ", err);
            submitBookingBtn.disabled = false;
            submitBookingBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Finalize & Confirm Booking`;
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

    // --- SECURE TERMINAL GATE PASS OVERLAY INTERACTION LOGIC ---
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

    // --- ADMIN HOUSEKEEPING MATRIX TOGGLE DATA LAYERS ---
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