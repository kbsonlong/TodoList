import { useState, useEffect } from 'react'
import './App.css'
import TodoDB, { Todo } from './db'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<Todo['status'] | 'all'>('all')

  useEffect(() => {
    const initDB = async () => {
      try {
        setLoading(true)
        const db = await TodoDB.getInstance()
        const todos = await db.getAllTodos()
        setTodos(todos)
        setError(null)
      } catch (err) {
        console.error('初始化失败:', err)
        setError('数据库初始化失败，请检查控制台以获取详细信息')
      } finally {
        setLoading(false)
      }
    }
    initDB()
  }, [])

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      const db = await TodoDB.getInstance()
      const newTodo = await db.addTodo(input.trim())
      setTodos([...todos, newTodo])
      setInput('')
    }
  }

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    const newStatus = todo.status === 'todo' ? 'inProgress' : todo.status === 'inProgress' ? 'completed' : 'todo'

    const db = await TodoDB.getInstance()
    await db.updateTodoStatus(id, newStatus)

    setTodos(todos.map(todo =>
      todo.id === id ? {
        ...todo,
        status: newStatus,
        completedTime: newStatus === 'completed' ? new Date().toISOString().slice(0, 16) : undefined
      } : todo
    ))
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
    const db = await TodoDB.getInstance()
    await db.deleteTodo(id)
    setTodos(todos.filter(todo => todo.id !== id))
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
