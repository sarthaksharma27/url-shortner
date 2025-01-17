const express = require("express")
const path = require('path')
const cookieParser = require("cookie-parser")
const { connectToMongoDB } = require("./connect")
const {restrictToLoggedinUserOnly, checkAuth } = require("./middlewares/auth")
const URL = require('./models/url')

const urlRoute = require("./routes/url")
const staticRouter = require("./routes/staticRouter")
const UserRoute = require("./routes/user")
const { timeStamp } = require("console")

const app = express()
const port = 8001;

connectToMongoDB("mongodb://localhost:27017/short-url")
  .then(() => console.log("MongoDB Started"));

app.set("view engine", "ejs");
app.set('views', path.resolve("./views"))

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use("/url", restrictToLoggedinUserOnly, urlRoute)
app.use("/user", checkAuth, UserRoute)
app.use("/", staticRouter)

app.get('/:shortID', async (req, res) => {
    const shortID = req.params.shortID;
    const entry = await URL.findOneAndUpdate({shortId: shortID}, 
    { 
      $push: {
        visitHistory: {
            timestamp: Date.now(),
        }
      } 
    }
   )
   res.redirect(entry.redirectURL)
})


app.listen(port, () => console.log(`Server started on port${port}`));