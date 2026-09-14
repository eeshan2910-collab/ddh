document.addEventListener("DOMContentLoaded", () => {
    
    // Global Core Architecture Variables
    let selectedPropertyName = "Premium Studio Suite (Candolim)";
    let selectedPropertyPrice = 3500;
    let stayClassification = "short"; 

    // DOM Handles for Booking Form System
    const checkInDate = document.getElementById("checkInDate");
    const checkOutDate = document.getElementById("checkOutDate");
    const roomsCount = document.getElementById("roomsCount");
    const guestsCount = document.getElementById("guestsCount");
    const activePropertyName = document.getElementById("activePropertyName");
    const durationLabel = document.getElementById("durationLabel");

    const calculatedDays = document.getElementById("calculatedDays");
    const receiptBase = document.getElementById("receiptBase");
    const receiptTax = document.getElementById("receiptTax");
    const receiptService = document.getElementById("receiptService");
    const receiptTotal = document.getElementById("receiptTotal");

    // Expose property selection logic to property showcase cards
    window.selectProperty = function(name, basePrice, classification) {
        selectedPropertyName = name;
        selectedPropertyPrice = basePrice;
        stayClassification = classification;

        if (activePropertyName) {
            activePropertyName.innerText = name;
        }

        if (durationLabel) {
            durationLabel.innerHTML = classification === "long" ? 
                `<i class="fa-solid fa-calendar-days"></i> Duration (Months)` : 
                `<i class="fa-solid fa-calendar-days"></i> Duration (Nights)`;
        }

        // Auto scroll user downward directly to selection parameters
        document.getElementById("booking-section").scrollIntoView({ behavior: 'smooth' });
        evaluateCalendarInvoice();
    };

    function evaluateCalendarInvoice() {
        if (!checkInDate || !checkOutDate) return;

        const start = new Date(checkInDate.value);
        const end = new Date(checkOutDate.value);
        let unitsOfTime = 0;

        // Perform time differential calculations if calendar fields contain inputs
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
            const differenceInTime = end.getTime() - start.getTime();
            const totalNightsCalculated = Math.ceil(differenceInTime / (1000 * 3600 * 24));
            
            if (stayClassification === "long") {
                // Approximate monthly calculation metrics
                unitsOfTime = Math.max(1, Math.round(totalNightsCalculated / 30));
            } else {
                unitsOfTime = totalNightsCalculated;
            }
        }

        let dynamicRooms = parseInt(roomsCount.value) || 1;
        if (dynamicRooms < 1) { dynamicRooms = 1; roomsCount.value = 1; }

        // Invoice Calculations formulas
        const aggregateBaseSum = selectedPropertyPrice * unitsOfTime * dynamicRooms;
        const computedTaxSum = Math.round(aggregateBaseSum * 0.12); // Premium 12% GST Luxury Category tier
        const standardServiceFee = stayClassification === "long" ? 2500 : (500 * dynamicRooms);
        
        const grossFinalSum = aggregateBaseSum > 0 ? (aggregateBaseSum + computedTaxSum + standardServiceFee) : 0;

        // Update interface items
        calculatedDays.innerText = `${unitsOfTime} ${stayClassification === 'long' ? 'Month(s)' : 'Night(s)'}`;
        receiptBase.innerText = "₹" + aggregateBaseSum.toLocaleString('en-IN');
        receiptTax.innerText = "₹" + computedTaxSum.toLocaleString('en-IN');
        receiptService.innerText = aggregateBaseSum > 0 ? "₹" + standardServiceFee.toLocaleString('en-IN') : "₹0";
        receiptTotal.innerText = "₹" + grossFinalSum.toLocaleString('en-IN');
    }

    // Outbound Message Construction Pipeline
    window.sendWhatsAppBookingData = function() {
        if (!checkInDate.value || !checkOutDate.value) {
            alert("Please pick valid Check-In and Check-Out calendar dates first.");
            return;
        }

        const outMessage = `Hello Dream Destination Hospitality Team!\n\n` +
                           `I would like to submit a formal reservation request:\n` +
                           `• Selected Property: ${selectedPropertyName}\n` +
                           `• Check-In: ${checkInDate.value}\n` +
                           `• Check-Out: ${checkOutDate.value}\n` +
                           `• Rooms Allocated: ${roomsCount.value}\n` +
                           `• Total Gross Invoice: ${receiptTotal.innerText}\n\n` +
                           `Please confirm availability so I can proceed with the booking.`;

        window.open(`https://wa.me{encodeURIComponent(outMessage)}`, '_blank');
    };

    // Attach interaction handling loops
    if (checkInDate && checkOutDate) {
        checkInDate.addEventListener("change", evaluateCalendarInvoice);
        checkOutDate.addEventListener("change", evaluateCalendarInvoice);
        roomsCount.addEventListener("input", evaluateCalendarInvoice);
        guestsCount.addEventListener("input", evaluateCalendarInvoice);
        
        // Populate system constraints with default execution variables automatically
        const today = new Date().toISOString().split('T')[0];
        checkInDate.min = today;
        evaluateCalendarInvoice();
    }

    // --- Admin Dashboard Housekeeping Status Manipulations ---
    window.adminModifyHousekeeping = function(unitId) {
        const targetLabel = document.getElementById(`labelStatus${unitId}`);
        const currentTargetRow = document.getElementById(`adminUnit${unitId}`);
        const actionBtn = currentTargetRow.querySelector("button");
        const counterHandle = document.getElementById("adminDirtyCounter");

        let currentActiveDirtyRooms = parseInt(counterHandle.innerText) || 0;

        if (targetLabel.classList.contains("pending")) {
            targetLabel.classList.remove("pending");
            targetLabel.classList.add("completed");
            targetLabel.innerHTML = `<i class="fa-solid fa-check-double"></i> Ready / Active Inspected`;
            actionBtn.className = "action-btn-danger";
            actionBtn.innerText = "Flag Vacated / Dirty";
            
            if (currentActiveDirtyRooms > 0) counterHandle.innerText = currentActiveDirtyRooms - 1;
        } else {
            targetLabel.classList.remove("completed");
            targetLabel.classList.add("pending");
            targetLabel.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> Dirty / Pending Turnover`;
            actionBtn.className = "action-btn-success";
            actionBtn.innerText = "Approve Clean";
            
            counterHandle.innerText = currentActiveDirtyRooms + 1;
        }
    };
});
