const User = require('../models/User');
const driver = require('../neo4j-driver');
const mongoose = require('mongoose');

module.exports = {
    create(req,res,next){
        const userProps = req.body;

        User.find({name: userProps.name})
        .then((r) => {
            
            if(r.length != 0) return next({message: "User already exists"}) 
            else{
                User.create(userProps)
                .then((user) => {
                    
                    let session = driver.session();
                    session.run(
                        'CREATE (p:User {name : $name}) return p',
                        {name: userProps.name, password: userProps.password}
                    ).then(()=> {
                       return session.run('MATCH (p:User {name: $name}) return p',
                       {name: userProps.name})
                    }).then((result) => {
                        const record = result.records[0]
                        const node = record.get(0);
                        
                        res.status(200).send(user)
                        session.close();
                    })
                    .catch((err) => {
                        session.close();
                        console.log(err)
                        next({message: "could not add user to graph db"});
                    })
        
                }).catch(next)
            }
        })

    
    },
    update(req,res,next){
        const userProps = req.body;
        const newUser = {
            name: req.body.name,
            password: req.body.newpassword
        };

        User.findOne({name: userProps.name, password: userProps.password})
        .then((user) => {
            
            if(user == null){
                return next({message: "User not found, make sure to use correct user name and password"});
            }
            User.findOneAndUpdate({ name: userProps.name, password: userProps.password}, newUser)
            .then(() => User.findOne({name: userProps.name, password: userProps.newpassword}))
            .then(user => res.send(user))
            .catch(next)
        });
    },
    delete(req,res,next){
        const userProps = req.body;
        User.findOneAndDelete({name : userProps.name, password : userProps.password})
        .then((user) => {
            if (user == null) {
               return next({message : "User not found, make sure to use correct user name and password"})
            }
            else {
                let session = driver.session();
                session.run(
                    `MATCH (n { name: $name })
                    DETACH DELETE n`,
                    {name:userProps.name}
                ).then(() => {
                    res.status(200).send({message : "User succesfully deleted"})
                })
            }
        }).catch(next);
    },
    addFriendship(req,res,next){
        let session = driver.session();
        const user = req.body.name;
        const friend = req.body.friend;
        session.run(
            `MATCH (x:User)
            WHERE x.name = $userName OR x.name = $friendName
            return x`,
            {userName : user, friendName : friend}
        ).then((result) => {
            
            if (result.records.length !== 2) { session.close(); return next({message: "Users not found"})}
            else {
                session.run(
                    `MATCH p = (x:User)-[r:HAS_FRIEND]-(o:User)
                    WHERE x.name = $userName AND o.name = $friendName
                    return p`,
                    {userName : user, friendName : friend}
                ).then((result)=>{
                    if (result.records.length > 0){ session.close(); return next({message : "Friendship already exists"})}
                    else {
                        session.run(
                            `MATCH (a:User {name: $userName}), (b:User{name: $friendName})
                            CREATE (a)-[:HAS_FRIEND]->(b)
                            CREATE (b)-[:HAS_FRIEND]->(a)`,
                            { userName: user, friendName: friend }
                        ).then(() => {
                            session.close()
                            res.status(200).send({ message: 'Succesfully added friendship' })
                        }).catch(next);
                    }
                }).catch(next);
            }
        }).catch(next);
    },
    deleteFriendship(req,res,next){
        const user = req.body.name;
        const friend = req.body.friend;

        let session = driver.session();

        session.run(
            `MATCH (a:User)
            WHERE a.name = $user OR a.name = $friend
            return a`,
            {user : user, friend: friend}     
        ).then((result) => {
            if(result.records.length != 2) { session.close(); return next({message : "Make sure to use two existing users"})}
            else {
                session.run(
                    `MATCH p = (x:User)-[r:HAS_FRIEND]->(y:User)
                    WHERE x.name= $user AND y.name= $friend
                    RETURN p`,
                    { user: user, friend: friend }
                ).then((result) =>{
                    if(result.records.length == 0) { session.close(); return next ({message : "User and the given friend are not friends"})} 
                    else {
                        session.run(
                            `MATCH (:User {name: $user})-[r:HAS_FRIEND]-(:User {name: $friend}) 
                            DELETE r`,
                            { user: user, friend: friend }
                        ).then(() => {
                            session.close()
                            res.status(200).send({ Message: 'Friendship removed' })
                        }).catch(next)
                    }
                }).catch(next)
            }
        }).catch(next)

    }
}