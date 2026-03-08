const { createClient } = supabase;

// --- Supabase setup ---
const supabaseUrl = 'https://pofaqrahjhsjfraziodr.supabase.co';
const supabaseAnonKey = 'YOUR_ANON_KEY';
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------
// File tabs system
// ---------------------------
let files = {
  "index.html": "<h1>Hello World</h1>",
  "styles.css": "body { font-family: Arial; }",
  "script.js": "console.log('Hello');"
};

let currentFile = "index.html";

function openFile(filename) {

  // Save current file contents
  if (currentFile) {
    files[currentFile] = document.getElementById("code-editor").value;
  }

  currentFile = filename;

  // Update active tab
  document.querySelectorAll(".file-tab").forEach(tab => {
    tab.classList.remove("active");
  });

  const tab = [...document.querySelectorAll(".file-tab")]
    .find(t => t.textContent === filename);

  if (tab) tab.classList.add("active");

  document.getElementById("code-editor").value = files[filename] || "";
}

function createFile() {
  const name = prompt("Enter new file name:");
  if (!name) return;

  files[name] = "";

  const fileBar = document.getElementById("fileBar");

  const tab = document.createElement("div");
  tab.className = "file-tab";
  tab.textContent = name;

  tab.onclick = () => openFile(name);
  tab.oncontextmenu = (e) => {
    e.preventDefault();
    showMenu(e, name);
  };

  fileBar.insertBefore(tab, document.getElementById("newFileBtn"));

  openFile(name);
}

function renameFile() {

  const newName = prompt("Enter new file name:");
  if (!newName) return;

  files[newName] = files[currentFile];
  delete files[currentFile];

  const tab = document.querySelector(".file-tab.active");

  if (tab) tab.textContent = newName;

  currentFile = newName;
}

function deleteFile() {

  if (!confirm(`Delete ${currentFile}?`)) return;

  delete files[currentFile];

  const tab = document.querySelector(".file-tab.active");

  if (tab) tab.remove();

  const remaining = Object.keys(files);

  if (remaining.length > 0) {
    openFile(remaining[0]);
  }
}

function showMenu(event, filename) {

  const menu = document.getElementById("contextMenu");

  menu.style.top = event.clientY + "px";
  menu.style.left = event.clientX + "px";
  menu.style.display = "block";

  currentFile = filename;
}

document.body.addEventListener("click", () => {
  document.getElementById("contextMenu").style.display = "none";
});

// ---------------------------
// Run / Preview
// ---------------------------
function runCode() {

  files[currentFile] = document.getElementById("code-editor").value;

  const html = files["index.html"] || "";
  const css = files["styles.css"] || "";
  const js = files["script.js"] || "";

  const preview = document.getElementById("preview");

  preview.srcdoc = `
  <html>
  <head>
  <style>${css}</style>
  </head>
  <body>
  ${html}
  <script>${js}<\/script>
  </body>
  </html>
  `;
}

// Live preview while typing
document.getElementById("code-editor")
  .addEventListener("input", runCode);

// ---------------------------
// Save project
// ---------------------------
async function saveProject() {

  const name = document.getElementById("project-name").value;

  if (!name) return alert("Enter a project name!");

  const { data: { user } } = await supabaseClient.auth.getUser();

  const { error } = await supabaseClient
    .from("projects")
    .insert([{
      user_id: user.id,
      project_name: name,
      files: files,
      created_at: new Date()
    }]);

  if (error) console.error(error);
  else loadProjects();
}

// ---------------------------
// Load projects
// ---------------------------
async function loadProjects() {

  const { data: { user } } = await supabaseClient.auth.getUser();

  const { data, error } = await supabaseClient
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return console.error(error);

  displayProjects(data);
}

function displayProjects(projects) {

  const list = document.getElementById("project-list");

  list.innerHTML = "";

  projects.forEach(proj => {

    const btn = document.createElement("button");

    btn.textContent = proj.project_name;

    btn.onclick = () => {

      files = proj.files || {};

      const first = Object.keys(files)[0];

      if (first) openFile(first);
    };

    list.appendChild(btn);
  });
}

// ---------------------------
// Logout
// ---------------------------
async function logout() {

  const { error } = await supabaseClient.auth.signOut();

  if (error) console.error(error);

  else window.location.href = "/";
}

// ---------------------------
// Initialize
// ---------------------------
window.addEventListener("DOMContentLoaded", () => {

  loadProjects();

  openFile(currentFile);

  runCode();

  window.runCode = runCode;
  window.logout = logout;
  window.createFile = createFile;
  window.renameFile = renameFile;
  window.deleteFile = deleteFile;
  window.showMenu = showMenu;
  window.saveProject = saveProject;
});