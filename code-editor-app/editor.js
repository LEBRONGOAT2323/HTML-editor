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
