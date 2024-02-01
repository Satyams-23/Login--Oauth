import React, { useState } from 'react';

const RoleSelection = () => {
    const [selectedRole, setSelectedRole] = useState('');

    const handleRoleSelection = (role) => {
        // Update the selected role in the state
        setSelectedRole(role);

        // Construct the URL with the selected role
        const callbackURL = `http://localhost:8000/api/v1/auth/google/callback?role:${role}`;

        // Redirect the user to the constructed URL
        window.location.href = callbackURL;
    };

    return (
        <div>
            <h1>Role Selection</h1>
            <p>Selected role: {selectedRole}</p>
            <button onClick={() => handleRoleSelection('brand')}>
                Select Brand
            </button>
            <button onClick={() => handleRoleSelection('influencer')}>
                Select Influencer
            </button>
        </div>
    );
};

export default RoleSelection;
