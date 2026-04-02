import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'

const FILE_LANGUAGES = {
  'App.jsx': 'javascript',
  'TaskList.jsx': 'javascript',
  'AddTask.jsx': 'javascript',
  'api.js': 'javascript',
}

export default function CodeEditor({ files, activeFile, onFileChange, onFileSelect }) {
  const [localContent, setLocalContent] = useState('')

  useEffect(() => {
    setLocalContent(files[activeFile] || '')
  }, [activeFile, files])

  function handleChange(value) {
    setLocalContent(value)
    onFileChange(activeFile, value)
  }

  return (
    <div style={styles.container}>
      <div style={styles.tabs}>
        {Object.keys(files).map(filename => (
          <button
            key={filename}
            style={{
              ...styles.tab,
              ...(filename === activeFile ? styles.tabActive : {})
            }}
            onClick={() => onFileSelect(filename)}
          >
            <span style={styles.tabDot(filename)} />
            {filename}
          </button>
        ))}
      </div>
      <div style={styles.editor}>
        <Editor
          height="100%"
          language={FILE_LANGUAGES[activeFile] || 'javascript'}
          value={localContent}
          onChange={handleChange}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: 'line',
            lineNumbers: 'on',
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#1e1e1e',
  },
  tabs: {
    display: 'flex',
    background: '#252526',
    borderBottom: '1px solid #333',
    overflowX: 'auto',
    flexShrink: 0,
  },
  tab: {
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    color: '#999',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid transparent',
    transition: 'all 0.1s',
  },
  tabActive: {
    color: '#d4d4d4',
    borderBottomColor: '#6366f1',
    background: '#1e1e1e',
  },
  tabDot: (filename) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: filename.endsWith('.jsx') ? '#569cd6' : '#ce9178',
    flexShrink: 0,
  }),
  editor: {
    flex: 1,
    overflow: 'hidden',
  }
}
