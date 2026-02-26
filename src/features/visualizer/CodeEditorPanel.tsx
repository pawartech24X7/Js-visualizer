import Editor from '@monaco-editor/react'
import type { OnMount } from '@monaco-editor/react'
import { useExecutionStore } from '@/store'
import { useRef, useCallback, useEffect } from 'react'
import type { editor } from 'monaco-editor'

export function CodeEditorPanel() {
  const { sourceCode, setSourceCode, currentStepIndex, executionSteps } = useExecutionStore()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const decorationsRef = useRef<string[]>([])

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setSourceCode(value)
    }
  }, [setSourceCode])

  // Update line highlighting based on current step
  const currentStep = currentStepIndex >= 0 && currentStepIndex < executionSteps.length
    ? executionSteps[currentStepIndex]
    : null

  // Highlight current line using useEffect to avoid accessing refs during render
  useEffect(() => {
    if (!editorRef.current) return
    
    const line = currentStep?.currentLine ?? 0
    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      line > 0
        ? [
            {
              range: {
                startLineNumber: line,
                startColumn: 1,
                endLineNumber: line,
                endColumn: 1,
              },
              options: {
                isWholeLine: true,
                className: 'highlighted-line',
                glyphMarginClassName: 'highlighted-glyph',
              },
            },
          ]
        : []
    )
  }, [currentStep])

  return (
    <div className="h-full flex flex-col">
      <style>{`
        .highlighted-line {
          background-color: rgba(88, 166, 255, 0.15) !important;
        }
        .highlighted-glyph {
          background-color: var(--color-accent-blue);
          margin-left: 3px;
          width: 4px !important;
        }
      `}</style>
      
      <Editor
        height="100%"
        language="javascript"
        theme="vs-dark"
        value={sourceCode}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'none',
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          padding: { top: 16, bottom: 16 },
          automaticLayout: true,
        }}
      />
    </div>
  )
}
