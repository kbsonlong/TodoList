export interface Todo {
  id: number;
  text: string;
  status: 'todo' | 'inProgress' | 'completed';
  completedTime?: string;
  createTime: string;
}

export interface TodoStorage {
  getAllTodos(): Promise<Todo[]>;
  addTodo(text: string): Promise<Todo>;
  getTodoById(id: number): Promise<Todo>;
  updateTodoStatus(id: number, status: Todo['status']): Promise<void>;
  deleteTodo(id: number): Promise<void>;
}

export type StorageType = 'indexedDB' | 'api';

export class TodoStorageFactory {
  private static instance: TodoStorageFactory;
  private storage: TodoStorage | null = null;
  private storageType: StorageType = 'indexedDB';
  private initializationPromise: Promise<TodoStorage> | null = null;
  private isInitializing = false;

  private constructor() {}

  private reset() {
    this.storage = null;
    this.initializationPromise = null;
    this.isInitializing = false;
  }

  static getInstance() {
    if (!TodoStorageFactory.instance) {
      TodoStorageFactory.instance = new TodoStorageFactory();
    }
    return TodoStorageFactory.instance;
  }

  async initialize(type: StorageType = 'indexedDB', retryCount = 3): Promise<TodoStorage> {
    if (this.isInitializing) {
      if (!this.initializationPromise) {
        throw new Error('初始化状态异常');
      }
      return this.initializationPromise;
    }

    if (this.storage && type === this.storageType) {
      return this.storage;
    }

    this.isInitializing = true;
    this.initializationPromise = this.initializeInternal(type, retryCount);

    try {
      const storage = await this.initializationPromise;
      return storage;
    } catch (error) {
      this.reset();
      throw error;
    }
  }

  private async initializeInternal(type: StorageType, retryCount: number): Promise<TodoStorage> {
    try {
      this.storageType = type;
      if (type === 'indexedDB') {
        const { default: TodoDB } = await import('./db');
        this.storage = await TodoDB.getInstance();
      } else {
        const { default: TodoAPI } = await import('./api');
        this.storage = await TodoAPI.getInstance();
      }
      if (!this.storage) {
        throw new Error('存储初始化失败');
      }
      return this.storage;
    } catch (error) {
      if (retryCount > 0) {
        console.warn(`存储初始化失败，正在重试... (剩余重试次数: ${retryCount - 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.initializeInternal(type, retryCount - 1);
      }
      throw new Error(`存储初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async switchStorage(type: StorageType): Promise<TodoStorage> {
    if (this.isInitializing) {
      throw new Error('存储正在初始化中，请稍后再试');
    }
    
    if (type === this.storageType && this.storage) {
      return this.storage;
    }

    this.reset();
    return this.initialize(type);
  }

  getStorage() {
    if (!this.storage) {
      throw new Error('存储未初始化，请先调用 initialize 方法');
    }
    return this.storage;
  }

  getCurrentStorageType() {
    return this.storageType;
  }
}