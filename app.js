const express = require('express');
const jwt = require('jsonwebtoken');
const {PrismaClient} = require('@prisma/client')
const bcrypt = require('bcrypt')
const _ = require('lodash');


const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.post('/api/register' , async (req,res)=>{

   let user = await prisma.user.findFirst({where:{email:req.body.email}})
   if(user) return res.status(400).send('user already exist');

   try {
      // we use lodash here
      user = await prisma.user.create({ data:{
         name: req.body.name,
         email: req.body.email,
         password: await bcrypt.hash(req.body.password , 10)
      } })
      if(!user) throw new Error("cant save it")
      res.json(_.pick(user , ['id' , 'email']))
   } catch (error) {
      res.status(400).json(error)
   }

})

app.post('/api/login' , async (req,res)=>{
   const {email , password} = req.body

   const user = await prisma.user.findFirst({where:{email:email}})
   if(!user) return res.status(400).json('username or password incorrect!');

   const validPassword = await bcrypt.compare(password, user.password)
   if(!validPassword) return res.status(400).json('username or password incorrect!')

   const token = jwt.sign({id:user.id} , 'mySecret');
   res.json(token)
})

app.listen(3000 , ()=> console.log("live on 3000"))