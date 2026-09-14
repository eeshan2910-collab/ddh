document.addEventListener("DOMContentLoaded", () => {
    let selectedPropertyName = "Premium Studio Suite (Candolim)";
    let selectedPropertyPrice = 3500;
    let stayClassification = "short"; 

    const checkInDate = document.getElementById("checkInDate");
    const checkOutDate = document.getElementById("checkOutDate");
    const roomsCount = document.getElementById("roomsCount");
    const guestsCount = document.getElementById("guestsCount");
    const guestName = document.getElementById("guestName");
    const activePropertyName = document.getElementById("activePropertyName");

    const calculatedDays = document.getElementById("calculatedDays");
    const receiptBase = document.getElementById("receiptBase");
    const receiptTax = document.getElementById("receiptTax");
    const receiptService = document.getElementById("receiptService");
    const receiptTotal = document.getElementById("receiptTotal");

    window.selectProperty = function(name, basePrice, classification) {
        selectedPropertyName = name;
        selectedPropertyPrice = basePrice;
        stayClassification = classification;
        if (activePropertyName) activePropertyName.innerText = name;
        document.getElementById("booking-section").scrollIntoView({ behavior: 'smooth' });
        evaluateCalendarInvoice();
    };

    function evaluateCalendarInvoice() {
        if (!checkInDate || !checkOutDate || !receiptTotal) return;
        const start = new Date(checkInDate.value);
        const end = new Date(checkOutDate.value);
        let unitsOfTime = 0;

        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
            const differenceInTime = end.getTime() - start.getTime();
            const totalNightsCalculated = Math.ceil(differenceInTime / (1000 * 3600 * 24));
            unitsOfTime = stayClassification === "long" ? Math.max(1, Math.round(totalNightsCalculated / 30)) : totalNightsCalculated;
        }

        let dynamicRooms = parseInt(roomsCount.value) || 1;
        const aggregateBaseSum = selectedPropertyPrice * unitsOfTime * dynamicRooms;
        const computedTaxSum = Math.round(aggregateBaseSum * 0.12); 
        const standardServiceFee = stayClassification === "long" ? 2500 : (500 * dynamicRooms);
        const grossFinalSum = aggregateBaseSum > 0 ? (aggregateBaseSum + computedTaxSum + standardServiceFee) : 0;

        calculatedDays.innerText = `${unitsOfTime} ${stayClassification === 'long' ? 'Month(s)' : 'Night(s)'}`;
        receiptBase.innerText = "₹" + aggregateBaseSum.toLocaleString('en-IN');
        receiptTax.innerText = "₹" + computedTaxSum.toLocaleString('en-IN');
        receiptService.innerText = aggregateBaseSum > 0 ? "₹" + standardServiceFee.toLocaleString('en-IN') : "₹0";
        receiptTotal.innerText = "₹" + grossFinalSum.toLocaleString('en-IN');
    }

    window.sendWhatsAppBookingData = function() {
        if (!checkInDate.value || !checkOutDate.value) {
            alert("Please pick valid Check-In and Check-Out calendar dates first.");
            return;
        }
        const customerName = guestName.value.trim() || "Valued Guest";
        const outMessage = `Hello Dream Destination Hospitality Team!

` +
                           `A new website booking has been requested:
` +
                           `• Guest Name: ${customerName}
` +
                           `• Selected Property: ${selectedPropertyName}
` +
                           `• Check-In: ${checkInDate.value}
` +
                           `• Check-Out: ${checkOutDate.value}
` +
                           `• Rooms Allocated: ${roomsCount.value}
` +
                           `• Total Gross Invoice: ${receiptTotal.innerText}

` +
                           `--- AUTOMATION ACTION ---
` +
                           `This triggers a real-time row appending to the Google Sheets reservation database.`;
        window.open(`https://wa.me/910000000000?text=${encodeURIComponent(outMessage)}`, '_blank');
    };

    if (checkInDate && checkOutDate) {
        checkInDate.addEventListener("change", evaluateCalendarInvoice);
        checkOutDate.addEventListener("change", evaluateCalendarInvoice);
        roomsCount.addEventListener("input", evaluateCalendarInvoice);
        guestsCount.addEventListener("input", evaluateCalendarInvoice);
        checkInDate.min = new Date().toISOString().split('T')[0];
        evaluateCalendarInvoice();
    }

    window.adminModifyHousekeeping = function(unitId) {
        const targetLabel = document.getElementById(`labelStatus${unitId}`);
        const currentTargetRow = document.getElementById(`adminUnit${unitId}`);
        const actionBtn = currentTargetRow.querySelector("button");
        const counterHandle = document.getElementById("adminDirtyCounter");
        let currentActiveDirtyRooms = parseInt(counterHandle.innerText) || 0;

        if (targetLabel.classList.contains("pending")) {
            targetLabel.classList.remove("pending");
            targetLabel.classList.add("completed");
            targetLabel.innerHTML = `Ready / Active Inspected`;
            actionBtn.className = "action-btn-danger";
            actionBtn.innerText = "Flag Vacated / Dirty";
            if (currentActiveDirtyRooms > 0) counterHandle.innerText = currentActiveDirtyRooms - 1;
        } else {
            targetLabel.classList.remove("completed");
            targetLabel.classList.add("pending");
            targetLabel.innerHTML = `Dirty / Pending Turnover`;
            actionBtn.className = "action-btn-success";
            actionBtn.innerText = "Approve Clean";
            counterHandle.innerText = currentActiveDirtyRooms + 1;
        }
    };

    window.verifyAdminAccess = function() {
        const passcodeField = document.getElementById("adminPasscodeField");
        const errorMessage = document.getElementById("authErrorMessage");
        if (passcodeField.value === "Goa2026") {
            document.body.classList.remove("admin-locked");
        } else {
            errorMessage.innerText = "Invalid security passcode. Access Denied.";
            passcodeField.value = "";
        }
    };
});