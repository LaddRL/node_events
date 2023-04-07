// Complete Events Exercise
const { createServer } = require('http')
const { appendFile, readFile, createReadStream, read } = require("fs");
const path = require("path");
const { EventEmitter } = require("events");
const PORT = 5001;

const NewsLetter = new EventEmitter();

const server = createServer((req, res) => {
    const { url, method } = req;

    req.on("error", (err)=>{
        console.error(err);
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({msg: "Invalid request 404!"}));
        res.end();
    });

    const chunks = [];

    req.on("data", (chunk)=>{
        chunks.push(chunk)
        console.log(chunks);
    })
    req.on("end", ()=>{
        if (url === "/newsletter_signup" && method === "POST"){
            const body = JSON.parse(Buffer.concat(chunks).toString());
            const newContact = `${body.name}, ${body.email}\n`;
            NewsLetter.emit("signup", newContact, res);
            res.setHeader("Content-Type", "application/json");
            res.write(
                JSON.stringify({ msg:"Successfully created account" })
            );
            res.end();
        }
        // else if (url === "/newsletter_signup" && method === "GET"){
        //     res.setHeader("Content-Type", "text/html")
        //     const readStream = createReadStream(
        //         path.join(__dirname, "./public/index.html")
        //     )
        //     readStream.pipe(res);
        // }
        else {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({ msg: "not a valid endpoint"}))
            res.end();
        }
    })
})
server.listen(PORT, () => console.log("server listening at " + PORT));

NewsLetter.on("signup", (newContact, res) => {
    appendFile(path.join(__dirname, "./assets/newsList.csv"), newContact,
        (err) => {
            if (err) {
                NewsLetter.emit('error', err, res);
                return;
            }
            console.log("The file updated HUZZAH!");
        });
});

NewsLetter.on("error", (err, res)=>{
    console.error(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json")
    res.write(JSON.stringify({ msg: "there was a error"}))
    res.end();
})