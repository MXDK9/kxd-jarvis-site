import speech_recognition as sr
import pyttsx3
import pywhatkit
import datetime
import json
import os
import requests
import webbrowser
import subprocess
import sys
import psutil
import time
from urllib.parse import quote

# Configuration
CONFIG_FILE = 'kd_config.json'

class KDAssistant:
    def __init__(self):
        self.name = "KD"
        self.version = "2.0 (Nova Heart Edition)"
        self.history = []
        self.mood = "Optimal"
        self.load_config()
        
        # Initialize Speech Recognition
        self.listener = sr.Recognizer()
        
        # Initialize Text-to-Speech Engine
        self.engine = pyttsx3.init()
        voices = self.engine.getProperty('voices')
        if len(voices) > 1:
            self.engine.setProperty('voice', voices[1].id)
        self.engine.setProperty('rate', 175)
        
    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                self.config = json.load(f)
        else:
            self.config = {
                'gemini_api_key': 'AIzaSyA6Ho7XD0W1dhq9MX6xYaHN8RA4TKpvrLo',
                'user_name': 'Creator'
            }
            with open(CONFIG_FILE, 'w') as f:
                json.dump(self.config, f, indent=2)

    def talk(self, text):
        print(f"\n{self.name} [{self.mood}]: {text}")
        self.engine.say(text)
        self.engine.runAndWait()

    def get_system_heartbeat(self):
        cpu = psutil.cpu_percent()
        ram = psutil.virtual_memory().percent
        battery = psutil.sensors_battery()
        percent = battery.percent if battery else "N/A"
        
        status = f"System Heartbeat: CPU at {cpu}%, RAM at {ram}%"
        if battery:
            status += f", Battery at {percent}%"
        
        if cpu > 80 or ram > 90:
            self.mood = "Strained"
        else:
            self.mood = "Optimal"
            
        return status

    def take_command(self):
        try:
            with sr.Microphone() as source:
                print(f"\n[KD is listening... Heartbeat: {self.mood}]")
                self.listener.adjust_for_ambient_noise(source, duration=0.8)
                voice = self.listener.listen(source, phrase_time_limit=8)
                command = self.listener.recognize_google(voice).lower()
                
                if "kd" in command or "nova" in command:
                    command = command.replace("kd", "").replace("nova", "").replace("hey", "").strip()
                    print(f"User: {command}")
                    return command
        except:
            pass
        return ""

    def build_system_prompt(self):
        time_now = datetime.datetime.now().strftime('%I:%M %p')
        date_today = datetime.datetime.now().strftime('%B %d, %Y')
        heartbeat = self.get_system_heartbeat()
        
        return f"You are KD, an advanced AI with a 'Nova Heart' core. Address user as Boss. Vitals: {heartbeat}. Sound witty and intelligent like Jarvis."

    def call_gemini(self, prompt):
        api_key = self.config.get('gemini_api_key')
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        self.history.append({"role": "user", "parts": [{"text": prompt}]})
        payload = {"systemInstruction": {"parts": [{"text": self.build_system_prompt()}]}, "contents": self.history[-15:]}
        try:
            response = requests.post(url, json=payload, timeout=15)
            data = response.json()
            text = data['candidates'][0]['content']['parts'][0]['text'].strip()
            self.history.append({"role": "model", "parts": [{"text": text}]})
            return text
        except: return "Connection error."

    def execute_advanced_actions(self, text):
        lines = text.split('\n')
        first_line = lines[0]
        if "YOUTUBE:" in first_line: pywhatkit.playonyt(first_line.split("YOUTUBE:")[1].strip())
        elif "SEARCH:" in first_line: webbrowser.open(f"https://www.google.com/search?q={quote(first_line.split('SEARCH:')[1].strip())}")
        elif "OPEN:" in first_line: 
            target = first_line.split("OPEN:")[1].strip()
            if target.startswith("http"): webbrowser.open(target)
            else: subprocess.Popen(target if sys.platform == 'win32' else ['open', target])
        return text

    def run(self):
        print(f"--- KD AI [{self.version}] ONLINE ---")
        self.talk("Nova Heart Core synchronized.")
        while True:
            cmd = self.take_command()
            if not cmd: continue
            if any(w in cmd for w in ['stop', 'exit']): break
            resp = self.call_gemini(cmd)
            self.talk(self.execute_advanced_actions(resp))

if __name__ == "__main__":
    KDAssistant().run()
