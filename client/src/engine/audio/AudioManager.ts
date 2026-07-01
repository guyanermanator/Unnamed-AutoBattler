/**
 * Audio manager for music and sound effects
 */
export class AudioManager {
  private music: HTMLAudioElement | null = null;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private muted: boolean = false;

  /**
   * Play background music
   */
  playMusic(audio: HTMLAudioElement, loop: boolean = true): void {
    if (this.music) {
      this.music.pause();
    }
    this.music = audio;
    this.music.loop = loop;
    this.music.volume = this.musicVolume;
    if (!this.muted) {
      this.music.play().catch(e => console.error('Failed to play music:', e));
    }
  }

  /**
   * Stop music
   */
  stopMusic(): void {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }

  /**
   * Play sound effect
   */
  playSfx(audio: HTMLAudioElement): void {
    if (this.muted) return;

    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = this.sfxVolume;
    clone.play().catch(e => console.error('Failed to play sfx:', e));

    // Clean up after playing
    clone.onended = () => {
      clone.remove();
    };
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music) {
      this.music.volume = this.musicVolume;
    }
  }

  /**
   * Set SFX volume
   */
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Mute/unmute all audio
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.music) {
      if (muted) {
        this.music.pause();
      } else {
        this.music.play().catch(e => console.error('Failed to resume music:', e));
      }
    }
  }

  /**
   * Toggle mute
   */
  toggleMute(): void {
    this.setMuted(!this.muted);
  }
}
