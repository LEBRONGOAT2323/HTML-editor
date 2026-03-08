// Using localStorage as a mock database
function signup() {
  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;

  if (!username || !password) {
    showMessage('Please enter username and password');
    return;
  }

  if (localStorage.getItem(`user_${username}`)) {
    showMessage('Username already exists');
    return;
  }

  localStorage.setItem(`user_${username}`, password);
  showMessage('Signup successful! You can now log in.');
}

function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const storedPass = localStorage.getItem(`user_${username}`);
  if (storedPass && storedPass === password) {
    sessionStorage.setItem('loggedInUser', username);
    window.location.href = 'dashboard.html';
  } else {
    showMessage('Invalid credentials');
  }
}

function showMessage(msg) {
  document.getElementById('message').innerText = msg;
}

import { supabase } from './supabase.js'

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return console.error(error)
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return console.error(error)
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}