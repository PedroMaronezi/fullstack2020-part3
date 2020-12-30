require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')
const { request, response } = require('express')

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
    Person.find({}).then(people => {
        response.json(people)
    })
})

// GET the information about the get request
app.get('/info', (request, response) => {
    Person.find({}).then(people => {
        const info = `<div>Phonebook has info for ${people.length} people</div>
                      <div>${new Date()}</div>`
        response.send(info)
    }) 
})

// GET information about a specific person
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person){
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

// DELETE one person from the phonebook
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
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

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        console.log(`Added ${savedPerson.name} number ${savedPerson.number} to the phonebook`)
        response.json(savedPerson)
    })
})

/*** Middleware for error handling ***/
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if(error.name === 'CastError'){
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}
// handler of requests with result to errors
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})