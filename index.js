import express from "express";
import rateLimit from "express-rate-limit";
import bunyan from "bunyan";
import { Low, JSONFile } from 'lowdb'

const app = express();
const port = process.env.PORT || 3344;

const log = bunyan.createLogger({
    name: "ips",
    streams: [{ path: process.env.LOG_PATH }],
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: {
            code: 429,
            message: "Too many requests from your IP. Please wait 15 Minutes",
        },
    },
});
app.use(express.json())
app.use(limiter);

// lowdb connect
const adapter = new JSONFile('db.json')
const db = new Low(adapter)
await db.read()
db.data ||= { posts: [] }

const { posts } = db.data

app.get("/ip", async (req, res) => {

    try {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        posts.push({ ip, date: new Date() })
        log.info(ip);
        res.send(ip)
        await db.write()
    } catch (error) {
        res.status(502)
        res.send("It's f*cking error")
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});