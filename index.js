const { ApolloServer } = require('apollo-server')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config()

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const server = new ApolloServer({
    typeDefs,
    resolvers
})

mongoose.connect(process.env.MONGODB_URI,
    { useNewUrlParser: true })
    .then(() => {
        console.log('MongoDB Connected')
        return server.listen({port: 5000})
    })
    .then((res) => {
        console.log(`Server Up and Running at ${res.url}`)
    })