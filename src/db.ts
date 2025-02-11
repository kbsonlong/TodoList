export interface Todo {
  id: number;
  text: string;
  status: 'todo' | 'inProgress' | 'completed';
  completedTime?: string;
  createTime: string;
}

class TodoDB {
  private static instance: TodoDB;
  private db!: IDBDatabase;
  private readonly DB_NAME = 'todo-db';
  private readonly STORE_NAME = 'todos';
  private readonly DB_VERSION = 1;

  private constructor() {}

  static async getInstance() {
    if (!TodoDB.instance) {
      TodoDB.instance = new TodoDB();
      await TodoDB.instance.initialize();
    }
    return TodoDB.instance;
  }

  private async initialize() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('数据库打开失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('数据库连接成功');
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        console.log('正在创建/更新数据库...');
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
        console.log('数据库创建/更新成功');
      };
    });
  }

  private getStore(mode: IDBTransactionMode = 'readonly') {
    const transaction = this.db.transaction(this.STORE_NAME, mode);
    return transaction.objectStore(this.STORE_NAME);
  }

  async getAllTodos(): Promise<Todo[]> {
    return new Promise((resolve, reject) => {
      const request = this.getStore().getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addTodo(text: string): Promise<Todo> {
    const todo: Todo = {
      id: Date.now(),
      text,
      status: 'todo',
      createTime: new Date().toISOString().slice(0, 16)
    };

    return new Promise((resolve, reject) => {
      const request = this.getStore('readwrite').add(todo);
      request.onsuccess = () => resolve(todo);
      request.onerror = () => reject(request.error);
    });
  }

  async getTodoById(id: number): Promise<Todo> {
    return new Promise((resolve, reject) => {
      const request = this.getStore().get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTodoStatus(id: number, status: Todo['status']): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('readwrite');
      const request = store.get(id);

      request.onsuccess = () => {
        const todo = request.result;
        if (todo) {
          todo.status = status;
          todo.completedTime = status === 'completed' ? new Date().toISOString().slice(0, 16) : undefined;
          store.put(todo).onsuccess = () => resolve();
        } else {
          reject(new Error('Todo not found'));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTodo(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.getStore('readwrite').delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export default TodoDB;