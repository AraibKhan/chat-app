const users = []

const addUser = ({ id, username, roomname }) => {
    //Validate the data
    if (!username || !roomname) {
        return {
            error: 'Username and room are required!'
        }
    }
    
    //Clean the data (trimming)
    username = username.trim().toLowerCase()
    roomname = roomname.trim().toLowerCase()

    //Check for existing User
    const existingUser = users.find((user) => {
        return user.roomname === roomname && user.username === username
    })

    //Validate Username
    if (existingUser) {
        return {
            error: 'Username already taken!'
        }
    }

    //Store User
    const user = { id, username, roomname }
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => {
        return user.id === id
    })
}

const getUsersInRoom = (roomname) => {
    roomname = roomname.trim().toLowerCase()
    return users.filter((user) => {
        return user.roomname === roomname
    })
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}