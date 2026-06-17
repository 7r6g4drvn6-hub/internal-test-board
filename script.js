const STORAGE_KEY = "bench-board-direct-edit-en-v1";
const LEGACY_STORAGE_KEYS = ["cl48-bench-board-direct-edit-v1"];
const DEFAULT_NOTIFY = "xu.xuan.extern@porsche.digital";

const LEGACY_VALUE_MAP = {
  "\u53ef\u7533\u8bf7": "Available",
  "\u5f85 book": "Pending booking",
  "\u5f85 owner": "Owner pending",
  "\u5f85\u8865\u5145": "Missing info",
  "\u53ef\u7528": "Available",
  "\u7248\u672c\u5df2\u77e5": "Version known",
  "\u5f85\u786e\u8ba4": "Pending confirmation",
  "\u4fe1\u606f\u7f3a\u5931": "Missing info",
  "\u4fdd\u6301\u6700\u65b0 Approval \u7248\u672c\uff0c\u7b49\u5f85\u6d4b\u8bd5\u7a97\u53e3\u786e\u8ba4\u3002": "Keep the latest Approval baseline and confirm the test window before use.",
  "Live \u57fa\u7ebf\u7248\u672c\uff1b\u5982\u6709\u65b0\u5305\u9700\u63d0\u524d\u901a\u77e5\u6d4b\u8bd5\u56e2\u961f\u3002": "Live baseline. Notify the test team before any new package update.",
  "\u5f85\u786e\u8ba4\u6700\u65b0 Approval package \u548c flash \u8ba1\u5212\u3002": "Confirm the latest Approval package and flash plan.",
  "Live \u57fa\u7ebf\u7248\u672c\uff1b\u540e\u7eed\u7248\u672c\u66f4\u65b0\u9700\u540c\u6b65 book \u8ba1\u5212\u3002": "Live baseline. Sync the booking plan before future version updates.",
  "Approval \u7248\u672c\u66f4\u65b0\u540e\u8fdb\u5165\u56de\u5f52\u6d4b\u8bd5\u3002": "Start regression testing after the Approval version update.",
};

const DEFAULT_ROWS = [
  {
    model: "E4",
    env: "Approval",
    hcp3: "V160",
    hcp5: "D381",
    vin: "",
    ecu: "",
    resource: "Bench",
    owner: "",
    bookStatus: "Pending booking",
    updatePlan: "Keep the latest Approval baseline and confirm the test window before use.",
    status: "Version known",
  },
  {
    model: "E4",
    env: "Live",
    hcp3: "V170",
    hcp5: "D380",
    vin: "",
    ecu: "",
    resource: "Vehicle",
    owner: "",
    bookStatus: "Available",
    updatePlan: "Live baseline. Notify the test team before any new package update.",
    status: "Available",
  },
  {
    model: "983",
    env: "Approval",
    hcp3: "",
    hcp5: "",
    vin: "",
    ecu: "",
    resource: "Bench",
    owner: "",
    bookStatus: "Missing info",
    updatePlan: "Confirm the latest Approval package and flash plan.",
    status: "Missing info",
  },
  {
    model: "983",
    env: "Live",
    hcp3: "V170",
    hcp5: "D380",
    vin: "",
    ecu: "",
    resource: "Vehicle",
    owner: "",
    bookStatus: "Available",
    updatePlan: "Live baseline. Sync the booking plan before future version updates.",
    status: "Available",
  },
  {
    model: "M1",
    env: "Approval",
    hcp3: "",
    hcp5: "",
    vin: "",
    ecu: "",
    resource: "Bench",
    owner: "",
    bookStatus: "Owner pending",
    updatePlan: "Start regression testing after the Approval version update.",
    status: "Pending confirmation",
  },
];

const tableBody = document.querySelector("#releaseTableBody");
const searchInput = document.querySelector("#searchInput");
const addRowBtn = document.querySelector("#addRowBtn");
const exportBtn = document.querySelector("#exportBtn");
const importInput = document.querySelector("#importInput");
const resetDataBtn = document.querySelector("#resetDataBtn");
const saveState = document.querySelector("#saveState");
const envButtons = Array.from(document.querySelectorAll(".segment"));
const targetSelects = Array.from(document.querySelectorAll("[data-target-select]"));
const requestForm = document.querySelector("#requestForm");
const statusForm = document.querySelector("#statusForm");
const emailDraft = document.querySelector("#emailDraft");
const emailDraftLink = document.querySelector("#emailDraftLink");

let rows = loadRows();
let activeFilter = "all";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeValue(value) {
  return LEGACY_VALUE_MAP[value] || value;
}

function normalizeRows(value) {
  return value.map((row) => ({
    ...row,
    model: normalizeValue(row.model || ""),
    env: normalizeValue(row.env || "Approval"),
    hcp3: row.hcp3 || "",
    hcp5: row.hcp5 || "",
    vin: row.vin || "",
    ecu: row.ecu || "",
    resource: normalizeValue(row.resource || "Bench"),
    owner: row.owner || "",
    bookStatus: normalizeValue(row.bookStatus || "Pending booking"),
    updatePlan: normalizeValue(row.updatePlan || ""),
    status: normalizeValue(row.status || "Pending confirmation"),
  }));
}

function readStoredRows(key) {
  const saved = localStorage.getItem(key);
  if (!saved) return null;
  const parsed = JSON.parse(saved);
  return Array.isArray(parsed) ? parsed : null;
}

function loadRows() {
  try {
    const savedRows = readStoredRows(STORAGE_KEY);
    if (savedRows) return normalizeRows(savedRows);

    for (const key of LEGACY_STORAGE_KEYS) {
      const legacyRows = readStoredRows(key);
      if (legacyRows) return normalizeRows(legacyRows);
    }

    return clone(DEFAULT_ROWS);
  } catch {
    return clone(DEFAULT_ROWS);
  }
}

function saveRows() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  saveState.textContent = "Auto Saved";
}

function input(value, field, index, placeholder = "") {
  return `<input class="cell-input" data-index="${index}" data-field="${field}" value="${escapeHtml(value || "")}" placeholder="${placeholder}" />`;
}

function textarea(value, field, index, placeholder = "") {
  return `<textarea class="cell-textarea" data-index="${index}" data-field="${field}" placeholder="${placeholder}">${escapeHtml(value || "")}</textarea>`;
}

function select(value, field, index, options) {
  const optionHtml = options
    .map((option) => `<option ${option === value ? "selected" : ""}>${option}</option>`)
    .join("");
  return `<select class="cell-select" data-index="${index}" data-field="${field}">${optionHtml}</select>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rowMatches(row) {
  const keyword = searchInput.value.trim().toLowerCase();
  const envMatch = activeFilter === "all" || row.env === activeFilter;
  const keywordMatch = !keyword || Object.values(row).join(" ").toLowerCase().includes(keyword);
  return envMatch && keywordMatch;
}

function renderTable() {
  tableBody.innerHTML = "";

  rows.forEach((row, index) => {
    if (!rowMatches(row)) return;

    const tr = document.createElement("tr");
    tr.dataset.index = index;
    tr.innerHTML = `
      <td>${input(row.model, "model", index, "E4 / 983 / M1")}</td>
      <td>${select(row.env, "env", index, ["Approval", "Live"])}</td>
      <td>${input(row.hcp3, "hcp3", index)}</td>
      <td>${input(row.hcp5, "hcp5", index)}</td>
      <td>${input(row.vin, "vin", index, "VIN")}</td>
      <td>${select(row.resource, "resource", index, ["Bench", "Vehicle"])}</td>
      <td>${input(row.owner, "owner", index, "Owner")}</td>
      <td>${select(row.bookStatus, "bookStatus", index, ["Available", "Pending booking", "Booked", "In use", "Blocked", "Owner pending", "Missing info"])}</td>
      <td>${textarea(row.updatePlan, "updatePlan", index, "Version update plan")}</td>
      <td>${select(row.status, "status", index, ["Available", "Version known", "Pending confirmation", "Pending booking", "Owner pending", "Missing info", "Blocked"])}</td>
      <td><button class="row-delete" data-index="${index}" type="button">Delete</button></td>
    `;
    tableBody.appendChild(tr);
  });

  updateTargetSelects();
}

function updateTargetSelects() {
  const options = rows.map((row) => `${row.model || "Unnamed"} / ${row.env || "Approval"}`);
  targetSelects.forEach((targetSelect) => {
    const current = targetSelect.value;
    targetSelect.innerHTML = options.map((option) => `<option>${escapeHtml(option)}</option>`).join("");
    if (options.includes(current)) targetSelect.value = current;
  });
}

function updateRowValue(target) {
  const index = Number(target.dataset.index);
  const field = target.dataset.field;
  if (!Number.isInteger(index) || !field || !rows[index]) return;

  rows[index][field] = target.value;
  saveRows();
  updateTargetSelects();
}

tableBody.addEventListener("input", (event) => {
  if (event.target.matches(".cell-input, .cell-textarea")) updateRowValue(event.target);
});

tableBody.addEventListener("change", (event) => {
  if (event.target.matches(".cell-select")) updateRowValue(event.target);
});

tableBody.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".row-delete");
  if (deleteButton) {
    rows.splice(Number(deleteButton.dataset.index), 1);
    saveRows();
    renderTable();
    return;
  }
});

function addRow() {
  rows.unshift({
    model: "New",
    env: "Approval",
    hcp3: "",
    hcp5: "",
    vin: "",
    ecu: "",
    resource: "Bench",
    owner: "",
    bookStatus: "Pending booking",
    updatePlan: "",
    status: "Pending confirmation",
  });
  saveRows();
  renderTable();
}

function exportData() {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cl48-bench-board.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function importData(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) return;
  rows = normalizeRows(parsed);
  saveRows();
  renderTable();
}

function buildMailTo(form, type) {
  const data = new FormData(form);
  const notifyEmail = String(data.get("notifyEmail") || DEFAULT_NOTIFY).trim();
  const requester = String(data.get("requester") || "TBD").trim();
  const requesterEmail = String(data.get("requesterEmail") || "").trim();
  const target = String(data.get("target") || "TBD").trim();
  const dueDate = String(data.get("dueDate") || "TBD").trim();
  const detail = String(data.get("detail") || "No additional details.").trim();
  const priority = String(data.get("priority") || "Medium").trim();
  const statusChange = String(data.get("statusChange") || "").trim();

  const subject = type === "status"
    ? `[Bench Status] ${target} - ${statusChange || "Status update"}`
    : `[Bench Request] ${target} - ${priority}`;
  const body = type === "status"
    ? [
        "Hi Xu,",
        "",
        "There is a bench status update.",
        "",
        `Updated by: ${requester}`,
        `Target: ${target}`,
        `Status change: ${statusChange || "TBD"}`,
        `Effective date: ${dueDate}`,
        "",
        "Details:",
        detail,
        "",
        "Thanks,",
        requester,
      ].join("\n")
    : [
        "Hi Xu,",
        "",
        "I would like to request bench / vehicle usage.",
        "",
        `Requester: ${requester}${requesterEmail ? ` (${requesterEmail})` : ""}`,
        `Target: ${target}`,
        `Priority: ${priority}`,
        `Expected date: ${dueDate}`,
        "",
        "Request details:",
        detail,
        "",
        "Thanks,",
        requester,
      ].join("\n");

  return `mailto:${encodeURIComponent(notifyEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function wireMailForm(form, type) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const mailTo = buildMailTo(form, type);
    emailDraft.hidden = false;
    emailDraftLink.href = mailTo;
    window.location.href = mailTo;
  });
}

addRowBtn.addEventListener("click", addRow);
exportBtn.addEventListener("click", exportData);
resetDataBtn.addEventListener("click", () => {
  rows = clone(DEFAULT_ROWS);
  saveRows();
  renderTable();
});
importInput.addEventListener("change", () => {
  if (importInput.files?.[0]) importData(importInput.files[0]);
  importInput.value = "";
});
searchInput.addEventListener("input", renderTable);
envButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    envButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderTable();
  });
});

wireMailForm(requestForm, "request");
wireMailForm(statusForm, "status");
renderTable();
