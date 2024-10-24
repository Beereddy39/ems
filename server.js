const express = require('express');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(fileUpload()); 
app.use(express.urlencoded({ extended: true })); // to handle form submissions
app.use(express.static('public')); // for static files (e.g., CSS, images, JS)
app.use('/images', express.static(path.join(__dirname, 'images'))); // serve images from the 'images' directory

// MongoDB URI
const mongoURI = 'mongodb://localhost:27017/Event_Management_System';

// Create MongoDB connection
mongoose.connect(mongoURI);
const db = mongoose.connection;
db.on('error', () => console.log("Error in connecting to the database"));
db.once('open', () => console.log("Connected to Database"));

// Initialize GridFS stream for file uploads
let gfs;
const conn = mongoose.createConnection(mongoURI);
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads'); 
});

// @route GET /
// @desc  Home route, serving the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html')); 
});

// @route GET /events (returns event data)
app.get('/Event', async (req, res) => {
    try {
        const events = await db.collection('Event').find({}).toArray();
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching events', error });
    }
});
// @route POST /login (User login)
app.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    // Find user by email and check password (you can replace this with actual auth logic)
    const user = await db.collection('logindetails').findOne({ email });
    if (user && user.password === password) {
        // Login successful
        res.redirect('/index');
    } else {
        // Invalid login
        res.status(401).send("Invalid login credentials");
    }
});
app.post("/signup", async (req, res) => {
    const { fName, email, password } = req.body;

    try {
        const existingUser = await db.collection('logindetails').findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        // Register the new user
        await db.collection('logindetails').insertOne({ name: fName, email, password });
        console.log("User registered successfully");

        // Redirect to login page after successful registration
        res.redirect('/index');
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).send("Error registering user: " + err.message);
    }
});

// @route POST /forgot-password (Handle forgot password)
app.post("/forgot-password", (req, res) => {
    const { email } = req.body;
    // Implement forgot password logic here (e.g., send reset link via email)
    res.send("Password reset link sent to your email");
});


// @route POST /register (user registration)
app.post("/event-register", async (req, res) => {
    const { name, age, email, phno, gender } = req.body;

    const data = {
        name,
        age,
        email,
        phno,
        gender,
    };

    try {
        await db.collection('Event').insertOne(data);
        console.log("Record Inserted Successfully");
        res.redirect('/index'); // Redirect to a success page
    } catch (err) {
        console.error("Insert Error:", err); // Log the specific error object
        return res.status(500).send("Error inserting record: " + err.message);
    }
});




// Other static pages like login, about, contact, etc.

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html')); 
});

app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registration.html'));
});

app.get('/concert', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'concert.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/organiser', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'organiser.html'));
});

app.get('/sponsor', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'sponsor.html'));
});

app.get('/fashion', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'fashion.html'));
});

app.get('/marketing', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'marketing.html'));
});

app.get('/forget-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'forget-password.html'));
});

// Set up server port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

