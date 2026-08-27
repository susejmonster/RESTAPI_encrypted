import pg from 'pg'
const { Pool } = pg
import 'dotenv/config'
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
})

const getUsers = async (request, response) => {
  try {
    const results = await pool.query('SELECT * FROM employees ORDER BY employeeid ASC')
    response.status(200).json(results.rows)
  } catch (error) {
    throw error
  }
}


const createEmployee = async (req, res) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    departmentId,
    salary,
    hireDate,
  } = req.body;

  try {
    const query = `
      INSERT INTO Employees (FirstName, LastName, DateOfBirth, Gender, DepartmentID, Salary, HireDate)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      firstName,
      lastName,
      dateOfBirth,
      gender,
      departmentId,
      salary,
      hireDate,
    ];

    const results = await pool.query(query, values);

    res.status(201).json({
      message: `Employee added with ID: ${results.rows[0].employeeid}`,
      employee: results.rows[0],
    });
  } catch (error) {
    console.error('Error creating employee:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const gett_eeid = async(req,res)=>{
    const{
        employeeid,
        transactiondate,
        } = req.query
        
    
    try{
        let query = `
            SELECT 
            t.transactionid,
            t.employeeid,
            t.amount,
            t.transactiondate,
            t.description,
            tc.categoryname,
            tc.categorytype
            FROM transactions t
            JOIN transactioncategories tc ON t.categoryid = tc.categoryid
            WHERE t.employeeid = $1
            `;
        const values = [employeeid];

        // Optional date filter if transactiondate is provided
        if (transactiondate) {
            query += ` AND t.transactiondate = $2`;
            values.push(transactiondate);
        }
        query += ` ORDER BY t.transactiondate DESC`;
        const results = await pool.query(query, values);

        res.status(200).json(results.rows);
        } catch (error) {
        console.error('Error fetching employee transactions:', error.message);
        res.status(500).json({ error: error.message });
  }
}

const post_eeid = async (req, res) => {
  const {
    employeeid,
    transactiondate,
    amount,
    description,
    categoryname,
    categorytype,
    categoryid 
  } = req.body;

  try {
   
    if (!employeeid) {
      return res.status(400).json({ error: "employeeid is missing!" });
    }

    
    const finalCategoryId = categoryid || 1; 

    const query = `
      INSERT INTO Transactions (EmployeeID, CategoryID, Amount, TransactionDate, Description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    // 4. Pass the lowercase variables from req.body into the query values
    const values = [employeeid, finalCategoryId, amount, transactiondate, description];
    const results = await pool.query(query, values);

    res.status(201).json({
      message: `Transaction added with ID: ${results.rows[0].transactionid}`,
      transaction: results.rows[0],
    });
  } catch (error) {
    console.error('Error creating transaction:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export {
  getUsers,
  createEmployee,
  gett_eeid,
  post_eeid
}