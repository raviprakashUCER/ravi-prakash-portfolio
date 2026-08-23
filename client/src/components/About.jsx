import React from 'react';
import { User, Mail, Phone, MapPin, Globe, Code2, Server, Cloud, Cpu } from 'lucide-react';

export default function About({ profile }) {
  const socialLinks = profile?.social_links || {};

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-xs sm:text-sm font-semibold tracking-widest text-cyan-400 uppercase">
          About Me
        </h2>
        <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
          Background & Technical Passion
        </p>
        <div className="w-16 h-1 bg-cyan-500 mx-auto mt-4 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Bio Card */}
        <div className="lg:col-span-7 glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 text-cyan-400 font-semibold text-lg">
            <User className="w-5 h-5" />
            <span>Professional Summary</span>
          </div>

          <div className="text-slate-300 space-y-4 leading-relaxed text-base">
            <p>
              {profile?.bio || 
                "I am a passionate software developer specializing in building reliable web applications, distributed backend services, and clean cloud systems. I believe in architectural simplicity, robust testing, and pragmatic design."}
            </p>
            <p>
              My focus is on engineering high-efficiency solutions that seamlessly bridge user-friendly client applications with performant, secure backend services. Whether deploying scalable databases or crafting responsive interfaces, I maintain high standards for maintainability and code quality.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <Code2 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="text-xs text-slate-400">Frontend</div>
              <div className="text-sm font-bold text-white">React & Vite</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <Server className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <div className="text-xs text-slate-400">Backend</div>
              <div className="text-sm font-bold text-white">Node & Express</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <Cpu className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-xs text-slate-400">Database</div>
              <div className="text-sm font-bold text-white">SQLite & SQL</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <Cloud className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-xs text-slate-400">Deployments</div>
              <div className="text-sm font-bold text-white">Render & Vercel</div>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="lg:col-span-5 glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 text-cyan-400 font-semibold text-lg">
            <Globe className="w-5 h-5" />
            <span>Contact & Details</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3.5 bg-slate-900/50 rounded-xl border border-slate-800/80">
              <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-400 font-medium">Location</div>
                <div className="text-sm font-semibold text-white">{profile?.location || 'Remote / Worldwide'}</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3.5 bg-slate-900/50 rounded-xl border border-slate-800/80">
              <Mail className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-400 font-medium">Email Address</div>
                <a href={`mailto:${profile?.email || 'ravi@example.com'}`} className="text-sm font-semibold text-cyan-300 hover:underline break-all">
                  {profile?.email || 'ravi@example.com'}
                </a>
              </div>
            </div>

            {profile?.phone && (
              <div className="flex items-start gap-4 p-3.5 bg-slate-900/50 rounded-xl border border-slate-800/80">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-400 font-medium">Phone</div>
                  <div className="text-sm font-semibold text-white">{profile.phone}</div>
                </div>
              </div>
            )}
          </div>

          {/* Social Links buttons */}
          <div className="pt-2">
            <div className="text-xs text-slate-400 font-medium mb-3">Connect Online:</div>
            <div className="flex flex-wrap gap-2">
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  GitHub
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  Twitter / X
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
