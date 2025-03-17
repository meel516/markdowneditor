import React, { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Split, FileEdit, Eye, Github, Server } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown as markdownLang } from '@codemirror/lang-markdown';

const DEBOUNCE_DELAY = 500; 

function App() {
  const [markdown, setMarkdown] = useState('');
  const [useServer, setUseServer] = useState(false);
  const [serverHtml, setServerHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedMarkdown, setDebouncedMarkdown] = useState('');

  useEffect(() => {
    if (useServer) {
      const timer = setTimeout(() => {
        setDebouncedMarkdown(markdown);
      }, DEBOUNCE_DELAY);

      return () => clearTimeout(timer);
    }
  }, [markdown, useServer]);

  // Function to process markdown on the server
  const processMarkdownOnServer = useCallback(async (text: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3000/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: text }),
      });
      const data = await response.json();
      setServerHtml(data.html);
    } catch (error) {
      console.error('Error processing markdown:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    if (useServer && debouncedMarkdown) {
      processMarkdownOnServer(debouncedMarkdown);
    }
  }, [debouncedMarkdown, useServer, processMarkdownOnServer]);


  const handleMarkdownChange = useCallback((value: string) => {
    setMarkdown(value);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
 
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Split className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">Markdown Editor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setUseServer(!useServer)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  useServer 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Server className="h-4 w-4" />
                <span>{useServer ? 'Server Processing' : 'Client Processing'}</span>
              </button>
              <a
                href="https://github.com/meel516"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700"
              >
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </header>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FileEdit className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-medium text-gray-900">Editor</h2>
              </div>
            </div>
            <div className="h-[calc(100vh-16rem)]">
              <CodeMirror
                value={markdown}
                height="100%"
                extensions={[markdownLang()]}
                onChange={handleMarkdownChange}
                theme="light"
                className="h-full"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">Preview</h2>
                </div>
                {isLoading && <div className="text-sm text-gray-500">Processing...</div>}
              </div>
            </div>
            <div className="prose max-w-none p-4 h-[calc(100vh-16rem)] overflow-auto">
              {useServer ? (
                <div dangerouslySetInnerHTML={{ __html: serverHtml }} />
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    img: ({node, ...props}) => (
                      <img className="rounded-lg shadow-md" {...props} alt={props.alt || ''} />
                    ),
                    table: ({node, ...props}) => (
                      <table className="min-w-full divide-y divide-gray-200" {...props} />
                    ),
                    th: ({node, ...props}) => (
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" {...props} />
                    ),
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
