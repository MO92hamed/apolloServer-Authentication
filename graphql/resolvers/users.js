const User = require('../../models/User')
const { ApolloError } = require('apollo-server-errors')
const { ApolloServer, gql, UserInputError  } = require('apollo-server')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
dotenv.config()

module.exports ={
    Mutation: {
        async registerUser(_, {registerInput: {username, email, password} }) {
            // See if an old user exists with email attempting to register
            const oldUser = await User.findOne({ email })
            
            //throw an error if that user exists
            if(oldUser) {
                throw new ApolloError('A user is already exists with this email' + email, 'EMAIL_ALREADY_EXISTS')
            } 

            //Encrypted Password
            const saltRounds = 10
            const hashedPassword = await bcrypt.hash(password, saltRounds)

            //Build a mongoose module(User)
            const newUser = new User({
                username: username,
                email: email.toLowerCase(),
                password: hashedPassword
            })

            //Create and assign a JWT
            const token = jwt.sign(
                { user_id: newUser._id, email },
                process.env.SECRET_TOKEN,
                {
                    expiresIn: "2h"
                }   
            )
            
            newUser.token = token
            
            //Save this user in MongoDB
            const res = await newUser.save()

            return {
                id: res.id,
                ...res._doc
            }
        },

        async loginUser(_, {loginInput: {email, password} }) {
            //See if the user exist in the Database
            const user = await User.findOne({ email })
            
            //check if the entred password equals to the hashed password
            if(user && (await bcrypt.compare(password, user.password))) {
                
                //Create a new token
                const token = jwt.sign(
                    { user_id: newUser._id, email },
                    process.env.SECRET_TOKEN,
                    {
                        expiresIn: "2h"
                    }   
                )
                
                //Attach token to user model that exists
                user.token = token

                return {
                    id: user.id,
                    ...user._doc
                }
            } else {
                //if user doesn't exist, return error
                throw new ApolloError('Wrong Password', 'WRONG_PASSWORD')
            }
        
        }
    },

    Query: {
        user: (_, {ID}) => User.findById(ID)
    }
}