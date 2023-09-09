import turtle

# 基础设置
turtle.color('red')
turtle.pensize(10)
turtle.speed(10)
turtle.st()
turtle.isvisible()

# 获取初始坐标
print(turtle.position)
print(turtle.xcor())
print(turtle.ycor())

# 画圆 及内切正四边形
turtle.circle(100)
turtle.circle(100,360,4)

# 画垂直直线
turtle.left(90)
turtle.forward(200)
turtle.backward(100)

# 画水平直线
turtle.left(90)
turtle.forward(100)
turtle.backward(200)

# 获取坐标
print(turtle.xcor())
print(turtle.ycor())

# 可以正常关闭窗口
turtle.mainloop()
