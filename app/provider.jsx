'use client';

import { useEffect, useState } from 'react';
import React from 'react';
import { useUser } from '@stackframe/stack';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { UserDetailsContext } from '../context/UserDetailsContext';
const Provider = ({ children }) => {
    const user = useUser();
    const registerUserMutation = useMutation(api.users.registerNewUser);
    const [userDetails, setUserDetails] = useState(null);
    const contextValue = React.useMemo(() => ({ userDetails, setUserDetails }), [userDetails, setUserDetails]);
    const registerNewUser = async () => {
        if (!user) return;

        const data = {
            name: user.displayName,
            email: user.primaryEmail,
            picture: user.profileImageUrl,
        };

        try {
            const result = await registerUserMutation(data);
            setUserDetails(result);
            console.log('✅ User registered successfully:', result);
        } catch (err) {
            console.error('❌ Error registering user:', err);
        }
    };

    useEffect(() => {
        if (user) {
            registerNewUser();
        }
    }, [user]);

    return (
        <div>
            <UserDetailsContext.Provider value={contextValue}>{children}</UserDetailsContext.Provider>
        </div>
    );
};

export default Provider;
