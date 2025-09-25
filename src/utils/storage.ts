// 本地存储工具类
export class LocalStorage {
  private static prefix = 'productivity_notebook_';

  // 获取完整的存储键名
  private static getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  // 存储数据
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serializedValue);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  // 获取数据
  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) {
        return defaultValue || null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue || null;
    }
  }

  // 删除数据
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  // 清空所有应用数据
  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // 获取存储大小（字节）
  static getStorageSize(): number {
    let total = 0;
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            total += key.length + value.length;
          }
        }
      });
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
    }
    return total;
  }

  // 检查是否支持localStorage
  static isSupported(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

// 数据同步工具类
export class DataSync {
  private static syncInterval: NodeJS.Timeout | null = null;
  private static syncCallbacks: Map<string, () => void> = new Map();

  // 注册同步回调
  static registerSyncCallback(key: string, callback: () => void): void {
    this.syncCallbacks.set(key, callback);
  }

  // 取消注册同步回调
  static unregisterSyncCallback(key: string): void {
    this.syncCallbacks.delete(key);
  }

  // 开始自动同步
  static startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncCallbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error('Sync callback failed:', error);
        }
      });
    }, intervalMs);
  }

  // 停止自动同步
  static stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // 手动触发同步
  static triggerSync(): void {
    this.syncCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Manual sync failed:', error);
      }
    });
  }
}

// 数据备份和恢复
export class DataBackup {
  // 导出所有数据
  static exportData(): string {
    const data: Record<string, any> = {};
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(LocalStorage['prefix'])) {
          const cleanKey = key.replace(LocalStorage['prefix'], '');
          const value = localStorage.getItem(key);
          if (value) {
            data[cleanKey] = JSON.parse(value);
          }
        }
      });

      return JSON.stringify({
        version: '1.0',
        timestamp: new Date().toISOString(),
        data
      }, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('数据导出失败');
    }
  }

  // 导入数据
  static importData(jsonString: string): void {
    try {
      const backup = JSON.parse(jsonString);
      
      if (!backup.data || typeof backup.data !== 'object') {
        throw new Error('Invalid backup format');
      }

      // 清空现有数据
      LocalStorage.clear();

      // 导入新数据
      Object.entries(backup.data).forEach(([key, value]) => {
        LocalStorage.setItem(key, value);
      });

    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('数据导入失败：格式不正确');
    }
  }

  // 下载备份文件
  static downloadBackup(): void {
    try {
      const data = this.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `productivity_notebook_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download backup:', error);
      throw new Error('备份下载失败');
    }
  }
}