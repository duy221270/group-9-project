import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../App.css'; // Assuming styles are in App.css

// No need for PROFILE_API_URL and UPLOAD_API_URL here if passed as props
// const PROFILE_API_URL = '/api/users/profile';
// const UPLOAD_API_URL = '/api/users/upload-avatar';

function Profile({ profileApiUrl, token, onLogout }) { // Receive props from App.js
  const [userData, setUserData] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // Separate error state
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // Upload loading state
  const [isUpdatingName, setIsUpdatingName] = useState(false); // Name update loading state

  const navigate = useNavigate(); // Hook for navigation

  // Fetch user profile on component mount or when token changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError('Bạn cần đăng nhập.');
        setLoading(false);
        // Optionally navigate to login if token suddenly disappears
        // navigate('/login');
        return;
      }
      setLoading(true);
      setMessage('');
      setError('');
      try {
        // Use standard Authorization header
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(profileApiUrl, config); // Use passed prop
        setUserData(res.data);
        setNameInput(res.data.name || ''); // Handle cases where name might be missing
      } catch (err) {
        console.error('Lỗi khi lấy thông tin profile:', err);
        setError('Không thể tải thông tin profile.');
        // Use navigate for smoother redirect on auth error
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          // Call the onLogout function passed from App.js to clear state there too
          if (onLogout) onLogout();
          // Navigate will be handled by App.js's PrivateRoute or effect
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // Dependency includes token and profileApiUrl
  }, [token, profileApiUrl, navigate, onLogout]); // Added navigate and onLogout dependencies

  // Update user name
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError('Tên mới không được để trống.');
      return;
    }
    setMessage('');
    setError('');
    setIsUpdatingName(true);
    try {
      // Use standard Authorization header
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(profileApiUrl, { name: nameInput }, config); // Use passed prop

      // Update local state with response from backend
      setUserData(prev => ({ ...prev, name: res.data.name })); // Assumes backend returns updated user fragment
      setNameInput(res.data.name); // Ensure input reflects saved data

      setMessage('Cập nhật tên thành công!');
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
    } catch (err) {
      console.error('Lỗi khi cập nhật profile:', err);
      setError(err.response?.data?.message || 'Cập nhật thất bại.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  // Handle file selection for avatar
  const handleFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      // Basic validation (optional)
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn một file ảnh.');
        setAvatarFile(null);
        setPreview(null);
        e.target.value = ''; // Reset file input
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // Example: 5MB limit
         setError('Kích thước ảnh không được vượt quá 5MB.');
         setAvatarFile(null);
         setPreview(null);
         e.target.value = ''; // Reset file input
         return;
      }

      setError(''); // Clear previous error
      setAvatarFile(file);
      // Clean up previous preview object URL to prevent memory leaks
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file)); // Create preview URL
    } else {
        setAvatarFile(null);
        setPreview(null);
    }
  };

   // Cleanup preview URL on component unmount
   useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Handle avatar upload
  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      alert('Hãy chọn ảnh trước!');
      return;
    }
    setMessage('');
    setError('');
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile); // Key 'avatar' must match backend middleware

      // Use standard Authorization header
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
          Authorization: `Bearer ${token}`,
        },
      };

      // Construct upload URL from profileApiUrl (assuming /upload-avatar is relative)
      const uploadUrl = `${profileApiUrl.replace('/profile', '')}/upload-avatar`; // Adjust if needed
      const res = await axios.post(uploadUrl, formData, config);
      console.log('Avatar upload response:', res.data); // Log response to check

      setMessage('Cập nhật avatar thành công!');
      // *** ✅ SỬA Ở ĐÂY: Dùng res.data.avatarUrl thay vì res.data.avatar ***
      setUserData(prev => ({ ...prev, avatar: res.data.avatarUrl }));
      setAvatarFile(null); // Clear selected file
      setPreview(null); // Clear preview
      // Optionally reset the file input visually (might need useRef)
      const fileInput = document.getElementById('avatar-input');
      if (fileInput) fileInput.value = '';


      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Lỗi khi upload avatar:', err);
      setError(err.response?.data?.message || 'Upload thất bại.');
    } finally {
      setIsUploading(false);
    }
  };


  // Render loading state
  if (loading) return <div className="card"><p className="muted">Đang tải...</p></div>;

  // Render message if user data couldn't be fetched (and not loading)
  if (!userData) return <div className="card"><p className="error">{error || message || 'Không có dữ liệu.'}</p></div>;

  // Render profile content
  return (
    <>
      <h2>Thông tin cá nhân</h2>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        {/* Display Avatar */}
        {userData.avatar ? (
          <img
            src={userData.avatar} // Use avatar URL from userData state
            alt="Avatar"
            style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', border: '2px solid var(--primary)' }}
            // Add onError handler for broken image links
            onError={(e) => { e.target.onerror = null; e.target.src="placeholder_image_url_or_default_avatar"; }}
          />
        ) : (
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            backgroundColor: 'var(--secondary)', margin: 'auto', marginBottom: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', fontSize: '2em', fontWeight: 'bold'
          }}>
            {(userData.name || '?').charAt(0).toUpperCase()} {/* Initial as fallback */}
          </div>
        )}
        <p><strong>Tên:</strong> {userData.name || 'N/A'}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        {userData.role && <p><strong>Vai trò:</strong> {userData.role}</p>}
      </div>

      <hr style={{ margin: '20px 0', borderColor: 'var(--secondary)' }} />

      {/* Form Update Name */}
      <form onSubmit={handleUpdateProfile} className="form">
        <h3>Cập nhật tên</h3>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          required
          className="input"
          disabled={isUpdatingName}
        />
        <button type="submit" className="btn" disabled={isUpdatingName}>
          {isUpdatingName ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>

      <hr style={{ margin: '20px 0', borderColor: 'var(--secondary)' }} />

      {/* Upload Avatar Section */}
      <div style={{ textAlign: 'center' }}>
        <h3>Upload Avatar</h3>
        <input
           id="avatar-input" // Add an ID for easier reset
           type="file"
           accept="image/*"
           onChange={handleFileChange}
           style={{ marginBottom: '10px' }}
           disabled={isUploading}
        />
        {/* Image Preview */}
        {preview && (
          <div style={{ margin: '15px 0' }}>
            <p className='muted'>Ảnh xem trước:</p>
            <img
              src={preview}
              alt="Preview"
              style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
        )}
        {/* Upload Button */}
        {avatarFile && ( // Only show upload button if a file is selected
            <button
              onClick={handleUploadAvatar}
              className="btn"
              style={{ background: 'var(--accent)', marginTop: '10px' }}
              disabled={isUploading}
            >
              {isUploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
            </button>
        )}
      </div>

      {/* Display Success/Error Messages */}
      {message && <p style={{ marginTop: '15px', textAlign: 'center', color: 'var(--accent)' }}>{message}</p>}
      {error && <p style={{ marginTop: '15px', textAlign: 'center', color: 'var(--danger)' }}>{error}</p>}
    </>
  );
}

export default Profile;

