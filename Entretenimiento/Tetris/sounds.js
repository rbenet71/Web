class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.init();
    }
    
    init() {
        // Crear sonidos simples
        try {
            this.createSound('move', 200, 'square', 0.1);
            this.createSound('rotate', 300, 'sawtooth', 0.1);
            this.createSound('drop', 400, 'sine', 0.15);
            this.createSound('clear', [523.25, 659.25, 783.99], 'sine', 0.3);
            this.createSound('gameover', [220, 207.65, 196, 185], 'sine', 0.4);
        } catch (e) {
            console.log('AudioContext no disponible:', e);
            this.enabled = false;
        }
    }
    
    createSound(name, frequency, type, duration = 0.1) {
        this.sounds[name] = {
            play: (options = {}) => {
                if (!this.enabled) return;
                
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.type = options.type || type;
                    
                    if (Array.isArray(frequency)) {
                        // Para melodías
                        const now = audioContext.currentTime;
                        frequency.forEach((freq, index) => {
                            oscillator.frequency.setValueAtTime(freq, now + index * 0.1);
                        });
                    } else {
                        oscillator.frequency.value = options.frequency || frequency;
                    }
                    
                    gainNode.gain.setValueAtTime(options.volume || 0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + (options.duration || duration));
                    
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + (options.duration || duration));
                    
                    // Cerrar el contexto después de tocar
                    setTimeout(() => {
                        audioContext.close();
                    }, (options.duration || duration) * 1000 + 100);
                    
                } catch (e) {
                    console.log('Error al reproducir sonido:', e);
                }
            }
        };
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}