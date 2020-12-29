const { request, response } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
morgan.token('data', (req, res) => req.method === 'POST' ? JSON.stringify(req.body) : ' ')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

const generateId = () => {
    return Math.round(Math.random() * 100000)
}

let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
]

// GET all the persons
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

// GET the information about the get request
app.get('/info', (request, response) => {
    const info = `<div>Phonebook has info for ${persons.length} people</div>
                  <div>${new Date()}</div>`

    response.send(info)
})

// GET information about a specific person
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person){
        response.json(person)
    } else {
        response.status(404).end()
    }

})

// DELETE one person from the phonebook
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

// POST a new person to the phonebook
app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name){
        return response.status(400).json({error: 'name missing'})
    } 
    if(!body.number){
        return response.status(400).json({error: 'number missing'})
    }
    if(persons.find(person => person.name === body.name)){
        return response.status(400).json({error: 'name must be unique'})
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})