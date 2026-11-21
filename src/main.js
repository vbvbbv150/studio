import './style.css';

const state = { view: 'projects', drafts: [], modal: false };
const app = document.querySelector('#app');

function safe(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}
function toast(message) {
  const el = document.querySelector('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function modal() {
  return `<div class="backdrop" id="backdrop"><section class="modal">
    <button class="close" id="close">×</button>
    <label>NEW PROJECT</label><h2>Start with a clear idea.</h2>
    <p>Give your project a name. GitHub connection will be added in a later milestone.</p>
    <form id="project-form">
      <label for="name">Project name</label><input id="name" maxlength="48" placeholder="My awesome app" required />
      <label for="description">What are you building? <small>Optional</small></label>
      <textarea id="description" rows="3" placeholder="A short description..."></textarea>
      <button class="primary full">Create local draft ↗</button>
    </form>
    <small class="footnote">This creates a local draft only. No repository or cloud workspace is created yet.</small>
  </section></div>`;
}
function render() {
  const cards = state.drafts.map(p => `<article class="project-card">
    <div class="card-top"><span class="project-icon">&lt;/&gt;</span><span class="draft-tag">LOCAL DRAFT</span></div>
    <h3>${safe(p.name)}</h3><p>${safe(p.description || 'Blank project')}</p>
    <small>Not connected to GitHub</small></article>`).join('');
  let page = '';
  if (state.view === 'projects') {
    page = `<div class="heading"><div><label>YOUR WORKSPACE</label>
      <h1>Build something <em>remarkable.</em></h1>
      <p>Your projects, ideas, and app-building workspace — all in one place.</p></div>
      <button class="primary" id="new-project">＋ New project</button></div>
      <section class="idea-panel"><label>✳ &nbsp;START WITH AN IDEA</label>
      <h2>What do you want to build?</h2><p>Describe your app. Studio will help turn your idea into a real project.</p>
      <form id="idea-form"><textarea id="idea" rows="2" placeholder="A study planner with tasks, focus sessions, and progress analytics..."></textarea>
      <div class="form-foot"><small>Be as specific or as simple as you like.</small><button class="primary">Create project ↗</button></div></form>
      <div class="quick"><button id="blank"><b>＋ &nbsp;Start from blank</b><small>Build from a clean canvas</small></button>
      <button id="import"><b>⌘ &nbsp;Import from GitHub</b><small>Bring an existing codebase</small></button>
      <button id="templates"><b>▧ &nbsp;Explore templates</b><small>Start with a foundation</small></button></div></section>
      <div class="section-title"><h2>Your projects <span>${state.drafts.length}</span></h2></div>
      ${state.drafts.length ? `<div class="project-grid">${cards}</div>` : `<section class="empty">
      <div class="empty-icon">&lt;/&gt;</div><h3>Your next big idea starts here.</h3>
      <p>You have not created a project yet. Start with a description, a blank project, or a template.</p>
      <button class="link-button" id="first-project">Create your first project ↗</button></section>`}
      <div class="notice"><i></i><span><b>Early foundation build</b> — drafts are currently local to this browser. GitHub sync and live project runtimes are the next milestones.</span></div>`;
  } else if (state.view === 'templates') {
    page = `<div class="heading"><div><label>GET A HEAD START</label><h1>Template <em>library.</em></h1><p>Choose a starting point for your next application.</p></div></div>
      <section class="empty large"><div class="empty-icon">▧</div><h3>Templates are being prepared.</h3>
      <p>The first templates will be added after runtime and repository workflows are connected. We will not show templates that cannot actually run.</p>
      <button class="secondary" id="back">Back to projects</button></section>`;
  } else {
    page = `<div class="heading"><div><label>PROJECT HISTORY</label><h1>Recent <em>activity.</em></h1><p>Track changes and workspace events across your projects.</p></div></div>
      <section class="empty large"><div class="empty-icon">◷</div><h3>No activity yet.</h3>
      <p>Commits, previews, AI tasks, and builds will appear here once those systems are connected.</p>
      <button class="secondary" id="back">Go to projects</button></section>`;
  }
  app.innerHTML = `<div class="shell"><aside class="sidebar">
    <div class="brand"><span class="mark">S</span><b>studio</b><small>BETA</small></div>
    <div class="workspace"><span>O</span><div><b>Personal workspace</b><small>Free workspace</small></div></div>
    <label class="nav-label">WORKSPACE</label>
    <button class="nav ${state.view==='projects'?'active':''}" data-view="projects">▦ &nbsp; Projects</button>
    <button class="nav ${state.view==='templates'?'active':''}" data-view="templates">▧ &nbsp; Templates</button>
    <button class="nav ${state.view==='activity'?'active':''}" data-view="activity">◷ &nbsp; Activity</button>
    <label class="nav-label build">BUILD</label>
    <button class="nav" data-message="AI Agent tools will be connected in a later milestone.">✳ &nbsp; AI Agent <small>SOON</small></button>
    <button class="nav" data-message="Workspace settings will be available when runtimes are connected.">⚙ &nbsp; Settings</button>
    <div class="side-bottom"><div class="usage">Workspace usage <span>0%</span><div></div><small>No runtime usage yet</small></div>
    <div class="account"><span>O</span><b>Omar</b></div></div></aside>
    <main><header><span>Workspace / <b>${state.view}</b></span><div><i></i> All systems ready <span class="avatar">O</span></div></header>
    <section class="content">${page}</section></main></div>${state.modal?modal():''}<div class="toast" id="toast"></div>`;
  bind();
}
function bind() {
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { state.view=b.dataset.view; render(); });
  document.querySelectorAll('[data-message]').forEach(b => b.onclick = () => toast(b.dataset.message));
  ['new-project','first-project','blank'].forEach(id => {
    const b=document.getElementById(id); if(b) b.onclick=()=>{state.modal=true;render();};
  });
  const templates=document.getElementById('templates');
  if(templates) templates.onclick=()=>{state.view='templates';render();};
  const back=document.getElementById('back');
  if(back) back.onclick=()=>{state.view='projects';render();};
  const imp=document.getElementById('import');
  if(imp) imp.onclick=()=>toast('GitHub import is planned after repository authorization is implemented.');
  const close=document.getElementById('close');
  if(close) close.onclick=()=>{state.modal=false;render();};
  const backdrop=document.getElementById('backdrop');
  if(backdrop) backdrop.onclick=e=>{if(e.target===backdrop){state.modal=false;render();}};
  const form=document.getElementById('project-form');
  if(form) form.onsubmit=e=>{
    e.preventDefault();
    state.drafts.unshift({name:document.getElementById('name').value.trim(),description:document.getElementById('description').value.trim()});
    state.modal=false;render();toast('Local draft created. GitHub sync is not connected yet.');
  };
  const idea=document.getElementById('idea-form');
  if(idea) idea.onsubmit=e=>{
    e.preventDefault(); const value=document.getElementById('idea').value.trim();
    if(!value){toast('Describe your idea first.');return;}
    state.drafts.unshift({name:value.split(/[.!?\n]/)[0].slice(0,48)||'Untitled project',description:value});
    render();toast('Idea saved as a local draft. AI generation is not connected yet.');
  };
}
render();
