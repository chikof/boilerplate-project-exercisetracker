const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const { generateId } = require('./utils')
const multer = require('multer')
require('dotenv').config()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer().array());
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// {
//   username: "fcc_test",
//   _id: "5fb5853f734231456ccb3b05"
// }
const users = new Map();

// {
//   username: "fcc_test",
//   count: 1,
//   _id: "5fb5853f734231456ccb3b05",
//   log: [{
//     description: "test",
//     duration: 60,
//     date: "Mon Jan 01 1990",
//   }]
// }
const logs = new Map();

// {
//   username: "fcc_test",
//   description: "test",
//   duration: 60,
//   date: "Mon Jan 01 1990",
//   _id: "5fb5853f734231456ccb3b05"
// }
const exercises = new Map();

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (users.has(username)) {
    return res.json({ error: "User already exists" });
  }

  const newUser = { username, _id: generateId() };
  users.set(username, newUser);

  return res.json(newUser);
})

app.get("/api/users", (req, res) => {
  return res.json(Array.from(users.values()));
})

app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration, date } = req.body;
  const { _id } = req.params;

  // We fast asf boi
  const user = Array.from(users.values())
    .reduce((acc, user) => user._id === _id ? user : acc, {});

  if (!user) {
    return res.json({ error: "User not found" });
  }

  const log = {
    description,
    duration: parseInt(duration),
    date: (date ? new Date(date) : new Date()).toDateString(),
  }

  const userLog = logs.get(user.username) || { count: 0, log: [] };

  userLog.count++;
  userLog.log.push(log);

  logs.set(user.username, userLog);
  exercises.set(log._id, { ...log, username: user.username, _id });

  return res.json({
    ...user,
    ...log
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = Array.from(users.values())
    .reduce((acc, user) => user._id === _id ? user : acc, {});


  if (!user) {
    return res.json({ error: "User not found" });
  }

  const userLog = logs.get(user.username) || { count: 0, log: [] };
  let filteredLogs = userLog.log;

  if (from || to) {
    filteredLogs = filteredLogs
      .filter(exercise => {
        const exerciseDate = new Date(exercise.date);

        if (from && exerciseDate < new Date(from)) {
          return false;
        }

        if (to && exerciseDate > new Date(to)) {
          return false;
        }

        return true;
      });
  }

  if (limit) {
    filteredLogs = filteredLogs.slice(0, limit);
  }

  return res.json({
    ...user,
    count: userLog.count,
    log: filteredLogs
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
