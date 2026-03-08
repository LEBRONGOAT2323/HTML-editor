if(!sessionStorage.getItem("loggedInUser")){
window.location.href="index.html";
}

const user=sessionStorage.getItem("loggedInUser");

function logout(){
sessionStorage.removeItem("loggedInUser");
window.location.href="index.html";
}

let files={
"index.html":"<h1>Hello World</h1>",
"styles.css":"h1{color:red;}",
"script.js":"console.log('hello');"
};

let currentFile="index.html";
let selectedFile=null;

const editor=document.getElementById("code-editor");
const fileBar=document.getElementById("fileBar");
const newBtn=document.getElementById("newFileBtn");

loadProject();

editor.value=files[currentFile];

function openFile(name){

saveCurrent();

currentFile=name;

editor.value=files[name];

document.querySelectorAll(".file-tab").forEach(tab=>{
tab.classList.remove("active");

if(tab.dataset.file===name){
tab.classList.add("active");
}
});

}

function attachTabEvents(tab,name){

tab.dataset.file=name;

tab.onclick=()=>openFile(name);

tab.oncontextmenu=(e)=>{
e.preventDefault();
showMenu(e,name);
};

}

/* CLOSE TAB */

function closeTab(name){

delete files[name];

document.querySelectorAll(".file-tab").forEach(tab=>{
if(tab.dataset.file===name){
tab.remove();
}
});

if(currentFile===name){

currentFile=Object.keys(files)[0];

editor.value=files[currentFile];

}

saveProject();

}

/* CREATE FILE */

function createFile(){

let name=prompt("File name");

if(!name || files[name]) return;

files[name]="";

const tab=document.createElement("div");

tab.className="file-tab";

const label=document.createElement("span");
label.textContent=name;

const close=document.createElement("span");
close.textContent="×";
close.className="close-tab";

close.onclick=(e)=>{
e.stopPropagation();
closeTab(name);
};

tab.appendChild(label);
tab.appendChild(close);

attachTabEvents(tab,name);

fileBar.insertBefore(tab,newBtn);

}

/* SAVE CURRENT FILE */

function saveCurrent(){
files[currentFile]=editor.value;
saveProject();
}

/* RUN CODE */

function runCode(){

saveCurrent();

let html=files["index.html"] || "";
let css="<style>"+(files["styles.css"]||"")+"</style>";
let js="<script>"+(files["script.js"]||"")+"<\/script>";

document.getElementById("preview").srcdoc=html+css+js;

}

/* AUTO SAVE PROJECT */

function saveProject(){

localStorage.setItem(
"userProject_"+user,
JSON.stringify(files)
);

}

/* LOAD PROJECT */

function loadProject(){

const saved=localStorage.getItem("userProject_"+user);

if(saved){

files=JSON.parse(saved);

}

}

/* SAVE WHILE TYPING */

editor.addEventListener("input",()=>{
saveCurrent();
});

/* RIGHT CLICK MENU */

function showMenu(e,file){

selectedFile=file;

const menu=document.getElementById("contextMenu");

menu.style.display="flex";
menu.style.left=e.pageX+"px";
menu.style.top=e.pageY+"px";

}

document.addEventListener("click",()=>{
document.getElementById("contextMenu").style.display="none";
});

function renameFile(){

let newName=prompt("New name",selectedFile);

if(!newName || files[newName]) return;

files[newName]=files[selectedFile];
delete files[selectedFile];

document.querySelectorAll(".file-tab").forEach(tab=>{

if(tab.dataset.file===selectedFile){

tab.dataset.file=newName;

tab.querySelector("span").textContent=newName;

/* update close button */
const closeBtn=tab.querySelector(".close-tab");

closeBtn.onclick=(e)=>{
e.stopPropagation();
closeTab(newName);
};

attachTabEvents(tab,newName);

}

});

if(currentFile===selectedFile){
currentFile=newName;
}

saveProject();

}

function deleteFile(){

closeTab(selectedFile);

}

/* Attach events to default tabs */

document.querySelectorAll(".file-tab").forEach(tab=>{

const name=tab.textContent;

tab.innerHTML="";

const label=document.createElement("span");
label.textContent=name;

const close=document.createElement("span");
close.textContent="×";
close.className="close-tab";

close.onclick=(e)=>{
e.stopPropagation();
closeTab(name);
};

tab.appendChild(label);
tab.appendChild(close);

attachTabEvents(tab,name);

});

// code-editor-app/editor.js
import { supabase } from './supabase.js'

// Save Project
const saveButton = document.getElementById('save-btn')
if (saveButton) {
  saveButton.addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const project = {
      id: window.currentProjectId, // optional, set when editing existing project
      name: document.getElementById('project-name').value || 'Untitled Project',
      html: document.getElementById('code-editor').value || '',
      css: '', // handle separate CSS file logic if needed
      js: ''   // handle separate JS file logic if needed
    }

    const { data, error } = await supabase
      .from('projects')
      .upsert({
        id: project.id || undefined,
        user_id: user.id,
        name: project.name,
        html: project.html,
        css: project.css,
        js: project.js,
        updated_at: new Date()
      })
      .select()

    if (error) console.error(error)
    else {
      alert('Project saved!')
      window.currentProjectId = data[0].id
    }
  })
}

// Load User Projects
export async function loadUserProjects() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data
}

// Load project into editor
export async function openProject(projectId) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (error) return console.error(error)

  window.currentProjectId = data.id
  document.getElementById('project-name').value = data.name
  document.getElementById('code-editor').value = data.html
}

// Fetch saved projects for the current user
async function loadProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', supabase.auth.user().id) // only the logged-in user's projects
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return;
  }

  displayProjects(data);
}

function displayProjects(projects) {
  const list = document.getElementById('project-list');
  list.innerHTML = ''; // clear old entries

  projects.forEach(project => {
    const btn = document.createElement('button');
    btn.textContent = project.project_name;
    btn.onclick = () => openProject(project); // load project into editor
    list.appendChild(btn);
  });
}

function openProject(project) {
  document.getElementById('html-editor').value = project.html || '';
  document.getElementById('css-editor').value = project.css || '';
  document.getElementById('js-editor').value = project.js || '';
}

window.addEventListener('DOMContentLoaded', () => {
  loadProjects();
});
