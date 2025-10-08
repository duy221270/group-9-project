import React, { useState } from 'react';
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";
import './App.css';
import './App.css';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);

  const handleUserAdded = (newUser) => {
    setUsers([...users, newUser]);
  };

  return (
    <div className="App">
      <h1>Quản lý User</h1>
      <AddUser onUserAdded={handleUserAdded} />
      <UserList users={users} setUsers={setUsers} />
    </div>
  );
}

export default App;