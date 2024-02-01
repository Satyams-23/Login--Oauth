import React, { useState } from 'react';

const RoleSelection = () => {
    const [role, setRole] = useState('');
    const [roleSelected, setRoleSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRoleSelection = async (role) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/fetchrole', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role,
                }),
            });

            const data = await response.json();

            const { success, message } = data;
            if (success) {
                setRole(role);
                setRoleSelected(true);
            } else {
                setError(message);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Redirect the user to the Google authentication link
        window.location.href = 'http://localhost:8000/api/v1/auth/google';
    };

    return (
        <div>
            <h1>Role Selection</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <p>Selected role: {role}</p>
            <button onClick={() => handleRoleSelection('brand')} disabled={loading}>
                Select Brand
            </button>
            <button onClick={() => handleRoleSelection('influencer')} disabled={loading}>
                Select Influencer
            </button>

            {/* Show the Google login button only if a role has been selected */}
            {roleSelected && (
                <button onClick={handleGoogleLogin}>
                    Login with Google
                </button>
            )}
        </div>
    );
};

export default RoleSelection;
