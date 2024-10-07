import mysql from "mysql"

export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "g654321",
    database: "blogsql"
})

// User and Privileges (User: Prisma  Password Gustave654321)