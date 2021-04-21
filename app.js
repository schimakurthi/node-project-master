const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const userRoute = require("./routes/user.route");
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(bodyParser.json());

let db_url = "mongodb+srv://saikumar07ch:saikumar07ch@cluster0.uf9zk.gcp.mongodb.net/bmiIndex?retryWrites=true&w=majority";

mongoose.connect(
    db_url,
    {
        auth: {
            user: "saikumar07ch",
            password: "saikumar07ch"
        },

        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    function (err, client) {
        if (err) {
            console.log(err);
        }
        console.log("DB Connected");
    }
);

mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));


app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            return callback(null, true);
        }
    })
);

app.get("/", (req, res) => {
    res.send("Server running");
});
app.use("/user", userRoute);


const port = process.env.PORT || 9000;

app.listen(port, () => {
    console.log("API up and running " + port);
});

