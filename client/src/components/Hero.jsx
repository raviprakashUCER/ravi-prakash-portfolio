import React, { useState } from 'react';
import { FileText, Briefcase, ArrowRight, Mail, MapPin } from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from './Icons';
import { getMediaUrl } from '../services/api';

export default function Hero({ profile, resume, onNavigate }) {
  const [imgError, setImgError] = useState(false);

  const photoUrl = profile?.profile_photo ? getMediaUrl(profile.profile_photo) : null;
  const socialLinks = profile?.social_links || {};

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[250px] bg-indigo-600/10 blur-[110px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto w-full text-center">
        
        {/* Profile Photo Avatar */}
        <div className="mb-6 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-cyan-500/40 bg-slate-900 shadow-2xl flex items-center justify-center">
              {photoUrl && !imgError ? (
                <img
                  src={photoUrl}
                  alt={profile?.name || "Ravi Prakash"}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-cyan-400 font-bold text-3xl sm:text-4xl tracking-wider">
                  {profile?.name ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'RP'}
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-2 bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#090d16]" title="Available for opportunities"></div>
          </div>
        </div>

        {/* Location Badge */}
        {profile?.location && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium mb-4">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{profile.location}</span>
          </div>
        )}

        {/* Name & Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Hi, I'm <span className="cyber-gradient-text">{profile?.name || 'Ravi Prakash'}</span>
        </h1>

        <p className="mt-4 text-xl sm:text-2xl font-medium text-slate-300 max-w-3xl mx-auto">
          {profile?.headline || 'Full Stack Engineer & Cloud Architect'}
        </p>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {profile?.bio || 'Building reliable, high-performance web systems with clean architectures and modern cloud solutions.'}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('projects')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Briefcase className="w-4 h-4" />
            <span>Explore Projects</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('resume')}
            className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white font-semibold border border-slate-700 hover:border-slate-600 shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>View Resume</span>
          </button>

          <button
            onClick={() => onNavigate('contact')}
            className="px-6 py-3 rounded-xl bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white font-semibold border border-slate-700/70 flex items-center gap-2 transition-all"
          >
            <Mail className="w-4 h-4 text-indigo-400" />
            <span>Contact Me</span>
          </button>
        </div>

        {/* Social Icons */}
        <div className="mt-10 flex items-center justify-center gap-4">
          {socialLinks.github && (
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-all hover:scale-110"
              aria-label="GitHub Profile"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
          )}
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-all hover:scale-110"
              aria-label="LinkedIn Profile"
            >
              <LinkedinIcon className="w-5 h-5" />
            </a>
          )}
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-all hover:scale-110"
              aria-label="Twitter Profile"
            >
              <TwitterIcon className="w-5 h-5" />
            </a>
          )}
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-all hover:scale-110"
              aria-label="Email Contact"
            >
              <Mail className="w-5 h-5" />
            </a>
          )}
        </div>

      </div>
    </section>
  );
}
