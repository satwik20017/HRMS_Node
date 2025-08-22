import express from 'express';
import { db, dbconnections } from './db/db';
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors({
    origin: "*"
}));

dbconnections()
app.listen(3000, () => {
    console.log(`Server running on port 3000`);
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.query("CALL sp_login_user(?, ?)", [
            email,
            password
        ]);

        if (rows[0].length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        res.json({ success: true, message: "Login successful!", user: rows[0][0] });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const [rows] = await db.query("CALL sp_register_user(?, ?, ?)", [
            username,
            email,
            password
        ]);

        res.json({ success: true, message: "User registered successfully!" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});


app.post("/forgot-password", async (req, res) => {
    const { email, otp, password } = req.body;

    try {
        await db.query("CALL sp_forgot_password(?, ?, ?)", [email, otp, password]);
        res.json({ success: true, message: "Password updated successfully!" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

app.post("/add-employee", async (req, res) => {
    const { name, email, department, phone, gender, nationality, bloodgroup, maritalstatus } = req.body;

    if (!name || !email || !department || !phone) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        await db.query(
            "CALL sp_add_employee(?, ?, ?, ?, ?, ?, ?, ?)",
            [name, email, department, phone, gender, nationality, bloodgroup, maritalstatus]
        );
        res.json({ success: true, message: "Employee added successfully" });
    } catch (err: any) {
        console.error("Error adding employee:", err.message);
        res.json({ success: false, error: err.message });
    }
});

// Get all employees
app.get("/employees", async (req, res) => {
    try {
        const [rows]: any = await db.query("CALL sp_get_employees()");
        // NOTE: mysql2 returns nested array for SP results
        res.json({ data: rows[0], length: rows[0].length });
    } catch (err: any) {
        console.error("Error fetching employees:", err.message);
        res.status(500).json({ message: "Failed to fetch employees" });
    }
});

// Get employee by ID
app.get("/employees/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [rows]: any = await db.query("CALL sp_get_employee_by_id(?)", [id]);

        if (rows[0].length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        return res.json({ data: rows[0][0] });
    } catch (err: any) {
        console.error("Error fetching employee:", err.message);
        return res.status(500).json({ message: "Failed to fetch employee" });
    }
});

app.delete("/deleteEmployee/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query("CALL sp_delete_employee(?)", [id]);

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
        });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: err.sqlMessage || "Error deleting employee",
        });
    }
});

app.put("/updateEmployee/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email, department, phone } = req.body;

    if (!name || !email || !department || !phone) {
        return res.status(400).json({ status: 400, message: "All fields are required" });
    }

    await db.query(`CALL sp_update_employee(?, ?, ?, ?, ?)`, [id, name, email, department, phone]);
    return res.status(200).json({
        success: true,
        message: 'Updated successfully'
    });
});