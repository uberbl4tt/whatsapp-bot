const fs = require("fs");
const users = require("../json/users.json");
const path = require("path")

const USERS_PATH = path.join(__dirname, "../json/users.json")

async function writeUser(lid, username) {
  users[lid] = username;
  return fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

async function deleteUser(lid) {
  if (users[lid]) {
    delete users[lid];
  } else {
    throw new Error(`User ${lid} not found`);
  }
}

function getUser(lid) {
  return users[lid] || "kamu belum terdaftar! daftar dengan !registration nama"
}

module.exports = { users, writeUser, deleteUser, getUser };
