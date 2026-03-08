import { createClient } from '@supabase/supabase-js';

// --- Supabase setup ---
const supabaseUrl = 'https://pofaqrahjhsjfraziodr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZmFxcmFoamhzamZyYXppb2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTkwODMsImV4cCI6MjA4ODQ5NTA4M30.K2XaqVEoVF5EYf4wqnXKsB7yrb_UHUj4F6RNpmaFa2M';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------
// File tabs system
// ---------------------------
let files = {
  'index.html': '',
  'styles.css': '',
  'script.js': ''
};
let currentFile = 'index.html';

function openFile(filename) {
  currentFile = filename;
  document.getElementById('code-editor').value = files[filename] || '';
}

function createFile() {
  const name = prompt("Enter new file name:");
  if (!name) return;
  files[name] = '';
  const fileBar = document.getElementById('fileBar');
  const tab = document.createElement('div');
  tab.className = 'file-tab';
  tab.textContent = name;
  tab.onclick = () => openFile(name);
  tab.oncontextmenu = (e) => { e.preventDefault(); showMenu(e, name); };
  fileBar.appendChild(tab);
}

function renameFile() {
  const newName = prompt("Enter new file name:");
  if (!newName) return;
  files[newName] = files[currentFile];
  delete files[currentFile];
  document.querySelector(`.file-tab.active`).textContent = newName;
  currentFile = newName;
}

function deleteFile() {
  if (!confirm(`Delete ${currentFile}?`)) return;
  delete files[currentFile];
  const tab = document.querySelector(`.file-tab.active`);
  tab.remove();
  const remainingFiles = Object.keys(files);
  currentFile = remainingFiles[0] || '';
  if (currentFile) openFile(currentFile);
}

function showMenu(event, filename) {
  const menu = document.getElementById('contextMenu');
  menu.style.top = event.clientY + 'px';
  menu.style.left = event.clientX + 'px';
  menu.style.display = 'block';
  currentFile = filename;
}

document.body.addEventListener('click', () => {
  document.getElementById('contextMenu').style.display = 'none';
});

// ---------------------------
// Run / Preview logic
// ---------------------------
function runCode() {
  const html = files['index.html'] || '';
  const css = files['styles.css'] || '';
  const js = files['script.js'] || '';
  const preview = document.getElementById('preview');
  preview.srcdoc = `
    <html>
      <head><style>${css}</style></head>
      <body>${html}
        <script>${js}<\/script>
      </body>
    </html>
  `;
}

// ---------------------------
// Save project to Supabase
// ---------------------------
async function saveProject() {
  const name = document.getElementById('project-name').value;
  if (!name) return alert('Enter a project name!');
  
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      user_id: supabase.auth.user().id,
      project_name: name,
      files: files,
      created_at: new Date()
    }]);
  
  if (error) console.error(error);
  else loadProjects();
}

// ---------------------------
// Load projects from Supabase
// ---------------------------
async function loadProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', supabase.auth.user().id)
    .order('created_at', { ascending: false });

  if (error) return console.error(error);
  displayProjects(data);
}

function displayProjects(projects) {
  const list = document.getElementById('project-list');
  list.innerHTML = '';

  projects.forEach(proj => {
    const btn = document.createElement('button');
    btn.textContent = proj.project_name;
    btn.onclick = () => {
      files = proj.files || {};
      const firstFile = Object.keys(files)[0];
      if (firstFile) openFile(firstFile);
    };
    list.appendChild(btn);
  });
}

// ---------------------------
// Logout logic
// ---------------------------
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error(error);
  else window.location.href = '/';
}

// ---------------------------
// Initialize editor
// ---------------------------
window.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  openFile(currentFile);

  // Attach runCode to global so dashboard.html buttons can call it
  window.runCode = runCode;
  window.logout = logout;
  window.createFile = createFile;
  window.renameFile = renameFile;
  window.deleteFile = deleteFile;
  window.showMenu = showMenu;
  window.saveProject = saveProject;
});
