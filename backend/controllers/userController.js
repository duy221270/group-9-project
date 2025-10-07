// Data tạm thời, giả lập database
let users = [
  { id: 1, name: 'Thành viên Duy', email: 'a@example.com' },
  { id: 2, name: 'Thành viên Trang', email: 'b@example.com' },
  { id: 3, name: 'Thành viên Vy', email: 'b@example.com' },
];

// Controller để lấy danh sách tất cả người dùng
const getAllUsers = (req, res) => {
  res.status(200).json(users);
};

// Controller để tạo người dùng mới
const createUser = (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  // Tạo user mới với id duy nhất đơn giản
  const newUser = {
    id: Date.now(), // Dùng timestamp để tạo id
    name,
    email,
  };

  users.push(newUser);
  res.status(201).json(newUser); // 201 Created
};

module.exports = {
  getAllUsers,
  createUser,
};