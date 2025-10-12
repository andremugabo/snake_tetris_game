// Sound Management System
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = localStorage.getItem('soundEnabled') !== 'false'; // Persist preference
        this.volume = parseFloat(localStorage.getItem('soundVolume')) || 0.4;
        this.audioContext = null;
        this.isInitialized = false;
        this.initSounds();
    }
    
    initSounds() {
        try {
            // Create Web Audio API context (lazily on first use)
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                console.warn('Web Audio API not supported');
                return;
            }
            
            // Define sound frequencies and durations
            this.soundPresets = {
                eat: { frequency: 800, duration: 0.1, type: 'sine' },
                gameover: { frequency: 200, duration: 0.5, type: 'sawtooth' },
                rotate: { frequency: 400, duration: 0.05, type: 'square' },
                lineclear: { frequency: 600, duration: 0.3, type: 'triangle' },
                move: { frequency: 300, duration: 0.05, type: 'sine' },
                levelup: { frequency: 1000, duration: 0.5, type: 'sine' },
            };
        } catch (error) {
            console.error('Failed to initialize sound system:', error);
        }
    }
    
    // Initialize AudioContext on first user interaction
    ensureAudioContext() {
        if (this.audioContext) {
            // Resume if suspended (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            return true;
        }
        
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Failed to create AudioContext:', error);
            return false;
        }
    }
    
    playSound(soundName) {
        if (!this.enabled || !this.soundPresets) return;
        
        const preset = this.soundPresets[soundName];
        if (!preset) {
            console.warn(`Sound preset "${soundName}" not found`);
            return;
        }
        
        // Ensure AudioContext exists and is running
        if (!this.ensureAudioContext()) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(
                preset.frequency, 
                this.audioContext.currentTime
            );
            oscillator.type = preset.type;
            
            // Set initial volume
            gainNode.gain.setValueAtTime(
                this.volume, 
                this.audioContext.currentTime
            );
            
            // Fade out to prevent clicks
            gainNode.gain.exponentialRampToValueAtTime(
                0.001, 
                this.audioContext.currentTime + preset.duration
            );
            
            const startTime = this.audioContext.currentTime;
            const stopTime = startTime + preset.duration;
            
            oscillator.start(startTime);
            oscillator.stop(stopTime);
            
            // Clean up after sound finishes
            oscillator.onended = () => {
                try {
                    oscillator.disconnect();
                    gainNode.disconnect();
                } catch (e) {
                    // Ignore disconnect errors (nodes may already be disconnected)
                }
            };
            
        } catch (error) {
            console.error('Sound playback error:', error);
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        
        // Persist preference
        localStorage.setItem('soundEnabled', this.enabled);
        
        // Update UI if elements exist
        const soundIcon = document.getElementById('sound-icon');
        const soundStatus = document.getElementById('sound-status');
        
        if (soundIcon) {
            soundIcon.textContent = this.enabled ? '🔊 Sound On' : '🔇 Sound Off';
        }
        
        if (soundStatus) {
            soundStatus.textContent = this.enabled ? 'Enabled' : 'Disabled';
        }
        
        // Play test sound when enabling
        if (this.enabled) {
            this.playSound('move');
        }
        
        return this.enabled;
    }
    
    setVolume(volume) {
        // Clamp between 0 and 1
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Persist preference
        localStorage.setItem('soundVolume', this.volume);
        
        return this.volume;
    }
    
    // Add a method to play a sequence of sounds
    playSoundSequence(sounds, interval = 100) {
        if (!Array.isArray(sounds)) return;
        
        sounds.forEach((sound, index) => {
            setTimeout(() => this.playSound(sound), index * interval);
        });
    }
    
    // Update UI on initialization
    updateUI() {
        const soundIcon = document.getElementById('sound-icon');
        const soundStatus = document.getElementById('sound-status');
        
        if (soundIcon) {
            soundIcon.textContent = this.enabled ? '🔊 Sound On' : '🔇 Sound Off';
        }
        
        if (soundStatus) {
            soundStatus.textContent = this.enabled ? 'Enabled' : 'Disabled';
        }
    }
    
    // Cleanup method
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.isInitialized = false;
    }
}

// Create global instance
const soundManager = new SoundManager();

// Global toggle function
function toggleSound() {
    return soundManager.toggle();
}

// Initialize on first user interaction
document.addEventListener('click', () => {
    soundManager.ensureAudioContext();
}, { once: true });

// Update UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        soundManager.updateUI();
    });
} else {
    soundManager.updateUI();
}

// Export for use in modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SoundManager, soundManager, toggleSound };
}