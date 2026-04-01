'use client';

import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, CloudArrowUpIcon, KeyIcon } from '@heroicons/react/24/outline';

interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  jobId?: string;
}

interface StatusResponse {
  jobId: string;
  status: 'processing' | 'completed' | 'error';
  message: string;
  result?: {
    recordsProcessed: number;
    outputFiles: string[];
    processingTime: string;
  };
  error?: string;
}

export default function AdminUploadPage() {
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  // Status state
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const API_BASE = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:9000';

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.token) {
        setToken(data.token);
        setPassword(''); // Clear password for security
      } else {
        setLoginError(data.error || data.message || 'Login fallito');
      }
    } catch (error) {
      setLoginError('Errore di connessione al server');
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadError(null);
      } else {
        setUploadError('Per favore seleziona un file CSV');
        setSelectedFile(null);
      }
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !token) return;

    setUploadError(null);
    setIsUploading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (data.success && data.jobId) {
        setJobId(data.jobId);
        // Start polling for status
        pollStatus(data.jobId);
      } else {
        setUploadError(data.message || 'Upload fallito');
      }
    } catch (error) {
      setUploadError('Errore durante l\'upload del file');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Poll job status
  const pollStatus = async (id: string) => {
    setIsCheckingStatus(true);
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max (2s interval)

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setUploadError('Timeout: il processamento sta impiegando troppo tempo');
        setIsCheckingStatus(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/admin/status/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data: StatusResponse = await response.json();
        setStatus(data);

        if (data.status === 'processing') {
          attempts++;
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          setIsCheckingStatus(false);
          
          // If completed successfully, redirect to homepage after 3 seconds with cache invalidation
          if (data.status === 'completed') {
            setTimeout(() => {
              // Add timestamp to force cache refresh
              window.location.href = '/?v=' + Date.now();
            }, 3000);
          }
        }
      } catch (error) {
        setUploadError('Errore nel controllo dello stato');
        setIsCheckingStatus(false);
        console.error('Status check error:', error);
      }
    };

    poll();
  };

  // Logout
  const handleLogout = () => {
    setToken(null);
    setUsername('');
    setPassword('');
    setSelectedFile(null);
    setJobId(null);
    setStatus(null);
    setUploadError(null);
    setLoginError(null);
  };

  // Reset upload
  const handleReset = () => {
    setSelectedFile(null);
    setJobId(null);
    setStatus(null);
    setUploadError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">
            Gestione caricamento CSV lemmi AtLiTeG
          </p>
        </div>

        {/* Login Form */}
        {!token ? (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-center mb-6">
              <KeyIcon className="h-12 w-12 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
              Accesso Amministratore
            </h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  placeholder="Inserisci username"
                  required
                  disabled={isLoggingIn}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  placeholder="Inserisci password"
                  required
                  disabled={isLoggingIn}
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoggingIn ? 'Accesso in corso...' : 'Accedi'}
              </button>
            </form>
          </div>
        ) : (
          /* Upload Interface */
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Carica CSV Lemmi
              </h2>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>

            {/* File Upload Section */}
            {!jobId && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleziona file CSV
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CloudArrowUpIcon className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clicca per selezionare</span> o trascina qui
                        </p>
                        <p className="text-xs text-gray-500">File CSV (MAX. 100MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-green-700 font-medium">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-green-600 ml-auto">
                        ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{uploadError}</p>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? 'Upload in corso...' : 'Carica CSV'}
                </button>
              </div>
            )}

            {/* Status Display */}
            {jobId && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Job ID:</span> {jobId}
                  </p>
                </div>

                {isCheckingStatus && (
                  <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <ArrowPathIcon className="h-5 w-5 text-yellow-600 animate-spin flex-shrink-0" />
                    <p className="text-sm text-yellow-700">
                      Processamento in corso...
                    </p>
                  </div>
                )}

                {status && status.status === 'completed' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-700">
                          Processamento completato con successo!
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {status.message}
                        </p>
                      </div>
                    </div>

                    {status.result && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          Dettagli Processamento:
                        </h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>
                            <span className="font-medium">Record processati:</span>{' '}
                            {status.result.recordsProcessed}
                          </li>
                          <li>
                            <span className="font-medium">File generati:</span>{' '}
                            {status.result.outputFiles.join(', ')}
                          </li>
                          <li>
                            <span className="font-medium">Tempo di processamento:</span>{' '}
                            {status.result.processingTime}
                          </li>
                        </ul>
                      </div>
                    )}

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <span className="font-semibold">📌 Nota:</span> Per vedere i nuovi dati nella mappa, 
                        ricarica la pagina principale o fai logout e riaccedi.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <a
                          href="/"
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Vai alla Mappa
                        </a>
                        <button
                          onClick={() => window.location.reload()}
                          className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                        >
                          Ricarica Pagina
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {status && status.status === 'error' && (
                  <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Errore durante il processamento
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {status.error || status.message}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Carica un altro file
                </button>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                📋 Istruzioni:
              </h3>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>Il file deve essere in formato CSV con encoding UTF-8</li>
                <li>Dimensione massima consentita: 100MB</li>
                <li>Viene creato automaticamente un backup dei dati esistenti</li>
                <li>Il processamento può richiedere alcuni secondi</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            AtLiTeG Map - Admin Panel |{' '}
            <a href="/" className="text-indigo-600 hover:text-indigo-800">
              Torna alla mappa
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
