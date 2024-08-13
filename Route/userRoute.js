const express = require('express');
const router = express.Router();
const User = require('../Modal/UserModal');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const fetchUser = require('../Middleware/middleware');

const saltRounds = 10;

async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.log(error);
    }
}
router.post('/signup', async (req, res) => {
    console.log(req.body);
    const { name, college, techStack, email, password, bio } = req.body;
    try {
        // Check if user already exists
        const found = await User.findOne({ email: email });
        if (found) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);
        const newUser = new User({
            name,
            college,
            techStack,
            email,
            password: hashedPassword,
            bio
        });

        // Save the new user
        await newUser.save();

        // Fetch the most recent 10 users
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10);

        // Add the new user ID to the request field of recent users
        await Promise.all(recentUsers.map(async user => {
            if (user._id.toString() !== newUser._id.toString()) {
                user.sender.push(newUser._id);
                newUser.request.push(user._id);
                await user.save();

            }
        }));
        await newUser.save();
        // Generate JWT token
        const data = {
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        };

        const token = jwt.sign(data, process.env.secret_key);
        res.json({
            success: true,
            token,
            newUser
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', details: error });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const found = await User.findOne({ email: email });
        if (!found) {
            return res.status(400).json({ message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, found.password);
        if (passwordMatch) {
            const data = {
                user: {
                    id: found._id,
                    name: found.name,
                    email: found.email
                }
            };

            const token = jwt.sign(data, process.env.secret_key);
            res.json({ success: true, token, found });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', details: error });
    }
});
router.get('/getUser',async(req,res)=>{
    try{
        const data = await User.find()
        res.json({data});
    }catch(err){
        res.json({err});
    }
})
router.get('/authUser', fetchUser, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).send('User not found');
      res.json(user);
    } catch (error) {
      res.status(500).send('Server error');
    }
});

router.post('/handleRequest', fetchUser, async (req, res) => {
    const { id } = req.body;
    const userId = req.user.id;

    try {
       
        await User.updateOne(
            { _id: userId },
            { $addToSet: { request: id } }
        );

        await User.updateOne(
            { _id: id },
            { $addToSet: { sender: userId } }
        );

        res.status(200).json({ message: 'Request handled successfully' });
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ message: 'Server error', details: error });
    }
});

router.post('/handlebackRequest', fetchUser, async (req, res) => {
    const { id } = req.body;
    const userId = req.user.id;

    try {
       
        await User.updateOne(
            { _id: userId },
            { $pull: { request: id } }
        );

        await User.updateOne(
            { _id: id },
            { $pull: { sender: userId } }
        );

        res.status(200).json({ message: 'Request handled successfully' });
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ message: 'Server error', details: error });
    }
});

module.exports = router;
