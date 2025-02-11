package main

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// getTodos 获取所有待办事项
func getTodos(c *gin.Context) {
	var todos []Todo
	result := db.Find(&todos)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取待办事项失败"})
		return
	}
	c.JSON(http.StatusOK, todos)
}

// createTodo 创建新的待办事项
func createTodo(c *gin.Context) {
	var todo Todo
	if err := c.ShouldBindJSON(&todo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求数据"})
		return
	}

	// 设置创建时间
	todo.CreateTime = time.Now().Format("2006-01-02T15:04")
	todo.Status = "todo" // 设置默认状态

	result := db.Create(&todo)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建待办事项失败"})
		return
	}

	c.JSON(http.StatusCreated, todo)
}

// updateTodo 更新待办事项状态
func updateTodo(c *gin.Context) {
	id := c.Param("id")
	var todo Todo
	var updateData struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求数据"})
		return
	}

	// 查找待办事项
	if err := db.First(&todo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "待办事项不存在"})
		return
	}

	// 更新状态
	todo.Status = updateData.Status
	if updateData.Status == "completed" {
		completedTime := time.Now().Format("2006-01-02T15:04")
		todo.CompletedTime = &completedTime
	} else {
		todo.CompletedTime = nil
	}

	if err := db.Save(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新待办事项失败"})
		return
	}

	c.JSON(http.StatusOK, todo)
}

// deleteTodo 删除待办事项
func deleteTodo(c *gin.Context) {
	id := c.Param("id")
	result := db.Delete(&Todo{}, id)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除待办事项失败"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "待办事项不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
