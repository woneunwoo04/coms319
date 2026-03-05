import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [accountForm, setAccountForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [accountMessage, setAccountMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (user) {
      setAccountForm({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  if (!user) {
    nav("/login");
    return null;
  }

  async function handleAccountSave(e) {
    e.preventDefault();
    setSavingAccount(true);
    setAccountMessage("");
    try {
      await updateProfile(accountForm);
      setAccountMessage("Profile updated successfully.");
    } catch (err) {
      setAccountMessage(err.message);
    } finally {
      setSavingAccount(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordMessage("Please provide both current and new passwords.");
      return;
    }
    setSavingPassword(true);
    setPasswordMessage("");
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage("Password updated successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordMessage(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>👤 My Profile</h1>
      <p style={subtitleStyle}>Manage your Café Delight account information securely.</p>

      <div style={gridStyle}>
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Account Information</h2>
          <form onSubmit={handleAccountSave} style={formStyle}>
            <label style={labelStyle}>
              Name
              <input
                type="text"
                value={accountForm.name}
                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                style={inputStyle}
                required
              />
            </label>
            <label style={labelStyle}>
              Email
              <input
                type="email"
                value={accountForm.email}
                onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                style={inputStyle}
                required
              />
            </label>
            {accountMessage && (
              <p style={{ color: accountMessage.includes("successfully") ? "#2e7d32" : "#d9534f", margin: 0 }}>
                {accountMessage}
              </p>
            )}
            <button type="submit" style={primaryButtonStyle} disabled={savingAccount}>
              {savingAccount ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Change Password</h2>
          <form onSubmit={handlePasswordSave} style={formStyle}>
            <label style={labelStyle}>
              Current Password
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                style={inputStyle}
                required
              />
            </label>
            <label style={labelStyle}>
              New Password
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                style={inputStyle}
                required
              />
            </label>
            {passwordMessage && (
              <p style={{ color: passwordMessage.includes("successfully") ? "#2e7d32" : "#d9534f", margin: 0 }}>
                {passwordMessage}
              </p>
            )}
            <button type="submit" style={secondaryButtonStyle} disabled={savingPassword}>
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  background: "#fdfaf7",
  padding: "40px 20px",
};

const titleStyle = {
  fontSize: "2.5rem",
  color: "#3c2f2f",
  marginBottom: 8,
};

const subtitleStyle = {
  color: "#6b4d32",
  marginBottom: 32,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 24,
};

const cardStyle = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #f1dfcd",
  padding: 24,
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
};

const sectionTitleStyle = {
  marginBottom: 16,
  color: "#3c2f2f",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  color: "#6b4d32",
  fontSize: "0.9rem",
};

const inputStyle = {
  borderRadius: 8,
  border: "1px solid #e1cdb7",
  padding: "10px 12px",
  fontSize: "0.95rem",
};

const primaryButtonStyle = {
  backgroundColor: "#3c2f2f",
  color: "#fff",
  border: "none",
  padding: "12px 16px",
  borderRadius: 10,
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  backgroundColor: "#f7ede3",
  color: "#6b4d32",
  border: "1px solid #f1dfcd",
  padding: "12px 16px",
  borderRadius: 10,
  fontWeight: 600,
  cursor: "pointer",
};
