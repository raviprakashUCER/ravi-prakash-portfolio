import { useEffect } from 'react';
import { getMediaUrl } from '../services/api';

export default function SEO({ profile, activeNote }) {
  useEffect(() => {
    const baseName = profile?.name || 'Ravi Prakash';
    const headline = profile?.headline || 'Developer, Cybersecurity & AI Knowledge Hub';
    
    let pageTitle = `${baseName} | ${headline}`;
    let pageDescription = profile?.bio || 'Official personal portfolio, cybersecurity knowledge base, engineering projects, verified certifications, and professional resume of Ravi Prakash.';

    if (activeNote) {
      pageTitle = `${activeNote.title} | ${baseName} - Technical Notes`;
      if (activeNote.short_description) {
        pageDescription = activeNote.short_description;
      }
    }

    document.title = pageTitle;

    // Helper to safely set or create a meta tag
    const setMeta = (nameOrProperty, value, isProperty = false) => {
      if (!value) return;
      const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', nameOrProperty);
        } else {
          el.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // Update standard & social meta tags
    setMeta('description', pageDescription);
    setMeta('og:title', pageTitle, true);
    setMeta('og:description', pageDescription, true);
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', pageDescription);

    // Canonical link management (uses live production origin with Vercel fallback)
    const origin = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost'))
      ? window.location.origin
      : 'https://ravi-prakash-portfolio-dxrj.vercel.app';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const canonicalUrl = `${origin}${pathname === '/' ? '/' : pathname}`;
    
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
    setMeta('og:url', canonicalUrl, true);

    // Dynamic OpenGraph image
    if (profile?.profile_photo) {
      const fullPhotoUrl = getMediaUrl(profile.profile_photo);
      setMeta('og:image', fullPhotoUrl, true);
      setMeta('twitter:image', fullPhotoUrl);
    }

    // Schema.org JSON-LD structured data (Person, WebSite, ProfilePage)
    const sameAsList = [];
    if (profile?.social_links) {
      const s = profile.social_links;
      if (s.github) sameAsList.push(s.github);
      if (s.linkedin) sameAsList.push(s.linkedin);
      if (s.twitter) sameAsList.push(s.twitter);
    }

    const skillsList = [];
    if (Array.isArray(profile?.skills)) {
      profile.skills.forEach(group => {
        if (Array.isArray(group.items)) {
          skillsList.push(...group.items);
        }
      });
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": `${canonicalUrl}#person`,
          "name": baseName,
          "jobTitle": headline,
          "description": pageDescription,
          "url": canonicalUrl,
          ...(profile?.profile_photo ? { "image": getMediaUrl(profile.profile_photo) } : {}),
          ...(profile?.email ? { "email": `mailto:${profile.email}` } : {}),
          ...(profile?.location ? { "address": { "@type": "PostalAddress", "addressCountry": profile.location } } : {}),
          ...(sameAsList.length > 0 ? { "sameAs": sameAsList } : {}),
          ...(skillsList.length > 0 ? { "knowsAbout": skillsList } : { "knowsAbout": ["Computer Science", "Software Engineering", "Cybersecurity", "Artificial Intelligence"] })
        },
        {
          "@type": "ProfilePage",
          "@id": `${canonicalUrl}#webpage`,
          "url": canonicalUrl,
          "name": pageTitle,
          "isPartOf": {
            "@type": "WebSite",
            "@id": `${canonicalUrl}#website`,
            "url": canonicalUrl,
            "name": `${baseName} - Portfolio & Knowledge Hub`
          },
          "about": {
            "@id": `${canonicalUrl}#person`
          },
          "description": pageDescription,
          "inLanguage": "en-US"
        }
      ]
    };

    let scriptTag = document.getElementById('dynamic-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'dynamic-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

  }, [profile, activeNote]);

  return null;
}
