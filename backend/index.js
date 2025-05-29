import express, {json} from 'express'
import mongoose from 'mongoose';


const app = express()
app.use(json());
mongoose.connect('mongodb://127.0.0.1:27017/')
  .then(() => console.log('Connected!')).catch(()=>{console.log(`not cconncected`)});


app.listen(3000,()=>{console.log(`Server is running`)})

app.get('/', (req, res) => {
  res.send('Pras')

})
app.post('/api/item',(req,res)=>{
  console.log(req.body);
  res.send(req.body);})
  

// app.listen(3000)