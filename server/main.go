package main

import (
	"log"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"gorm.io/gorm"
	"gorm.io/driver/sqlite"
)

// Todo 模型定义
type Todo struct {
	ID           uint   `json:"id" gorm:"primaryKey"`
	Text         string `json:"text"`
	Status       string `json:"status" gorm:"default:'todo'"`
	CreateTime   string `json:"createTime"`
	CompletedTime *string `json:"completedTime,omitempty"`
}

var db *gorm.DB

func main() {
	// 初始化数据库连接
	var err error
	db, err = gorm.Open(sqlite.Open("todos.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	// 自动迁移数据库结构
	db.AutoMigrate(&Todo{})

	// 创建Gin实例
	r := gin.Default()

	// 配置CORS
	r.Use(cors.Default())

	// 路由组
	v1 := r.Group("/api/v1")
	{
		v1.GET("/todos", getTodos)
		v1.POST("/todos", createTodo)
		v1.PUT("/todos/:id", updateTodo)
		v1.DELETE("/todos/:id", deleteTodo)
	}

	// 启动服务器
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}