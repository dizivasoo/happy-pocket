/* ===== BUDGET SETUP ===== */
let PRESET_BUDGET = 0;
let remaining = 0;
let used = 0;

/* ===== DOM ELEMENTS ===== */
const totalDisplay = document.getElementById("total");
const expenseList = document.getElementById("expenseList");
const modal = document.getElementById("modal");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const reasonSelect = document.getElementById("reasonSelect");
const customReason = document.getElementById("customReason");
const amountInput = document.getElementById("amount");

const topBar = document.querySelector(".top-bar");

/* ===== FORMAT CURRENCY (INDIAN STYLE) ===== */
function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

/* ===== HERO COUNT UP ANIMATION ===== */
function animateBalance(targetAmount) {

  let start = 0;
  const duration = 1200;
  const increment = targetAmount / (duration / 16);

  const counter = setInterval(() => {
    start += increment;

    if (start >= targetAmount) {
      start = targetAmount;
      clearInterval(counter);
    }

    totalDisplay.textContent = formatCurrency(Math.floor(start));

  }, 16);
}

/* ===== SAVE CURRENT SESSION ===== */
function saveData() {
  const data = {
    budget: PRESET_BUDGET,
    remaining: remaining,
    used: used,
    expensesHTML: expenseList.innerHTML
  };

  localStorage.setItem("hp_current", JSON.stringify(data));
}

/* ===== LOAD SAVED SESSION ===== */
function loadData() {

  const saved = JSON.parse(localStorage.getItem("hp_current"));

  if (!saved || !saved.budget || saved.budget <= 0) {
    document.getElementById("splashScreen").style.display = "flex";
    return;
  }

  PRESET_BUDGET = saved.budget;
  remaining = saved.remaining;
  used = saved.used;

  totalDisplay.textContent = formatCurrency(remaining);

  document.querySelector(".budget-overlay").textContent =
    "Budget ₹" + PRESET_BUDGET;

  expenseList.innerHTML = saved.expensesHTML;

  updateProgress();
  updateBudgetColor();

  document.getElementById("splashScreen").style.display = "none";
}

/* ===== SPLASH START FUNCTION ===== */
function startApp() {
  const budgetInput = document.getElementById("budgetInput");
  const value = parseFloat(budgetInput.value);

  if (isNaN(value) || value <= 0) {
    alert("Enter valid budget amount");
    return;
  }

  PRESET_BUDGET = value;
  remaining = value;
  used = 0;

  animateBalance(remaining);

  document.querySelector(".budget-overlay").textContent =
    "Budget ₹" + PRESET_BUDGET;

  updateProgress();
  updateBudgetColor();

  saveData();

  document.getElementById("splashScreen").style.display = "none";
}

/* ===== CATEGORY COLORS ===== */
const categoryColors = {
  Food: "#FF7043",
  Travel: "#42A5F5",
  Shopping: "#AB47BC",
  Bills: "#26A69A",
  Entertainment: "#EC407A",
  Health: "#66BB6A",
  Education: "#5C6BC0",
  Recharge: "#FFA726",
  Subscriptions: "#8D6E63",
  Other: "#78909C"
};

/* ===== MODAL CONTROLS ===== */
function openAddModal() {
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

modal.addEventListener("click", function (e) {
  if (e.target === modal) {
    closeModal();
  }
});

/* ===== SHOW CUSTOM FIELD ===== */
reasonSelect.addEventListener("change", function () {
  if (reasonSelect.value === "Custom") {
    customReason.classList.remove("hidden");
  } else {
    customReason.classList.add("hidden");
    customReason.value = "";
  }
});

/* ===== RESTRICT AMOUNT TO NUMBERS ===== */
amountInput.addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

/* ===== ADD EXPENSE ===== */
function addExpense() {

  if (PRESET_BUDGET === 0) {
    alert("Set your budget first");
    return;
  }

  let selectedReason = reasonSelect.value;
  let finalReason = "";

  if (!selectedReason) {
    alert("Please select a category");
    return;
  }

  if (selectedReason === "Custom") {
    finalReason = customReason.value.trim();
    if (!finalReason) {
      alert("Enter custom reason");
      return;
    }
  } else {
    finalReason = selectedReason;
  }

  const amount = parseFloat(amountInput.value);

  if (isNaN(amount) || amount <= 0) {
    alert("Enter valid amount");
    return;
  }

  if (amount > remaining) {
    alert("Budget exceeded!");
    return;
  }

  remaining -= amount;
  used += amount;

  totalDisplay.textContent = formatCurrency(remaining);

  updateProgress();
  updateBudgetColor();

  const card = document.createElement("div");
  card.className = "card";

  let cardColor = categoryColors[selectedReason] || "#333";

  card.style.borderLeft = "6px solid " + cardColor;
  card.style.background =
    "linear-gradient(135deg, " + cardColor + "15, #ffffff)";

  card.innerHTML = `
    <div>
      <strong>${finalReason}</strong><br>
      <span>Expense</span>
    </div>
    <div>${formatCurrency(amount)}</div>
  `;

  expenseList.appendChild(card);

  reasonSelect.value = "";
  customReason.value = "";
  customReason.classList.add("hidden");
  amountInput.value = "";

  saveData();

  closeModal();
}

/* ===== PROGRESS UPDATE ===== */
function updateProgress() {

  if (PRESET_BUDGET === 0) return;

  const percent = (used / PRESET_BUDGET) * 100;

  progressBar.style.width = percent + "%";
  progressText.textContent = Math.round(percent) + "% used";

  if (percent >= 70) {
    progressBar.style.background = "#ff5252";
  } else {
    progressBar.style.background = "black";
  }
}

/* ===== HERO COLOR CHANGE ===== */
function updateBudgetColor() {

  if (PRESET_BUDGET === 0) return;

  if (remaining <= PRESET_BUDGET * 0.3) {
    topBar.style.background =
      "linear-gradient(135deg, #ff8a80, #ff5252)";
  } else {
    topBar.style.background =
      "linear-gradient(135deg, #FFD54F, #FFC107)";
  }
}

/* ===== RESET BUDGET ===== */
function resetBudget() {

  if (PRESET_BUDGET === 0) {
    alert("No active budget");
    return;
  }

  const sessionData = {
    budget: PRESET_BUDGET,
    remaining: remaining,
    used: used,
    expenses: expenseList.innerHTML,
    date: new Date().toLocaleString()
  };

  let history = JSON.parse(localStorage.getItem("hp_history")) || [];
  history.push(sessionData);
  localStorage.setItem("hp_history", JSON.stringify(history));

  localStorage.removeItem("hp_current");

  PRESET_BUDGET = 0;
  remaining = 0;
  used = 0;

  expenseList.innerHTML = "";
  totalDisplay.textContent = "₹0";

  document.querySelector(".budget-overlay").textContent = "Budget ₹0";

  updateProgress();
  updateBudgetColor();

  document.getElementById("splashScreen").style.display = "flex";

  alert("Previous data saved successfully!");
}

/* ===== LOAD ON PAGE OPEN ===== */
window.onload = loadData;


if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("Service Worker Registered"))
      .catch(err => console.log("SW failed", err));
  });
}
