export interface Todo {
  id: number;
  text: string;
  status: 'todo' | 'inProgress' | 'completed';
  completedTime?: string;
  createTime: string;
}

class TodoAPI {
  private static instance: TodoAPI;
  private readonly baseURL = 'http://localhost:8080/api/v1';

  private constructor() {}

  static getInstance() {
    if (!TodoAPI.instance) {
      TodoAPI.instance = new TodoAPI();
    }
    return TodoAPI.instance;
  }

  async getAllTodos(): Promise<Todo[]> {
    const response = await fetch(`${this.baseURL}/todos`);
    if (!response.ok) {
      throw new Error('获取待办事项失败');
    }
    return response.json();
  }

  async addTodo(text: string): Promise<Todo> {
    const response = await fetch(`${this.baseURL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error('创建待办事项失败');
    }
    return response.json();
  }

  async updateTodoStatus(id: number, status: Todo['status']): Promise<void> {
    const response = await fetch(`${this.baseURL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('更新待办事项失败');
    }
  }

  async deleteTodo(id: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/todos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('删除待办事项失败');
    }
  }
}

export default TodoAPI;