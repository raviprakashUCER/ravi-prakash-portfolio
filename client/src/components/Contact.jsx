import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, MessageSquare, User, AtSign, FileText } from 'lucide-react';
import { api } from '../services/api';

export function Contact({ profile, socials }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // bot protection
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ state: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setStatus({ state: 'sending', message: 'Sending message...' });

    try {
      const res = await api.sendContactMessage(formData);
      if (res.success) {
        setStatus({
          state: 'success',
          message: 'Thank you! Your message has been sent successfully. Ravi will get back to you soon.'
        });
        setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
      } else {
        setStatus({ state: 'error', message: res.error || 'Failed to send message.' });
      }
    } catch (err) {
      setStatus({ state: 'error', message: 'Network error. Please try again later.' });
    }
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Mail className="w-3.5 h-3.5" />
            <span>DIRECT COMMUNICATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Get In <span className="cyber-gradient-text">Touch</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Have a question about cybersecurity, a project collaboration, or just want to connect? Send a message below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Contact Info Card */}
          <div className="md:col-span-5 glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Let's Connect</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ravi is always open to discussing technology, cybersecurity concepts, software development, and student collaboration.
              </p>
            </div>

            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">Inquiries</span>
                  <span className="text-slate-200 font-medium">Direct Web Form</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">Interactive</span>
                  <span className="text-slate-200 font-medium">Ask Ravi AI 24/7</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 font-mono">
              ⚡ Anti-Spam protected • Direct inbox delivery
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Invisible Honeypot */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex="-1"
                autoComplete="off"
              />

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" /> Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-cyan-400" /> Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" /> Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cybersecurity project inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Status feedback */}
              {status.state === 'error' && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}

              {status.state === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status.state === 'sending'}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm shadow-glow-cyan transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{status.state === 'sending' ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
