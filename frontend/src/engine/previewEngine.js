const PREVIEW_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 16px;
    background: #fff;
    color: #111;
  }
  .app { max-width: 600px; margin: 0 auto; }
  h1 { font-size: 24px; margin-bottom: 16px; font-weight: 700; }
  .add-task-form { display: flex; gap: 8px; margin-bottom: 20px; }
  .add-task-form input {
    flex: 1; padding: 8px 12px; border: 1px solid #ddd;
    border-radius: 6px; font-size: 14px;
  }
  .add-task-form input[type="date"] { flex: 0 0 auto; }
  .add-task-form button {
    padding: 8px 16px; background: #6366f1; color: white;
    border: none; border-radius: 6px; cursor: pointer; font-size: 14px; white-space: nowrap;
  }
  .filters { display: flex; gap: 8px; margin-bottom: 16px; }
  .filters button {
    padding: 6px 14px; border: 1px solid #ddd; background: white;
    border-radius: 20px; cursor: pointer; font-size: 13px;
  }
  .filters button.active { background: #6366f1; color: white; border-color: #6366f1; }
  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 18px; height: 18px; border-radius: 50%; font-size: 10px;
    margin-left: 4px; font-weight: 600;
  }
  .filters button.active .badge { background: rgba(255,255,255,0.3); color: white; }
  .filters button:not(.active) .badge { background: #eee; color: #666; }
  .task-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .task-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 16px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;
  }
  .task-item.status-done { opacity: 0.6; }
  .task-info { display: flex; flex-direction: column; gap: 3px; }
  .task-title { font-size: 14px; font-weight: 500; }
  .task-due { font-size: 12px; color: #888; }
  .task-actions { display: flex; gap: 8px; }
  .status-btn {
    padding: 4px 10px; border-radius: 4px; font-size: 12px; border: 1px solid #ddd;
    background: white; cursor: pointer; text-transform: capitalize;
  }
  .status-btn { background: #f3f4f6; }
  .delete-btn {
    padding: 4px 10px; border-radius: 4px; font-size: 12px; border: 1px solid #fee;
    background: #fff5f5; color: #e53e3e; cursor: pointer;
  }
  .empty { color: #999; font-size: 14px; text-align: center; padding: 32px; }
  #error {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: #fee; color: #c00; padding: 8px 16px; font-size: 12px;
    font-family: monospace; display: none; white-space: pre-wrap;
    max-height: 150px; overflow-y: auto;
  }
</style>
</head>
<body>
<div id="root"></div>
<div id="error"></div>
<script>
window.onerror = function(msg, src, line, col, err) {
  const el = document.getElementById('error');
  el.style.display = 'block';
  el.textContent = (err ? err.stack : msg) || msg;
};

window.addEventListener('message', function(e) {
  if (!e.data || e.data.type !== 'UPDATE_FILES') return;
  const errorEl = document.getElementById('error');
  errorEl.style.display = 'none';
  errorEl.textContent = '';

  try {
    const files = e.data.files;

    // Execute api.js as a module
    const apiCode = files['api.js'] || '';

    // Transpile and execute each JSX file
    const allCode = \`
// Inline React from CDN globals
const React = window.React;
const ReactDOM = window.ReactDOM;

// ---- api.js ----
\${apiCode.replace(/^export default /gm, 'var _default_api = ').replace(/^export (async function|function|const|let|var)/gm, '$1')}

// Expose api functions
var getTasks = typeof getTasks !== 'undefined' ? getTasks : (window.getTasks || function(){return Promise.resolve([])});
var createTask = typeof createTask !== 'undefined' ? createTask : (window.createTask || function(){return Promise.resolve({})});
var updateTaskStatus = typeof updateTaskStatus !== 'undefined' ? updateTaskStatus : function(){return Promise.resolve({})};
var deleteTask = typeof deleteTask !== 'undefined' ? deleteTask : function(){return Promise.resolve({})};

// ---- TaskList.jsx ----
\${files['TaskList.jsx'] || ''}

// ---- AddTask.jsx ----
\${files['AddTask.jsx'] || ''}

// ---- App.jsx ----
\${files['App.jsx'] || ''}

// Mount
const rootEl = document.getElementById('root');
if (window._reactRoot) {
  window._reactRoot.render(React.createElement(App));
} else {
  window._reactRoot = ReactDOM.createRoot(rootEl);
  window._reactRoot.render(React.createElement(App));
}
\`;

    const transpiled = Babel.transform(allCode, {
      presets: ['react'],
      plugins: [],
    }).code;

    const fn = new Function(transpiled);
    fn();
  } catch(err) {
    errorEl.style.display = 'block';
    errorEl.textContent = err.stack || err.message;
  }
});
</script>
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
</body>
</html>`;

export function getPreviewHTML() {
  return PREVIEW_HTML;
}
