const express = require('express')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
    
app.prepare()
.then(() => {
  const server = express()
    
  server.get('/profile/:id',(req,res)=>{
    app.render(req,res,'/profile')
  })
  server.get('*', (req, res) => {
    return handle(req, res)
  })
    
  server.listen(3400, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3400')
  })
})
.catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})