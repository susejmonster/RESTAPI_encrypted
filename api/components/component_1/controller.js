import * as db from './routes.js'
import express from 'express'
const app = express()
const port = 3000
import cors from 'cors';
import decryptMiddleware from './encrypt.js';

app.use(express.json());
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);


app.use('/', decryptMiddleware);

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
});
app.get('/users', db.getUsers);
app.post('/users', db.createEmployee);
app.get('/eeid', db.gett_eeid);
app.post('/eeid' , db.post_eeid);


app.listen(port, () => {
  console.log(`App running on port ${port}.`);
})

