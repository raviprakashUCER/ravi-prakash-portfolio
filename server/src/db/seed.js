import bcrypt from 'bcryptjs';
import { db } from './connection.js';
import { initSchema } from './schema.js';
import { config } from '../config.js';

export function seedDatabase(force = false) {
  initSchema();

  const existingProfile = db.prepare('SELECT id FROM profile LIMIT 1').get();
  if (!existingProfile || force) {
    console.log('🌱 Initializing database with approved profile data...');

    if (force) {
      db.exec(`
        DELETE FROM profile;
        DELETE FROM skills;
        DELETE FROM certifications;
        DELETE FROM projects;
        DELETE FROM project_images;
        DELETE FROM notes;
        DELETE FROM resumes;
        DELETE FROM social_links;
        DELETE FROM education;
        DELETE FROM learning_journey;
        DELETE FROM ai_knowledge;
      `);
    }

    // 1. Profile (Only explicitly provided information)
    db.prepare(`
      INSERT INTO profile (name, headline, bio, location, email, current_focus, career_goal, interests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Ravi Prakash',
      'Computer Science Student | Cybersecurity Learner | AI & Technology Enthusiast',
      'Ravi is a Computer Science student building practical skills in cybersecurity, programming, AI, web technologies, and software development. He is interested in building practical technology projects and documenting what he learns.',
      'India',
      '',
      'Computer Science, Cybersecurity, AI, Programming and Software Development.',
      'Aspiring Cybersecurity Professional & Software Engineer focused on secure systems, threat analysis, and AI-driven automation.',
      JSON.stringify([
        'Computer Networks',
        'Cybersecurity',
        'Web Security',
        'Ethical Security Testing',
        'OSINT',
        'Vulnerability Assessment',
        'Python',
        'C/C++',
        'Java',
        'Web Development',
        'AI',
        'Prompt Engineering',
        'Linux',
        'Cloud/AWS',
        'Databases'
      ])
    );

    // 2. Admin User
    const passwordHash = bcrypt.hashSync(config.adminDefaultPassword, 10);
    db.prepare(`
      INSERT OR REPLACE INTO admin_users (username, password_hash)
      VALUES (?, ?)
    `).run(config.adminDefaultUsername, passwordHash);

    // 3. Technical Skills
    const skills = [
      // Programming
      { name: 'Python', category: 'Programming', level: 'Practical Experience', description: 'Core scripting, automation, security tooling, and AI integration.', sort_order: 1 },
      { name: 'C', category: 'Programming', level: 'Intermediate', description: 'Low-level programming, memory concepts, and foundational algorithms.', sort_order: 2 },
      { name: 'C++', category: 'Programming', level: 'Intermediate', description: 'Object-oriented programming, data structures, and algorithms.', sort_order: 3 },
      { name: 'Java', category: 'Programming', level: 'Intermediate', description: 'OOP fundamentals, modular applications, and backend logic.', sort_order: 4 },
      { name: 'JavaScript', category: 'Programming', level: 'Intermediate', description: 'Modern ES6+, asynchronous scripting, and interactive interfaces.', sort_order: 5 },

      // Web Development
      { name: 'HTML', category: 'Web Development', level: 'Practical Experience', description: 'Semantic structure, accessibility, and modern web layouts.', sort_order: 1 },
      { name: 'CSS', category: 'Web Development', level: 'Practical Experience', description: 'Flexbox, CSS Grid, animations, and responsive UI design.', sort_order: 2 },
      { name: 'JavaScript', category: 'Web Development', level: 'Intermediate', description: 'DOM manipulation and front-end interface logic.', sort_order: 3 },
      { name: 'Django', category: 'Web Development', level: 'Familiar', description: 'Python-based MVC web framework, models, and views.', sort_order: 4 },
      { name: 'Flask', category: 'Web Development', level: 'Familiar', description: 'Lightweight microframework for fast API prototyping.', sort_order: 5 },
      { name: 'SQL', category: 'Web Development', level: 'Intermediate', description: 'Relational querying, schema design, and database queries.', sort_order: 6 },
      { name: 'REST APIs', category: 'Web Development', level: 'Intermediate', description: 'API architecture, HTTP methods, JSON data exchange, and security.', sort_order: 7 },

      // Cybersecurity
      { name: 'Nmap', category: 'Cybersecurity', level: 'Practical Experience', description: 'Network mapping, port scanning, service versioning, and NSE scripts.', sort_order: 1 },
      { name: 'Burp Suite', category: 'Cybersecurity', level: 'Intermediate', description: 'HTTP traffic interception, repeater analysis, intruder, and web proxying.', sort_order: 2 },
      { name: 'Wireshark', category: 'Cybersecurity', level: 'Practical Experience', description: 'Packet sniffing, protocol analysis, TCP streams, and PCAP inspection.', sort_order: 3 },
      { name: 'Nuclei', category: 'Cybersecurity', level: 'Familiar', description: 'Template-based automated vulnerability scanner for targeted checks.', sort_order: 4 },
      { name: 'FFUF', category: 'Cybersecurity', level: 'Familiar', description: 'Fast web fuzzer for directory and parameter fuzzing.', sort_order: 5 },
      { name: 'Subfinder', category: 'Cybersecurity', level: 'Familiar', description: 'Passive subdomain discovery tool for reconnaissance.', sort_order: 6 },
      { name: 'OSINT', category: 'Cybersecurity', level: 'Practical Experience', description: 'Open Source Intelligence gathering and target profiling techniques.', sort_order: 7 },
      { name: 'Web Security', category: 'Cybersecurity', level: 'Intermediate', description: 'Evaluating and understanding common OWASP top web vulnerabilities.', sort_order: 8 },
      { name: 'Vulnerability Assessment', category: 'Cybersecurity', level: 'Practical Experience', description: 'Scanning and identifying misconfigurations in lab environments.', sort_order: 9 },

      // Security Concepts
      { name: 'XSS', category: 'Security Concepts', level: 'Intermediate', description: 'Reflected, Stored, and DOM-based XSS mechanisms and sanitization.', sort_order: 1 },
      { name: 'SQL Injection', category: 'Security Concepts', level: 'Intermediate', description: 'Error-based, union-based, and parameterized query remediation.', sort_order: 2 },
      { name: 'IDOR', category: 'Security Concepts', level: 'Familiar', description: 'Access control flaws and object-level permission verification.', sort_order: 3 },
      { name: 'LFI', category: 'Security Concepts', level: 'Familiar', description: 'Path traversal attacks and strict file path validation.', sort_order: 4 },
      { name: 'Authentication', category: 'Security Concepts', level: 'Intermediate', description: 'Tokens, cookies, session fixation, and secure auth flows.', sort_order: 5 },
      { name: 'Access Control', category: 'Security Concepts', level: 'Intermediate', description: 'Role-based access, privilege escalation prevention.', sort_order: 6 },
      { name: 'Networking', category: 'Security Concepts', level: 'Practical Experience', description: 'TCP/IP model, DNS, routing, firewalls, and subnetting.', sort_order: 7 },
      { name: 'Cryptography', category: 'Security Concepts', level: 'Familiar', description: 'Symmetric/asymmetric encryption, hashing, TLS/SSL, and certificates.', sort_order: 8 },
      { name: 'Security Monitoring', category: 'Security Concepts', level: 'Familiar', description: 'Log inspection, alerts, and system activity tracking.', sort_order: 9 },

      // AI
      { name: 'Prompt Engineering', category: 'AI', level: 'Practical Experience', description: 'System prompts, few-shot prompting, structured output, and chain-of-thought.', sort_order: 1 },
      { name: 'AI-assisted development', category: 'AI', level: 'Practical Experience', description: 'Pair programming with LLMs, code generation, and debugging.', sort_order: 2 },
      { name: 'AI security concepts', category: 'AI', level: 'Familiar', description: 'Prompt injection defenses, data leakage prevention, and model safety.', sort_order: 3 },
      { name: 'AI automation', category: 'AI', level: 'Familiar', description: 'Building workflows, script automation, and AI APIs.', sort_order: 4 },
    ];

    const insertSkill = db.prepare(`
      INSERT INTO skills (name, category, level, description, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const s of skills) {
      insertSkill.run(s.name, s.category, s.level, s.description, s.sort_order);
    }

    // 4. Projects (Practical verified projects)
    const projects = [
      {
        slug: 'jarvis-ai-assistant',
        title: 'Jarvis AI Assistant',
        description: 'An interactive personal voice and text AI assistant built with Python for automating everyday workstation workflows.',
        problem: 'Streamlining repetitive workstation tasks like opening apps, running system diagnostics, taking voice notes, and executing custom commands.',
        solution: 'Developed a modular Python assistant with speech recognition, text-to-speech feedback, API integrations, and command automation.',
        features: JSON.stringify([
          'Voice and text command recognition',
          'Automated application launcher and web searches',
          'System health and network telemetry reporting',
          'Extensible plugin architecture for custom scripts'
        ]),
        technologies: 'Python, SpeechRecognition, Pyttsx3, Requests, OSINT APIs',
        status: 'Completed',
        github_url: 'https://github.com/raviprakashUCER',
        demo_url: '',
        lessons_learned: 'Mastered Python threading for non-blocking voice processing, audio stream buffering, and robust error handling.'
      },
      {
        slug: 'personal-notes-knowledge-platform',
        title: 'Personal Notes Platform & Knowledge Hub',
        description: 'A centralized developer portfolio, cybersecurity knowledge base, and AI-grounded interactive assistant.',
        problem: 'Needed a structured repository to document CS coursework, cybersecurity lab findings, and programming concepts in one place.',
        solution: 'Built a full-stack web application with responsive UI, markdown documentation engine, and AI query layer.',
        features: JSON.stringify([
          'Full-text search across all notes and tags',
          'Interactive cybersecurity and programming skills matrix',
          'Grounded AI chat agent with citation capabilities',
          'Dynamic admin content management system'
        ]),
        technologies: 'React, Express, SQLite, Tailwind CSS, REST APIs',
        status: 'Completed',
        github_url: 'https://github.com/raviprakashUCER',
        demo_url: '',
        lessons_learned: 'Implemented secure file streaming, defensive prompt engineering, and database-backed dynamic CMS architecture.'
      }
    ];

    const insertProj = db.prepare(`
      INSERT INTO projects (slug, title, description, problem, solution, features, technologies, status, github_url, demo_url, lessons_learned)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of projects) {
      insertProj.run(p.slug, p.title, p.description, p.problem, p.solution, p.features, p.technologies, p.status, p.github_url, p.demo_url, p.lessons_learned);
    }

    // 5. Approved Social Links (Exact 6 Approved URLs)
    const socials = [
      { platform: 'GitHub', username: 'raviprakashUCER', url: 'https://github.com/raviprakashUCER', sort_order: 1 },
      { platform: 'LinkedIn', username: 'ravi-prakash-5b6934314', url: 'https://www.linkedin.com/in/ravi-prakash-5b6934314/', sort_order: 2 },
      { platform: 'YouTube', username: '@ravi_prakash2006', url: 'https://youtube.com/@ravi_prakash2006', sort_order: 3 },
      { platform: 'LeetCode', username: 'ravi_prakash96', url: 'https://leetcode.com/u/ravi_prakash96', sort_order: 4 },
      { platform: 'Medium', username: '@raviprakash8808546773', url: 'https://medium.com/@raviprakash8808546773', sort_order: 5 },
      { platform: 'TryHackMe', username: 'raviprakash8808546773', url: 'https://tryhackme.com/p/raviprakash8808546773', sort_order: 6 }
    ];

    const insertSocial = db.prepare(`
      INSERT INTO social_links (platform, username, url, sort_order)
      VALUES (?, ?, ?, ?)
    `);
    for (const s of socials) {
      insertSocial.run(s.platform, s.username, s.url, s.sort_order);
    }

    // 6. Education
    db.prepare(`
      INSERT INTO education (institution, course, start_date, end_date, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'University / College',
      'Computer Science',
      'Current',
      'Ongoing',
      'Pursuing Computer Science with core coursework across computer networks, cybersecurity, software engineering, algorithms, and AI.'
    );

    // 7. Learning Journey Milestones (Neutral ongoing statuses)
    const journey = [
      { topic: 'Computer Science Core', category: 'Academics', status: 'Ongoing', started_at: 'Current Coursework', description: 'Data structures, algorithms, operating systems, and discrete mathematics.', sort_order: 1 },
      { topic: 'Cybersecurity & Web Security', category: 'Security', status: 'In Progress', started_at: 'Ongoing Lab Study', description: 'Hands-on practice with Nmap, Burp Suite, Wireshark, OWASP vulnerabilities, and network analysis.', sort_order: 2 },
      { topic: 'Software Development & Python', category: 'Programming', status: 'Active', started_at: 'Ongoing Projects', description: 'Writing automation scripts, REST API integrations, and practical Python tools like Jarvis Assistant.', sort_order: 3 },
      { topic: 'AI & Prompt Engineering', category: 'AI', status: 'Exploring', started_at: 'Current Exploration', description: 'Studying LLM capabilities, pair programming, system prompts, and AI workflow integration.', sort_order: 4 }
    ];

    const insertJourney = db.prepare(`
      INSERT INTO learning_journey (topic, category, status, started_at, description, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const j of journey) {
      insertJourney.run(j.topic, j.category, j.status, j.started_at, j.description, j.sort_order);
    }

    // 8. Grounded AI Knowledge Facts
    const aiFacts = [
      { key: 'bio', category: 'About', content: 'Ravi Prakash is a Computer Science student, cybersecurity learner, and AI enthusiast based in India. He focuses on practical labs in network security, Python development, and documenting his learning journey.' },
      { key: 'current_focus', category: 'About', content: 'Ravi is currently studying computer networks, web application security (OWASP Top 10), penetration testing tools (Nmap, Wireshark, Burp Suite), and Python automation.' },
      { key: 'career_goal', category: 'About', content: 'Aspiring Cybersecurity Professional & Software Engineer aiming to specialize in secure infrastructure, threat analysis, and AI automation.' },
      { key: 'social_profiles', category: 'Social', content: 'Ravi is active on GitHub (raviprakashUCER), LinkedIn (ravi-prakash-5b6934314), YouTube (@ravi_prakash2006), LeetCode (ravi_prakash96), Medium (@raviprakash8808546773), and TryHackMe (raviprakash8808546773).' },
      { key: 'jarvis_project', category: 'Projects', content: 'Jarvis AI Assistant is a personal voice and text assistant built with Python that automates workstation tasks, app launching, and system diagnostics.' },
      { key: 'cybersecurity_tools', category: 'Skills', content: 'Ravi has practical and intermediate experience with Nmap, Wireshark, Burp Suite, Nuclei, FFUF, Subfinder, OSINT, and evaluating web vulnerabilities like XSS, SQLi, and IDOR.' }
    ];

    const insertAI = db.prepare(`
      INSERT INTO ai_knowledge (key, category, content)
      VALUES (?, ?, ?)
    `);
    for (const f of aiFacts) {
      insertAI.run(f.key, f.category, f.content);
    }

    // 9. Initial site stats
    db.prepare(`
      INSERT OR REPLACE INTO site_stats (key, value)
      VALUES ('profile_views', 1)
    `).run();

    console.log('✔ Clean database initialization complete. Notes, Certifications, and Resumes are empty templates ready for Admin uploads.');
  }
}
