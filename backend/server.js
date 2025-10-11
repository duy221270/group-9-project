const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import User Model đã tạo

const app = express();
const port = 3000;

// Middleware để parse body của request (cần thiết cho POST)
app.use(express.json()); // Dùng cho JSON body

// ----------------------------------------------------
// PHẦN 1: KẾT NỐI MONGODB ATLAS
// ----------------------------------------------------
const ATLAS_URI = 'mongodb+srv://thuyvychau2011_db_user:HElmaEU3is2LNgXl@cluster0.rdmqqnp.mongodb.net/groupDB?retryWrites=true&w=majority&appName=Cluster0'; 

mongoose.connect(ATLAS_URI)
    .then(() => console.log('Connected to MongoDB Atlas - groupDB'))
    .catch(err => {
        console.error('Could not connect to MongoDB Atlas:', err);
        process.exit(); // Thoát ứng dụng nếu không kết nối được
    });

// ----------------------------------------------------
// PHẦN 2: TẠO API (ROUTES)
// ----------------------------------------------------

// API POST: Thêm người dùng mới
app.post('/users', async (req, res) => {
    try {
        // Lấy dữ liệu name và email từ body request
        const { name, email } = req.body; 

        // Kiểm tra dữ liệu đầu vào
        if (!name || !email) {
            return res.status(400).send({ message: 'Name and Email are required.' });
        }

        // Tạo một đối tượng User mới từ Model
        const newUser = new User({ name, email });

        // Lưu vào database
        const savedUser = await newUser.save();

        // Phản hồi thành công
        res.status(201).send({ 
            message: 'User created successfully!',
            user: savedUser
        });

    } catch (error) {
        // Xử lý lỗi (ví dụ: email bị trùng)
        console.error(error);
        res.status(500).send({ 
            message: 'Error creating user',
            error: error.message
        });
    }
});

// API GET: Lấy tất cả người dùng
app.get('/users', async (req, res) => {
    try {
        // Dùng User.find() để lấy tất cả document trong collection 'users'
        const users = await User.find({}); 

        // Phản hồi danh sách người dùng
        res.status(200).send(users);

    } catch (error) {
        console.error(error);
        res.status(500).send({ 
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// ----------------------------------------------------
// PHẦN 3: KHỞI CHẠY SERVER
// ----------------------------------------------------
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Test POST: http://localhost:${port}/users`);
    console.log(`Test GET: http://localhost:${port}/users`);
});