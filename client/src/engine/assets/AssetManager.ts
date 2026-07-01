/**
 * Asset manager for loading and caching game assets
 */
export class AssetManager {
  private images: Map<string, HTMLImageElement> = new Map();
  private audio: Map<string, HTMLAudioElement> = new Map();
  private json: Map<string, any> = new Map();
  private loading: Set<string> = new Set();

  /**
   * Load an image
   */
  async loadImage(path: string): Promise<HTMLImageElement> {
    if (this.images.has(path)) {
      return this.images.get(path)!;
    }

    if (this.loading.has(path)) {
      // Wait for existing load
      while (this.loading.has(path)) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return this.images.get(path)!;
    }

    this.loading.add(path);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(path, img);
        this.loading.delete(path);
        resolve(img);
      };
      img.onerror = () => {
        this.loading.delete(path);
        reject(new Error(`Failed to load image: ${path}`));
      };
      img.src = path;
    });
  }

  /**
   * Load audio
   */
  async loadAudio(path: string): Promise<HTMLAudioElement> {
    if (this.audio.has(path)) {
      return this.audio.get(path)!;
    }

    const audio = new Audio(path);
    await audio.load();
    this.audio.set(path, audio);
    return audio;
  }

  /**
   * Load JSON data
   */
  async loadJSON<T = any>(path: string): Promise<T> {
    if (this.json.has(path)) {
      return this.json.get(path);
    }

    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${path}`);
    }
    const data = await response.json();
    this.json.set(path, data);
    return data;
  }

  /**
   * Get cached image
   */
  getImage(path: string): HTMLImageElement | undefined {
    return this.images.get(path);
  }

  /**
   * Get cached audio
   */
  getAudio(path: string): HTMLAudioElement | undefined {
    return this.audio.get(path);
  }

  /**
   * Get cached JSON
   */
  getJSON<T = any>(path: string): T | undefined {
    return this.json.get(path);
  }

  /**
   * Clear all cached assets
   */
  clear(): void {
    this.images.clear();
    this.audio.clear();
    this.json.clear();
  }
}
