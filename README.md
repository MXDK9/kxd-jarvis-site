# KXD AI — J.A.R.V.I.S. Advanced Intelligence Platform

> **"Good morning, boss. All systems nominal."**

A fully-featured Iron Man-inspired AI voice assistant web app, powered by **Google Gemini 2.0 Flash** and optionally **ChatGPT**. Deployed via GitHub Pages.

---

## 🌐 Live Site

**https://YOUR_USERNAME.github.io/kxd-jarvis-site/**

---

## ✨ Features

- 🎙️ **Continuous voice recognition** — Speak naturally, JARVIS listens
- 🔊 **Text-to-speech** — British male voice responds
- 🤖 **Gemini 2.0 Flash AI** — Answers literally any question intelligently
- 🤖 **ChatGPT support** — Optional OpenAI key
- 🌐 **Browser PC control** — Open sites, YouTube, Google, fullscreen, clipboard
- 🌤️ **Live weather** — "Weather in Mumbai" fetches real data
- 📚 **Wikipedia** — "Tell me about black holes"
- 🔢 **Calculator** — Natural language math via AI
- ⏰ **Reminders** — Browser notifications
- 📋 **Clipboard** — "Copy that"
- 🎯 **Quick command buttons**
- ⚡ **Iron Man HUD** — Arc reactor, particle background, glassmorphism
- 🔒 **Settings panel** — API key management

---

## 🚀 Deployment (GitHub Pages)

```bash
git init
git add .
git commit -m "🚀 KXD AI JARVIS v9.0.0 — Launch"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kxd-jarvis-site.git
git push -u origin main
```

Then go to: **GitHub Repo → Settings → Pages → Source: main branch**

---

## ⚙️ API Keys

Click the **⚙️ Settings** button in the top-right corner of the app to configure:

| Key | Source | Cost |
|---|---|---|
| Gemini API Key | [aistudio.google.com](https://aistudio.google.com) | **FREE** |
| OpenAI API Key | [platform.openai.com](https://platform.openai.com) | Paid (~$5 credit) |

Keys are stored in `localStorage` — never sent to any external server except the official APIs.

---

## 🗣️ Voice Commands

| Say... | JARVIS does... |
|---|---|
| "What time is it?" | Tells the exact time |
| "Weather in Tokyo" | Live weather data |
| "Tell me about black holes" | Wikipedia + AI summary |
| "Open YouTube" | Opens YouTube |
| "Play Bohemian Rhapsody" | YouTube search |
| "Search for quantum computing" | Google search |
| "Calculate 15 percent of 230" | Computes the answer |
| "Set a reminder in 5 minutes" | Browser notification |
| "Go fullscreen" | Enters fullscreen |
| "Inspire me" | Motivational quote |
| "Tell me a joke" | JARVIS wit |
| "Open Gmail / GitHub / Netflix..." | Opens any site |

---

## 🏗️ Tech Stack

- Pure **HTML5 + CSS3 + JavaScript** — zero build tools
- **Google Gemini API** — primary AI brain
- **Web Speech API** — voice in/out
- **wttr.in** — live weather
- **Wikipedia REST API** — knowledge base
- **marked.js** — markdown rendering
- **GitHub Pages** — free hosting

---

*© KXD AI — MDK Systems. Stark Industries. All rights reserved.*
