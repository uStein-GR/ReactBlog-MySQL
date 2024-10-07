import {db} from "../db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


export const register = (req, res) => {
    
    // Check existing user
    const q = "SELECT * FROM users WHERE email = ? OR username = ?"

    db.query(q,[req.body.email, req.body.username], (err,data) => {
        if(err) return res.json(err)
        if(data.length) return res.status(409).json("User already exists!")

        // Hash the password and create a user
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const q = "INSERT INTO users(`username`,`email`,`password`) VALUES (?)"
        const vlaues = [
            req.body.username,
            req.body.email,
            hash
        ]

        db.query(q, [vlaues], (err,data) => {
            if(err) return res.json(err)
                return res.status(200).json("User has been created..")
        })
    })
}
export const login = (req, res) => {
    // Check user

    const q = "SELECT * FROM users WHERE username = ?"

    db.query(q, [req.body.username], (err,data) =>{
        if(err) return res.json(err)
        if(data.length === 0) return res.status(404).json("User not found!")

    // Check password 
    const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password); // true

    if(!isPasswordCorrect) return res.status(400).json("Wrong username or password!")

    const token = jwt.sign({id: data[0].id}, "jwtkey")
    const { password, ...other } = data[0];

    res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production with HTTPS
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // SameSite None for cross-origin
        domain: "localhost", // Specify the domain to allow cross-port usage
        path: "/",
    }).status(200).json(other);
})

}
export const logout = (req, res) => {
    res.clearCookie("access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production with HTTPS
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // SameSite None for cross-origin
        domain: "localhost", // Match the domain where the cookie was set
        path: '/', // Ensure the same path is used to clear the cookie
    }).status(200).json("User has been logged out.");
}