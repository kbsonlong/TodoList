import { useState, useEffect } from 'react'
import './App.css'
import { Todo } from './api'
import { TodoStorageFactory, TodoStorage } from './storage'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<Todo['status'] | 'all'>('all')
  const [storage, setStorage] = useState<TodoStorage | null>(null)

  useEffect(() => {
    const initDB = async () => {
      try {
        setLoading(true)
        const factory = TodoStorageFactory.getInstance()
        const storageInstance = await factory.initialize('indexedDB')
        setStorage(storageInstance)
        const todos = await storageInstance.getAllTodos()
        setTodos(todos)
        setError(null)
      } catch (err) {
        console.error('初始化失败:', err)
        setError('数据库初始化失败，请检查控制台以获取详细信息')
        // 如果初始化失败，尝试使用API作为备选存储方式
        try {
          const factory = TodoStorageFactory.getInstance()
          const storageInstance = await factory.initialize('api')
          setStorage(storageInstance)
          const todos = await storageInstance.getAllTodos()
          setTodos(todos)
          setError(null)
        } catch (fallbackErr) {
          console.error('备选存储初始化失败:', fallbackErr)
          setError('所有存储方式初始化失败，请检查网络连接或刷新页面重试')
        }
      } finally {
        setLoading(false)
      }
    }
    initDB()
  }, [])

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storage || !input.trim()) return
    try {
      const newTodo = await storage.addTodo(input.trim())
      setTodos([...todos, newTodo])
      setInput('')
      setError(null)
    } catch (err) {
      console.error('添加待办事项失败:', err)
      setError('添加待办事项失败，请稍后重试')
    }
  }

  const toggleTodo = async (id: number) => {
    if (!storage) return
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    const newStatus = todo.status === 'todo' ? 'inProgress' : todo.status === 'inProgress' ? 'completed' : 'todo'

    try {
      await storage.updateTodoStatus(id, newStatus)
      setTodos(todos.map(todo =>
        todo.id === id ? {
          ...todo,
          status: newStatus,
          completedTime: newStatus === 'completed' ? new Date().toISOString().slice(0, 16) : undefined
        } : todo
      ))
      setError(null)
    } catch (err) {
      console.error('更新待办事项状态失败:', err)
      setError('更新待办事项状态失败，请稍后重试')
    }
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const filteredTodos = todos.filter(todo => {
    const statusMatch = statusFilter === 'all' || todo.status === statusFilter;
    const dateMatch = (() => {
      const dateToCheck = statusFilter === 'completed' ? todo.completedTime :
        statusFilter === 'all' ? (todo.status === 'completed' ? todo.completedTime : todo.createTime) :
        todo.createTime;
  
      if (!dateToCheck) return !startDate && !endDate;
      if (!startDate && !endDate) return true;
  
      const checkDate = new Date(dateToCheck);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
  
      // 设置开始日期的时间为当天的开始（00:00:00）
      if (start) start.setHours(0, 0, 0, 0);
      // 设置结束日期的时间为当天的结束（23:59:59.999）
      if (end) end.setHours(23, 59, 59, 999);
  
      if (!start && end) return checkDate <= end;
      if (start && !end) return checkDate >= start;
      if (start && end) return checkDate >= start && checkDate <= end;
      return true;
    })();
    return statusMatch && dateMatch;
  });
  
  const paginatedTodos = filteredTodos.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredTodos.length / pageSize);
  const deleteTodo = async (id: number) => {
    if (!storage) return
    try {
      await storage.deleteTodo(id)
      setTodos(todos.filter(todo => todo.id !== id))
      setError(null)
    } catch (err) {
      console.error('删除待办事项失败:', err)
      setError('删除待办事项失败，请稍后重试')
    }
  }

  if (loading) {
    return <div className="todo-app"><h2>加载中...</h2></div>
  }

  if (error) {
    return <div className="todo-app"><h2 style={{color: 'red'}}>{error}</h2></div>
  }

  return (
    <div className="todo-app">
      <h1>Todo List</h1>
      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="添加新任务..."
          className="todo-input"
        />
        <button type="submit" className="add-button">添加</button>
      </form>
      <div className="filter-section">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Todo['status'] | 'all')}
          className="status-filter"
        >
          <option value="all">全部状态</option>
          <option value="todo">待开始</option>
          <option value="inProgress">进行中</option>
          <option value="completed">已完成</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="date-filter"
          placeholder="开始日期"
        />
        <span className="date-separator">至</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="date-filter"
          placeholder="结束日期"
        />
      </div>
      <div className="todo-table">
        <div className="todo-header">
          <div className="todo-cell">任务</div>
          <div className="todo-cell">状态</div>
          <div className="todo-cell">创建时间</div>
          <div className="todo-cell">完成时间</div>
          <div className="todo-cell">持续时间</div>
          <div className="todo-cell">操作</div>
        </div>
        {paginatedTodos.map(todo => (
          <div key={todo.id} className={`todo-row ${todo.status === 'completed' ? 'completed' : ''}`}>
            <div className="todo-cell todo-text">{todo.text}</div>
            <div className="todo-cell">
              <button 
                onClick={() => toggleTodo(todo.id)} 
                className={`status-button ${todo.status}`}
              >
                {todo.status === 'todo' ? '待开始' : todo.status === 'inProgress' ? '进行中' : '完成'}
              </button>
            </div>
            <div className="todo-cell completed-time">{todo.createTime}</div>
            <div className="todo-cell completed-time">
              {todo.status === 'completed' && todo.completedTime ? todo.completedTime : '-'}
            </div>
            <div className="todo-cell completed-time">
              {todo.status === 'completed' && todo.completedTime ? 
                (() => {
                  const start = new Date(todo.createTime);
                  const end = new Date(todo.completedTime);
                  const diffMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
                  const hours = Math.floor(diffMinutes / 60);
                  const minutes = diffMinutes % 60;
                  return `${hours}小时${minutes}分钟`;
                })() : '-'}
            </div>
            <div className="todo-cell">
              <button onClick={() => deleteTodo(todo.id)} className="delete-button">删除</button>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination-controls">
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
            setCurrentPage(1) // 重置到第一页
          }}
          className="page-size-select"
        >
          <option value="5">5条/页</option>
          <option value="10">10条/页</option>
          <option value="20">20条/页</option>
          <option value="50">50条/页</option>
        </select>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="page-button"
        >
          上一页
        </button>
        <span className="page-info">{currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="page-button"
        >
          下一页
        </button>
      </div>
    </div>
  )
}

export default App
