/* ===== BUDGET SETUP ===== */
let PRESET_BUDGET = 0;
let remaining = 0;
let used = 0;
let deferredPrompt; // Variable for PWA Install

/* ===== DOM ELEMENTS ===== */
const totalDisplay = document.getElementById("total");
const expenseList = document.getElementById("expenseList");
const modal = document.getElementById("modal");
const earnModal = document.getElementById("earnModal"); // New
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const reasonSelect = document.getElementById("reasonSelect");
const customReason = document.getElementById("customReason");
const amountInput = document.getElementById("amount");
const earnAmountInput = document.getElementById("earnAmount"); // New

const topBar = document.querySelector(".top-bar");
const installBtn = document.getElementById("installBtn"); // New

/* ===== PWA INSTALL LOGIC (THE "DOWNLOAD" THING) ===== */
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', (e) => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        installBtn.classList.add('hidden');
      }
      deferredPrompt = null;
    });
  }
});

/* ===== FORMAT CURRENCY (INDIAN STYLE) ===== */
function formatCurrency(amount) {
  return "₹" + Math.floor(amount).toLocaleString("en-IN");
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
    totalDisplay.textContent = formatCurrency(start);
  }, 16);
}

/* ===== SAVE/LOAD DATA ===== */
function saveData() {
  const data = {
    budget: PRESET_BUDGET,
    remaining: remaining,
    used: used,
    expensesHTML: expenseList.innerHTML
  };
  localStorage.setItem("hp_current", JSON.stringify(data));
}

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
  document.querySelector(".budget-overlay").textContent = "Budget ₹" + PRESET_BUDGET;
  expenseList.innerHTML = saved.expensesHTML;
  updateProgress();
  updateBudgetColor();
  document.getElementById("splashScreen").style.display = "none";
}

/* ===== START APP ===== */
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
  document.querySelector(".budget-overlay").textContent = "Budget ₹" + PRESET_BUDGET;
  updateProgress();
  updateBudgetColor();
  saveData();
  document.getElementById("splashScreen").style.display = "none";
}

/* ===== MODAL CONTROLS ===== */
function openAddModal() { modal.classList.remove("hidden"); }
function openEarnModal() { earnModal.classList.remove("hidden"); }

function closeModal(e) {
  modal.classList.add("hidden");
  earnModal.classList.add("hidden");
}

/* ===== ADD INCOME (EARN) LOGIC ===== */
function addEarn() {
  const amount = parseFloat(earnAmountInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert("Enter valid amount");
    return;
  }

  remaining += amount;
  // Note: We don't decrease 'used' usually, we just increase the balance.
  
  totalDisplay.textContent = formatCurrency(remaining);
  updateProgress();
  updateBudgetColor();

  const card = document.createElement("div");
  card.className = "card income-card"; // Added income class for green border
  card.innerHTML = `
    <div>
      <strong>Income Added</strong><br>
      <span>Earned</span>
    </div>
    <div style="color: #4CAF50;">+ ${formatCurrency(amount)}</div>
  `;

  expenseList.insertBefore(card, expenseList.firstChild);
  earnAmountInput.value = "";
  saveData();
  closeModal();
}

/* ===== ADD EXPENSE ===== */
const categoryColors = { Food: "#FF7043", Travel: "#42A5F5", Shopping: "#AB47BC", Bills: "#26A69A", Entertainment: "#EC407A", Health: "#66BB6A", Other: "#78909C" };

function addExpense() {
  if (PRESET_BUDGET === 0) { alert("Set your budget first"); return; }
  let selectedReason = reasonSelect.value;
  let finalReason = (selectedReason === "Custom") ? customReason.value.trim() : selectedReason;

  if (!finalReason) { alert("Please select a category"); return; }
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) { alert("Enter valid amount"); return; }

  remaining -= amount;
  used += amount;

  totalDisplay.textContent = formatCurrency(remaining);
  updateProgress();
  updateBudgetColor();

  const card = document.createElement("div");
  card.className = "card";
  let cardColor = categoryColors[selectedReason] || "#333";
  card.style.borderLeft = "6px solid " + cardColor;
  card.style.background = `linear-gradient(135deg, ${cardColor}15, #ffffff)`;
  card.innerHTML = `
    <div>
      <strong>${finalReason}</strong><br>
      <span>Expense</span>
    </div>
    <div style="color: #d32f2f;">- ${formatCurrency(amount)}</div>
  `;

  expenseList.insertBefore(card, expenseList.firstChild);
  amountInput.value = "";
  saveData();
  closeModal();
}

/* ===== PROGRESS & COLOR UPDATES ===== */
function updateProgress() {
  if (PRESET_BUDGET === 0) return;
  const percent = Math.min((used / PRESET_BUDGET) * 100, 100);
  progressBar.style.width = percent + "%";
  progressText.textContent = Math.round(percent) + "% used";
  progressBar.style.background = (percent >= 80) ? "#ff5252" : "black";
}

function updateBudgetColor() {
  if (PRESET_BUDGET === 0) return;
  topBar.style.background = (remaining <= PRESET_BUDGET * 0.2) 
    ? "linear-gradient(135deg, #ff8a80, #ff5252)" 
    : "linear-gradient(135deg, #FFD54F, #FFC107)";
}

function resetBudget() {
  if (!confirm("Are you sure you want to reset? This saves your history.")) return;
  localStorage.removeItem("hp_current");
  location.reload();
}

window.onload = loadData;

/* ===== SERVICE WORKER REGISTRATION ===== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(err => console.log("SW failed", err));
  });
}
