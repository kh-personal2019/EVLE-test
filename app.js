const STORAGE_EVENTS = "evle-v33-github-events";
const STORAGE_SETTINGS = "evle-v33-github-settings";
const CATEGORIES = [
  "SnoCo",
  "Lynnwood",
  "Station Area Planning",
  "Corridor Design",
  "IDT",
  "PSE",
  "Third-Party Prep",
  "Permitting Working Group",
  "Everett",
  "WSDOT",
  "WDFW Meeting",
  "CT/ET",
  "Milestone",
  "IAG",
  "Holiday"
];
const COLORS = {
  "SnoCo":"#2454d6",
  "Lynnwood":"#00856f",
  "Station Area Planning":"#8a3ffc",
  "Corridor Design":"#c2410c",
  "IDT":"#175cd3",
  "PSE":"#0e7490",
  "Third-Party Prep":"#93370d",
  "Permitting Working Group":"#067647",
  "Everett":"#7c3aed",
  "WSDOT":"#475467",
  "WDFW Meeting":"#be123c",
  "CT/ET":"#1d4ed8",
  "Milestone":"#ea580c",
  "IAG":"#0891b2",
  "Holiday":"#b42318"
};

let view = 1;
const today = new Date();
let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let events = [];

const el = id => document.getElementById(id);
const calendar = el("calendar");
const statusText = el("statusText");
const fields = {
  id: el("eventId"),
  date: el("eventDate"),
  title: el("eventTitle"),
  category: el("eventCategory"),
  status: el("eventStatus"),
  details: el("eventDetails")
};

function color(category){ return COLORS[category] || "#475467"; }
function setStatus(message){ statusText.textContent = message; }
function saveLocal(){ localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events)); }
function toIsoDate(date){ return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0"); }

function setupCategoryOptions(){
  fields.category.innerHTML = CATEGORIES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

function starterEvents(){
  return [
    {id:"1", date:"2026-08-03", title:"128th questions", category:"SnoCo", status:"Confirmed", details:"Will, Ian Fabik"},
    {id:"2", date:"2026-08-03", title:"PPP Update", category:"SnoCo", status:"Tentative", details:""},
    {id:"3", date:"2026-09-07", title:"Labor Day", category:"Holiday", status:"Confirmed", details:""},
    {id:"4", date:"2026-10-12", title:"Indigenous People's Day", category:"Holiday", status:"Confirmed", details:""}
  ];
}

async function loadEvents(){
  const saved = localStorage.getItem(STORAGE_EVENTS);
  if(saved){
    try{ events = JSON.parse(saved); render(); return; } catch(error){}
  }
  await reloadCsv();
}

async function reloadCsv(){
  try{
    const response = await fetch("events.csv?cache=" + Date.now(), {cache:"no-store"});
    if(response.ok){
      events = parseCsv(await response.text());
      saveLocal();
      render();
      setStatus("Loaded events.csv.");
      return;
    }
  }catch(error){}
  events = starterEvents();
  saveLocal();
  render();
  setStatus("Loaded starter events.");
}

function clearForm(){
  fields.id.value = "";
  fields.date.value = toIsoDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
  fields.title.value = "";
  fields.category.value = "SnoCo";
  fields.status.value = "Confirmed";
  fields.details.value = "";
}
function editEvent(event){
  fields.id.value = event.id;
  fields.date.value = event.date;
  fields.title.value = event.title;
  fields.category.value = CATEGORIES.includes(event.category) ? event.category : "SnoCo";
  fields.status.value = event.status || "Confirmed";
  fields.details.value = event.details || "";
}
function saveEvent(){
  if(!fields.date.value || !fields.title.value.trim()){
    alert("Add a date and title before saving.");
    return;
  }
  const record = {
    id: fields.id.value || Date.now().toString(),
    date: fields.date.value,
    title: fields.title.value.trim(),
    category: fields.category.value,
    status: fields.status.value,
    details: fields.details.value.trim()
  };
  if(fields.id.value){
    events = events.map(e => e.id === record.id ? record : e);
  }else{
    events.push(record);
  }
  events.sort((a,b) => a.date.localeCompare(b.date) || a.category.localeCompare(b.category));
  saveLocal();
  editEvent(record);
  render();
  autoSaveToGithub();
}
function deleteEvent(){
  if(!fields.id.value){ clearForm(); return; }
  events = events.filter(e => e.id !== fields.id.value);
  saveLocal();
  clearForm();
  render();
  autoSaveToGithub();
}

function render(){
  renderLegend();
  calendar.className = view === 3 ? "three" : "";
  calendar.innerHTML = "";
  for(let m=0; m<view; m++){
    const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+m, 1);
    calendar.appendChild(createMonth(monthDate));
  }
  el("monthBtn").classList.toggle("active", view === 1);
  el("threeBtn").classList.toggle("active", view === 3);
}
function renderLegend(){
  const legend = el("legend");
  legend.innerHTML = "";
  CATEGORIES.forEach(category => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.style.background = color(category);
    tag.textContent = category;
    legend.appendChild(tag);
  });
}
function createMonth(monthDate){
  const section = document.createElement("section");
  section.className = "month";
  const title = document.createElement("h3");
  title.textContent = monthDate.toLocaleString("en-US", {month:"long", year:"numeric"});
  section.appendChild(title);
  const days = document.createElement("div");
  days.className = "days";
  const offset = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
  for(let i=0; i<offset; i++){
    const empty = document.createElement("div");
    empty.className = "day empty";
    days.appendChild(empty);
  }
  const total = new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 0).getDate();
  for(let day=1; day<=total; day++){
    const cell = document.createElement("div");
    cell.className = "day";
    const label = document.createElement("b");
    label.textContent = day;
    cell.appendChild(label);
    const iso = monthDate.getFullYear()+"-"+String(monthDate.getMonth()+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
    events.filter(event => event.date === iso).forEach(event => {
      const div = document.createElement("div");
      div.className = event.status === "Tentative" ? "event tentative" : "event";
      div.style.background = color(event.category);
      div.textContent = event.category + ": " + event.title;
      div.title = event.details || event.title;
      div.addEventListener("click", () => editEvent(event));
      cell.appendChild(div);
    });
    days.appendChild(cell);
  }
  section.appendChild(days);
  return section;
}

function csvEscape(value){
  const text = String(value || "");
  return /[",\n]/.test(text) ? '"' + text.replaceAll('"','""') + '"' : text;
}
function toCsv(){
  const headers = ["date","title","category","status","details"];
  return headers.join(",") + "\n" + events.map(event => headers.map(header => csvEscape(event[header])).join(",")).join("\n") + "\n";
}
function parseCsv(text){
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for(let i=0; i<text.length; i++){
    const char = text[i];
    const next = text[i+1];
    if(quoted){
      if(char === '"' && next === '"'){ field += '"'; i++; }
      else if(char === '"') quoted = false;
      else field += char;
    }else{
      if(char === '"') quoted = true;
      else if(char === ","){ row.push(field); field = ""; }
      else if(char === "\n"){ row.push(field); if(row.some(v => v.trim())) rows.push(row); row = []; field = ""; }
      else if(char !== "\r") field += char;
    }
  }
  row.push(field);
  if(row.some(v => v.trim())) rows.push(row);
  if(!rows.length) return [];
  const headers = rows.shift().map(h => h.trim());
  return rows.map((values, index) => {
    const event = {id: Date.now().toString() + "-" + index};
    headers.forEach((header, i) => event[header] = values[i] || "");
    if(!CATEGORIES.includes(event.category)) event.category = "SnoCo";
    if(!event.status) event.status = "Confirmed";
    return event;
  }).filter(event => event.date && event.title);
}
function downloadCsv(){
  const blob = new Blob([toCsv()], {type:"text/csv;charset=utf-8"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "events.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function loadSettings(){
  const saved = JSON.parse(localStorage.getItem(STORAGE_SETTINGS) || "{}");
  el("ghOwner").value = saved.owner || "";
  el("ghRepo").value = saved.repo || "";
  el("ghBranch").value = saved.branch || "main";
  el("ghPath").value = saved.path || "events.csv";
  el("ghToken").value = saved.token || "";
}
function getSettings(){
  return {
    owner: el("ghOwner").value.trim(),
    repo: el("ghRepo").value.trim(),
    branch: el("ghBranch").value.trim() || "main",
    path: el("ghPath").value.trim() || "events.csv",
    token: el("ghToken").value.trim()
  };
}
function saveSettings(){
  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(getSettings()));
  setStatus("GitHub settings saved in this browser.");
}

function hasGithubSettings(){
  const settings = getSettings();
  return Boolean(settings.owner && settings.repo && settings.token);
}

function autoSaveToGithub(){
  if(!hasGithubSettings()){
    setStatus("Event saved locally. Add GitHub settings to enable automatic publishing.");
    return;
  }
  setStatus("Event saved locally. Auto-saving to GitHub...");
  saveToGithub();
}
async function githubRead(settings){
  const url = "https://api.github.com/repos/" + encodeURIComponent(settings.owner) + "/" + encodeURIComponent(settings.repo) + "/contents/" + settings.path + "?ref=" + encodeURIComponent(settings.branch);
  const response = await fetch(url, {headers:{"Accept":"application/vnd.github+json","Authorization":"Bearer " + settings.token,"X-GitHub-Api-Version":"2022-11-28"}});
  if(!response.ok) throw new Error("GitHub read failed: " + response.status + " " + await response.text());
  return response.json();
}
function base64FromText(text){
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for(let i=0; i<bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i+0x8000));
  return btoa(binary);
}
async function saveToGithub(){
  const settings = getSettings();
  if(!settings.owner || !settings.repo || !settings.token){ setStatus("Add GitHub settings first."); return; }
  try{
    setStatus("Saving events.csv to GitHub...");
    const current = await githubRead(settings);
    const url = "https://api.github.com/repos/" + encodeURIComponent(settings.owner) + "/" + encodeURIComponent(settings.repo) + "/contents/" + settings.path;
    const body = {message:"Update EVLE calendar events.csv", content:base64FromText(toCsv()), branch:settings.branch, sha:current.sha};
    const response = await fetch(url, {method:"PUT", headers:{"Accept":"application/vnd.github+json","Authorization":"Bearer " + settings.token,"X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"}, body:JSON.stringify(body)});
    if(!response.ok) throw new Error("GitHub save failed: " + response.status + " " + await response.text());
    setStatus("Saved to GitHub.");
  }catch(error){
    setStatus(error.message);
  }
}

el("monthBtn").addEventListener("click", () => { view = 1; render(); });
el("threeBtn").addEventListener("click", () => { view = 3; render(); });
el("prevBtn").addEventListener("click", () => { currentMonth.setMonth(currentMonth.getMonth()-1); clearForm(); render(); });
el("nextBtn").addEventListener("click", () => { currentMonth.setMonth(currentMonth.getMonth()+1); clearForm(); render(); });
el("newBtn").addEventListener("click", clearForm);
el("saveBtn").addEventListener("click", saveEvent);
el("deleteBtn").addEventListener("click", deleteEvent);
el("clearBtn").addEventListener("click", clearForm);
el("downloadCsvBtn").addEventListener("click", downloadCsv);
el("loadCsvBtn").addEventListener("click", () => { localStorage.removeItem(STORAGE_EVENTS); reloadCsv(); });
el("saveSettingsBtn").addEventListener("click", saveSettings);
el("saveGithubBtn").addEventListener("click", saveToGithub);
el("importCsv").addEventListener("change", event => {
  const file = event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => { events = parseCsv(reader.result); saveLocal(); render(); setStatus("CSV imported locally."); };
  reader.readAsText(file);
});

setupCategoryOptions();
loadSettings();
clearForm();
loadEvents();
