const { constants } = require('buffer')
const fs = require('fs')

// Check folder eather exist or not
const dirPath = './data'
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath)
}


// Check file eather exist or not
const dataPath = './data/contacts.json'

if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, '[]', 'utf-8')
}

// Data.json Caller
const getData = () => {
  let file = fs.readFileSync('data/contacts.json', 'utf-8')
  let data = JSON.parse(file)

  return data
}

// Detail data function
const detailData = (name) => {
  const data = getData()

  const contact = data.find((e) => e.name.toLowerCase() === name.toLowerCase())

  return contact
}

// Write data to contacts.json
const saveData = (contacts) => {
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts))
}

// Add new data function
const addData = (contact) => {
  const data = getData()

  data.push(contact)
  saveData(data)
}

// Duplicate data check function
const duplicateCheck = (value) => {
  const data = getData()

  return data.find((contact) => contact.name === value)
}


// Update data function
const updateData = (value) => {
  const data = getData()
  const filteredData = data.filter((contact) => contact.name !== value.name)
  
  delete value.oldName
  filteredData.push(value)
  
  saveData(filteredData)
}

// Delete data function
const deleteData = (value) => {
  const data = getData()
  const filteredData = data.filter((contact) => contact.name !== value)
  saveData(filteredData)
}

module.exports = { getData, detailData, addData, duplicateCheck, deleteData, updateData }
