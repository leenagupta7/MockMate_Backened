const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const fileupload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const port = process.env.PORT || 4000;
require('dotenv').config();


app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', 
  }));
app.use(fileupload({
    useTempFiles: true
}));


const userRoutes = require('./Route/userRoute');
app.use('/api/users', userRoutes);
// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.cloudname,
    api_key: process.env.apikey,
    api_secret: process.env.apisecret,
});


mongoose.connect(process.env.database)
    .then(() => {
        console.log('website it run at 4000')
        app.listen(port, () => console.log(`Server is running on port ${port}`));
}).catch(err => console.log(err));

