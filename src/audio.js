export class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.musicEnabled = true;
        this.initializeSounds();
    }

    initializeSounds() {
        // Create audio elements
        this.createSound('thruster', 'data:audio/wav;base64,UklGRh4BAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQABAAAAAAAA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', true);
        this.createSound('explosion', 'data:audio/wav;base64,UklGRh4BAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQABAAAAAAAA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
        this.createSound('landing', 'data:audio/wav;base64,UklGRh4BAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQABAAAAAAAA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
        this.createSound('alert', 'data:audio/wav;base64,UklGRh4BAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQABAAAAAAAA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
        
        // Create background music
        this.createSound('music', 'data:audio/wav;base64,UklGRh4BAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQABAAAAAAAA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', true);
    }

    createSound(name, src, loop = false) {
        const audio = new Audio(src);
        audio.loop = loop;
        this.sounds.set(name, audio);
    }

    playSound(name, volume = 1) {
        const sound = this.sounds.get(name);
        if (sound) {
            sound.volume = volume;
            sound.currentTime = 0;
            sound.play().catch(() => {
                // Ignore autoplay errors
            });
        }
    }

    stopSound(name) {
        const sound = this.sounds.get(name);
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }

    playThruster(intensity) {
        const thruster = this.sounds.get('thruster');
        if (thruster) {
            thruster.volume = Math.min(intensity * 0.5, 1);
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        const music = this.sounds.get('music');
        if (music) {
            if (this.musicEnabled) {
                music.play().catch(() => {});
            } else {
                music.pause();
            }
        }
    }

    playExplosion() {
        this.playSound('explosion', 0.8);
    }

    playLanding() {
        this.playSound('landing', 0.6);
    }

    playAlert() {
        this.playSound('alert', 0.4);
    }
} 