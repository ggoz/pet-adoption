package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type Pet struct {
	ID          int    `json:"id" gorm:"primaryKey;autoIncrement:false"`
	Name        string `json:"name"`
	Picture     string `json:"picture"`
	ImageAuthor string `json:"imageAuthor"`
	Age         int    `json:"age"`
	Breed       string `json:"breed"`
	Location    string `json:"location"`
	Description string `json:"description"`
}

func setupDatabase() *gorm.DB {
	dsn := "root:123321@tcp(127.0.0.1:3306)/petadoption?charset=utf8mb4&parseTime=True&loc=Local" // 修改为您的数据库信息
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect to database")
	}

	// 自动迁移表结构
	db.AutoMigrate(&Pet{})

	// 设置 AUTO_INCREMENT 从 0 开始
	db.Exec("ALTER TABLE pets AUTO_INCREMENT = 0;")
	// 插入初始数据
	initialPets := []Pet{
		{
			ID:          0,
			Name:        "Frieda",
			Picture:     "https://images.unsplash.com/photo-1600682011352-e448301668e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1348&q=40",
			ImageAuthor: "Photo by https://unsplash.com/@anotherleaf",
			Age:         3,
			Breed:       "Scottish Terrier",
			Location:    "Lisco, Alabama",
			Description: "Frieda is a spunky Scottish Terrier with a curious personality. She loves to explore her surroundings and always keeps her owners on their toes.",
		},
		{
			ID:          1,
			Name:        "Rocky",
			Picture:     "https://images.unsplash.com/photo-1537019575197-df34a13f342c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1338&q=40",
			ImageAuthor: "Photo by https://unsplash.com/@annadudkova",
			Age:         2,
			Breed:       "German Shepherd",
			Location:    "Burlington, Vermont",
			Description: "Rocky is a loyal and obedient German Shepherd who will do anything to protect his family. He loves to play fetch and go on long walks.",
		},
		{
			ID:          2,
			Name:        "Buddy",
			Picture:     "https://images.unsplash.com/photo-1612774412771-005ed8e861d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1340&q=40",
			ImageAuthor: "Photo by https://unsplash.com/@enisyavuz",
			Age:         1,
			Breed:       "Golden Retriever",
			Location:    "Tulsa, Oklahoma",
			Description: "Buddy is a playful and affectionate Golden Retriever who loves to snuggle with his owners. He also enjoys going for runs and playing in the park.",
		},
		{
			ID:          3,
			Name:        "Maggie",
			Picture:     "https://images.unsplash.com/photo-1605244863941-3a3ed921c60d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1340&q=40",
			ImageAuthor: "Photo by https://unsplash.com/ko/@stevenvanelk",
			Age:         4,
			Breed:       "Poodle",
			Location:    "Asheville, North Carolina",
			Description: "Maggie is a cute and cuddly Poodle who loves to be pampered. She enjoys going for walks and playing with her toys, but also enjoys lounging around and getting lots of attention from her humans. Maggie has a sweet and gentle personality and is always ready to make new friends.",
		},
		{
			ID:          4,
			Name:        "Zeus",
			Picture:     "https://images.unsplash.com/photo-1558349699-1e1c38c05eeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1340&q=40",
			ImageAuthor: "Photo by https://unsplash.com/@helelucy",
			Age:         5,
			Breed:       "Boxer",
			Location:    "Phoenix, Arizona",
			Description: "Zeus is a happy-go-lucky Boxer who loves to play and go for long walks. He has a big personality and is always the life of the party. Despite his size, he thinks he is a lap dog and loves to cuddle with his humans.",
		},
	}

	// 检查是否需要插入初始数据
	if len(initialPets) > 0 {
		for _, pet := range initialPets {
			db.FirstOrCreate(&pet, Pet{ID: pet.ID})
		}
	}

	return db
}

func main() {
	db := setupDatabase()
	r := gin.Default()

	// CORS 中间件配置
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},                            // 允许所有域名访问，可以根据需要限制
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"}, // 允许的 HTTP 方法
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,           // 允许携带凭证
		MaxAge:           12 * time.Hour, // 预检请求的缓存时间
	}))

	// 获取所有宠物
	r.GET("/pets", func(c *gin.Context) {
		var pets []Pet
		db.Find(&pets)
		c.JSON(http.StatusOK, pets)
	})

	// 启动服务器
	r.Run(":8080")
}
