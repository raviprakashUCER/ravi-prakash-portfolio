import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  File,
  Search,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Eye,
  ExternalLink,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import { api } from '../services/api';

export function MediaLibraryTab({ authToken, onSelectMedia, isSelectorMode = false }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [previewFile, setPreviewFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [renamingFile, setRenamingFile] = useState(null);
  const [replacingFileId, setReplacingFileId] = useState(null);

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  useEffect(() => {
    loadFiles();
  }, [searchQuery, filterType]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await api.getMediaFiles(authToken, searchQuery, filterType);
      if (res.success) {
        setFiles(res.files);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = e.target.files || e.dataTransfer?.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    setUploading(true);
    setUploadProgress(40);

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress((p) => (p < 90 ? p + 15 : p));
      }, 100);

      const res = await api.uploadMedia(authToken, formData);
      clearInterval(progressTimer);
      setUploadProgress(100);

      if (res.success) {
        showNotification(`Successfully uploaded ${res.uploaded.length} file(s)!`);
        if (res.errors && res.errors.length > 0) {
          showNotification(`Some files failed: ${res.errors.map(e => e.filename + ': ' + e.error).join(', ')}`, 'error');
        }
        loadFiles();
      } else {
        showNotification(res.error || 'Upload failed', 'error');
      }
    } catch (err) {
      showNotification('Network error during upload', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReplaceFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replacingFileId) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.replaceMediaFile(authToken, replacingFileId, formData);
      if (res.success) {
        showNotification('File replaced successfully!');
        loadFiles();
      } else {
        showNotification(res.error || 'Replace failed', 'error');
      }
    } catch (err) {
      showNotification('Error replacing file', 'error');
    } finally {
      setReplacingFileId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleDelete = async (id, originalName) => {
    if (!confirm(`Are you sure you want to permanently delete "${originalName}"?`)) return;

    try {
      const res = await api.deleteMediaFile(authToken, id);
      if (res.success) {
        showNotification('File deleted from disk and database.');
        loadFiles();
      } else {
        showNotification(res.error || 'Delete failed', 'error');
      }
    } catch (err) {
      showNotification('Failed to delete file', 'error');
    }
  };

  const handleCopyUrl = (url, id) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    showNotification('Public URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-cyan-400" />;
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-rose-400" />;
    return <File className="w-5 h-5 text-purple-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Alert Message */}
      {feedback.message && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'error'
              ? 'bg-rose-950/80 border border-rose-500/30 text-rose-200'
              : 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-200'
          }`}
        >
          {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e);
        }}
        className="glass-panel p-6 sm:p-8 rounded-2xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 transition-colors flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
          <UploadCloud className="w-6 h-6 animate-pulse-slow" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Upload Files to Media Storage</h4>
          <p className="text-xs text-slate-400 mt-1">
            Drag & drop files here, or browse from your device (PDF, DOCX, TXT, MD, PNG, JPG, WEBP, SVG)
          </p>
        </div>

        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.webp,.svg"
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs shadow-glow-cyan transition-all disabled:opacity-50 cursor-pointer"
        >
          {uploading ? 'Processing Upload...' : 'Browse Local Files'}
        </button>

        {uploading && (
          <div className="w-full max-w-xs space-y-1.5 pt-2">
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Uploading {uploadProgress}%...</span>
          </div>
        )}
      </div>

      {/* Hidden file input for Replace action */}
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceFile}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.webp,.svg"
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'images', label: 'Images' },
            { id: 'pdfs', label: 'PDFs' },
            { id: 'documents', label: 'Documents' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search files by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-slate-400">
          Loading media library...
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 space-y-2">
          <File className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No media files found</p>
          <p className="text-xs text-slate-500">Upload documents or images using the upload area above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => {
            const isImage = file.mime_type?.startsWith('image/');
            return (
              <div
                key={file.id}
                className="glass-panel rounded-xl p-4 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group space-y-3 relative overflow-hidden"
              >
                {/* Thumbnail / File Preview Header */}
                <div className="relative h-32 w-full rounded-lg bg-slate-950/80 border border-slate-800/80 overflow-hidden flex items-center justify-center">
                  {isImage ? (
                    <img
                      src={file.public_url}
                      alt={file.original_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
                      {getFileIcon(file.mime_type)}
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-300">
                        {file.original_name.split('.').pop()}
                      </span>
                    </div>
                  )}

                  {/* Badges on top */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-slate-300 border border-white/10">
                      {formatFileSize(file.size)}
                    </span>
                    {file.usage_count > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/40">
                        Used ({file.usage_count})
                      </span>
                    )}
                  </div>
                </div>

                {/* File Metadata */}
                <div className="space-y-1">
                  <h5 className="font-bold text-white text-xs truncate" title={file.original_name}>
                    {file.original_name}
                  </h5>
                  <p className="text-[10px] font-mono text-slate-400">
                    Uploaded: {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Recent'}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                  {isSelectorMode ? (
                    <button
                      type="button"
                      onClick={() => onSelectMedia && onSelectMedia(file)}
                      className="w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Select File
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Preview File"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(file.public_url, file.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                          title="Copy Public URL"
                        >
                          {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplacingFileId(file.id);
                            replaceInputRef.current?.click();
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-purple-300 hover:bg-slate-800"
                          title="Replace File Content"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingFile(file)}
                          className="p-1.5 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(file.id, file.original_name)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                        title="Delete File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-cyan-500/40 rounded-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm">{previewFile.original_name}</h4>
                <p className="text-[11px] font-mono text-cyan-400">
                  {previewFile.mime_type} • {formatFileSize(previewFile.size)}
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl flex items-center justify-center min-h-[250px]">
              {previewFile.mime_type?.startsWith('image/') ? (
                <img
                  src={previewFile.public_url}
                  alt={previewFile.original_name}
                  className="max-h-[500px] max-w-full object-contain rounded-lg shadow-lg"
                />
              ) : previewFile.mime_type === 'application/pdf' ? (
                <iframe
                  src={previewFile.public_url}
                  title="PDF Preview"
                  className="w-full h-[500px] rounded-lg border border-slate-800"
                />
              ) : (
                <div className="text-center space-y-3 py-8">
                  <FileText className="w-12 h-12 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-300">Preview not supported in-browser for this document type.</p>
                  <a
                    href={previewFile.public_url}
                    download
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    Download Document
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-400">
              <span>Public URL: <code className="text-cyan-300">{previewFile.public_url}</code></span>
              <button
                onClick={() => handleCopyUrl(previewFile.public_url, previewFile.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 hover:text-white text-xs"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renamingFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Rename File</h4>
              <button onClick={() => setRenamingFile(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">File Display Name</label>
              <input
                type="text"
                value={renamingFile.original_name}
                onChange={(e) => setRenamingFile({ ...renamingFile, original_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setRenamingFile(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const res = await api.updateMediaFile(authToken, renamingFile.id, {
                    original_name: renamingFile.original_name,
                    is_public: renamingFile.is_public
                  });
                  if (res.success) {
                    showNotification('File renamed successfully!');
                    loadFiles();
                    setRenamingFile(null);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
