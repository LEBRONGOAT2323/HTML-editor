// Redirect to login if not logged in
if (!sessionStorage.getItem('loggedInUser')) {
  window.location.href = 'index.html';
}

// Logout
function logout() {
  sessionStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
}

// Run the code in iframe
function runCode() {
  const html = document.getElementById('html-code').value;
  const css = `<style>${document.getElementById('css-code').value}</style>`;
  const js = `<script>${document.getElementById('js-code').value}<\/script>`;

  const iframe = document.getElementById('preview');
  iframe.srcdoc = html + css + js;
}
